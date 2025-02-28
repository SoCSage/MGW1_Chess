const FSM_STATES = {
    IDLE: 'IDLE',
    SELECTING: 'SELECTING',
    MOVING: 'MOVING',
}

class ChessGame {

    constructor(initialFen) {
        //Initial FEN string
        this.initialFen - initialFen;
        this.board = null;
        this.socket = null;
        this.statusTimeout = null;

        this.moveOrientationColor = null;
        this.squareElement = null;
        this.statusTimeout = null;

        this.state = {
            selectedPiece: null,
            availableMoves: [],
            fromSquare: null,
        };
    }

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER

    initializeBoard() {
        // Initialize the Chessboard2
        const boardConfig = {
            sparePieces: true,
            position: initialFen,
            draggable: true,
            dropOffBoard: 'snapback',
            pieceTheme: 'static/assets/chesspieces/wikipedia/{piece}.png',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onMousedownSquare: this.onMousedownSquare.bind(this),
        }
        this.board = Chessboard2('myBoard', boardConfig)
        this.socket = io(location.origin, { path: '/socket.io' }); // Connect to Socket.IO
        // Listen for "board_update" events from the server

        socket.on('board_update', function(data) {
            console.log("Received board_update from server:", data);
            // data.fen, data.pgn, data.statusText
            if (board) {
                board.position(data.fen);
            }
            updateStatus();
        });

        $('#pgnTable').DataTable({
            "preDrawCallback": (settings) => {
                pageScrollPos = $('div.dataTables_scrollBody').scrollTop();
            },
            "drawCallback": (settings) => {
                $('div.dataTables_scrollBody').scrollTop(pageScrollPos);
            },
            scrollY: '275px',
            scroller: true,
            fixedHeader: true,
            searching: false,
            ordering: false,
            info: false,
            autoWidth: true,
            columnDefs: [
            { className: "dt-center", targets: "_all" },
            { className: "column-white", targets: [1, 2] }, // Apply to White columns
            { className: "column-black", targets: [3, 4] }  // Apply to Black columns
            ]
        });

        // On page load, get initial status
        this.updateStatus();
        this.generateNotations();

        // Use ResizeObserver to detect changes in the size of the board-wrapper element
        const boardWrapper = document.querySelector('.board-wrapper');
        if (boardWrapper) {
            const resizeObserver = new ResizeObserver(() => {
                if (this.board) {
                    this.board.resize();
                }
            });
            resizeObserver.observe(boardWrapper);
        }
    }

    // ================================
    //  onDragStart: highlight moves
    // ================================
    onDragStart(dragData) {
        board.clearCircles();

        state.fromSquare = dragData.square;
        let piece = dragData.piece;

        if (moveOrientationColor === 'white' && !isWhitePiece(piece)) return false;
        if (moveOrientationColor === 'black' && !isBlackPiece(piece)) return false;

        if (!state.fromSquare || !piece) return;

        state.selectedPiece = piece;

        squareElement = document.querySelector(`[data-square-coord="${state.fromSquare}"]`);
        if (squareElement) { setSquareElementOpacity(squareElement, 'pieceSelected'); }

        $.post('/legal_moves', { square: state.fromSquare }, function(res) {
            if (res && res.moves) {
                state.availableMoves = res.moves;
                res.moves.forEach(destSquare => {
                    board.addCircle(destSquare);
                });
            } else {
                console.log('No moves returned from /legal_moves');
            }
        }).fail(function() {
            console.error('Failed to retrieve legal moves from server');
            displayStatusMessage('Failed to retrieve legal moves from server');
        });
    }

    // ================================
    //  onDrop: make the move
    // ================================
    onDrop (dropData) {
        if (dropData.source === dropData.target) {
            // Piece dropped back on the source square, do not clear state
            if (squareElement) {
                setSquareElementOpacity(squareElement, 'pieceSelected');
            }
            return 'snapback';
        }

        // Reset square element opacity if needed
        if (squareElement) {
            setSquareElementOpacity(squareElement, 'noPieceSelected');
            squareElement = null;
        }

        let piece = dropData.piece[1];
        let targetRank = dropData.target[1];
        let moveStr = dropData.source + dropData.target;
        moveStr = handlePromotion(piece, targetRank, moveStr);
        handleValidMove(moveStr);

        return 'snapback';
    }

    // ================================
    //  onMousedownSquare
    // ================================
    onMousedownSquare(evt, domEvt) {
        const { piece, square } = evt;
        const pieceColor = piece ? piece.charAt(0) : null;

        // If a piece is already selected and the clicked square is a valid move
        if (state.selectedPiece && state.availableMoves.includes(square)) {
            let selectedPiece = state.selectedPiece[1];
            let targetRank = square[1];
            moveStr = state.fromSquare + square;
            moveStr = handlePromotion(selectedPiece, targetRank, moveStr);
            handleValidMove(moveStr);
        } else {
            // Reset the opacity of the source square if an invalid square is clicked
            if (squareElement) {
                setSquareElementOpacity(squareElement, 'noPieceSelected');
                squareElement = null;
            }
            clearBoardState();
        }
    }

    updateStatus() {
        $.get('/game_status', function(data) {
            if (data) {
                displayStatusMessage(data.statusText);
                const table = $('#pgnTable').DataTable();
                table.clear(); // Clear existing data
                data.moves.forEach(row => {
                    table.row.add([
                    row["Move #"],
                    row["White Move"],
                    row["White User"],
                    row["Black Move"],
                    row["Black User"]
                    ]);
                });
                // Check if the table was scrolled to the bottom before redrawing
                const tableWasScrolledToBottom = isTableScrolledToBottom();
                // Redraw the table
                table.draw();
                // Scroll back to the bottom if it was previously scrolled to the bottom
                if (tableWasScrolledToBottom) {
                    scrollTableBackToBottom();
                }
            }
            if (board) {
                const newOrientation = board.orientation(data.orientation);
                generateNotations();
                moveOrientationColor = data.orientation;
            }
        });
    }

    clearBoardState() {
        this.board.clearCircles();
        state.selectedPiece = null;
        state.availableMoves = [];
        state.fromSquare = null;
    }

    // Reset the board (call server /reset)
    resetGame() {
        clearBoardState();
        window.location.href = "/reset";
    }

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER

    isWhitePiece (piece) { return /^w/.test(piece) }
    isBlackPiece (piece) { return /^b/.test(piece) }

    // TODO: Implement underpromotion (to rook, bishop, or knight) in the future
    handlePromotion(piece, targetRank, moveStr) {
        const isPawn = piece.toUpperCase() === 'P';
        const isPromoting = targetRank === '8' || targetRank === '1';
        if (isPawn && isPromoting) {
            moveStr += 'q'; // Promote to queen
        }
        return moveStr;
    }

    handleValidMove(moveStr) {
        $.post('/make_move', { move: moveStr })
        .done(function(data) {
            if (data.status === 'ok') {
                board.position(data.fen);
                updateStatus();
                // Reset the opacity of the source square
                if (squareElement) {
                    setSquareElementOpacity(squareElement, 'noPieceSelected');
                    squareElement = null;
                }
            } else {
                displayStatusMessage(data.message);
            }
        })
        .fail(function() {
            board.position(dropData.oldPos);
            displayStatusMessage("Server error, move not processed.");
        });

        board.clearCircles();
    }

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER

    generateNotations() {
        const fileNotation = document.querySelector('.notation-bottom');
        const rankNotation = document.querySelector('.notation-left');

        // Clear existing notations
        fileNotation.innerHTML = '';
        rankNotation.innerHTML = '';

        const files = moveOrientationColor === 'white' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] : ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
        const ranks = moveOrientationColor === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];

        files.forEach(file => {
            const span = document.createElement('span');
            span.textContent = file;
            fileNotation.appendChild(span);
        });

        ranks.forEach(rank => {
            const span = document.createElement('span');
            span.textContent = rank;
            rankNotation.appendChild(span);
        });
    }

    displayStatusMessage(message) {
        const statusElement = document.getElementById('status');
        statusElement.innerText = message;
        console.log(message);

        // Clear any existing timeout
        if (this.statusTimeout) {
            clearTimeout(this.statusTimeout);
        }

        // Set a new timeout
        this.statusTimeout = setTimeout(() => {
            statusElement.innerText = '';
        }, 5000); // Clear message after 5 seconds
    }

    isTableScrolledToBottom() {
        const scrollContainer = document.querySelector('.dt-scroll-body');
        if (!scrollContainer) {
            console.error('Scroll container not found');
            return false;
        }
        const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
        return scrollHeight === scrollTop + clientHeight;
    }

    scrollTableBackToBottom() {
        const dataTable = $('#pgnTable').DataTable();
        const totalRows = dataTable.rows().count();
        if (totalRows === 0) return;
        dataTable.scroller.toPosition(totalRows - 1, false);
    }

    // Function to set the opacity of the square element
    setSquareElementOpacity(element, opacity) {
        if (typeof opacity === 'string') {
            switch (opacity) {
                case 'pieceSelected':
                    element.style.opacity = "0.5";
                    break;
                case 'noPieceSelected':
                    element.style.opacity = "1.0";
                    break;
                default:
                    console.warn('Unknown opacity setting:', opacity);
            }
        } else if (typeof opacity === 'number') {
            element.style.opacity = opacity.toString();
        } else {
            console.warn('Invalid opacity value:', opacity);
        }
    }

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
}

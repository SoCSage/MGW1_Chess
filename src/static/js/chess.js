class ChessGame {

    constructor(initialFen) {
        //Initial FEN string
        this.initialFen - initialFen;
        this.board = null;
        this.socket = null;
        this.statusTimeout = null;
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
            onDragStart,
            onDrop,
            onMousedownSquare,
        }
        this.board = Chessboard2('myBoard', boardConfig)
        this.socket = io(location.origin, { path: '/socket.io' }); // Connect to Socket.IO

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

    function clearBoardState() {
        this.board.clearCircles();
        state.selectedPiece = null;
        state.availableMoves = [];
        state.fromSquare = null;
    }

    // Reset the board (call server /reset)
    function resetGame() {
        clearBoardState();
        window.location.href = "/reset";
    }

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER

    function isWhitePiece (piece) { return /^w/.test(piece) }
    function isBlackPiece (piece) { return /^b/.test(piece) }

    // TODO: Implement underpromotion (to rook, bishop, or knight) in the future
    function handlePromotion(piece, targetRank, moveStr) {
        const isPawn = piece.toUpperCase() === 'P';
        const isPromoting = targetRank === '8' || targetRank === '1';
        if (isPawn && isPromoting) {
            moveStr += 'q'; // Promote to queen
        }
        return moveStr;
    }

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER
    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIVIDER

    function displayStatusMessage(message) {
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

    function isTableScrolledToBottom() {
        const scrollContainer = document.querySelector('.dt-scroll-body');
        if (!scrollContainer) {
            console.error('Scroll container not found');
            return false;
        }
        const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
        return scrollHeight === scrollTop + clientHeight;
    }

    function scrollTableBackToBottom() {
        const dataTable = $('#pgnTable').DataTable();
        const totalRows = dataTable.rows().count();
        if (totalRows === 0) return;
        dataTable.scroller.toPosition(totalRows - 1, false);
    }

    // Function to set the opacity of the square element
    function setSquareElementOpacity(element, opacity) {
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

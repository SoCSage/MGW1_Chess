// static/simple-board.js

// document.addEventListener('DOMContentLoaded', function () {
//     const config = {
//         position: 'start',
//         pieceTheme: '/static/chesspieces/wikipedia/{piece}.png',
//     };
//     const board = Chessboard2('myBoard', config);
// });
// // Above case works when directly refrences; below im setting as class

class SimpleChessBoard {
    constructor(fen = 'start') {
        this.fen = fen;
        this.board = null;
    }

    initializeBoard() {
        const config = {
            position: this.fen,
            pieceTheme: '/static/chesspieces/wikipedia/{piece}.png',
        };

        this.board = Chessboard2('myBoard', config);
    }

    resetGame() {
        if (this.board) {
            this.board.position('start');
        }
    }
}

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const fen = window.INITIAL_FEN || 'start';  // fallback in case the variable isn't set
    const simpleBoard = new SimpleChessBoard(fen);
    simpleBoard.initializeBoard();

    // Optional: make accessible from browser console
    window.simpleBoard = simpleBoard;

    // Hook up reset button if needed
    const resetBtn = document.querySelector('button[onclick="resetGame()"]');
    if (resetBtn) {
        window.resetGame = () => simpleBoard.resetGame();
    }
});


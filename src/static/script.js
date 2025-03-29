//Ensure page is loaded
document.addEventListener('DOMContentLoaded', function () {

    // Pull initial FEN from the server-side template variable
    const initialFen = "{{ fen }}";
    const chessGame = new ChessGame(initialFen);
    // const chessGame = new SimpleChessBoard(initialFen); --Testing pieces not showing

    chessGame.initializeBoard();

    window.resetGame = () => {
        chessGame.resetGame();
    };
});

from datetime import datetime

import chess.pgn
from flask import Flask
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
app.config["SECRET_KEY"] = "someSecretKey"
socketio = SocketIO(app)
cors = CORS(app)
socketio.init_app(app, cors_allowed_origins="*")
board = chess.Board()


def current_pgn():
    """
    Generate PGN from the move stack, with the result if the game has ended.

    Parameters:
        argument1 (none): No arguments

    Returns:
        str: The PGN string representing the moves and headers of the current game.
    """

    game = chess.pgn.Game()
    game.headers["Event"] = "Office Chess"
    game.headers["Site"] = "Office"
    game.headers["Date"] = datetime.now().strftime("%Y.%m.%d")
    game.headers["Round"] = "1"
    game.headers["White"] = "White"
    game.headers["Black"] = "Black"
    game.headers["Result"] = board.result()

    node = game
    for mv in board.move_stack:
        node = node.add_variation(mv)
    return str(game)


def status_text():
    """
    Provide a human-readable game status, indicating whose turn it is or if the game is over.

    Parameters:
        argument1 (none): No arguments

    Returns:
        str: The status text, for example "White to move" or "Checkmate! White wins!"
    """

    if board.is_game_over():
        r = board.result()
        if r == "1-0":
            return "Checkmate! White wins!"
        if r == "0-1":
            return "Checkmate! Black wins!"
        if r == "1/2-1/2":
            return "Game over. Draw!"
        return "Game over."
    else:
        turn_str = "White" if board.turn == chess.WHITE else "Black"
        if board.is_check():
            return f"{turn_str} to move, and they're in check!"
        return f"{turn_str} to move."


@app.route("/legal_moves", methods=["POST"])
def legal_moves():
    """
    Return a JSON list of legal destination squares for the square provided in the POST request.

    Parameters:
        argument1 (none): No arguments

    Returns:
        JSON: A JSON object containing the list of legal moves from the given square.
    """

    square_str = request.form.get("square", "")
    try:
        from_sq = chess.parse_square(square_str)
    except ValueError:
        return jsonify({"moves": []})

    possible_moves = []
    for m in board.legal_moves:
        if m.from_square == from_sq:
            possible_moves.append(chess.square_name(m.to_square))

    return jsonify({"moves": possible_moves})


@app.route("/make_move", methods=["POST"])
def make_move():
    """
    Handle POST requests for making a move on the chess board. The move is sent from
    the client in algebraic notation (e.g., "e2e4").

    Parameters:
        argument1 (none): No arguments

    Returns:
        A JSON response indicating whether the move was successful, along with the
        new FEN position if the move was legal, or an error message if not.
    """
    move_uci = request.form.get("move", "")
    try:
        move = board.parse_uci(move_uci)
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid move syntax."})

    if move in board.legal_moves:
        board.push(move)
        socketio.emit(
            "board_update",
            {"fen": board.fen(), "pgn": current_pgn(), "statusText": status_text()},
            to=None,
        )
        return jsonify({"status": "ok", "fen": board.fen()})
    else:
        return jsonify({"status": "error", "message": "Illegal move."})


@app.route("/game_status")
def game_status():
    """
    Returns relevant game details such as the piece placement/orientation in FEN format and similar such details.

    Parameters:
        argument1 (none): No arguments

    Returns:
        Returns the details in JSON format
    """
    return jsonify(
        {"fen": board.fen(), "pgn": current_pgn(), "statusText": status_text()}
    )


@app.route("/reset")
def reset():
    """
    Reset the chess board to its initial state and redirect to the main page.

    Parameters:
        argument1 (none): No arguments

    Returns:
        Redirect response to the index route, effectively reloading the page
        with the initial state of the chess board.
    """
    board.reset()
    # Broadcast reset to all
    socketio.emit(
        "board_update",
        {"fen": board.fen(), "pgn": current_pgn(), "statusText": status_text()},
        to=None,
    )
    return redirect(url_for("index"))


@app.route("/")
def index():
    """
    Render the main chessboard page with the current board position (FEN).

    Parameters:
        argument1 (none): No arguments

    Returns:
        Response: The rendered HTML page containing the chessboard.
    """

    fen = board.fen()
    return render_template("index.html", fen=fen)


if __name__ == "__main__":
    # app.run(debug=True, host="0.0.0.0")
    socketio.run(app, debug=True, host="0.0.0.0")

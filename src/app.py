from datetime import datetime

import chess.pgn
from flask import Flask
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from flask_cors import CORS
from flask_socketio import SocketIO
from modules import helper
from modules import login

app = Flask(__name__)
app.config["SECRET_KEY"] = "someSecretKey"
socketio = SocketIO(app)
cors = CORS(app)
socketio.init_app(app, cors_allowed_origins="*")

board = chess.Board()
move_owners = []
manager = helper.OrientationManager()


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
    for i, mv in enumerate(board.move_stack):
        node = node.add_variation(mv)

        if i < len(move_owners):
            node.comment = f"Move made by {move_owners[i]}"
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
        name_in_cookie = login.get_username_cookie()
        if not name_in_cookie:
            name_in_cookie = "Anonymous"
        move_owners.append(name_in_cookie)
        manager.toggle_orientation()
        socketio.emit(
            "board_update",
            {
                "fen": board.fen(),
                "pgn": current_pgn(),
                "statusText": status_text(),
                "orientation": manager.get_orientation(),
            },
            to=None,
        )
        return jsonify(
            {
                "status": "ok",
                "fen": board.fen(),
                "orientation": manager.get_orientation(),
            }
        )
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
        {
            "fen": board.fen(),
            "pgn": current_pgn(),
            "statusText": status_text(),
            "orientation": manager.get_orientation(),
        }
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
    move_owners.clear()
    manager.reset_orientation()
    # Broadcast reset to all
    socketio.emit(
        "board_update",
        {
            "fen": board.fen(),
            "pgn": current_pgn(),
            "statusText": status_text(),
            "orientation": manager.get_orientation(),
        },
        to=None,
    )
    return redirect(url_for("index"))


@app.route("/", methods=["POST", "GET"])
def index():
    """
    Prompt the user for registering with their name.
    Then, render the main chessboard page with the current board position (FEN).

    Parameters:
        argument1 (none): No arguments

    Returns:
        Response: The rendered HTML page containing the chessboard.
    """
    session.clear()
    name_in_cookie = login.get_username_cookie()
    fen = board.fen()

    if request.method == "GET":
        if name_in_cookie:
            return render_template("index.html", fen=fen, name=name_in_cookie)
        else:
            return render_template("login.html")

    if request.method == "POST":
        name = request.form.get("name")

        if not name:
            return render_template("login.html", error="Please enter a name.")

        resp = make_response(render_template("index.html", fen=fen, name=name))
        login.set_username_cookie(resp, name)
        return resp

    # Fallback (should not reach here)
    return "Something unexpected happened", 400


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", allow_unsafe_werkzeug=True)

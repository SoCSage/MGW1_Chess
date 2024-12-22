import chess
from flask import Flask
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for

app = Flask(__name__)

board = chess.Board()


@app.route("/")
def index():
    """
    Serve the main page of the chess application, passing the current FEN position
    of the board to the HTML template for initial rendering.

    Returns:
        Rendered template of index.html with the current FEN string of the chess board.
    """
    fen = board.fen()
    return render_template("index.html", fen=fen)


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
    move_uci = request.form.get("move")
    global board

    try:
        move = board.parse_uci(move_uci)
    except ValueError:
        # If it fails, it means an invalid move string
        return jsonify({"status": "error", "message": "Invalid move syntax."})

    if move in board.legal_moves:
        board.push(move)
        return jsonify({"status": "ok", "fen": board.fen()})
    else:
        return jsonify({"status": "error", "message": "Illegal move."})


@app.route("/reset", methods=["GET"])
def reset():
    """
    Reset the chess board to its initial state and redirect to the main page.

    Parameters:
        argument1 (none): No arguments

    Returns:
        Redirect response to the index route, effectively reloading the page
        with the initial state of the chess board.
    """
    global board
    board.reset()
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

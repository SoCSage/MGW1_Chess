from datetime import datetime

import chess.pgn


class OrientationManager:

    def __init__(self):
        self.orientation = "white"

    def reset_orientation(self):
        """
        Reset the orientation to its default state ('white').

        Parameters:
            None

        Returns:
            None
        """
        self.orientation = "white"
        return

    def get_orientation(self):
        """
        Retrieve the current orientation.

        Parameters:
            None

        Returns:
            str: The current orientation ('white' or 'black').
        """
        return self.orientation

    def toggle_orientation(self):
        """
        Toggle the orientation between 'white' and 'black'.

        Parameters:
            None

        Returns:
            None
        """
        self.orientation = "black" if self.orientation == "white" else "white"
        return


class PGN_Tracker:

    def __init__(self):
        """
        Initialize a ChessGameTracker instance to maintain and manage move history.
        """
        self.moves_list = []
        self.fen_strings = []

    def reset(self):
        """
        Reset the move history.

        Parameters:
            None

        Returns:
            None
        """
        self.moves_list = []
        self.fen_strings = []
        return

    def update_moves_list(self, board, move_owners, orientation):
        """
        Update the move history from the board and move owners, ensuring proper structure for each move.

        Parameters:
            board (chess.Board): The chess board object to track moves.
            move_owners (list): A list of users making the moves, in order.
            orientation (str): The orientation to determine who's move is being recorded.

        Returns:
            None

        Raises:
            ValueError: Invalid orientation
        """

        if orientation not in ["white", "black"]:
            raise ValueError(
                f"Invalid orientation. Must be white or black. Received: {orientation}"
            )

        move_index = len(self.moves_list) * 2
        move_number = (move_index // 2) + 1
        if orientation == "white":
            move_data = {
                "Move #": move_number,
                "White Move": board.move_stack[-1].uci(),
                "White User": move_owners[-1],
                "Black Move": "waiting",
                "Black User": "waiting",
            }
            self.moves_list.append(move_data)
        else:
            self.moves_list[-1]["Black Move"] = board.move_stack[-1].uci()
            self.moves_list[-1]["Black User"] = move_owners[-1]
        return

    def get_moves_list(self):
        """
        Retrieve the move history as a list of dictionaries.

        Parameters:
            None

        Returns:
            list: A list of dictionaries where each dictionary contains the details of a move.
        """
        return self.moves_list

    def append_fen_string(self, fen_value):
        """
        Update the fen history ensuring a record of the board state for each move.

        Parameters:
            fen_value (str): The FEN string for the board.

        Returns:
            None
        """

        self.fen_strings.append(fen_value)
        return

    def get_fen_string(self, move_number):
        """
        Retrieve the fen string from the list for a given move.

        Parameters:
            move_number (int): The move number to retrieve the corresponding FEN.

        Returns:
            string: A string with the FEN value of a move.

        Raises:
            IndexError: Invalid move_number
        """

        if 0 <= move_number < len(self.fen_strings):
            return self.fen_strings[move_number]
        else:
            raise IndexError(f"Index out of range: {move_number}")

    def export_moves(self):
        """
        Export the move history to a JSON string.

        Parameters:
            None

        Returns:
            str: The JSON representation of the move history.
        """
        import json

        return json.dumps(self.moves_list, indent=4)


def decode_move_number(move_pair, move_player):
    """
    Decode the move number from the move pair and the move player.

    Parameters:
        move_pair (int): The integer value of the move pair.
        move_player (str): white or black. Which side made the move.

    Returns:
        int: The move number in terms of all the moves player in the current game.

    Raises:
        ValueError: Invalid move_playerp
    """

    if move_player not in ["white", "black"]:
        raise ValueError(
            f"Invalid move_player. Must be white or black. Received: {move_player}"
        )

    move_index = (move_pair - 1) * 2
    if move_player == "black":
        move_index += 1

    return move_index


def current_pgn(board, move_owners):
    """
    Generate PGN from the move stack, with the result if the game has ended.

    Parameters:
        board (chess.Board): The chess board object to track moves.
        move_owners (list): A list of users making the moves, in order.

    Returns:
        str: The PGN string representing the moves and headers of the current game.
    """

    game = chess.pgn.Game()
    game.headers["Event"] = "Office Chess"
    game.headers["Site"] = "MGW1"
    game.headers["Date"] = datetime.now().strftime("%Y.%m.%d")
    game.headers["Round"] = "1"
    game.headers["Result"] = board.result()

    node = game
    for i, mv in enumerate(board.move_stack):
        node = node.add_variation(mv)

        if i < len(move_owners):
            node.comment = f"Move made by {move_owners[i]}"
    return str(game)


def status_text(board):
    """
    Provide a human-readable game status, indicating whose turn it is or if the game is over.

    Parameters:
        board (chess.Board): The chess board object to track moves.

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

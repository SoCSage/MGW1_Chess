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

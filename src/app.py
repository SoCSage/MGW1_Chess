from flask import Flask
from flask import render_template

app = Flask(__name__)


@app.route("/")
def index():
    """
    Main index page/route

    Parameters:
        argument1 (none): No arguments

    Returns:
        Returning rendered jinja2 template

    """
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

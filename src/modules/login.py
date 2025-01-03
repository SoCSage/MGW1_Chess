from flask import request


def get_username_cookie():
    """
    Get the 'username' value from the user's cookies.
    Each user (browser) has its own cookie, so multiple
    users won't conflict with each other.

    Parameters:
        argument1 (none): No arguments

    Returns:
        cookie: The cookie associated with the username is retrived and returned.
    """
    return request.cookies.get("username")


def set_username_cookie(response, name):
    """
    Set the 'username' cookie on the response so the
    user's browser will store it and send it on subsequent requests.

    Parameters:
        response (Respone): Takes the response value created by flask
        name (Str): The user's name - username

    Returns:
        None
    """
    # Setting the cookie to expire in 1 year (in seconds).
    response.set_cookie("username", name, max_age=60 * 60 * 24 * 365)
    return

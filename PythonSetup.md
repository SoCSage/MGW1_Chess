# Setting up a Python Environment on zsc12 machines.

## Checking the Python Version

To check which version of Python is installed, use the following commands:

bash
python3 -V
python3 --version
python -V
python --version

## Locating the Python Binary

To find out where the Python binary exists, use:

bash
which python

Make sure you're using it from the right directory. You can also use:

bash
iwhich python

If iwhich doesn't return anything, it means something is not set up correctly, and adjustments are needed.

## Configuring Python Environment

Create a file in your home directory called .iTools. Within this file, you can define the Python 3 version and the Python path:

plaintext
# Define Python 3 version and path
P:python    /usr/intel/pkgs/python3/*python_version*/bin/python3
P:python3   *python_version*

For instance,

plaintext
P:python    /usr/intel/pkgs/python3/3.11.1/bin/python3
P:python3   3.11.1

### Adding Python to Your Shell Configuration

Add the .iTools file to your shell configuration file (like .bashrc or .cshrc) to ensure these settings are applied when you start a new shell session.

# Set USER_ITOOLS environment variable
For .bashrc:
bash
export USER_ITOOLS="${HOME}/.itools"

For .cshrc:
csh
setenv USER_ITOOLS ${HOME}/.itools

## Manually Adding Python Path

If .iTools doesn't work, you can manually add the Python path. In your .bashrc file, add the following line, replacing path_to_python with the actual path to the Python binary:

PYTHON3_VERSION=*python_version*
PYTHON3_PATH=/usr/intel/pkgs/python3/$PYTHON3_VERSION/bin

For .bashrc:
bash
export PATH="$PYTHON3_PATH:$PATH"

For .cshrc:
csh
setenv PATH "$PYTHON3_PATH:$PATH"

In case iwhich python doesn't return the correct path, manually adding the path ensures the correct Python version is used. This is particularly useful if you've switched to Bash from the default C shell.

## Setting Up Pip

### Creating gloabl pip configuration

To install new packages using pip, you may need to configure a proxy. Add the following proxy settings to your .bashrc or .cshrc file. I'll provide the specific proxy values:

For .bashrc:
bash
export http_proxy="http://proxy-dmz.intel.com:912"
export https_proxy="http://proxy-dmz.intel.com:912"
export HTTP_PROXY=$http_proxy
export HTTPS_PROXY=$https_proxy

For .cshrc:
csh
setenv http_proxy http://proxy-dmz.intel.com:912
setenv https_proxy http://proxy-dmz.intel.com:912
setenv HTTP_PROXY $http_proxy
setenv HTTPS_PROXY $https_proxy

When installing packages with pip, include these flags:

bash
python3 -m pip install <package-name> --trusted-host <host-address> --proxy="http://your.proxy:port"

For a global configuration, you would want to create the following config file: ` ~/.config/pip/pip.conf`
with the following contents:
bash
[global]
proxy = http://proxy-chain.intel.com:912
trusted-host = files.pythonhosted.org pypi.org pypi.python.org

## Using a Virtual Environment

To avoid cluttering your home directory, it's a good practice to install packages in a virtual environment. This keeps your global Python environment clean and ensures packages are installed locally to the project.

To create a virtual environment:

bash
python3 -m venv <env-name>
source <env-name>/bin/activate

After activating the virtual environment, any packages installed using pip will be placed in the virtual environment's directory instead of your home directory. This helps manage dependencies and prevents potential conflicts between projects.

To deactivate the virtual environment, simply use:

bash
deactivate

## Additional Tips

### Upgrading Pip

It's a good idea to ensure you have the latest version of pip before installing packages. Upgrade pip with:

bash
python3 -m pip install --upgrade pip

### Virtual Environment Best Practices

- Name your virtual environments clearly to distinguish between projects.
- Consider using a .venv folder within your project directory to keep everything organized.
- Regularly update your virtual environments to keep up with new package releases and security patches.

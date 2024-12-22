# Variables
VENV_DIR := venv
PYTHON := python3
BINARY_NAME := chess

# Targets
.PHONY: all create_venv install_reqs build clean_build clean

all: create_venv install_reqs

create_venv:
	$(PYTHON) -m venv $(VENV_DIR)
	@echo "Virtual environment created in $(VENV_DIR)."

install_reqs:
	$(VENV_DIR)/bin/python3 -m pip install --upgrade pip
	$(VENV_DIR)/bin/python3 -m pip install -r requirements.txt
	@echo "Installing requirements in virtual environment."
	$(VENV_DIR)/bin/pre-commit install
	@echo "Pre-commit hooks installed."
	$(VENV_DIR)/bin/pre-commit autoupdate
	@echo "Pre-commit hooks updated."

build:
	$(VENV_DIR)/bin/pyinstaller --onefile --name $(BINARY_NAME) --paths=src src/app.py
	@echo "Build completed. Binary created as $(BINARY_NAME)."

clean_build:
	rm -rf build dist __pycache__ *.spec
	@echo "Build artifacts removed."

clean:
	rm -rf $(VENV_DIR)
	@echo "Virtual environment removed."
	rm -rf build dist __pycache__ *.spec
	@echo "Build artifacts removed."

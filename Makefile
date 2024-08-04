# Variables
VENV_DIR := venv
PYTHON := python3

# Targets
.PHONY: all create_venv install_reqs clean

all: create_venv install_reqs

create_venv:
	$(PYTHON) -m venv $(VENV_DIR)
	@echo "Virtual environment created in $(VENV_DIR)."

install_reqs:
	$(VENV_DIR)/bin/python3 -m pip install --upgrade pip
	$(VENV_DIR)/bin/pip install -r requirements.txt
	@echo "Installing requirements in virtual environment."
	$(VENV_DIR)/bin/pre-commit install
	@echo "Pre-commit hooks installed."
	$(VENV_DIR)/bin/pre-commit autoupdate
	@echo "Pre-commit hooks updated."

clean:
	rm -rf $(VENV_DIR)
	@echo "Virtual environment removed."


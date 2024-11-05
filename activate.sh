#!/bin/sh

# Check if the virtual environment directory exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run 'make create_venv' first."
    exit 1
fi

# Enter the virtual environment
echo "Entering virtual environment. Press ctrl+d to exit shell or deactivate to exit venv."
source venv/bin/activate

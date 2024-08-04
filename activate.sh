#!/usr/bin/env bash

# Check if the virtual environment directory exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run 'make create_venv' first."
    exit 1
fi

# Activate the virtual environment
source venv/bin/activate

# Enter the virtual environment
echo "Entering virtual environment. Press ctrl+d to exit."
exec $SHELL

done

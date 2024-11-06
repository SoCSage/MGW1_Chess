# Python Virtual Environment Setup

## Prerequisites

- Python 3.x
- Make
- Bash

## Setup

1. **Create Virtual Environment and Install Dependencies:**

    ```sh
    make all
    ```

2. **Activate Virtual Environment:**

    ```sh
    ./activate.sh
    ```

3. **Deactivate Virtual Environment:**

    Press `Ctrl+D` or type `deactivate`.

4. **Clean Up:**

    ```sh
    make clean
    ```

Ensure `activate.sh` is executable:

```sh
chmod +x activate_venv.sh
```

## Executable creation

Steps to compile your script/application into a shareable executable/binary:

1. **Set the binary name within the makefile**
    - You can set BINARY_NAME to the expected binary/executable
    - Set to `main` by default

2. **Run build using make to proceed with

```sh
make build
```

Note: If you did not change the default name, you can temporarily set it when building:


```sh
make build BINARY_NAME=name

```

3. **Artifact cleanup**
    - For cleaning up any PyInstaller related artifacts without affecting the venv:
    ```sh
    make clean_build
    ```

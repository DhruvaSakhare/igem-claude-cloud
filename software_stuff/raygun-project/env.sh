#!/bin/bash
if [ -n "$BB_ROOT" ] || [ -n "$BAGEL_ROOT" ]; then
    echo "ERROR: the BAGEL env is sourced in this shell. Open a fresh one." >&2
    return 1 2>/dev/null || exit 1
fi

conda deactivate 2>/dev/null || true
export PATH=$(echo "$PATH" | tr ':' '\n' | grep -v miniconda3 | paste -sd:)

export RG_ROOT=/work3/s215098/BioBuilders2026/software/raygun-project
export RAYGUN_ROOT=$RG_ROOT/raygun

export TORCH_HOME=$RG_ROOT/torch
export HF_HOME=$RG_ROOT/hf
export XDG_CACHE_HOME=$RG_ROOT/cache

export UV_CACHE_DIR=$RG_ROOT/uv/cache
export UV_PYTHON_INSTALL_DIR=$RG_ROOT/uv/python
export UV_INSTALL_DIR=$RG_ROOT/uv/bin
export UV_NO_MODIFY_PATH=1

export VIRTUAL_ENV=$RG_ROOT/.venv
export PATH=$VIRTUAL_ENV/bin:$UV_INSTALL_DIR:$PATH

umask 002

mkdir -p $TORCH_HOME $HF_HOME $XDG_CACHE_HOME \
         $UV_CACHE_DIR $UV_PYTHON_INSTALL_DIR $UV_INSTALL_DIR \
         $RG_ROOT/logs $RG_ROOT/jobs $RG_ROOT/work

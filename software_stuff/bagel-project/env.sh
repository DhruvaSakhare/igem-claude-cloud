#!/bin/bash
conda deactivate 2>/dev/null || true
export PATH=$(echo "$PATH" | tr ':' '\n' | grep -viE 'miniconda|miniforge' | paste -sd:)

export BB_ROOT=/work3/s215098/BioBuilders2026/software/bagel-project
export BAGEL_ROOT=$BB_ROOT/bagel

export MODEL_DIR=$BB_ROOT/models
export HF_HOME=$BB_ROOT/hf
export XDG_CACHE_HOME=$BB_ROOT/cache
export UV_CACHE_DIR=$BB_ROOT/uv/cache
export UV_PYTHON_INSTALL_DIR=$BB_ROOT/uv/python
export UV_INSTALL_DIR=$BB_ROOT/uv/bin
export UV_PROJECT_ENVIRONMENT=$BAGEL_ROOT/.venv

export PATH=$UV_INSTALL_DIR:$PATH
umask 002

mkdir -p $MODEL_DIR $HF_HOME $XDG_CACHE_HOME \
         $UV_CACHE_DIR $UV_PYTHON_INSTALL_DIR $UV_INSTALL_DIR \
         $BB_ROOT/logs $BB_ROOT/jobs

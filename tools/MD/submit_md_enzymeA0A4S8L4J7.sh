#!/bin/bash
#BSUB -J md_8av5_A0A4S8L4J7
#BSUB -q gpuv100
#BSUB -gpu "num=1:mode=exclusive_process"
#BSUB -n 4
#BSUB -W 24:00
#BSUB -R "rusage[mem=8GB]"
#BSUB -R "select[gpu32gb]"
#BSUB -o md_8av5_%J.out
#BSUB -e md_8av5_%J.err

### -- set the email address --
##BSUB -u s215098@student.dtu.dk #Changed
### -- send notification at start --
#BSUB -B
### -- send notification at completion --
#BSUB -N


set -e

module load cuda/12.4

source $HOME/miniforge3/bin/activate #Changed
conda deactivate
conda activate md-run

cd /work3/s215098/BioBuilders2026/MD #Changed


python 02_run.py --mode gpu \
      --output-dir A0A4S8L4J7 \
      --nvt-steps 1000000 --npt-steps 1000000 \
      --prod-steps 25000000 --report-interval 25000

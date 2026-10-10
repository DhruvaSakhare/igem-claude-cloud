#!/bin/sh
#BSUB -q gpua100
#BSUB -J rf3_msa_control
#BSUB -n 4
#BSUB -gpu "num=1:mode=exclusive_process"
#BSUB -W 1:00
#BSUB -R "rusage[mem=10GB]"
#BSUB -R "span[hosts=1]"
#BSUB -o /work3/s215098/BioBuilders2026/tools/sotiris_msa_rf_test/work/rf3_msa_control/ctrl_%J.out
#BSUB -e /work3/s215098/BioBuilders2026/tools/sotiris_msa_rf_test/work/rf3_msa_control/ctrl_%J.err

module load cuda/12.4
source /dtu/projects/dbl/rf3/release/activate_env.sh
export DISABLE_CUEQUIVARIANCE=true

python /work3/s215098/BioBuilders2026/tools/sotiris_msa_rf_test/lib/rf3_wrapper.py fold inference_engine=rf3 \
    inputs=/work3/s215098/BioBuilders2026/tools/sotiris_msa_rf_test/work/rf3_msa_control/control.json out_dir=/work3/s215098/BioBuilders2026/tools/sotiris_msa_rf_test/work/rf3_msa_control/out \
    ckpt_path=/dtu/projects/dbl/rf3/release/ckpt/rf3_latest.pt \
    num_steps=20 \
    annotate_b_factor_with_plddt=True \
    early_stopping_plddt_threshold=0

echo "Done at $(date)"

_PGID=$(ps -o pgid= -p $$ | tr -d ' ')
for _pid in $(pgrep -g "$_PGID" 2>/dev/null); do
    [ "$_pid" != "$$" ] && kill -9 "$_pid" 2>/dev/null
done
exit 0

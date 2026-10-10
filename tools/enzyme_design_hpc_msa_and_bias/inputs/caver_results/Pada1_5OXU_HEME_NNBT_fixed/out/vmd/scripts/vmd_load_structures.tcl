set dir "/work3/s215098/BioBuilders2026/tools/enzyme_design_hpc_msa_and_bias/inputs/caver_results/Pada1_5OXU_HEME_NNBT_fixed/pdb"

mol load pdb ${dir}/Pada1_5OXU_HEME_NNBT_fixed.pdb

after idle { 
  mol representation NewCartoon 
  mol delrep 0 top
  mol addrep top
  mol modcolor 0 top "ColorID" 8
} 


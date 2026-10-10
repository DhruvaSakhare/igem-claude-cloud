set dir "/work3/s215098/BioBuilders2026/tools/enzyme_design_hpc_msa_and_bias/inputs/caver_results/GroGu_prepped/pdb"

mol load pdb ${dir}/GroGu_prepped.pdb

after idle { 
  mol representation NewCartoon 
  mol delrep 0 top
  mol addrep top
  mol modcolor 0 top "ColorID" 8
} 


#set dir "/work3/s215098/BioBuilders2026/tools/enzyme_design_hpc_msa_and_bias/inputs/caver_results/PabUPO-II_withHEMEFE_and_NNBT/pdb"

mol load pdb ../data/PabUPO-II_withHEMEFE_and_NNBT.pdb

after idle { 
  mol representation NewCartoon 
  mol delrep 0 top
  mol addrep top
  mol modcolor 0 top "ColorID" 8
} 


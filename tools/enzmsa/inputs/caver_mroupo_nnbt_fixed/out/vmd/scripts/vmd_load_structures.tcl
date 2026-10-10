set dir "/work3/s215098/BioBuilders2026/tools/enzmsa/inputs/caver_mroupo_nnbt_fixed/pdb"

mol load pdb ${dir}/structure.pdb

after idle { 
  mol representation NewCartoon 
  mol delrep 0 top
  mol addrep top
  mol modcolor 0 top "ColorID" 8
} 


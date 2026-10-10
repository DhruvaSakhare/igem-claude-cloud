set dir "/Users/dhruva/dtu/igemmm/channel-design/enzyme_design/examples/caver_PabUPO-II_withHEMEFE_and_NNBT/pdb"

mol load pdb ${dir}/structure.pdb

after idle { 
  mol representation NewCartoon 
  mol delrep 0 top
  mol addrep top
  mol modcolor 0 top "ColorID" 8
} 


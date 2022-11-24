on run argv
      set d to the clipboard as «class PNGf»
      set fid to open for access ((item 1 of argv) as string) with write permission 
      write d to fid 
      close access fid
end run

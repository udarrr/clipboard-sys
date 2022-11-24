on run argv
      set the clipboard to (read (POSIX file ((item 1 of argv) as string)) as JPEG picture)
end run
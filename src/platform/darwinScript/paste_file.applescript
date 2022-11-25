    use framework "Foundation"

    property this : a reference to the current application
    property NSPasteboard : a reference to NSPasteboard of this
    property NSURL : a reference to NSURL of this
    property pb : a reference to NSPasteboard's generalPasteboard

    property text item delimiters : linefeed

on run argv
    pb's readObjectsForClasses:[NSURL] options:[]
    set res to result's valueForKey:"path"

    repeat with f in res
        set p to f as text
        set pp to (POSIX file p) as string

       tell application "Finder"
       set f1 to pp as alias
       set d to item 1 of argv as text
       set dd to ((POSIX file d) as string) as alias

       duplicate f1 to folder dd with replacing
       end tell
    end repeat
end run

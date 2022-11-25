use framework "Foundation"

    property this : a reference to the current application
    property NSPasteboard : a reference to NSPasteboard of this
    property NSURL : a reference to NSURL of this
    property pb : a reference to NSPasteboard's generalPasteboard

    property text item delimiters : linefeed

    pb's readObjectsForClasses:[NSURL] options:[]
    set res to result's valueForKey:"path"

    set arr to {}

    repeat with f in res
       set p to f as string
       set end of arr to p
    end repeat

return arr as string

 
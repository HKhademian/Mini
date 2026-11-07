"use strict";
let position;
let output;
function $mini_file_0() {
    position = 0;
    output = "";
    while ((position < 3)) {
        if ((position === 1)) {
            output = (output + ";");
        } else {
            output = (output + " ");
        }
        position = (position + 1);
    }
}
function $mini_main() {
    $mini_file_0();
}
$mini_main();

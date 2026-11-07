"use strict";
let output;
function join(left, right) {

    return (left + right);
}
function twice(value) {

    return join(value, value);
}
function $mini_file_0() {
    output = twice("mini");
}
function $mini_main() {
    $mini_file_0();
}
$mini_main();

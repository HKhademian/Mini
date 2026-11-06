"use strict";
function join(left, right) {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    return (left + right);
    return 0;
}
function twice(value) {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    return join(value, value);
    return 0;
}
let output = twice("mini");

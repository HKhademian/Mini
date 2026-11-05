/// Playground sample catalog.
///
/// Entries run in the browser. `file` references a tracked sample; `source`
/// carries a showcase-only program. The site build compiles and runs every
/// entry before emitting the page, so a broken sample fails the build.
export type PlaygroundEntry = {
    readonly id: string;
    readonly group: string;
    readonly label: string;
    readonly note: string;
    readonly args: readonly string[];
    readonly stdin: string;
    readonly file?: string;
    readonly source?: string;
};

export const playgroundSamples: readonly PlaygroundEntry[] = [
    {
        id: "hello",
        group: "Basics",
        label: "Hello, Mini",
        note: "Write one line of text.",
        args: [],
        stdin: "",
        source: String.raw`io_write("hello, mini\n");`.trim(),
    },
    {
        id: "bindings",
        group: "Basics",
        label: "Bindings",
        note: "Bind text and number values.",
        args: [],
        stdin: "",
        source: String.raw`/// Bind text and number values and write one line.
var name = "Mini";
var version = 1;
io_write(name + " " + number_to_text(version) + "\n");`.trim(),
    },
    {
        id: "numbers",
        group: "Basics",
        label: "Arithmetic",
        note: "Multiply and subtract numbers.",
        args: [],
        stdin: "",
        source: String.raw`var width = 6;
var height = 7;
io_write(number_to_text(number_mul(width, height)) + "\n");
io_write(number_to_text(20 - 5) + "\n");`.trim(),
    },
    {
        id: "concat",
        group: "Basics",
        label: "Text concatenation",
        note: "Join text with +.",
        args: [],
        stdin: "",
        source: String.raw`var first = "self";
var second = "-hosting";
io_write(first + second + "\n");`.trim(),
    },
    {
        id: "booleans",
        group: "Basics",
        label: "Booleans",
        note: "Combine comparisons with &&.",
        args: [],
        stdin: "",
        source: String.raw`var count = 3;
var ready = count > 0 && count < 10;
if (ready) {
    io_write("ready\n");
} else {
    io_write("waiting\n");
}`.trim(),
    },
    {
        id: "if",
        group: "Basics",
        label: "If",
        note: "Run a block when a condition holds.",
        args: [],
        stdin: "",
        source: String.raw`var temperature = 21;
if (temperature > 18) {
    io_write("warm\n");
}`.trim(),
    },
    {
        id: "if-else",
        group: "Basics",
        label: "If and else",
        note: "Choose one of two branches.",
        args: [],
        stdin: "",
        source: String.raw`var value = 7;
if (number_mod(value, 2) == 0) {
    io_write("even\n");
} else {
    io_write("odd\n");
}`.trim(),
    },
    {
        id: "while",
        group: "Basics",
        label: "While",
        note: "Repeat while a condition holds.",
        args: [],
        stdin: "",
        source: String.raw`var position = 1;
while (position <= 5) {
    io_write(number_to_text(position) + " ");
    position = position + 1;
}
io_write("\n");`.trim(),
    },
    {
        id: "function",
        group: "Basics",
        label: "Functions",
        note: "Return a value from a named function.",
        args: [],
        stdin: "",
        source: String.raw`fn square(value) {
    return number_mul(value, value);
}
io_write(number_to_text(square(9)) + "\n");`.trim(),
    },
    {
        id: "arguments",
        group: "Basics",
        label: "Program arguments",
        note: "Join the command-line arguments with pipes.",
        args: ["alpha", "beta", "gamma"],
        stdin: "",
        file: "samples/006-list.mini",
    },

    {
        id: "text-length",
        group: "Text",
        label: "Text length",
        note: "Count characters.",
        args: [],
        stdin: "",
        source: String.raw`var text = "playground";
io_write(number_to_text(text_length(text)) + "\n");`.trim(),
    },
    {
        id: "text-get",
        group: "Text",
        label: "Characters",
        note: "Read the first and last character.",
        args: [],
        stdin: "",
        source: String.raw`var text = "Mini";
io_write(text_get(text, 0) + text_get(text, 3) + "\n");`.trim(),
    },
    {
        id: "text-slice",
        group: "Text",
        label: "Slices",
        note: "Slice with positive and negative bounds.",
        args: [],
        stdin: "",
        source: String.raw`var text = "playground";
io_write(text_slice(text, 0, 4) + "\n");
io_write(text_slice(text, -4, text_length(text)) + "\n");`.trim(),
    },
    {
        id: "text-find",
        group: "Text",
        label: "Find",
        note: "Locate a word inside text.",
        args: [],
        stdin: "",
        source: String.raw`var haystack = "a small compiler";
io_write(number_to_text(text_find(haystack, "compiler")) + "\n");`.trim(),
    },
    {
        id: "text-split",
        group: "Text",
        label: "Split",
        note: "Split text on a literal separator.",
        args: [],
        stdin: "",
        source: String.raw`var fields = text_split("one,two,three", ",");
var index = 0;
while (index < list_length(fields)) {
    io_write(list_get(fields, index) + "\n");
    index = index + 1;
}`.trim(),
    },
    {
        id: "text-reverse",
        group: "Text",
        label: "Reverse text",
        note: "Walk backwards and build a new string.",
        args: [],
        stdin: "",
        source: String.raw`var source = "mini";
var output = "";
var index = text_length(source) - 1;
while (index >= 0) {
    output = output + text_get(source, index);
    index = index - 1;
}
io_write(output + "\n");`.trim(),
    },
    {
        id: "text-vowels",
        group: "Text",
        label: "Count vowels",
        note: "Combine a loop with character comparisons.",
        args: [],
        stdin: "",
        source: String.raw`var text = "self hosting";
var index = 0;
var count = 0;
while (index < text_length(text)) {
    var ch = text_get(text, index);
    if (ch == "a" || ch == "e" || ch == "i" || ch == "o" || ch == "u") {
        count = count + 1;
    }
    index = index + 1;
}
io_write(number_to_text(count) + "\n");`.trim(),
    },
    {
        id: "text-bytes",
        group: "Text",
        label: "UTF-8 bytes",
        note: "Turn text into its byte values.",
        args: [],
        stdin: "",
        source: String.raw`var bytes = text_to_bytes("Mini");
var index = 0;
while (index < list_length(bytes)) {
    io_write(number_to_text(list_get(bytes, index)) + " ");
    index = index + 1;
}
io_write("\n");`.trim(),
    },
    {
        id: "text-codes",
        group: "Text",
        label: "Character codes",
        note: "Convert between characters and code points.",
        args: [],
        stdin: "",
        source: String.raw`var text = "A!";
io_write(number_to_text(text_code(text_get(text, 0))) + "\n");
io_write(text_from_code(77) + "\n");`.trim(),
    },
    {
        id: "text",
        group: "Text",
        label: "Text and stdin",
        note: "Normalize tabs and line endings from standard input.",
        args: [],
        stdin: "alpha\tbeta\ngamma",
        file: "samples/004-text.mini",
    },

    {
        id: "list-create",
        group: "Lists",
        label: "Create a list",
        note: "Set two items and read the length.",
        args: [],
        stdin: "",
        source: String.raw`var items = list_new();
list_set(items, 0, "alpha");
list_set(items, 1, "beta");
io_write(number_to_text(list_length(items)) + "\n");`.trim(),
    },
    {
        id: "list-get",
        group: "Lists",
        label: "Read items",
        note: "Use a negative index for the last item.",
        args: [],
        stdin: "",
        source: String.raw`var items = list_new();
list_set(items, 0, "first");
list_set(items, 1, "last");
io_write(list_get(items, 0) + " " + list_get(items, -1) + "\n");`.trim(),
    },
    {
        id: "lists",
        group: "Lists",
        label: "Join a list",
        note: "Join list items with a visible separator.",
        args: [],
        stdin: "",
        file: "samples/018-list-to-text.mini",
    },
    {
        id: "list-sum",
        group: "Lists",
        label: "Sum a list",
        note: "Accumulate numbers in a loop.",
        args: [],
        stdin: "",
        source: String.raw`var values = list_new();
list_set(values, 0, 4);
list_set(values, 1, 8);
list_set(values, 2, 15);
var sum = 0;
var index = 0;
while (index < list_length(values)) {
    sum = sum + list_get(values, index);
    index = index + 1;
}
io_write(number_to_text(sum) + "\n");`.trim(),
    },
    {
        id: "list-max",
        group: "Lists",
        label: "Largest item",
        note: "Scan a list and keep the best value.",
        args: [],
        stdin: "",
        source: String.raw`var values = list_new();
list_set(values, 0, 4);
list_set(values, 1, 9);
list_set(values, 2, 2);
var best = list_get(values, 0);
var index = 1;
while (index < list_length(values)) {
    var current = list_get(values, index);
    if (current > best) {
        best = current;
    }
    index = index + 1;
}
io_write(number_to_text(best) + "\n");`.trim(),
    },
    {
        id: "list-reverse",
        group: "Lists",
        label: "Reverse a list",
        note: "Walk a list backwards and join the items.",
        args: [],
        stdin: "",
        source: String.raw`var values = list_new();
list_set(values, 0, "one");
list_set(values, 1, "two");
list_set(values, 2, "three");
var output = "";
var index = list_length(values) - 1;
while (index >= 0) {
    output = output + list_get(values, index);
    if (index > 0) {
        output = output + " ";
    }
    index = index - 1;
}
io_write(output + "\n");`.trim(),
    },
    {
        id: "list-stack",
        group: "Lists",
        label: "Stack",
        note: "Push and pop from the back.",
        args: [],
        stdin: "",
        source: String.raw`var stack = list_new();
list_push_back(stack, "a");
list_push_back(stack, "b");
var top = list_pop_back(stack);
io_write(top + " " + number_to_text(list_length(stack)) + "\n");`.trim(),
    },
    {
        id: "list-queue",
        group: "Lists",
        label: "Queue",
        note: "Push at the back and pop from the front.",
        args: [],
        stdin: "",
        source: String.raw`var queue = list_new();
list_push_back(queue, "first");
list_push_back(queue, "second");
var head = list_pop_front(queue);
io_write(head + " " + list_get(queue, 0) + "\n");`.trim(),
    },
    {
        id: "list-copy",
        group: "Lists",
        label: "Copy a list",
        note: "Changing the copy leaves the original intact.",
        args: [],
        stdin: "",
        source: String.raw`var original = list_new();
list_set(original, 0, "one");
list_set(original, 1, "two");
var copy = list_copy(original);
list_set(copy, 0, "changed");
io_write(list_get(original, 0) + " " + list_get(copy, 0) + "\n");`.trim(),
    },
    {
        id: "list-lines",
        group: "Lists",
        label: "Lines",
        note: "Split text into lines and join them again.",
        args: [],
        stdin: "",
        source: String.raw`var source = "red\ngreen\nblue";
var lines = text_split(source, "\n");
var output = "";
var index = 0;
while (index < list_length(lines)) {
    if (index > 0) {
        output = output + "|";
    }
    output = output + list_get(lines, index);
    index = index + 1;
}
io_write(output + "\n");`.trim(),
    },

    {
        id: "map-create",
        group: "Maps",
        label: "Create a map",
        note: "Set and read text-keyed values.",
        args: [],
        stdin: "",
        source: String.raw`var values = map_new();
map_set(values, "name", "Mini");
map_set(values, "count", 2);
io_write(map_get(values, "name") + "\n");`.trim(),
    },
    {
        id: "map-has",
        group: "Maps",
        label: "Presence",
        note: "Test for a key before reading it.",
        args: [],
        stdin: "",
        source: String.raw`var values = map_new();
map_set(values, "ready", true);
if (map_has(values, "ready")) {
    io_write("present\n");
}
if (!map_has(values, "missing")) {
    io_write("absent\n");
}`.trim(),
    },
    {
        id: "map-keys",
        group: "Maps",
        label: "Count keys",
        note: "Take a key snapshot and count it.",
        args: [],
        stdin: "",
        source: String.raw`var values = map_new();
map_set(values, "a", 1);
map_set(values, "b", 2);
map_set(values, "c", 3);
io_write(number_to_text(list_length(map_keys(values))) + "\n");`.trim(),
    },
    {
        id: "map-replace",
        group: "Maps",
        label: "Replace a value",
        note: "Setting an existing key keeps the key count.",
        args: [],
        stdin: "",
        source: String.raw`var values = map_new();
map_set(values, "key", "old");
map_set(values, "key", "new");
io_write(map_get(values, "key") + " " + number_to_text(list_length(map_keys(values))) + "\n");`.trim(),
    },
    {
        id: "map-copy",
        group: "Maps",
        label: "Copy a map",
        note: "Changing the copy leaves the original intact.",
        args: [],
        stdin: "",
        source: String.raw`var original = map_new();
map_set(original, "name", "Mini");
var copy = map_copy(original);
map_set(copy, "name", "Clone");
io_write(map_get(original, "name") + " " + map_get(copy, "name") + "\n");`.trim(),
    },
    {
        id: "json",
        group: "Maps",
        label: "Maps and JSON",
        note: "Build a map and print compact JSON.",
        args: [],
        stdin: "",
        file: "samples/020-json-to-text.mini",
    },
    {
        id: "map-parse",
        group: "Maps",
        label: "Parse JSON",
        note: "Parse an object and read a field.",
        args: [],
        stdin: "",
        source: String.raw`var parsed = json_parse("{\"name\":\"Mini\",\"count\":2}");
if (map_get(parsed, "ok")) {
    var value = map_get(parsed, "value");
    io_write(map_get(value, "name") + "\n");
}`.trim(),
    },
    {
        id: "map-array",
        group: "Maps",
        label: "JSON arrays",
        note: "Parse an array and read an item.",
        args: [],
        stdin: "",
        source: String.raw`var parsed = json_parse("[10,20,30]");
if (map_get(parsed, "ok")) {
    var values = map_get(parsed, "value");
    io_write(number_to_text(list_get(values, 1)) + "\n");
}`.trim(),
    },
    {
        id: "map-nested",
        group: "Maps",
        label: "Nested maps",
        note: "Store a map inside another map.",
        args: [],
        stdin: "",
        source: String.raw`var outer = map_new();
var inner = map_new();
map_set(inner, "name", "Mini");
map_set(outer, "language", inner);
io_write(map_get(map_get(outer, "language"), "name") + "\n");`.trim(),
    },
    {
        id: "map-word-count",
        group: "Maps",
        label: "Word counts",
        note: "Count repeated words with a map.",
        args: [],
        stdin: "",
        source: String.raw`var words = text_split("mini makes mini tools", " ");
var counts = map_new();
var index = 0;
while (index < list_length(words)) {
    var word = list_get(words, index);
    var count = map_get(counts, word);
    map_set(counts, word, count + 1);
    index = index + 1;
}
io_write("mini=" + number_to_text(map_get(counts, "mini")) + "\n");
io_write("makes=" + number_to_text(map_get(counts, "makes")) + "\n");`.trim(),
    },

    {
        id: "fizzbuzz",
        group: "Programs",
        label: "FizzBuzz",
        note: "Classic division and branching.",
        args: [],
        stdin: "",
        source: String.raw`var n = 1;
while (n <= 15) {
    if (number_mod(n, 15) == 0) {
        io_write("FizzBuzz\n");
    } else {
        if (number_mod(n, 3) == 0) {
            io_write("Fizz\n");
        } else {
            if (number_mod(n, 5) == 0) {
                io_write("Buzz\n");
            } else {
                io_write(number_to_text(n) + "\n");
            }
        }
    }
    n = n + 1;
}`.trim(),
    },
    {
        id: "factorial",
        group: "Programs",
        label: "Factorial",
        note: "A recursive function.",
        args: [],
        stdin: "",
        source: String.raw`fn factorial(n) {
    if (n <= 1) {
        return 1;
    }
    return number_mul(n, factorial(n - 1));
}
io_write(number_to_text(factorial(6)) + "\n");`.trim(),
    },
    {
        id: "fibonacci",
        group: "Programs",
        label: "Fibonacci",
        note: "An iterative sequence.",
        args: [],
        stdin: "",
        source: String.raw`fn fib(n) {
    var a = 0;
    var b = 1;
    var i = 0;
    while (i < n) {
        var next = a + b;
        a = b;
        b = next;
        i = i + 1;
    }
    return a;
}
var index = 0;
while (index < 10) {
    io_write(number_to_text(fib(index)) + " ");
    index = index + 1;
}
io_write("\n");`.trim(),
    },
    {
        id: "primes",
        group: "Programs",
        label: "Primes",
        note: "Trial division up to a limit.",
        args: [],
        stdin: "",
        source: String.raw`fn is_prime(n) {
    if (n < 2) {
        return false;
    }
    var divisor = 2;
    while (divisor < n) {
        if (number_mod(n, divisor) == 0) {
            return false;
        }
        divisor = divisor + 1;
    }
    return true;
}
var value = 2;
while (value <= 30) {
    if (is_prime(value)) {
        io_write(number_to_text(value) + " ");
    }
    value = value + 1;
}
io_write("\n");`.trim(),
    },
    {
        id: "palindrome",
        group: "Programs",
        label: "Palindrome",
        note: "Reverse text and compare.",
        args: [],
        stdin: "",
        source: String.raw`fn reverse(text) {
    var output = "";
    var index = text_length(text) - 1;
    while (index >= 0) {
        output = output + text_get(text, index);
        index = index - 1;
    }
    return output;
}
var word = "level";
if (word == reverse(word)) {
    io_write("palindrome\n");
} else {
    io_write("different\n");
}`.trim(),
    },
    {
        id: "caesar",
        group: "Programs",
        label: "Caesar shift",
        note: "Shift character codes by one.",
        args: [],
        stdin: "",
        source: String.raw`var source = "MINI";
var output = "";
var index = 0;
while (index < text_length(source)) {
    var code = text_code(text_get(source, index));
    output = output + text_from_code(code + 1);
    index = index + 1;
}
io_write(output + "\n");`.trim(),
    },
    {
        id: "binary-search",
        group: "Programs",
        label: "Binary search",
        note: "Find a value in a sorted list.",
        args: [],
        stdin: "",
        source: String.raw`var values = list_new();
list_set(values, 0, 2);
list_set(values, 1, 4);
list_set(values, 2, 8);
list_set(values, 3, 16);
list_set(values, 4, 32);
list_set(values, 5, 64);
var target = 16;
var low = 0;
var high = list_length(values) - 1;
var found = -1;
while (low <= high) {
    var middle = number_div(low + high, 2);
    var current = list_get(values, middle);
    if (current == target) {
        found = middle;
        low = high + 1;
    } else {
        if (current < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }
}
io_write(number_to_text(found) + "\n");`.trim(),
    },
    {
        id: "bubble-sort",
        group: "Programs",
        label: "Bubble sort",
        note: "Sort a small list in place.",
        args: [],
        stdin: "",
        source: String.raw`var values = list_new();
list_set(values, 0, 5);
list_set(values, 1, 1);
list_set(values, 2, 4);
list_set(values, 3, 2);
list_set(values, 4, 3);
var outer = 0;
while (outer < list_length(values)) {
    var inner = 0;
    while (inner < list_length(values) - 1) {
        if (list_get(values, inner) > list_get(values, inner + 1)) {
            var temp = list_get(values, inner);
            list_set(values, inner, list_get(values, inner + 1));
            list_set(values, inner + 1, temp);
        }
        inner = inner + 1;
    }
    outer = outer + 1;
}
var index = 0;
while (index < list_length(values)) {
    io_write(number_to_text(list_get(values, index)) + " ");
    index = index + 1;
}
io_write("\n");`.trim(),
    },
    {
        id: "tokenizer",
        group: "Programs",
        label: "Tokenizer",
        note: "Split source text into words and symbols.",
        args: [],
        stdin: "",
        source: String.raw`var source = "var x=1;";
var index = 0;
var token = "";
while (index < text_length(source)) {
    var ch = text_get(source, index);
    if (ch == " " || ch == "=" || ch == ";") {
        if (token != "") {
            io_write(token + "\n");
            token = "";
        }
        if (ch != " ") {
            io_write(ch + "\n");
        }
    } else {
        token = token + ch;
    }
    index = index + 1;
}
if (token != "") {
    io_write(token + "\n");
}`.trim(),
    },
    {
        id: "csv-sum",
        group: "Programs",
        label: "CSV sum",
        note: "Parse numbers from CSV text and add them.",
        args: [],
        stdin: "",
        source: String.raw`var csv = "4,8,15,16,23,42";
var fields = text_split(csv, ",");
var total = 0;
var index = 0;
while (index < list_length(fields)) {
    total = total + number_from_text(list_get(fields, index));
    index = index + 1;
}
io_write(number_to_text(total) + "\n");`.trim(),
    },
];

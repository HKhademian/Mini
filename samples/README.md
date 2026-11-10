# Samples

Samples are grouped by topic. Each source has a case with expected output;
the [playground catalog](../site/README.md) also runs the graphical samples.
For a first pass, try [hello](basics/hello.mini), [bindings](basics/bindings.mini),
[expressions](basics/expressions.mini), [conditionals](basics/if-else.mini),
[loops](basics/while.mini), and [functions](basics/function.mini).

```text
./bin/mini run samples/lists/list-join.mini
./bin/mini verify cases/language/046-004-list-join-sample.case.json
```

## Basics

- [binding-assignment.mini](basics/binding-assignment.mini): Binding initialization and cursor assignment. [Case](../cases/language/003-002-bindings-sample.case.json).
- [expressions.mini](basics/expressions.mini): Arithmetic, comparison, booleans, and text concatenation. [Case](../cases/language/015-002-expressions-sample.case.json).
- [read-defaults.mini](basics/read-defaults.mini): Use `text_get`, `list_get`, and `map_get` defaults, read gaps as zero, and use a negative list index, without null. [Case](../cases/language/037-007-read-defaults-sample.case.json).
- [comments.mini](basics/comments.mini): Document a function with `///` and explain implementation choices with `//`, both alone and after code. [Case](../cases/language/039-002-comments-sample.case.json).
- [shebang.mini](basics/shebang.mini): Use a first-line shebang header and print a line. [Case](../cases/language/049-004-shebang-sample.case.json).
- [bindings.mini](basics/bindings.mini): Bind text and number values. [Case](../cases/showcase/bindings.case.json).
- [booleans.mini](basics/booleans.mini): Combine comparisons with &&. [Case](../cases/showcase/booleans.case.json).
- [function.mini](basics/function.mini): Return a value from a named function. [Case](../cases/showcase/function.case.json).
- [hello.mini](basics/hello.mini): Write one line of text. [Case](../cases/showcase/hello.case.json).
- [if-else.mini](basics/if-else.mini): Choose one of two branches. [Case](../cases/showcase/if-else.case.json).
- [if.mini](basics/if.mini): Run a block when a condition holds. [Case](../cases/showcase/if.case.json).
- [while.mini](basics/while.mini): Repeat while a condition holds. [Case](../cases/showcase/while.case.json).

## Numbers

- [arithmetic.mini](numbers/arithmetic.mini): Multiply and subtract numbers. [Case](../cases/showcase/numbers.case.json).
- [number-to-text.mini](numbers/number-to-text.mini): Print canonical decimal text for zero, a positive number, and a negative number. [Case](../cases/language/047-003-number-to-text-sample.case.json).

## Text

- [concat.mini](text/concat.mini): Join text with +. [Case](../cases/showcase/concat.case.json).
- [normalize-whitespace.mini](text/normalize-whitespace.mini): Scan with `text_length` and `text_get`, replacing tabs and newlines with spaces. [Case](../cases/language/019-004-text-sample.case.json).
- [slice-input.mini](text/slice-input.mini): Read text and print slices with clamping, negative bounds, and an empty reversed range. [Case](../cases/language/041-005-text-slice-sample.case.json).
- [find-input.mini](text/find-input.mini): Read text and report whether it contains two sample words. [Case](../cases/language/042-005-text-find-sample.case.json).
- [split-input.mini](text/split-input.mini): Read comma-separated text and print each field on its own line. [Case](../cases/language/043-005-text-split-sample.case.json).
- [text-bytes.mini](text/text-bytes.mini): Turn text into its byte values. [Case](../cases/showcase/text-bytes.case.json).
- [text-codes.mini](text/text-codes.mini): Round-trip a character through its code point and print values directly. [Case](../cases/showcase/text-codes.case.json).
- [text-find.mini](text/text-find.mini): Locate a word inside text. [Case](../cases/showcase/text-find.case.json).
- [text-get.mini](text/text-get.mini): Read the first and last character. [Case](../cases/showcase/text-get.case.json).
- [text-length.mini](text/text-length.mini): Count characters. [Case](../cases/showcase/text-length.case.json).
- [text-reverse.mini](text/text-reverse.mini): Walk backwards and build a new string. [Case](../cases/showcase/text-reverse.case.json).
- [text-slice.mini](text/text-slice.mini): Slice with positive and negative bounds. [Case](../cases/showcase/text-slice.case.json).
- [text-split.mini](text/text-split.mini): Split text on a literal separator. [Case](../cases/showcase/text-split.case.json).
- [text-vowels.mini](text/text-vowels.mini): Combine a loop with character comparisons. [Case](../cases/showcase/text-vowels.case.json).

## Lists

- [argument-list.mini](lists/argument-list.mini): Read command-line arguments as a list, print its length, and visit each item with `list_get`. [Case](../cases/language/024-003-list-sample.case.json).
- [list-mutation.mini](lists/list-mutation.mini): Use `list_new` and `list_set` for growth, replacement, negative indices, and mixed/nested values. [Case](../cases/language/029-008-list-mutation-sample.case.json).
- [list-copy-isolation.mini](lists/list-copy-isolation.mini): Copy a list and show that changing the copy leaves the original intact. [Case](../cases/language/045-004-list-copy-sample.case.json).
- [list-join.mini](lists/list-join.mini): Build a list with `list_of` and join its words with `list_join`. [Case](../cases/language/046-004-list-join-sample.case.json).
- [list-copy.mini](lists/list-copy.mini): Changing the copy leaves the original intact. [Case](../cases/showcase/list-copy.case.json).
- [list-create.mini](lists/list-create.mini): Set two items and read the length. [Case](../cases/showcase/list-create.case.json).
- [list-get.mini](lists/list-get.mini): Use a negative index for the last item. [Case](../cases/showcase/list-get.case.json).
- [list-lines.mini](lists/list-lines.mini): Split text into lines and join them again. [Case](../cases/showcase/list-lines.case.json).
- [list-max.mini](lists/list-max.mini): Scan a list and keep the best value. [Case](../cases/showcase/list-max.case.json).
- [list-queue.mini](lists/list-queue.mini): Push at the back and pop from the front. [Case](../cases/showcase/list-queue.case.json).
- [list-reverse.mini](lists/list-reverse.mini): Walk a list backwards and join the items. [Case](../cases/showcase/list-reverse.case.json).
- [list-stack.mini](lists/list-stack.mini): Push and pop from the back. [Case](../cases/showcase/list-stack.case.json).
- [list-sum.mini](lists/list-sum.mini): Accumulate numbers in a loop. [Case](../cases/showcase/list-sum.case.json).

## Maps

- [map-operations.mini](maps/map-operations.mini): Use `map_new`, `map_set`, `map_get`, `map_has`, and `map_keys`; count the key list with `list_length`, read replacement values, distinguish missing keys, and snapshot keys. [Case](../cases/language/033-005-map-sample.case.json).
- [map-copy-isolation.mini](maps/map-copy-isolation.mini): Copy a map and show that changing the copy leaves the original intact. [Case](../cases/language/044-004-map-copy-sample.case.json).
- [map-copy.mini](maps/map-copy.mini): Changing the copy leaves the original intact. [Case](../cases/showcase/map-copy.case.json).
- [map-create.mini](maps/map-create.mini): Set and read text-keyed values. [Case](../cases/showcase/map-create.case.json).
- [map-has.mini](maps/map-has.mini): Test for a key before reading it. [Case](../cases/showcase/map-has.case.json).
- [map-keys.mini](maps/map-keys.mini): Take a key snapshot and count it. [Case](../cases/showcase/map-keys.case.json).
- [map-nested.mini](maps/map-nested.mini): Store a map inside another map. [Case](../cases/showcase/map-nested.case.json).
- [map-replace.mini](maps/map-replace.mini): Setting an existing key keeps the key count. [Case](../cases/showcase/map-replace.case.json).
- [map-word-count.mini](maps/map-word-count.mini): Count repeated words with a map. [Case](../cases/showcase/map-word-count.case.json).

## JSON

- [map-parse.mini](json/map-parse.mini): Parse an object and read a field. [Case](../cases/showcase/map-parse.case.json).
- [map-array.mini](json/map-array.mini): Parse an array and read an item. [Case](../cases/showcase/map-array.case.json).
- [json-to-text.mini](json/json-to-text.mini): Build a map and print compact deterministic JSON text. [Case](../cases/language/048-004-json-to-text-sample.case.json).
- [json-read.mini](json/json-read.mini): Parse standard-input JSON and print its name field. [Case](../cases/language/051-003-json-read-sample.case.json).

## Input and output

- [echo-input.mini](io/echo-input.mini): Copy stdin to stdout with `io_read_all` and `io_write`. [Case](../cases/language/005-002-io-sample.case.json).
- [diagnostic.mini](io/diagnostic.mini): Use `io_write_error` before an unsuccessful exit. [Case](../cases/language/026-003-write-error-sample.case.json).

## Files and directories

- [copy-file.mini](files/copy-file.mini): Copy and print a file with `file_read` and `file_write`. [Case](../cases/language/021-003-file-sample.case.json).
- [host-files.mini](files/host-files.mini): Write a note in a fresh temporary directory, read it back, and clean up. [Case](../cases/language/050-003-host-files-sample.case.json).

## Processes

- [exit.mini](process/exit.mini): Use `process_exit` when an argument is missing. [Case](../cases/language/025-004-process-exit-sample.case.json).
- [process-run.mini](process/process-run.mini): Run Node once, capture its output and status, and print them. [Case](../cases/language/049-004-process-run-sample.case.json).

## Programs and algorithms

- [binary-search.mini](programs/binary-search.mini): Find a value in a sorted list. [Case](../cases/showcase/binary-search.case.json).
- [bubble-sort.mini](programs/bubble-sort.mini): Sort a small list in place. [Case](../cases/showcase/bubble-sort.case.json).
- [caesar.mini](programs/caesar.mini): Shift character codes by one. [Case](../cases/showcase/caesar.case.json).
- [csv-sum.mini](programs/csv-sum.mini): Parse numbers from CSV text and add them. [Case](../cases/showcase/csv-sum.case.json).
- [factorial.mini](programs/factorial.mini): A recursive function. [Case](../cases/showcase/factorial.case.json).
- [fibonacci.mini](programs/fibonacci.mini): Print an iterative sequence without manual number formatting. [Case](../cases/showcase/fibonacci.case.json).
- [fizzbuzz.mini](programs/fizzbuzz.mini): Classic division and branching. [Case](../cases/showcase/fizzbuzz.case.json).
- [palindrome.mini](programs/palindrome.mini): Reverse text and compare. [Case](../cases/showcase/palindrome.case.json).
- [primes.mini](programs/primes.mini): Trial division up to a limit. [Case](../cases/showcase/primes.case.json).
- [tokenizer.mini](programs/tokenizer.mini): Split source text into words and symbols. [Case](../cases/showcase/tokenizer.case.json).

## Games

- [asterix-board.mini](games/asterix-board.mini): Press Space, W, or Up to jump incoming obstacles. Clear them at three steps per second. [Case](../cases/showcase/asterix-board.case.json).
- [breakout-board.mini](games/breakout-board.mini): Starts with Space; arrows or A/D steer; P pauses. Short tones mark wall, brick, paddle, miss, and win events. [Case](../cases/showcase/breakout-board.case.json).
- [freeway-board.mini](games/freeway-board.mini): Cross the road with arrows or WASD. Three traffic lanes move at two, three, and four steps per second. [Case](../cases/showcase/freeway-board.case.json).
- [frogger-board.mini](games/frogger-board.mini): Move Frogger through traffic that advances at a configurable 3 steps per second. [Case](../cases/showcase/frogger-board.case.json).
- [lunar-lander-board.mini](games/lunar-lander-board.mini): Use Up or Space to spend fuel and slow down, steer toward the green pad, and land at two positions per second with speed two or less. [Case](../cases/showcase/lunar-lander-board.case.json).
- [pacman-board.mini](games/pacman-board.mini): Collect corridor dots with arrows or WASD and avoid the ghost as it patrols at one step per second. [Case](../cases/showcase/pacman-board.case.json).
- [pong-board.mini](games/pong-board.mini): Move the left paddle with W/S and the right paddle with the arrow keys. The ball moves at three steps per second. [Case](../cases/showcase/pong-board.case.json).
- [qbert-board.mini](games/qbert-board.mini): Hop with diagonal arrow moves (Up/Left go up; Right/Down go down) and change every tile's color. [Case](../cases/showcase/qbert-board.case.json).
- [seaquest-board.mini](games/seaquest-board.mini): Steer the submarine with arrows or WASD, touch all three divers, and avoid the enemy before oxygen runs out. [Case](../cases/showcase/seaquest-board.case.json).
- [snake-board.mini](games/snake-board.mini): Steer with arrows or WASD, eat the red food, and avoid walls and your tail. Moves at three steps per second. [Case](../cases/showcase/snake-board.case.json).
- [space-invaders-board.mini](games/space-invaders-board.mini): Move with arrows or A/D, fire with Space, and clear the formation before it reaches you. Invaders move twice per second; shots move four times per second. [Case](../cases/showcase/space-invaders-board.case.json).
- [tetris-board.mini](games/tetris-board.mini): Move with arrows or A/D, rotate with Up/W, soft-drop with Down/S, hard-drop with Space, and clear rows. Pieces fall twice per second. [Case](../cases/showcase/tetris-board.case.json).

## Pixel art

- [pixel-checkerboard.mini](graphics/art/pixel-checkerboard.mini): Render a two-color checkerboard once on a ten-by-ten board. [Case](../cases/showcase/pixel-checkerboard.case.json).
- [pixel-gradient.mini](graphics/art/pixel-gradient.mini): Render a horizontal blue-to-lavender color gradient once on a ten-by-ten board. [Case](../cases/showcase/pixel-gradient.case.json).
- [pixel-heart.mini](graphics/art/pixel-heart.mini): Build and render a red heart once from a ten-by-ten text pattern. [Case](../cases/showcase/pixel-heart.case.json).
- [pixel-icons.mini](graphics/art/pixel-icons.mini): Render a small house and a right arrow once on a ten-by-ten board. [Case](../cases/showcase/pixel-icons.case.json).
- [pixel-one.mini](graphics/art/pixel-one.mini): Render a single white pixel once on a black ten-by-ten board. [Case](../cases/showcase/pixel-one.case.json).
- [pixel-shapes.mini](graphics/art/pixel-shapes.mini): Render a horizontal line, outline box, and diagonal once on a ten-by-ten board. [Case](../cases/showcase/pixel-shapes.case.json).
- [pixel-stripes.mini](graphics/art/pixel-stripes.mini): Render alternating vertical colors once on a ten-by-ten board. [Case](../cases/showcase/pixel-stripes.case.json).

## Animation

- [pixel-beating-heart.mini](graphics/animation/pixel-beating-heart.mini): Pulse a pixel heart about once per second between two sizes and shades of red. [Case](../cases/showcase/pixel-beating-heart.case.json).
- [pixel-blink.mini](graphics/animation/pixel-blink.mini): A warm smiling face blinks about once every three seconds on a soft blue background. [Case](../cases/showcase/pixel-blink.case.json).
- [pixel-blinking-dot.mini](graphics/animation/pixel-blinking-dot.mini): Ease a centered pixel between soft blue shades at four color steps per second. [Case](../cases/showcase/pixel-blinking-dot.case.json).
- [pixel-dvd.mini](graphics/animation/pixel-dvd.mini): Bounce a compact DVD logo around a 31×23 blue screen at 3 steps per second. [Case](../cases/showcase/pixel-dvd.case.json).
- [pixel-moving.mini](graphics/animation/pixel-moving.mini): Move and bounce a pixel at a configurable 5 steps per second. [Case](../cases/showcase/pixel-moving.case.json).
- [pixel-rain.mini](graphics/animation/pixel-rain.mini): Move three drops at three steps per second and wrap them to the top. [Case](../cases/showcase/pixel-rain.case.json).
- [pixel-resize.mini](graphics/animation/pixel-resize.mini): Draw new frames on the same canvas while its square size changes from five to nine pixels, three times per second. [Case](../cases/showcase/pixel-resize.case.json).
- [pixel-walk-cycle.mini](graphics/animation/pixel-walk-cycle.mini): Switch between small character poses to suggest walking. [Case](../cases/showcase/pixel-walk-cycle.case.json).
- [pixel-wraparound.mini](graphics/animation/pixel-wraparound.mini): Move a pixel across the board at three steps per second and wrap at the edge. [Case](../cases/showcase/pixel-wraparound.case.json).

## Interaction

- [pixel-arrows.mini](graphics/interactive/pixel-arrows.mini): Move the yellow pixel around the green goal with arrows or WASD. [Case](../cases/showcase/pixel-arrows.case.json).
- [pixel-cursor-draw.mini](graphics/interactive/pixel-cursor-draw.mini): Move the pointer across the canvas to paint a lasting trail of pixels. [Case](../cases/showcase/pixel-cursor-draw.case.json).
- [pixel-light-switch.mini](graphics/interactive/pixel-light-switch.mini): Press Space or Enter to switch a small lamp on and off. [Case](../cases/showcase/pixel-light-switch.case.json).
- [pixel-maze.mini](graphics/interactive/pixel-maze.mini): Use arrows or WASD to reach the green goal without crossing walls. [Case](../cases/showcase/pixel-maze.case.json).

## Audio

- [pixel-arpeggio.mini](graphics/audio/pixel-arpeggio.mini): Press Space to start or pause a four-note melody paced at two notes per second. [Case](../cases/showcase/pixel-arpeggio.case.json).
- [pixel-chord-pad.mini](graphics/audio/pixel-chord-pad.mini): Play C, F, or G major chords using keys 1–3 or the arrow keys. [Case](../cases/showcase/pixel-chord-pad.case.json).
- [pixel-soundboard.mini](graphics/audio/pixel-soundboard.mini): Move over and click one of four colored pads to play its note. [Case](../cases/showcase/pixel-soundboard.case.json).
- [pixel-tone.mini](graphics/audio/pixel-tone.mini): Play four short tones with the arrow keys or WASD; the canvas stays responsive without an update loop. [Case](../cases/showcase/pixel-tone.case.json).

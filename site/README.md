# Showcase site

Sources for the public landing page and playground.

The build and serve scripts are handwritten TypeScript support code run directly
by Node, not compiler output; the compiler's generated JavaScript goes to
`dist/`.

## Local check

Build with Node after the generated tools exist, then serve the result:

```text
./bin/bootstrap
./site/build.ts
./site/serve.ts
```

Open <http://127.0.0.1:8080/> and <http://127.0.0.1:8080/playground/>. Use
`PORT=8090 ./site/serve.ts` when 8080 is taken. The server reads only
`dist/site/`, sets `no-store`, and has no other dependencies.

Output goes to `dist/site/`, which is ignored by Git. The build compiles and
runs the samples, emits `playground/compiler.js` from `dist/compile.js`, and is
deterministic. It writes nothing else. The header wordmark and favicon come from
[`brand/`](../brand/README.md).

Both pages show the full source revision, with the 12-character prefix in bold,
linked to its commit. `build.json` records the full commit and short revision.

## Mini Play

Import `extra/canvas` to declare the board and `extra/board` to build
row-major RGB frames:

```mini
import "extra/canvas";
import "extra/board";

screen_size := 10;

canvas_play("Example");

fn canvas_on_update(dt) {
    board := pixel_board_new(screen_size, screen_size, pixel_rgb(0, 0, 0));
    pixel_board_set(board, screen_size, screen_size, 5, 5, pixel_rgb(255, 255, 255));
    pixel_board_draw(screen_size, screen_size, board);
}
```

`canvas_play(title)` selects play mode and sets its title. Optional
`canvas_on_init()` runs once after the program starts. Optional
`canvas_on_update(dt)` receives elapsed seconds and produces frames; falling
through returns zero and continues, while a nonzero result stops animation.
Without an update handler, the canvas displays its current frame without
starting an animation loop. Optional input handlers are
`canvas_on_key_down(key)`, `canvas_on_key_up(key)`,
`canvas_on_pointer_move(column, row)`,
`canvas_on_pointer_down(column, row, button)`, and
`canvas_on_pointer_up(column, row, button)`. `canvas_draw(width, height, pixels)`
stores one row-major frame with `width * height` packed RGB integers from
`0x000000` to `0xffffff`. The host reads frame dimensions and pixels through
`canvas_get_width()`, `canvas_get_height()`, and `canvas_get_pixels()`; the pixel
getter returns the stored list without copying. `canvas_get_title()` returns the
current title. Each update can call `canvas_draw(...)` again on the same canvas;
the host uses that frame's current dimensions and pixels. `pixel_board_new`,
`pixel_board_set`, `pixel_board_get`, and
`pixel_rgb` help construct boards. The same Mini calls can
be hosted by other renderers, such as Raylib; each host owns its frame loop and
drawing.

Import `extra/audio` to request a tone with `audio_tone(frequency, duration_ms,
volume_percent)`. Frequency is in hertz (20–20,000), duration is in milliseconds
(up to 3,000), and volume is a percent (1–100); invalid values are ignored.
The library queues tone triples for the host, which drains them with `audio_tone_drain()` after
each program or event callback. The browser host plays sine tones with a short
gain fade and unlocks Web Audio on a user gesture.

For a still image, build the pixel list and call `canvas_draw(...)` once at
top level without declaring `canvas_play`; the playground
shows the rendered frame without starting an animation loop.

Opening `dist/site/index.html` from `file://` shows the landing page, but the
playground needs an HTTP origin because it uses a module worker.

## Publishing to GitHub Pages

The site deploys from `.github/workflows/pages.yml` on pushes to `main` and by
manual dispatch. It runs only when the repository is public or a manual run is
requested.

1. Make the repository public: **Settings → General → Danger Zone → Change
   repository visibility → Make public**.
2. Enable Pages: **Settings → Pages → Build and deployment → Source → GitHub
   Actions**.
3. Push `main`, or run **Actions → Pages → Run workflow**.
4. The first deployment prints the URL, normally
   `https://OWNER.github.io/Mini/`.

All links and assets are relative, so the repository subpath works without a
build setting. A custom domain can be added later in the same Pages settings.

Before making the repository public, confirm the licence and that no secrets or
private references remain in the tree or history.

## Syntax highlighting

Mini source uses the compiler's lexer and maps its token kinds to CSS classes.
Generated JavaScript uses a JavaScript scanner, so its coloring does not depend
on Mini accepting the generated syntax. Both live in [`highlight.js`](highlight.js),
which is copied into `dist/site/` for the playground. Invalid Mini source falls
back to escaped plain text. The build strips the compiler's CLI entry before
loading it.

## Generated-code modes

The playground switches between two JavaScript views of the same program:

- **Program only** (default): generated JavaScript for the user's source,
  without expanded library files or host setup. It is for reading and is not
  runnable on its own.
- **Runtime + program**: the adapters and expanded libraries the program uses,
  then the program. This is what runs.

The views are compiled on demand. **Play** runs the program and **Compile only**
updates the generated view without running it. Both actions sit at the right of
the output header, with the tabs on the left. Switching views does not rerun or
change the selected panel. The build bundles `libs/` into
`playground/imports.js`, allowing examples to expand library imports in the
browser. Other filesystem access remains unavailable. A third, **Reference**
view is present but hidden. It uses the imported Mini implementations instead
of emitter host overrides where those fallbacks exist. It still relies on host
access for representation primitives and I/O, so keep it hidden until the view
is ready for users.

The footer reads compiler, language, and `play` product versions from the
registry. `play` is currently unassigned. Syntax highlighting ships as part of
the playground and has no independent version.

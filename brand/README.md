# Mini brand assets

Canonical static marks for Mini. Use these files instead of copying geometry
from the site or the editor.

| File | Use |
| --- | --- |
| [mini-wordmark.svg](mini-wordmark.svg) | `mini` wordmark for headers and banners |
| [mini-mark.svg](mini-mark.svg) | `m` monogram for favicons and tight spaces |
| [mini-favicon.svg](mini-favicon.svg) | Theme-aware favicon built from the monogram |

The mark is monoline: a 2-unit stroke with round caps and joins on a 16-unit
x-height grid. The wordmark is 36×16; the monogram is 16×16. The wordmark and
monogram use `currentColor`, so inline them or set `color` when embedding them;
as an `<img>` they default to black. The favicon selects `#0369A1` or `#7DD3FC`
from `prefers-color-scheme` and mirrors the monogram, so update both when the
mark changes.

Keep the geometry unchanged when scaling. Do not add gradients, shadows,
outlines, or additional colors. Use the wordmark at 20 px high or larger and
the monogram at 16 px or larger.

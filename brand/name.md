# The mini name

## Decision

Write the project and language name as `mini`, lowercase, in prose and headings.
Use `mini` in code for the command and `.mini` for source files.

The wordmark is the display form: the first `m` takes the brand accent, while
`ini` stays in the text colour. The `m` is the mark: it is the monogram, the
first arch of the wordmark, and the only coloured part of the name. Do not
italicise the name, capitalise it, or change its case for emphasis.

On surfaces without colour, the name is plain lowercase `mini`. The wordmark is
then the only place the accent appears.

## Surfaces

| Surface | Form |
| --- | --- |
| Wordmark | Two-tone `m` + `ini` in [mini-wordmark.svg](mini-wordmark.svg) |
| Site prose | Lowercase name with `.name-m` on the `m` |
| Docs, Markdown | Lowercase plain `mini`; the wordmark carries the accent |
| CLI, editor UI | Lowercase plain `mini` |
| Commands, files | `mini`, `.mini` |

## Options considered

| Option | Form | Where it works | Why it is not current |
| --- | --- | --- | --- |
| Capitalised | `Mini` | All text | Does not match the lowercase identity |
| Lowercase plain | `mini` | All text | Baseline fallback; has no mark of its own |
| Italic | `*mini*` | All text | Reads as emphasis, not a name |
| Bold word | `**mini**` | All text | Reads as emphasis |
| Bold `m` | `**m**ini` | All text | Portable, but reads as a typo or emphasis |
| Small caps | `MINI` | Site, CSS | Reads as an acronym |
| Monospace | `mini` | All text | Reserved for commands |
| Accent word | `mini` | Site | Competes with links |
| Accent i-dots | Wordmark | Site | Too subtle without the `m` |
| Two-tone `m` | `mini` | Site, wordmark | Chosen; needs colour, so docs fall back |
| Rounded font | `mini` | Site | Closest text match; does not work in docs |
| Custom `m` inline | `mini` | Site | Glyph mismatch, breaks text selection; logo only |
| Tracking | `mini` | Site | Too quiet to carry the name |
| Underline | `mini` | Site | Reads as a link |
| Pill | `mini` | Site | Reads as a UI label |
| Trailing dot | `mini.` | All text | Reads as sentence punctuation |
| Unicode pseudo-styles | `ᴍɪɴɪ`, `𝐦𝐢𝐧𝐢` | All text | Breaks search, copy, and screen readers |

## Switching

### Wordmark

Two-tone `m` is the current rule in [site/style.css](../site/style.css):

```css
.brand { color: var(--text); }
.brand .brand-m { color: var(--accent); }
```

Other treatments only change those colours:

```css
/* Full accent */
.brand { color: var(--accent); }

/* Monochrome */
.brand { color: var(--text); }
.brand .brand-m { color: inherit; }

/* Accent i-dots */
.brand-dots { color: var(--accent); }
```

The `brand-m` and `brand-dots` classes are in
[mini-wordmark.svg](mini-wordmark.svg).

### Prose

The current site markup is:

```html
<span class="name"><span class="name-m">m</span>ini</span>
```

```css
.name-m { color: var(--accent); }
```

A future switch can use the same span with different CSS:

```css
/* Full accent */
.name { color: var(--accent); }

/* Rounded approximation of the wordmark */
.name {
  font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  font-weight: 500;
}

/* Plain lowercase, no mark */
/* Remove the span and write: mini */
```

Markdown has no colour or custom fonts. Use plain `mini`; if a marker is
required, `**m**ini` is the only portable one, but it reads as emphasis. Italic
`*mini*` is not used.

### Wordmark inline

Do not put the custom `m` glyph in running text. The monogram is a logo device;
in body text it mismatches the surrounding font and breaks text selection and
search. Use the wordmark only for display: the site header, the README title
area, and social cards.

## Pending surfaces

None. The VS Code display name, language alias, configuration title, grammar
name, output channel, error message, and the generated tools' diagnostics use
lowercase mini as of VS Code 0.3.6 and CLI 0.1.0-alpha.17.

- `CHANGELOG.md` and the archived `.agents/plans/` keep their historical
  spelling.
- Sample data strings such as `"Mini"` are values, not name references, and
  stay as written.
- The `MiniClient` TypeScript class name is an identifier, not display text.

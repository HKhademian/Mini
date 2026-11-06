/// Syntax highlighting for Mini source that runs in the browser.
///
/// The generated compiler already exposes `tokenize`, so highlighting uses the
/// language's real lexer instead of a duplicate grammar. Both the static pages
/// and the playground import this module.
///
/// Token kinds come from the lexer: `keyword`, `identifier`, `number`, `text`,
/// `symbol`, `comment`, and `shebang`. Identifiers that name a call are split
/// into `function` and `plain` so calls read differently from bindings.

/// Return the token kind class for one lexer token.
function tokenClass(kind) {
    if (kind === "keyword") return "kw";
    if (kind === "number") return "num";
    if (kind === "text") return "str";
    if (kind === "comment") return "com";
    if (kind === "shebang") return "she";
    if (kind === "symbol") return "op";
    return "id";
}

/// Return true when the token at index opens a call.
function isCall(tokens, index) {
    const next = tokens[index + 1];
    return next !== undefined && next.kind === "symbol" && next.text === "(";
}

/// Return builtin-looking names by their trailing underscore convention.
function isBuiltinName(text) {
    return text.includes("_");
}

/// Highlight one source string and return HTML.
///
/// `tokenize` is injected so the same function serves the Node build and the
/// browser playground. Unknown or invalid source falls back to escaped text.
export function highlight(source, tokenize) {
    let tokens;
    try {
        tokens = tokenize(source, "highlight.mini", true);
    } catch {
        return escapeHtml(source);
    }
    let html = "";
    let cursor = 0;
    let valid = true;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.kind === "eof") continue;
        if (typeof token.start !== "number" || typeof token.end !== "number" || token.start < cursor || token.end > source.length) {
            valid = false;
            break;
        }
        html += escapeHtml(source.slice(cursor, token.start));
        let name = tokenClass(token.kind);
        if (token.kind === "identifier") {
            if (isCall(tokens, index)) name = isBuiltinName(token.text) ? "fn" : "call";
            else name = "id";
        }
        html += `<span class="tk-${name}">${escapeHtml(source.slice(token.start, token.end))}</span>`;
        cursor = token.end;
    }
    if (!valid) return escapeHtml(source);
    return html + escapeHtml(source.slice(cursor));
}

/// Escape text for HTML.
export function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

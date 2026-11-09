/// Syntax highlighting for Mini source and generated JavaScript.
///
/// Mini source uses the compiler's lexer. Generated JavaScript uses a small
/// JavaScript scanner because generated code does not follow Mini syntax.
/// Static pages and the playground import this module.
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

/// Return whether a function name carries the common API's domain prefix.
function hasDomainPrefix(text) {
    return text.includes("_");
}

const javascriptKeywords = new Set([
    "as", "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "default", "delete", "do", "else", "export", "extends", "finally",
    "for", "from", "function", "get", "if", "import", "in", "instanceof", "let",
    "new", "of", "return", "set", "static", "super", "switch", "this", "throw", "try", "typeof",
    "var", "void", "while", "with", "yield",
]);

const javascriptOperators = [
    ">>>=", "<<=", ">>=", "**=", "&&=", "||=", "??=", "===", "!==", ">>>", "...", "=>", "==", "!=",
    "<=", ">=", "++", "--", "&&", "||", "??", "?.", "+=", "-=", "*=", "/=", "%=",
    "**", "<<", ">>", "&=", "|=", "^=",
];
const javascriptNumber = /(?:0[xX][\da-fA-F]+n?|0[bB][01]+n?|0[oO][0-7]+n?|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?n?)/y;

/// Highlight generated JavaScript without asking the Mini lexer to parse it.
export function highlightJavaScript(source) {
    let html = "";
    let index = 0;
    while (index < source.length) {
        const start = index;
        const char = source[index];
        if (/\s/.test(char)) {
            while (index < source.length && /\s/.test(source[index])) index++;
            html += escapeHtml(source.slice(start, index));
            continue;
        }
        if (source.startsWith("//", index)) {
            index += 2;
            while (index < source.length && source[index] !== "\n") index++;
            html += `<span class="tk-com">${escapeHtml(source.slice(start, index))}</span>`;
            continue;
        }
        if (source.startsWith("/*", index)) {
            index += 2;
            while (index < source.length && !source.startsWith("*/", index)) index++;
            index = Math.min(source.length, index + 2);
            html += `<span class="tk-com">${escapeHtml(source.slice(start, index))}</span>`;
            continue;
        }
        if (char === "'" || char === '"' || char === "`") {
            index++;
            while (index < source.length) {
                if (source[index] === "\\") {
                    index = Math.min(source.length, index + 2);
                } else if (source[index++] === char) {
                    break;
                }
            }
            html += `<span class="tk-str">${escapeHtml(source.slice(start, index))}</span>`;
            continue;
        }
        javascriptNumber.lastIndex = index;
        const number = javascriptNumber.exec(source);
        if (number !== null) {
            index += number[0].length;
            html += `<span class="tk-num">${escapeHtml(number[0])}</span>`;
            continue;
        }
        if (/[A-Za-z_$]/.test(char)) {
            index++;
            while (index < source.length && /[\w$]/.test(source[index])) index++;
            const word = source.slice(start, index);
            const next = source.slice(index).match(/^\s*\(/);
            const kind = javascriptKeywords.has(word) ? "kw"
                : ["true", "false", "null", "undefined", "NaN", "Infinity"].includes(word) ? "num"
                : next !== null ? "call" : "id";
            html += `<span class="tk-${kind}">${escapeHtml(word)}</span>`;
            continue;
        }
        const operator = javascriptOperators.find(value => source.startsWith(value, index));
        if (operator !== undefined) index += operator.length;
        else index++;
        html += `<span class="tk-op">${escapeHtml(source.slice(start, index))}</span>`;
    }
    return html;
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
            if (isCall(tokens, index)) name = hasDomainPrefix(token.text) ? "fn" : "call";
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

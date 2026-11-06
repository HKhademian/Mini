/// Types for the browser-shared highlighter module.

export type Token = {
    readonly kind: string;
    readonly text: string;
    readonly start: number;
    readonly end: number;
};

export function highlight(source: string, tokenize: (source: string, name: string, comments: boolean) => readonly Token[]): string;
export function escapeHtml(text: string): string;

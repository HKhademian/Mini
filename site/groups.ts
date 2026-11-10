/// Keep the first appearance of each group and each entry's original index.
export function groupSamples<T extends { readonly group: string }>(samples: readonly T[]): {
    readonly name: string;
    readonly entries: readonly { readonly sample: T; readonly index: number }[];
}[] {
    const groups = new Map<string, { sample: T; index: number }[]>();
    samples.forEach((sample, index) => {
        const entries = groups.get(sample.group) ?? [];
        entries.push({ sample, index });
        groups.set(sample.group, entries);
    });
    return [...groups].map(([name, entries]) => ({ name, entries }));
}

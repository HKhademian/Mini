# Object-map performance

The [object runtime](map-runtime.md) improves the tested compiler pipeline's
elapsed time and memory, with tradeoffs: its warm CPU increases, and some
dictionary applications slow down. Retain the simple representation for the
M1 port, without claiming that JS objects make every map workload faster.

Measured on 2026-11-03, Node.js, CPU details omitted, platform details omitted. Four clean runs
alternate native-Map output and object output, twice each. The
[raw evidence](map-runtime-performance-baseline.json) retains every measurement,
source identity, correctness check, and common handwritten/T0 control.
See the [suite method](application-performance.md) for timing boundaries.

## Largest inputs

Ranges span the two run medians for each backend. Percentages compare paired
runs A and B; they are observations on one host, not confidence intervals.
Each item lists native-Map output followed by object output.

- Word frequencies: warm wall **16.54–18.12 → 17.59–18.17 ms**, 0–6% slower;
  warm CPU 16.55–18.13 → 17.42–18.15 ms; RSS about 84 MiB in both.
- Log summary: warm wall **3.70–3.82 → 3.51–3.70 ms**, 3–5% faster;
  warm CPU 3.75–3.83 → 3.60–3.73 ms; RSS 83.19–83.27 → 83.70–83.77 MiB.
- CSV cleanup: warm wall **4.52–4.64 → 4.48–4.58 ms**, effectively similar;
  warm CPU 4.52–4.64 → 4.28–4.60 ms; RSS about 87 MiB in both.
- Configuration parsing: warm wall **19.09–19.44 → 18.70–18.98 ms**, about 2%
  faster; warm CPU 20.37–20.70 → 18.86–19.47 ms;
  RSS 95.06–95.08 → 90.72–90.88 MiB.
- Dependency traversal: warm wall **4.65–5.01 → 5.54–6.56 ms**, 19–31% slower;
  warm CPU 5.10–7.54 → 5.88–7.09 ms; RSS 84.69–84.78 → 85.27–85.28 MiB.
- Template rendering: warm wall **3.19–3.28 → 4.39–4.48 ms**, 37–38% slower;
  warm CPU 3.19–3.28 → 4.26–4.48 ms, 33–36% higher;
  RSS about 92 MiB in both.
- Expression evaluation: warm wall **11.87–13.03 → 9.04–9.32 ms**, 24–28%
  faster; warm CPU 11.87–12.91 → 9.04–9.26 ms;
  RSS 86.63–87.05 → 84.16–84.36 MiB.
- Tokenization: warm wall **25.23–25.46 → 22.51–24.48 ms**, 3–12% faster;
  warm CPU 27.25–27.46 → 22.52–24.49 ms;
  RSS 104.73–105.09 → 95.88–96.23 MiB.
- Source indexing: warm wall **27.36–28.86 → 24.38–24.68 ms**, 10–16% faster;
  warm CPU 28.93–29.41 → 25.46–26.47 ms;
  RSS 104.95–105.00 → 95.78–96.23 MiB.
- Compiler pipeline: warm wall **26.09–26.15 → 20.64–21.58 ms**, 17–21% faster;
  warm CPU **26.49–26.61 → 27.91–29.50 ms**, 5–11% higher;
  RSS **106.53–106.86 → 98.77–99.00 MiB**, about 7–8 MiB lower.

RSS is the maximum cold process high-water before output normalization. It
includes Node, imports, input, and application memory. Cold post-call heap
snapshots for the compiler pipeline fall from 20.55–20.65 to 14.62–14.63 MiB;
these include garbage and do not measure retained heap. No forced GC was used.
CPU sums user and system time, including runtime threads, so it can exceed wall
time. These measurements do not isolate why warm CPU rises as wall time falls.

For the 92,300-byte pipeline input, first-call application time falls from
34.95–37.06 to 27.44–27.64 ms. Whole cold-worker time falls from 89.03–96.06 to
83.83–84.45 ms, and cold process CPU from 145.71–155.27 to 132.50–133.05 ms.
Cold worker measurements include the shared harness and output serialization.

## What this establishes

The object pipeline takes 1.18–1.20 times its matched handwritten map-based TS
warm wall time, but **3.73–4.14 times actual handwritten T0**. Tokenization takes
6.42–7.17 times T0, and source indexing 5.40–5.67 times T0. Object storage reduces
some costs; it does not close the compiler performance gap. The benchmark parser
also covers a smaller language than T0, so these are workload comparisons rather
than measurements of the future complete M1.

Common controls show meaningful host/JIT/GC variation: unchanged handwritten
template rendering ranges from 2.74 to 4.64 ms across the four runs; handwritten
word counting ranges from 14.92 to 18.73 ms. Small differences deserve caution.
Both repeats nevertheless show the object pipeline's lower elapsed time/RSS,
higher warm CPU, and the template/dependency wall-time regressions. The suite
does not isolate object layout from adapter, JIT, or GC behavior.

No application source, algorithm, or input changed between these runs. In
particular, none calls the removed count builtin: this comparison measures the
runtime replacement, without adding enumeration work to an application.
Counting remains `list_length(map_keys(items))`: it allocates a key snapshot and
takes work proportional to the number of keys. Compiler workloads have no need
for a dedicated count operation or per-write count maintenance.

Proceed with the structurally faithful M1 port. Keep the regressions visible
and profile the actual generated compiler after parity and its fixed point.
M1 is still absent; this suite cannot establish that T0 can be retired.

## Verification and provenance

- Four runs × 69 variant/size groups × 10 measured calls: **2,760 verified timed
  calls**, plus 184 semantic fixture checks and 12 executions of emitted TS.
- All runs used clean commit `7cba0bf` and identical harness, Mini/handwritten
  application, reference-module, input, and expected-output identities.
- Before runs selected a frozen copy of the five compiler source files from
  `6839938`, with their relative paths preserved and an ESM package marker.
  Every source hash and their combined hash were checked; all ten generated
  application hashes match the [historical baseline](application-performance-baseline.json).
- The harness's override mode records only the selected entry-file hash and
  reads version metadata from the current checkout. Therefore the before runs'
  `versions` field describes group 0.3.0, while their selected compiler was group
  0.2.0. The raw report's `beforeCompilerIdentity` supplies the actual old versions,
  revision, five source hashes, and combined hash. After runs use the configured
  five-source compiler hash, group 0.3.0/compiler 0.3.0-alpha.1.
- Paths in raw runs identify local scratch assets. Reproduce with
  `node tools/application-performance.ts REPORT.json OLD/compiler/t0.ts` for the
  frozen old compiler, and omit the final argument for the current compiler.
  Run sequentially on the same host. Generated hashes repeat within each backend.
- Code verification at `7cba0bf`: 258 active repository scenarios passed, four
  existing proposals pending; all 69 application smoke combinations and ten
  compiler/release/editor tests passed. Map-specific checks cover special keys,
  shared values, missing reads, key snapshots, and argument evaluation order.

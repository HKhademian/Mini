# Paired application results

Historical native-Map baseline. The later
[object-backed runtime](map-runtime.md) changes generated storage; the recorded
samples below retain their original source and version identities.

Measured on 2026-11-03 with Node.js, CPU details omitted, platform details omitted. The
[suite and method](application-performance.md) were committed as `2d8b315` before
these two runs. Both recorded clean checkouts and matching source, generated,
input/output, harness, and compiler hashes. Compiler/language: 0.2.0-alpha.4.
The [raw evidence](application-performance-baseline.json) includes every sample.
An earlier exploratory run is excluded from this baseline.

## Assessment

The current subset runs meaningful application and compiler-style workloads
correctly. It is a viable basis for writing the first M1. It does not establish
performance parity with T0, nor justify retiring T0 before measuring the real M1
and its generated compiler through the complete self-build.

At the largest inputs, six general data-processing applications took about
1.02–1.25 times their matched handwritten TS warm wall time. Recursive expression
evaluation took 1.61–1.65 times. The map-based scanner and source index had more
overhead: 1.88–1.93 and 1.57–1.61 times respectively. The compiler pipeline took
1.40 times the matched map-based TS.

Compared with the actual handwritten T0 modules, the scanner took 7.26–9.14
times the warm wall time, indexing 6.36–6.59 times, and the compiler pipeline
4.34–4.79 times. These comparisons include necessary port adaptations such as
named-field maps, explicit state, and character helpers, as well as differences
between the subset parser and the full T0 parser. They do not isolate one cause.

The slowdown is material, but absolute time matters too: the 92,300-byte compiler
input completed in about 24 ms warm. Its process RSS before output normalization
was 106–107 MiB, versus 98–99 MiB for T0. These workloads show no crash, incorrect
result, or explosive growth across the three tested sizes. They are not a full
compiler workload, a memory limit, or proof about larger/unusual programs.

## Coverage

- Ten paired applications and three sizes each; actual-T0 variants for three
  compiler-oriented applications: 69 variant/size groups per run.
- Three cold calls and seven measured warm calls per group, plus three warmups.
  Across two runs, all **1,380 measured calls** passed result verification.
- Both runs also passed 46 explicit small semantic variant/fixture checks.
- All three sizes of the compiler's exact emitted TS ran successfully in each
  run: six additional generated-program execution checks.
- The suite's separate correctness smoke test passed 69 combinations, and the
  existing 259 active repository scenarios passed; four proposals remain pending.

## Largest inputs: matching handwritten TS

Each entry lists generated Mini / handwritten TS. Time ranges span the two
run medians, not individual-sample minima/maxima. CPU is warm application user
plus system CPU. RSS is each run's maximum cold process high-water before output
normalization; it includes Node, imports, input, and application memory.
Ratios above are calculated within runs, not by crossing the range extremes.

- **Word frequencies, 1,248,000 bytes:** warm wall 16.73–18.12 / 14.69–17.84 ms;
  CPU 16.73–18.14 / 14.75–17.85 ms; RSS 84.22–84.27 / 84.08–84.17 MiB.
- **Log summary, 324,169 bytes:** warm wall 3.64–3.88 / 3.25–3.41 ms;
  CPU 3.66–3.89 / 3.32–3.41 ms; RSS 83.33–83.44 / 82.69–82.72 MiB.
- **CSV cleanup, 491,574 bytes:** warm wall 4.47–5.31 / 4.05–4.67 ms;
  CPU 4.40–5.25 / 4.05–4.68 ms; RSS 87.31–87.38 / 86.80–86.81 MiB.
- **Configuration parsing, 688,900 bytes:** warm wall 18.72–18.87 / 17.82–18.26 ms;
  CPU 20.06–20.10 / 19.11–19.47 ms; RSS 94.95–94.98 / 97.42–97.56 MiB.
- **Dependency traversal, 285,811 bytes:** warm wall 4.52–4.61 / 4.16–4.25 ms;
  CPU 4.83–5.19 / 4.47–5.39 ms; RSS 84.84–84.92 / 84.38 MiB.
- **Template rendering, 440,043 bytes:** warm wall 3.18–3.38 / 2.71–2.86 ms;
  CPU 3.18–3.38 / 2.71–2.87 ms; RSS 92.45–92.47 / 91.73–91.78 MiB.
- **Expression evaluation, 350,350 bytes:** warm wall 11.64–11.87 / 7.07–7.36 ms;
  CPU 11.63–11.96 / 7.07–7.39 ms; RSS 86.42–86.61 / 93.08–93.31 MiB.
- **Tokenization, 192,490 bytes:** warm wall 27.39–28.73 / 14.56–14.87 ms;
  CPU 29.35–30.79 / 14.88–16.12 ms; RSS 104.66–104.72 / 107.66–108.17 MiB.
- **Source indexing, 192,490 bytes:** warm wall 29.58–30.25 / 18.33–19.28 ms;
  CPU 30.30–31.77 / 20.26–20.98 ms; RSS 104.95–105.02 / 107.63–108.03 MiB.
- **Compiler pipeline, 92,300 bytes:** warm wall 24.17–24.18 / 17.25–17.29 ms;
  CPU 24.25–24.92 / 18.01–18.85 ms; RSS 106.31–106.70 / 106.20–106.84 MiB.

Similar map-based heap snapshots and the emitted code support the absence of an
extra value-boxing or copying layer. Lower RSS in some generated variants does
not prove lower allocation cost: Node startup, JIT, GC, and transient allocations
all affect process high-water measurements. Heap snapshots include garbage and
must not be presented as retained memory.

## Compiler pipeline versus actual T0

For the 92,300-byte input with 1,600 bindings:

- Generated warm wall: **24.17–24.18 ms**; T0: **5.05–5.57 ms**.
- Generated warm CPU: **24.25–24.92 ms**; T0: **7.25–9.25 ms**.
- Generated first-call application wall: **36.26–36.97 ms**; T0: **10.14–10.64 ms**.
- Generated first-call application CPU: **87.54–89.90 ms**; T0: **33.38–34.55 ms**.
- Generated cold worker wall: **91.76–95.43 ms**; T0: **69.25–71.15 ms**.
- Generated cold process CPU: **149.74–155.42 ms**; T0: **101.99–106.47 ms**.
- Generated application RSS: **106.31–106.70 MiB**; T0: **97.98–98.80 MiB**.
- Generated post-call heap snapshot: **20.46–20.50 MiB**; T0: **14.95–14.97 MiB**.

CPU includes work by runtime threads and can exceed wall time. Cold worker time
includes the common measurement/serialization harness, so its smaller ratio
must not conceal the warm computation difference or be claimed as an
uninstrumented compiler CLI comparison.

The generated compiler pipeline's input grew from 5,599 to 92,300 bytes, while
warm wall time grew from roughly 2.28 to 24.17 ms. The scanner grew from 11,890 to
192,490 bytes and roughly 2.06 to 27–29 ms. No quadratic cliff was observed at
these sizes; three points do not establish an asymptotic guarantee.

## Decision for the next step

Proceed with the structurally faithful M1 port using the current language.
Keep these samples and measurements as comparison evidence. Do not redesign
storage or change T0 merely to improve these numbers. After M1 reaches parity
and its fixed point, profile the actual generated compiler and address material
time/memory costs before promotion.

T0 replacement is not established by this evidence alone: the benchmark subset
cannot compile its own source or general functions, M1 was still absent, and no
actual self-build has been measured. Re-run the same application suite with the
candidate and measure its complete self-build before removing T0.

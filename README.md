# Hydrogen Storage Technology Comparator

An interactive dashboard comparing nine hydrogen storage routes — compressed
gas, cryogenic liquid, chemical carriers (ammonia, LOHC), metal hydrides
(MgH2, NaAlH4, LaNi5), and bulk underground storage — on the physical and
economic parameters that actually determine where each one makes sense,
benchmarked against the US DOE onboard storage targets.

https://moulickshubhom-lang.github.io/h2-storage-dashboard/

## Why this exists

Most online comparisons of hydrogen storage technologies quietly mix two
incompatible bases: "system" gravimetric capacity (tank + gas, used for
compressed/liquid H2) and "neat carrier" gravimetric capacity (just the
material, used for metal hydrides and chemical carriers). This project
makes that distinction explicit rather than papering over it — every
number in the table links back to its basis and its literature source.

## What it shows

- An interactive scatter chart of gravimetric capacity vs. volumetric
  density, with the DOE 2025 and ultimate storage targets overlaid as
  reference zones.
- A sortable, filterable comparison table with operating conditions,
  technology readiness level (TRL), an indicative cost tier, and an
  expandable source citation for every row.
- Category filters that sync between the chart and the table.

## Project structure

```
h2-storage-dashboard/
├── data/
│   └── technologies.json     # source-of-truth dataset, with citations
├── scripts/
│   └── build_data_js.py      # validates the dataset and compiles it to JS
├── assets/
│   ├── data.js                # generated — do not edit by hand
│   ├── style.css
│   └── app.js                 # chart, filters, sorting, detail rows
├── index.html
└── requirements.txt
```

The dataset lives in one human-edited JSON file. A small Python script
(using pandas for the validation step) checks it for duplicate IDs,
out-of-range TRL values and implausible gravimetric values, then compiles
it into a plain JavaScript file the dashboard reads — so the site itself
has no build step or backend, but the data still goes through a basic
quality gate before it ships.

## Running it locally

```bash
pip install -r requirements.txt
python scripts/build_data_js.py   # regenerates assets/data.js from data/technologies.json
```

Then open `index.html` directly in a browser, or serve the folder with
any static file server (e.g. `python -m http.server`).

## Deploying it (GitHub Pages, free)

1. Push this folder to a GitHub repository.
2. In the repo settings, under **Pages**, set the source to the `main`
   branch (root folder).
3. Your dashboard will be live at `https://<your-username>.github.io/<repo-name>/`
   within a minute or two. Update the "Live demo" link at the top of this
   README once it's up.

## Editing the data

Edit `data/technologies.json`, then re-run `python scripts/build_data_js.py`.
Each entry has a `source` field — keep it updated when you change a value,
and prefer primary sources (DOE program records, peer-reviewed papers,
published TEA studies) over secondary blog summaries where possible.

## Data sources

Values were compiled from a mix of DOE Hydrogen Program records, peer-
reviewed journal articles, and published techno-economic studies. Full
per-row citations are in `data/technologies.json` and visible in the
"Details" expander for each row in the dashboard. Where a figure required
calculation (e.g. estimating volumetric density for NaAlH4 and LaNi5 from
material density x gravimetric capacity, since no single source reports
it directly), this is flagged explicitly in the `volumetric_basis` field
rather than presented as a directly measured value.

## Possible extensions

- Add a togglable LCOH (levelized cost of hydrogen) calculator that lets
  the user vary storage duration and cycle frequency.
- Add a second chart axis for round-trip energy efficiency once a
  consistent literature basis is compiled for all nine technologies.
- This dashboard intentionally stops at a landscape-level comparison.
  A natural follow-up project is a detailed techno-economic model
  (process simulation + Python TEA script) for one specific storage
  route in depth — see the companion project in this portfolio.

## License

MIT — see `LICENSE`.

# History Flow — Project Guide for Claude Code

## Structure

```
historyflow/
├── server.js           # Local dev server (zero deps, plain Node.js)
├── package.json        # npm scripts (requires execution policy fix)
└── project/
    ├── index.html      # Main app — all CSS lives here
    ├── app.js          # All rendering and interaction logic
    ├── data/
    │   ├── cities.js        # window.CITIES_DATA — array of city records
    │   ├── people.js        # window.PEOPLE_DATA + PEOPLE_DOMAIN_COLORS etc.
    │   └── world-110m.json  # TopoJSON world atlas (downloaded locally)
    └── uploads/
        └── pantheon.csv     # Source CSV for people.js
```

## Running locally

```
node server.js
```

Opens at http://localhost:3000. No npm install required.

## Key globals (set in index.html before app.js loads)

- `window.__resources.worldTopo` — path to TopoJSON; defaults to CDN if absent
- `window.TWEAK_DEFAULTS` — initial values for the tweaks panel sliders
- `window.CITIES_DATA` — set by data/cities.js
- `window.PEOPLE_DATA`, `window.PEOPLE_DOMAIN_COLORS`, `window.PEOPLE_DOMAIN_LABELS`, `window.PEOPLE_HPI_RANGE` — set by data/people.js

## Data formats

**cities.js**: `[name, country, lon, lat, foundedYear, importance]`
- `importance` 1–5 (controls dot size and label visibility at zoom levels)

**people.js**: `[name, birthYear, lon, lat, occupation, domain, hpi, gender]`
- `domain`: A=Arts, S=Science, L=Leadership, P=Sports, R=Religion, H=Humanities
- `hpi`: Historical Popularity Index, range ~12–32

## Architecture notes

- SVG layer renders the base map (ocean, land, graticule, borders) via D3 geoNaturalEarth1
- Canvas overlay (same dimensions, pointer-events:none) renders all dots for performance
- Hit detection uses a spatial grid (GRID_CELL=40px) — see `hitGrid` in app.js
- Zoom state lives in `state.transform` (d3.ZoomTransform); both SVG and canvas are transformed together
- Year state is persisted to localStorage under key `history-flow-state`

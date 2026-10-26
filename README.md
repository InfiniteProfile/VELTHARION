# VELTHARION

**ONE IDENTITY. INFINITE POSSIBILITIES.**

VELTHARION is a lightweight, static infinite-identity explorer. It uses vanilla HTML, CSS, and JavaScript with deterministic profile generation and procedurally generated SVG artwork. It does not need an account, server, database, paid API, build step, or external runtime dependency.

## Run locally

1. Extract the project ZIP.
2. Open `index.html` in a modern browser. Most features work directly from the file system. Clipboard support may be restricted by browsers outside HTTPS/localhost; the app includes a fallback.
3. For a local HTTP preview, run `python -m http.server 8000` from the project folder and open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a repository named `VELTHARION` (or use another repository name).
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets` folder to the repository root.
3. In repository **Settings → Pages**, choose **Deploy from a branch**, select your default branch and the `/ (root)` folder, then save.
4. Open the published Pages URL. The app uses hash-based profile routes (for example `#profile/2048`) so direct profile links work on static hosting without server-side route configuration.

Cloudflare Pages and other static hosts can deploy the same folder as-is.

## How identities are generated

- The exact canonical positive decimal ID is stored as a string and remains the authoritative identity key.
- A deterministic character-by-character 32-bit hash creates seeds for name, category, accent palette, composition, and artwork variation.
- SVG artwork is generated locally from those seeds. It is consistent for the same ID and does not require image downloads.
- Hash collisions can produce similar names or artwork, but they never merge identities because the full ID string remains the key.

## Infinite feed and exact IDs

The feed starts at ID `1`, appends batches automatically near the scrolling threshold, and advances IDs using decimal-string incrementing. The feed trims old rendered cards to keep DOM memory bounded; this does not alter the next-ID sequence or the direct-ID generator. There is no configured maximum identity ID or feed batch count.

Numeric ID search validates the full decimal string with `^[1-9][0-9]*$`. It does not parse IDs through JavaScript `Number`, so IDs longer than the safe-integer range remain exact. Hashing is performed character by character. Name search checks a deterministic sample per query rather than claiming to exhaustively search all possible identities. Random discovery samples a practical destination range; this sampling range does not constrain direct numeric search or the feed.

## Controls

- **Explore** scrolls to the live feed.
- **Discover** opens the discovery search mode.
- **Random** opens a generated destination.
- Search icon or `/` opens search. Search supports exact IDs, deterministic sample-based name search, and discovery.
- Profile detail includes copy ID, copy name, share/copy link, previous and next identity, and return navigation.
- Settings include contrast, compact cards, reduced effects, animations, and local search history.
- Search history is off by default and is only stored locally when enabled.

## Customize

- Edit design tokens at the top of `style.css` to change colors, borders, and content width.
- Adjust the name syllable arrays, category list, palettes, and shape types near the top of `script.js`.
- Change `addBatch(24)` to tune the initial number of cards, and `addBatch(18)` / the observer margin to tune feed batching.
- Change the card window threshold in `trimFeed()` to tune memory/scroll trade-offs.
- Replace `assets/logo.svg` or `assets/favicon.svg` to customize the emblem.

## Notes and limitations

- The feed keeps a bounded rendered window for performance. This first implementation prioritizes a smooth forward stream; it does not preserve an unlimited, fully navigable DOM history of every previously rendered card.
- Name search is intentionally bounded per query for responsiveness. Exact ID navigation is direct and independent of feed position.
- Clipboard and native share behavior depend on browser capabilities and permissions; copy has a fallback, and sharing falls back to copying the profile URL.
- Browser storage may be disabled or unavailable; the core experience still works without it.

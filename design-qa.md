# Design QA — 神马直播 H5

## Comparison target

- Source visual truth: `/Users/apple/Desktop/神马直播/Codex 图像 2026年9月23日 11_08_21.png` (homepage) and `/Users/apple/Desktop/神马直播/Codex 图像 2026年9月23日 11_08_43.png` (live preview page).
- Implementation: browser-rendered local prototype at `http://127.0.0.1:4173/`, captured in the Codex in-app browser during this build.
- Viewport/state: iPhone runtime, homepage / 推荐 selected / first banner. The runtime's protected phone screen is 393 × 852 CSS px; content is fluid and remains bounded when viewed at the requested 402px browser width. Source images are 886 × 1772 px; the comparison used their mobile-screen visual content rather than browser/device surrounds.

## Evidence and interaction checks

- Full-view comparison: the browser-rendered capture was reviewed beside the supplied homepage visual: header → category rail → 16:9 football banner → horizontal matches (with preview entry in the same rail) → “正在直播” two-column cards → fixed bottom tabs. The source and implementation both use the same light cyan/white canvas, rounded dense card rhythm, blue active state, pink live state, and purple preview emphasis.
- Focused regions: header, banner/index indicator, matches/preview entry, and the preview event card were reviewed separately because their iconography and dense type are not legible in a full-page view.
- Primary interactions tested in the local browser: preview card opens `#preview`; date selection filters events; reminder button switches state; overflow anchors expand; browser Back returns to homepage; the 赛事 tab opens its empty state. The other two placeholder tabs use the same shared switch logic.
- Console/runtime: mobile runtime integrity check passed; TypeScript check passed; Vite production build passed. No browser console errors were observed during the interaction pass.

## Required fidelity surfaces

- Fonts and typography: system Chinese UI fallback preserves compact bold headings and smaller muted metadata; titles are single/two-line constrained to preserve card density.
- Spacing and layout rhythm: mobile-first content uses the shared phone viewport, compact 13–15px gutters, 11px card gaps, rounded 13–16px cards, and bottom padding above the fixed tab bar.
- Colors and visual tokens: light blue-white background, #247bff selected indicator, #ff3c78 live state, and #7257ff preview/date emphasis are consistently applied.
- Image quality and asset fidelity: project-local generated raster artwork is used for the football hero, live covers, and club crest; all rendered images use `object-fit: cover` or `contain`, without stretching.
- Copy and content: headings use “热门赛事” and “正在直播”; live preview cards aggregate multiple anchors by match and use the earliest anchor start time.

## Findings

- No actionable P0/P1/P2 issues after the final browser check.
- [P3] The supplied screenshots contain proprietary club marks and distinctive portraits that were not available as reusable assets. The prototype uses a neutral generated sports crest and styled mock avatars pending supplied brand assets.

## Implementation checklist

- [x] Homepage and secondary live-preview route implemented.
- [x] Fixed bottom tabs and blank primary-page placeholders implemented.
- [x] Carousel auto-advance and five-second progress indicator implemented.
- [x] Horizontal match rail includes the live-preview entry.
- [x] Date filtering, expansion, reminder toggle, and browser Back behavior implemented.

## Comparison history

1. Initial browser pass found the generic crest treatment was too code-like for the target. It was replaced with a project-local generated raster crest and rechecked in the local browser.
2. Final browser pass found no actionable P0/P1/P2 differences for the requested prototype scope.

final result: passed

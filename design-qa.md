# Design QA: episode player

## Comparison target and evidence

- Source visuals: `/tmp/codex-remote-attachments/01a121f1-067c-78a1-b4b2-634949c0ecb2/7E2FC732-DA80-4E34-AED8-A20135BEC137/1-Photo-1.jpg` (587×1237), `2-Photo-2.jpg` (590×1280), and `3-Photo-3.jpg` (638×1280).
- Implementation: live Codex in-app browser at `http://localhost:5173/`; browser captures were reviewed inline in the task. The CUA browser did not expose a local screenshot export path.
- Browser viewport at handoff: 769×652. The iPhone app screen uses the runtime's 393×852 CSS layout and is fit-scaled inside the desktop preview. The source photos include physical device framing; comparison focused on the phone screen content and composition, not raw pixel density.
- States compared: player screen with episode selector closed; selector open on range 1–30 with current and locked episodes; selector open on the second range, 31–52.
- Full-view comparison: both screens use a full-bleed portrait, back control, central play control, right-side actions, lower title/details, progress line, and a compact episode control. The prototype uses the existing series artwork and our dark app styling, as requested.
- Focused comparison: sheet header thumbnail/title/close button, range tabs, five-column episode grid, current episode marker, and lock icons were compared against Photo 2. The 60% sheet height exposes the first five rows with the next row partially visible, matching the reference density.

## Findings and iterations

- Initial sheet capture showed the simulated keyboard over the episode panel. Opening the panel now calls `keyboard.hide()`; the follow-up capture shows the sheet without the keyboard.
- No actionable P0, P1, or P2 differences remain. Existing app artwork is used as a still background because the prototype has no episode video source; this is an expected prototype limitation and remains a P3 difference from the moving-content reference.

## Interaction review

- Opened and closed the episode sheet.
- Selected an available episode and confirmed the EP label updates and the sheet closes.
- Tapped a locked episode and confirmed the access message appears while the sheet stays open.
- Switched from range 1–30 to 31–52 and confirmed the grid updates.
- TypeScript check passed. Protected mobile runtime integrity check passed (28 files).

## Required fidelity surfaces

- Typography: short title, genre chip, synopsis, and action labels preserve the app's existing compact mobile hierarchy.
- Layout and spacing: full-screen media composition, side rail, lower details, progress, selector, and five-column sheet grid align with the references.
- Color: dark charcoal surfaces and white controls retain the prototype's palette; the selected tab and current episode use the existing restrained red accent.
- Imagery: current app poster art fills the player; it is a still preview rather than video footage.
- Copy: all added interface copy is Russian; series metadata remains the prototype's current catalog data.

**final result: passed**

## Full-page mobile feed spacing

### Comparison target and evidence

- Source visual: `/tmp/codex-remote-attachments/01a121f1-067c-78a1-b4b2-634949c0ecb2/04BB1F04-F2E4-42CC-A8DF-5FE67F0860F7/1-Photo-1.jpg` (590×1280), with the physical-phone reference in `2-Photo-2.jpg`.
- Implementation: current project served from Vite on port `5179` through `https://hhrpf-14-233-186-48.run.pinggy-free.link/?preview=full`. The public page returns HTTP 200, and its served CSS contains the current iOS safe-area background rule.
- The category row, section heading, first poster row, and floating bottom navigation were compared with the iPhone reference. The supplied phone screenshot showed an extra top gap and a raised navigation bar.

### Findings and iterations

- Desktop full-page mode keeps a 54px page-layer offset, with home-feed padding compensating for that offset.
- The iPhone-specific CSS uses the runtime's explicit `data-platform="ios"` marker, avoiding browser-feature detection. It removes duplicate top and bottom reservations while keeping the feed's 106px internal top padding and the iOS safe-area inset.
- Diagnosis: the old `xfifc` hostname no longer resolved, and the server on port `5178` returned CSS from before the latest safe-area edits. The iPhone was therefore still showing stale styling. A fresh server was started from this project on port `5179`, and the new public tunnel was checked against its served CSS.
- The reference shows a regular Safari website with the page painted behind the translucent status area and continuing to the bottom edge while Safari's compact toolbar overlays it. The viewport meta already uses `viewport-fit=cover`; the current iOS rule carries the purple header gradient through the status-bar safe area while retaining a black document canvas below it. Home Screen standalone launch remains optional.
- Pinggy's free tunnel URLs rotate when a tunnel restarts and expire after 60 minutes, so the active preview address must be refreshed when that happens.

**latest CSS delivery confirmed; visual confirmation on iPhone pending**

## Reward coin expiry screen

### Comparison target and evidence

- Source visual: `/tmp/codex-remote-attachments/01a121f1-067c-78a1-b4b2-634949c0ecb2/3F5643A4-A81A-4607-A173-156ACEED45A6/1-Photo-1.jpg` (590×1280).
- Implementation: live Codex in-app browser at `http://localhost:5173/`; the iPhone capture was reviewed inline, with no local screenshot export path available.
- The reference structure is retained: page title, notification prompt, grouped expiry rows with dates and coin amounts, and the trailing “Пока это всё” label. Colors and surfaces follow the app's dark/purple styling with gold coin accents.

### Interaction review

- Opened this screen from Wallet → наградные монеты and confirmed all six dates and amounts appear without clipping.
- Enabled the coin-notification action and confirmed the selected state and success message; back returns to Wallet.
- TypeScript check passed. Protected mobile runtime integrity check passed (28 files).

**final result: passed**

## Account store and rewards flow

### Comparison target and evidence

- Source visuals: `/tmp/codex-remote-attachments/01a121f1-067c-78a1-b4b2-634949c0ecb2/DCB4BD22-C33C-4285-8925-83C894E3E6D4/1-Photo-1.jpg` through `8-Photo-8.jpg` (each 590×1280).
- Implementation: live Codex in-app browser at `http://localhost:5173/`; browser captures were reviewed inline. The CUA browser did not expose a local screenshot export path.
- Browser viewport: 769×652. The iPhone app screen uses the runtime's 393×852 CSS layout and is fit-scaled inside the desktop preview.
- States compared: store top and lower sections, rewards and VIP-diamond tabs, benefits and exchange panels, coin history, empty diamond history, transaction history, and automatic unlock.
- Comparison focused on the content hierarchy and navigation within the phone screen. The screenshot references use ReelShort's black/red/gold treatment; the prototype deliberately uses its existing charcoal/purple/lavender palette with restrained gold currency accents.

### Findings and iterations

- The account mail/envelope button now opens the New/System notifications screen. The VIP exchange page remains reachable through the profile's VIP benefits link.
- Store, rewards, wallet histories, and automatic unlock use the same internal account toolbar and return to the previous screen. Scroll review confirmed that the store's top-up packages and payment terms remain reachable below the subscription cards.
- The VIP-diamond screen uses a generated chest illustration and app-style benefit/exchange cards instead of the reference artwork and warm gold panels.
- No actionable P0, P1, or P2 visual or navigation differences remain. Purchase, restore, and redemption actions are prototype interactions and do not process payments or update a real account.

### Interaction review

- Opened the store from Wallet → Пополнить and verified three VIP plans, four coin packages, restore action, and all nine terms.
- Opened Rewards from the profile and switched between Награды and VIP-алмазы; opened both the benefits and exchange panels.
- Opened coin history from Wallet, expanded the transaction filter, selected Начисления, and confirmed the list changed.
- Opened diamond history, transaction history, and automatic unlock from Wallet. Toggled automatic unlock and confirmed its selected state changed.
- Opened notifications through the profile's envelope icon and confirmed the Новое/System tabs appear.
- TypeScript check passed. Protected mobile runtime integrity check passed (28 files).

### Required fidelity surfaces

- Typography and layout: the references' compact mobile headings, balance summary, grouped cards, clear primary actions, and scrollable long-form terms are retained.
- Color and components: all new surfaces follow the prototype's existing dark and purple design system, with lavender active states and gold currency indicators.
- Copy: Russian labels and prices match the visual references where relevant; account action copy remains descriptive when no backend is available.

**final result: passed**

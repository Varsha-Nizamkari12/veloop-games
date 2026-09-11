# VELOOP Games Hub

Responsive React/Vite implementation of the VELOOP Games banner task, including the 13-game Games Hub and two fully playable games: **Block Crush** and **Merge Master**.

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

## Completed implementation

### Games Hub
- 13 supplied image-based game artworks.
- AVIF assets used for game and reward imagery.
- 20 Tokens entry cost; no `+20 XP` messaging.
- Coded Play Now footer with infinite shimmer, hover/active/tap and insufficient-token states.
- Horizontal auto-scrolling carousel with manual/touch/trackpad scrolling, 13 dots, no arrows, pause-on-interaction and a duplicated seamless loop.
- Responsive 320px+ layouts and reduced-motion support.

### Block Crush
- Light-theme game home and actual gameplay environment.
- 20-token validation/deduction, first-time guide and How to Play.
- Canvas paddle/ball/block gameplay with mouse, touch and keyboard controls.
- Score, lives, pause/exit, game over, revive, reward calculation and No Thanks.
- Game Coin celebration with multi-coin flying reward feedback.

### Merge Master
- Light-theme game home and actual gameplay environment.
- 20-token validation/deduction, first-time guide and How to Play.
- 4×4 merge gameplay with arrow keys, touch swipe and on-screen controls.
- 2048 win, no-moves loss, revive, reward calculation and No Thanks.
- Game Coin celebration with multi-coin flying reward feedback.

### Redemption center
- Light premium theme aligned with the light game environments.
- Clear reward cards, balance, confirmation, success and insufficient-coin states.

### Centralized economy
- React Context owns Tokens and Game Coins.
- `localStorage` persistence keeps balances synchronized across routes.
- Redemption center supports VEs, SVEs, Gems, Tokens and Spins.
- Confirmation, success, insufficient-coin handling and redemption history.
- Bottom Home/Redeem navigation.

### Reliability / accessibility
- Lazy routes with Suspense loading state.
- Application error boundary with Retry and Back to Games.
- Defensive game-start error recovery.
- Accessible labels, keyboard focus states and reduced-motion behavior.

## Architecture

```text
src/components/games  reusable Games Hub UI
src/components/ui      loading/error states
src/context            centralized Tokens/Game Coins
src/data               13-game configuration
src/pages              game homes, game engines, redemption
src/assets              supplied artwork and AVIF reward assets
```

## Research and originality

Block Crush and Merge Master were selected because their core mechanics are independently implementable with original code. Block Crush uses paddle/ball/block collision mechanics; Merge Master uses a sliding and equal-tile merge mechanic. The implementation does not decompile or copy proprietary source, music, animation or extracted assets.

## Production security preparation

The current client state is intentionally demo-friendly. In production, a backend should validate the game session, score, completion state, entry fee, reward calculation and redemption before changing balances. Client-supplied scores/rewards must never be trusted.

## Final QA checklist

- [x] 13 cards / AVIF / 20 Tokens / no +20 XP
- [x] Play Now shimmer and interaction states
- [x] Carousel dots, no arrows, auto-scroll, pause and seamless loop
- [x] Insufficient Tokens state
- [x] Block Crush complete playable flow
- [x] Merge Master complete playable flow
- [x] Guides, revive, No Thanks and reward calculation
- [x] Central Game Coin synchronization and persistence
- [x] Redemption + insufficient coins + history
- [x] Light-theme actual games
- [x] Loading/error recovery
- [ ] `npm run lint` after the latest UI update
- [ ] `npm run build` after the latest UI update
- [ ] Browser QA at 320/375/768/1366/1920px
- [ ] Console-error check during every gameplay/redemption path
- [ ] Screen recording evidence
- [ ] GitHub push / final deployment

The last four items are final evidence/deployment checks rather than missing application features.

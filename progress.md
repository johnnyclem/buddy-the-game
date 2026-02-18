Original prompt: make a black and white derpy corgi who is the main character going to save another corgi that brown and white, and he goes through the common worlds seen in platformers

- Created `index.html` and `game.js` from scratch for a side-scrolling 16-bit noir platformer.
- Implemented core controls (WASD/Arrow support), jump (SPACE/ArrowUp), double jump, E head-butt special, poop-on-idle.
- Added auto-run pipe/trail segments in early worlds.
- Added fake noir/fantasy visual direction, rescue corgi pickup, and final evil cat boss.
- Added `window.render_game_to_text` and `window.advanceTime` for automation.
- Added `#start-btn` so Playwright can start from menu.
- TODOs after first run: tune collision boundaries, check victory transitions, confirm boss behavior and idle-poop trigger frequency.

- Added robust floor collider by injecting a world floor platform during world load to prevent instant fall deaths.
- Updated `state.player` reset Y to sit on-platform (`FLOOR_Y - PLAYER_H`).
- Added rescue pickup tolerance check via nearby-distance trigger so rescue can be captured in momentum-rich runs.
- Verified with Playwright runs and `state-*.json` that render pipeline reports:
  - mode/world transitions,
  - rescue + score increments,
  - auto movement and enemy/boss interactions,
  - and terminal `gameover`/`win` states when triggered.
- Known follow-up:
  - The environment’s Playwright client tool in this session lacked direct image-preview support, so visuals were validated via generated screenshot files + state JSON.
  - `WEB_GAME_ACTIONS` now includes `e` input mapping; head-butt automation can be exercised with custom payloads.
  - `type` in `/Users/johnnyclem/.codex/skills/develop-web-game/package.json` was set to `module` to run the bundled test client in this environment.

- Additional patch pass completed:
  - Reconnected gameplay tuning hooks after prior revert:
    - `HEAD_BUTT_COOLDOWN` and `HEAD_BUTT_IMPULSE` now drive head-butt timing/force.
    - Enemy stomps use `ENEMY_STOMP_BOUNCE`/`STOMP_SCORE` and proper enemy damage sources.
    - Boss contact/head-butt logic uses `BOSS_*` constants and score/iframes through `BOSS_HEADBUTT_DAMAGE`, `BOSS_HIT_SCORE`, `HEADBUTT_BOSS_INVULN`, `BOSS_ATTACK_INTERVAL`, `BOSS_BULLET_DAMAGE`, `BOSS_CONTACT_DAMAGE`.
    - Added `updateSoundtrack(dt)` in gameplay loop and `clearPressed()` once per frame so `keyPressed` is one-shot again.
    - Added soundtrack HUD overlay and included `soundtrack` payload in `renderGameToText`.
    - Boss HP bar now scales off `boss.maxHp`.
  - Updated play-test validation: ran Playwright with custom action script including `e` (head-butt) and auto-run traversal actions.
  - Validation output observed in `output/web-game/state-0.json` through `state-2.json` (menu->world transitions/rescue + combat states), with no `errors-*.json` generated.
  - Next suggested pass: add a short boss-fight-focused action script to confirm stomps/head-butt can reduce `boss.hp` and drive win state deterministically.

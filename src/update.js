// Game logic — called once per frame during 'play' mode
// dt: delta time in seconds (fixed at 1/60)
function update(dt) {
  applyTiltInput(); // map device orientation → state.input before game logic

  state.tick++;

  // TODO: use state.input.left / right / jump / sit to move Buddy
  // TODO: update world entities, physics, collisions, etc.
}

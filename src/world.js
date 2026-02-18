// World initialisation
// seed: integer used to deterministically generate level layout
function createWorld(seed) {
  state.world = {
    seed,
    entities: [],
  };
}

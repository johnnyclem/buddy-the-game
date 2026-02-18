// Shared DOM references
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game state — mutate this object; never reassign it
const state = {
  mode: 'menu', // 'menu' | 'play' | 'over'
  world: null,
  tick: 0,
};

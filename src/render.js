// Rendering — all draw calls go through here

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.mode === 'menu') {
    _renderMenu();
  } else if (state.mode === 'play') {
    _renderGame();
  } else if (state.mode === 'over') {
    _renderGameOver();
  }

  _renderHud();
}

function _renderMenu() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e8e0d0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '36px "Press Start 2P"';
  ctx.fillText("BUDDY'S QUEST", canvas.width / 2, canvas.height / 2 - 48);

  ctx.font = '12px "Press Start 2P"';
  ctx.fillStyle = '#f5a623';
  ctx.fillText('PRESS ENTER OR CLICK START', canvas.width / 2, canvas.height / 2 + 24);
}

function _renderGame() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // TODO: draw world, player, enemies, etc.
  ctx.fillStyle = '#e8e0d0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '14px "Press Start 2P"';
  ctx.fillText('GAME RUNNING — tick ' + state.tick, canvas.width / 2, canvas.height / 2);
}

function _renderGameOver() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e8e0d0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '36px "Press Start 2P"';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 24);

  ctx.font = '12px "Press Start 2P"';
  ctx.fillStyle = '#f5a623';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 32);
}

function _renderHud() {
  const hud = document.getElementById('hud');
  hud.textContent = 'Mode: ' + state.mode;
}

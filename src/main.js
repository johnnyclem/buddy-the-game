// Entry point — game loop and bootstrap

const startButton = document.getElementById('start-btn');

function gameLoop() {
  state.tick++;

  if (state.mode === 'play' || state.mode === 'dialogue') {
    update(1 / 60);
  }

  render();
  requestAnimationFrame(gameLoop);
}

startButton.addEventListener('click', () => {
  beginRun();
});

// Bootstrap
loadIntroSprites();   // async — no-op if none configured
setCanvasScale();
initVoice();
initTilt();
initTouchControls();
initMobileUI();
render();             // draw menu frame before game loop starts
gameLoop();
showStartButton("BUDDY'S QUEST\n\nTop-Down Edition\n\nPress Start!");

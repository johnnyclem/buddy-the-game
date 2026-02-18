// Entry point — game loop and bootstrap

const startButton = document.getElementById('start-btn');

function gameStep() {
  update(1 / 60);
  render();
}

function gameLoop() {
  if (state.mode === 'play') {
    gameStep();
  } else if (state.mode === 'training') {
    updateTraining(1 / 60);
    renderTraining();
    _renderVoiceFeedback();
  } else {
    render();
  }
  requestAnimationFrame(gameLoop);
}

startButton.addEventListener('click', () => {
  beginRun();
});

// Bootstrap
createWorld(0);
render();
setCanvasScale();
initVoice();
initTilt();
initTouchControls();
initMobileUI();
gameLoop();
showStartButton('Start BUDDY\'S QUEST');

import { chromium } from 'playwright';

const page = await (await chromium.launch({ headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] })).newPage();
await page.goto('http://127.0.0.1:5173', { waitUntil:'domcontentloaded' });

const result = await page.evaluate(() => {
  createWorld(3);
  state.mode = 'play';
  state.worldName = worldBlueprints[3].name;
  state.player.x = 2165;
  state.player.y = FLOOR_Y - PLAYER_H;
  state.player.vx = 360;
  state.player.vy = 0;
  state.player.onGround = true;
  state.player.autoRun = false;
  state.player.facing = 1;
  // drive left input explicitly
  keyState.ArrowLeft = true;
  keyPressed.clear();

  const samples = [];
  for (let i = 0; i < 20; i++) {
    update(1/60);
    samples.push({
      i: i + 1,
      x: Number(state.player.x.toFixed(3)),
      vx: Number(state.player.vx.toFixed(3)),
      mode: state.mode,
      autoRun: state.autoRun,
      world: state.worldIndex,
      collisions: state.player.onGround,
    });
  }
  keyState.ArrowLeft = false;
  return { world: state.worldIndex, player: { x: state.player.x, vx: state.player.vx }, samples };
});

console.log(result);
await page.close();

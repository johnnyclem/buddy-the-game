import { chromium } from 'playwright';

const url = 'http://127.0.0.1:5173';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader']});
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.click('#start-btn');
await page.waitForTimeout(120);

async function tick(){
  await page.evaluate(() => window.advanceTime(1000 / 60));
}

async function getState() {
  return JSON.parse(await page.evaluate(() => window.render_game_to_text()));
}

await page.keyboard.down('ArrowRight');
let state = await getState();
for (let i = 0; i < 2200; i++) {
  await tick();
  if ((i + 1) % 30 === 0) {
    state = await getState();
    console.log('progress', i + 1, 'world', state.world, 'x', state.player.x.toFixed(1), 'lives', state.lives, 'mode', state.mode);
  }
  if (state.mode === 'play' && state.world === 4 && state.player.x >= 1200 && state.lives > 0) {
    console.log('ready to test', i + 1, state.player.x, 'lives', state.lives, 'mode', state.mode);
    break;
  }
  state = await getState();
}
await page.keyboard.up('ArrowRight');

console.log('pre-left', state.world, state.player.x, state.lives, state.mode, 'auto', state.player.autoRun, 'facing', state.player.facing);

await page.keyboard.down('ArrowLeft');
for (let i = 0; i < 240; i++) {
  await tick();
  if ((i + 1) % 20 === 0) {
    const s = await getState();
    console.log('left', i + 1, 'x', s.player.x.toFixed(1), 'vx', s.player.vx.toFixed(2), 'lives', s.lives, 'mode', s.mode);
  }
}
await page.keyboard.up('ArrowLeft');
const after = await getState();
console.log('after', after.world, after.player.x, after.player.vx, after.lives, after.mode);

await browser.close();

import { chromium } from 'playwright';

const url = 'http://127.0.0.1:5173';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader']});
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.click('#start-btn');
await page.waitForTimeout(100);

async function frame(){
  await page.evaluate(() => window.advanceTime(1000/60));
}
async function holdLeft(frames){
  await page.keyboard.down('ArrowLeft');
  for (let i = 0; i < frames; i++) {
    await frame();
  }
  await page.keyboard.up('ArrowLeft');
}
async function holdRight(frames){
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < frames; i++) {
    await frame();
  }
  await page.keyboard.up('ArrowRight');
}

async function state(){
  const s = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  return s;
}

await holdRight(2600);
const atEdge = await state();
console.log('edge', atEdge.world, atEdge.player.x, atEdge.player.y, 'auto', atEdge.player.autoRun, 'worldLen',  atEdge.player.facing);

await holdLeft(60);
const leftStep = await state();
console.log('after left', leftStep.player.x, leftStep.player.y);
await holdLeft(200);
const leftMore = await state();
console.log('after more left', leftMore.player.x, leftMore.player.y);

await browser.close();

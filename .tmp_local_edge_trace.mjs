import { chromium } from 'playwright';
const url='http://127.0.0.1:5173';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage();

await page.goto(url,{waitUntil:'domcontentloaded'});
await page.click('#start-btn');
await page.waitForTimeout(100);

async function frame(){await page.evaluate(()=>window.advanceTime(1000/60));}
async function walkLeft(frames){
  await page.keyboard.down('ArrowLeft');
  for(let i=0;i<frames;i++) {
    await frame();
    if ((i+1)%10===0) {
      const s=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
      if (s.player.x!==undefined) console.log('left', i+1, 'x', s.player.x.toFixed(2), 'vx', s.player.vx.toFixed(2), 'auto', s.player.autoRun);
    }
  }
  await page.keyboard.up('ArrowLeft');
}

async function walkRight(frames) {
  await page.keyboard.down('ArrowRight');
  for(let i=0;i<frames;i++) {
    await frame();
    if ((i+1)%100===0) {
      const s=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
      if (s.player.x!==undefined) console.log('right', i+1, 'x', s.player.x.toFixed(2), 'world', s.world, 'vx', s.player.vx.toFixed(2), 'auto', s.player.autoRun);
    }
  }
  await page.keyboard.up('ArrowRight');
}

await walkRight(2000);
let s=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
console.log('post-right', s.world, s.player.x.toFixed(2), s.player.vx.toFixed(2), s.worldName, 'rescue', s.rescued, 'lives', s.lives);
await walkLeft(240);
const after = JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
console.log('after-left-final', after.world, after.player.x.toFixed(2), after.player.vx.toFixed(2), after.player.facing, 'enemyCount', after.entities.filter(e=>e.type==='enemy').length);
await browser.close();

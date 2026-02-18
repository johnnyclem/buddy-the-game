import { chromium } from 'playwright';
const page = await (await chromium.launch({ headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] })).newPage();
await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
console.log(await page.evaluate(() => ({
  hasUpdate: typeof update,
  hasRender: typeof render,
  hasApplyHorizontalCollision: typeof applyHorizontalCollision,
  hasApplyVerticalCollision: typeof applyVerticalCollision,
  hasCreateWorld: typeof createWorld,
  hasState: typeof state,
})));
await page.close();

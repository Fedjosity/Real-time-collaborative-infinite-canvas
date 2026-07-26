const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Pipe browser console logs to Node.js console
  page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));

  console.log('Navigating to room...');
  await page.goto('http://localhost:3000/room/4NoAO66SDL', { waitUntil: 'networkidle' });
  
  console.log('Waiting for canvas to load...');
  await page.waitForTimeout(2000); // Wait for Yjs sync and canvas mount

  console.log('Checking for username modal...');
  try {
    const input = await page.$('input');
    if (input) {
      await input.type('TestUser');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('No username modal found.');
  }

  console.log('Enabling physics...');
  // Find physics toggle button (Rocket icon)
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const title = await btn.getAttribute('title');
    if (title && title.includes('Physics')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(500);

  console.log('Adding a shape...');
  for (const btn of buttons) {
    const title = await btn.getAttribute('title');
    if (title && title.includes('Add Shape')) {
      await btn.click(); // Select shape tool
      await page.waitForTimeout(100);
      await btn.click(); // Add shape to canvas
      break;
    }
  }
  await page.waitForTimeout(500);

  console.log('Simulating a drag throw...');
  // We drag from center of screen to left
  const mouse = page.mouse;
  const viewport = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  await mouse.move(viewport.w / 2 || 500, viewport.h / 2 || 500);
  await mouse.down();
  await mouse.move(510, 510, { steps: 5 });
  await page.waitForTimeout(50);
  await mouse.move(600, 400, { steps: 5 });
  await mouse.up();

  console.log('Waiting for physics simulation logs...');
  await page.waitForTimeout(3000);

  await browser.close();
  console.log('Done.');
})();

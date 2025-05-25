require('dotenv').config();
const { chromium } = require('playwright');

async function scrapeProfileData(profileUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
await context.addCookies([{
  name: 'li_at',
  value: 'AQEFAQ4BAAAAABS9zB0AAAGVybCQ5wAAAZcn--zRTQAAsXVybjpsaTplbnRlcnByaXNlQXV0aFRva2VuOmVKeGpaQUFDbHNlN00wRTBXNWU0SUlobUxhbGF5UWhpYUlrNnhJSVozTGF4a2d5TUFKWmFCZjQ9XnVybjpsaTplbnRlcnByaXNlUHJvZmlsZToodXJuOmxpOmVudGVycHJpc2VBY2NvdW50OjgyMDMzNTEzLDEwOTcxMzE2OSledXJuOmxpOm1lbWJlcjo0OTI5NjU5NherHqrIEOcuIj_WSd4A5M9erC2N4Cb3fWZPgQZIECO85KTkzWwSjAYTHp2O7ln0nX4xPUL4WF5VoGmY5Q2uq9a35w4b7amUbXq550wWULGoeDxG-7lrudF-HbeTgJQ78vrnYXlowZTPciqP1KdBZMuZWlXOkjsfxmf2mGZLgTaZr113br637Wocn7cdMbr8Z2_D_n8', // ← כאן
  domain: '.linkedin.com',
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'Lax'
}]);


  const page = await context.newPage();
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const name = await page.locator('h1').first().innerText();
  const headline = await page.locator('.text-body-medium.break-words').first().innerText().catch(() => '');
  const about = await page.locator('section.pv-about-section div.inline-show-more-text').first().innerText().catch(() => '');

  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1000);
  }

  const postBlocks = await page.locator('div.feed-shared-update-v2__description, div.feed-shared-text').all();
  const posts = [];
  for (let i = 0; i < Math.min(postBlocks.length, 3); i++) {
    const postText = await postBlocks[i].innerText().catch(() => '');
    if (postText) posts.push(postText.trim());
  }

  await browser.close();
  return { name, headline, about, posts };
}

module.exports = { scrapeProfileData };

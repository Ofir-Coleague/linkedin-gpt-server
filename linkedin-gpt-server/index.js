const { chromium } = require('playwright');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function scrapeProfileData(profileUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([{
    name: 'li_at',
    value: process.env.LI_AT,
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

async function generateEmail(profileData) {
  const prompt = `
שם: ${profileData.name}
Headline: ${profileData.headline}
About: ${profileData.about || 'אין'}
פוסטים אחרונים:
${profileData.posts && profileData.posts.length > 0 ? profileData.posts.join('\n---\n') : 'לא נמצאו'}

יש לי שתי תבניות מייל:
A – סגנון ישיר ודינמי
B – סגנון רך ומסביר

בחר את אחת מהן לפי מה שנראה לך מהפרופיל והפוסטים. כתוב מייל מותאם אישית לפי התבנית, ואחר כך הסבר לבחירה שלך.
השב כך:
1. טיוטת מייל
2. הסבר לבחירה
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

module.exports = { scrapeProfileData, generateEmail };
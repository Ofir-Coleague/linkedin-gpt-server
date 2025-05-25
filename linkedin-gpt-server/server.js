const express = require('express');
console.log('🔐 LI_AT:', process.env.LI_AT ? '[OK]' : '[MISSING]');

const { scrapeProfileData, generateEmail } = require('./index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/profile', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing LinkedIn URL');

  try {
    console.log(`🔍 Scraping profile: ${url}`);
    const profileData = await scrapeProfileData(url);
    console.log('✅ Profile data:', profileData);

    // אם רוצים גם לייצר מייל, בטל הערה מהשורות הבאות:
    // const email = await generateEmail(profileData);
    // console.log('✉️ Email generated:', email);

    // שליחה עם מייל:
    // res.send({ profileData, email });

    // שליחה בלי מייל, רק לוודא שהחלק של לינקדאין עובד:
    res.send({ profileData });

  } catch (err) {
    console.error('❌ Error processing profile:', err);
    res.status(500).send('Error processing profile');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

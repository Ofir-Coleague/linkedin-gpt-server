const express = require('express');
const { scrapeProfileData, generateEmail } = require('./index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/profile', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing LinkedIn URL');

  try {
    const profileData = await scrapeProfileData(url);
    const email = await generateEmail(profileData);
    res.send({ profileData, email });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing profile');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
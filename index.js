require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// URL Shortener Microservice
const urlSchema = new mongoose.Schema({ original_url: String });
const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl/', function(req, res) {
  const original_url = req.body.url;
  const checkdns = dns.lookup(urlparser.parse(original_url).hostname, function(err, address) {
    if (err || !address) {
      res.json({ error: 'invalid url' });
    } else {
      const url = new Url({ original_url: original_url });
      url.save();
      res.json({ original_url: url.original_url, short_url: url.id });
      }
  });
});

app.get('/api/shorturl/:short_url', async function(req, res) {
  const id = req.params.short_url;
  try {
    const theUrl = await Url.findById(id);
    res.redirect(theUrl.original_url);
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

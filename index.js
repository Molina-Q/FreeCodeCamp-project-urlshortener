require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');
const bodyParser = require('body-parser');

const client = new MongoClient(process.env.DB_URL);
const db = client.db('url-shortner');
const urls = db.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.route('/api/shorturl')
  .post(function(req, res) {

    const url = req.body.url;

    const dnslookup = dns.lookup(urlparser.parse(url).hostname,

    async(err, address) => {

      if (!address){
        res.json({error: "Invalid URL"})
      } else {

        const urlCount = await urls.countDocuments({}) // will count all of the documents
        const urlDoc = {
          url: url,
          short_url: urlCount
        };

        const result = await urls.insertOne(urlDoc)
        console.log(result);
        res.json({ original_url: url, short_url: urlCount });
      }
    })
  })

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

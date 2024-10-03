const express = require('express');
const { initRedis, cache } = require('./redis')

const port = process.env.PORT || 3000;
const app = express();
const DICTIONARY_API = process.env.DICTIONARY_API
const SPACEFLIGHT_NEWS_API = process.env.SPACEFLIGHT_NEWS_API
const QUOTE_API = process.env.QUOTE_API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



const StatsD = require('hot-shots');
const os = require('os');
// Create a StatsD client
const statsd_client = new StatsD({
    host: "graphite",
    port: 8125,
    protocol: "udp",
    errorHandler: (error) => {
        console.error("Error while reporting metric:", error);
    },
});


app.get('/ping', (req, res) => {
    const useCache = process.env.USE_CACHE;
    const bcache = useCache === "yes"
    console.log(`Env var value is ${useCache}`);
    console.log(`Use Cache value is set as: ${bcache}`);
    const start = Date.now();
    console.log("received ping");
    const end = Date.now();
    statsd_client.gauge(`server_timing`, end-start);
    res.send('pong');
});



app.get('/dictionary', cache(), async (req, res) => {
    const word = req.query.word;
    console.log("Searching for word: ", word);
    if (!word) {
        res.status(400).send('Word is required');
    }
    const url = `${DICTIONARY_API}${word}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const phonetics = data[0].phonetics.map(p => p.text).join(', ');
      const meanings = data[0].meanings.map(m => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.map(d => d.definition).join(', ')
      }));
      res.send({ phonetics, meanings });
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal server error');
    }
});

app.get('/spaceflight_news', cache(), (req, res) => {
    const limit = req.query.limit || 5;
    const url = `${SPACEFLIGHT_NEWS_API}?limit=${limit}`;
    console.log("Searching for spaceflight news");
    fetch(url, {
        headers: {
            'accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            const news = data.results.map(n => ({
                title: n.title,
            }));
            res.send(news);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal server error');
        });
});

app.get('/quote', (_req, res) => {
    const url = 'https://api.quotable.io/random';
    console.log("Searching for quote");
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const response = {
                author: data.author,
                content: data.content
            }
            res.send(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal server error');
        });
});

async function initApp() {
  await initRedis();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
}

initApp()
  .then()
  .catch((e) => console.error('Error initializing Express app', e));

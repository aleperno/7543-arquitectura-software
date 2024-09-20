const express = require('express');
const { initRedis, cache } = require('./redis')

const port = process.env.PORT || 3000;
const app = express();
const DICTIONARY_API = process.env.DICTIONARY_API
const SPACEFLIGHT_NEWS_API = process.env.SPACEFLIGHT_NEWS_API
const QUOTE_API = process.env.QUOTE_API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.get('/ping', (req, res) => {
        res.send('pong');
});

app.get('/dictionary', cache(), async (req, res) => {
    const word = req.query.word;
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


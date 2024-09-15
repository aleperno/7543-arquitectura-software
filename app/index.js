const express = require('express');


const port = process.env.PORT || 3000;
const app = express();
const DICTIONARY_API = process.env.DICTIONARY_API
const SPACEFLIGHT_NEWS_API = process.env.SPACEFLIGHT_NEWS_API

app.get('/ping', (req, res) => {
        res.send('pong');
});

app.get('/dictionary', (req, res) => {
    const word = req.query.word;
    if (!word) {
        res.status(400).send('Word is required');
    }
    const url = `${DICTIONARY_API}${word}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const phonetics = data[0].phonetics.map(p => p.text).join(', ');
            const meanings = data[0].meanings.map(m => ({
                partOfSpeech: m.partOfSpeech,
                definitions: m.definitions.map(d => d.definition).join(', ')
            }));
            res.send({ phonetics, meanings });
        })
        .catch(err => {
            res.status(500).send('Internal server error');
        });
});

app.get('/spaceflight_news', (req, res) => {
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})   

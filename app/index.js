const express = require('express');


const port = process.env.PORT || 3000;
const app = express();
const DICTIONARY_API = process.env.DICTIONARY_API

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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})   

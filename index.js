const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load existing shortened URLs from JSON file
let urlData = {};
try {
    const data = fs.readFileSync('data.json');
    urlData = JSON.parse(data);
} catch (err) { 
    console.error("Error reading data:", err);
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/shorten', (req, res) => {
    const originalUrl = req.body.url;
    const customName = req.body.custom;

    let shortUrl = customName.trim().toLowerCase(); // Custom short URL provided by user
    if (!shortUrl) {
        // Generate short URL if custom name not provided
        shortUrl = generateShortUrl();
    }

    urlData[shortUrl] = originalUrl; // Save URL mapping to data

    fs.writeFile('data.json', JSON.stringify(urlData, null, 2), (err) => {
        if (err) {
            console.error("Error writing data:", err);
            res.send('Error saving data');
        } else {
            res.send(`Shortened URL: ${req.hostname}/${shortUrl}`);
        }
    });
});

app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;
    if (urlData.hasOwnProperty(shortUrl)) {
        const originalUrl = urlData[shortUrl];
        res.redirect(originalUrl);
    } else {
        res.status(404).send('URL not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function generateShortUrl() {
    // Generate a random short URL
    return Math.random().toString(36).substr(2, 7);
}

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

const scrapeHistoricalPlacements = async () => {
    try {
        const url = 'https://dental.buffalo.edu/education/dds-program1/about-the-program-dds/after-you-graduate.html';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const placements = [];

        const targetSection = $('div.title.section').filter(function () {
            return $(this).find('h2 > span').text().trim() === 'Historical Post Graduate Placements';
        });

        if (targetSection.length === 0) {
            throw new Error('Target section not found');
        }

        const table = targetSection.closest('div').find('table');

        table.find('tbody tr').each((i, tr) => {
            const specialization = $(tr).find('td:nth-child(1) b').text().trim();
            const placementName = $(tr).find('td:nth-child(2)').text().trim();
            const location = $(tr).find('td:nth-child(3)').text().trim();
            if (placementName && location && specialization) {
                placements.push({
                    specialization,
                    placementName,
                    location
                });
            }
        });

        return placements;
    } catch (error) {
        console.error('Error scraping placements:', error);
        throw error;
    }
};

app.get('/', (req, res) => {
    res.send('Hello from Express backend!');
});

app.get('/api/historical-placements', async (req, res) => {
    try {
        const placements = await scrapeHistoricalPlacements();
        res.json({ success: true, data: placements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to scrape placements.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

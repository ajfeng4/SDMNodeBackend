const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

const scrapeHistoricalPlacements = async () => {
    try {
        console.log('Starting scraper...');
        const url = 'https://dental.buffalo.edu/education/dds-program1/about-the-program-dds/after-you-graduate.html';
        console.log(`Fetching data from URL: ${url}`);
        const { data } = await axios.get(url);
        console.log('Data fetched successfully. Loading into cheerio...');
        const $ = cheerio.load(data);

        const placements = [];
        console.log('Searching for table rows in the HTML...');
        $('table tbody tr').each((i, tr) => {
            console.log(`Processing row ${i + 1}...`);
            const specialization = $(tr).find('td:nth-child(1) b').text().trim();
            const placementName = $(tr).find('td:nth-child(2)').text().trim();
            const location = $(tr).find('td:nth-child(3)').text().trim();

            if (specialization && placementName && location) {
                console.log(`Row ${i + 1} data extracted:`, { specialization, placementName, location });
                placements.push({ specialization, placementName, location });
            } else {
                console.log(`Row ${i + 1} is missing some data. Skipping.`);
            }
        });

        if (placements.length === 0) {
            console.log('No placements found. Ensure the table structure matches the scraper logic.');
        } else {
            console.log(`${placements.length} placements found.`);
        }

        return placements;
    } catch (error) {
        console.error('Error during scraping:', error.message);
        throw new Error('Error scraping placements');
    }
};

app.get('/', (req, res) => {
    res.send('Hello from Express backend!');
});

app.get('/api/historical-placements', async (req, res) => {
    try {
        console.log('API /api/historical-placements called. Running scraper...');
        const placements = await scrapeHistoricalPlacements();
        console.log('Scraper completed successfully.');
        res.json({ success: true, data: placements });
    } catch (error) {
        console.error('Error in API /api/historical-placements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to scrape placements.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

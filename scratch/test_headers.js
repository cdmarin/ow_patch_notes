const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const url = 'https://overwatch.blizzard.com/en-us/news/patch-notes/';
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    const $ = cheerio.load(response.data);
    $('.PatchNotes-patch').each((i, patchEl) => {
        const $patch = $(patchEl);
        const patchTitle = $patch.find('.PatchNotes-patchTitle, h3, h4').first().text().trim();
        console.log(`Patch: ${patchTitle}`);
        $patch.find('.PatchNotes-section').each((j, secEl) => {
            const $sec = $(secEl);
            const secTitle = $sec.find('h4.PatchNotes-sectionTitle').first().text().trim();
            const classes = $sec.attr('class');
            console.log(`  Section: "${secTitle}" (classes: ${classes})`);
        });
    });
}

test().catch(console.error);

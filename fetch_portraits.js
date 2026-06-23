process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

https.get('https://overfast-api.tekrop.fr/heroes', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const heroes = JSON.parse(data);
            const portraits = {};
            heroes.forEach(h => portraits[h.key] = h.portrait);
            console.log(JSON.stringify(portraits, null, 2));
        } catch(e) {
            console.log('Error:', e.message);
        }
    });
}).on('error', (e) => {
    console.log('Error:', e.message);
});

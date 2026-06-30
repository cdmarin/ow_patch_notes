const fs = require('fs');
const path = require('path');

const patchPath = path.join(__dirname, '../data/patches/2026-06-30/patch.json');

try {
    const data = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
    if (data.sections && data.sections.communityCrafted) {
        data.sections.arcade = data.sections.communityCrafted;
        delete data.sections.communityCrafted;
        fs.writeFileSync(patchPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Successfully renamed communityCrafted to arcade in 2026-06-30/patch.json');
    } else {
        console.log('communityCrafted section not found in patch.json');
    }
} catch (err) {
    console.error('Error modifying patch.json:', err);
}

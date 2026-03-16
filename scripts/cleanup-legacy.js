const fs = require('fs');
const path = require('path');

const filesToDelete = [
    './maintenance.json',
    './scraper/data/player-stats.json',
    './scraper/data/talent-stats.json',
    './scraper/config/home-content.json',
    './scraper/config/roster.json',
    './scraper/config/talent-urls.json'
];

console.log('--- CLEANUP LEGACY JSON STORAGE ---');

filesToDelete.forEach(file => {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            console.log('Deleted: ' + file);
        } catch (e) {
            console.log('Error deleting ' + file + ': ' + e.message);
        }
    } else {
        console.log('Not found (already gone?): ' + file);
    }
});

console.log('--- FINISHED ---');

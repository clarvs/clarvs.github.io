'use strict';

const FortniteTrackerScraper = require('../../scraper/fortnite-tracker-scraper');
const TalentScraper = require('../../scraper/talent-scraper');

const fortniteScaper = new FortniteTrackerScraper({ enableStartupTest: true });
const talentScraper = new TalentScraper();

module.exports = { fortniteScaper, talentScraper };

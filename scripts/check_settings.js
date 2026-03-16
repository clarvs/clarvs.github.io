const { supabase } = require('../supabase');
require('dotenv').config();

async function checkSettings() {
    console.log('--- SITE SETTINGS IN DATABASE ---');
    try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) {
            console.error('Error:', error.message);
            return;
        }
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkSettings();

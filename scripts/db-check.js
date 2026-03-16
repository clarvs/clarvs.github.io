const { supabase } = require('../supabase');

async function check() {
    console.log('--- DATABASE CHECK ---');

    // 1. Check Profiles
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (pErr) console.error('Profiles error:', pErr.message);
    else {
        console.log('Found ' + profiles.length + ' profiles:');
        profiles.forEach(p => console.log('- ' + p.nickname + ' (' + p.role + ')'));
    }

    // 2. Check Site Links
    const { data: links, error: lErr } = await supabase.from('site_links').select('*');
    if (lErr) console.error('Links error:', lErr.message);
    else console.log('Found ' + links.length + ' site links.');

    // 3. Check Site Settings
    const { data: settings, error: sErr } = await supabase.from('site_settings').select('*');
    if (sErr) console.error('Settings error:', sErr.message);
    else {
        console.log('Site Settings:');
        settings.forEach(s => console.log('- ' + s.key + ': ' + JSON.stringify(s.value)));
    }
}

check();

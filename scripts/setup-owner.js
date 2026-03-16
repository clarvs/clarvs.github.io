require('dotenv').config();
const { supabase } = require('../supabase');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const q = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function main() {
    console.log('=== Setup Owner Account Clarvs ===');

    const { data: existing } = await supabase.from('profiles').select('id').eq('role', 'owner');
    if (existing && existing.length > 0) {
        console.log('Owner gia esistente. Usa il pannello admin per gestire gli account.');
        process.exit(0);
    }

    const email    = (await q('Email: ')).trim().toLowerCase();
    const nickname = (await q('Nickname: ')).trim();
    const password = await q('Password (min 8 caratteri): ');

    if (!email || !nickname) { console.log('Email e nickname obbligatori.'); process.exit(1); }
    if (password.length < 8) { console.log('Password troppo corta (min 8 caratteri).'); process.exit(1); }

    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
    });

    if (error) { console.error('Errore Auth:', error.message); process.exit(1); }

    const { error: profErr } = await supabase.from('profiles').insert({
        id: data.user.id,
        nickname: nickname,
        role: 'owner'
    });

    if (profErr) {
        await supabase.auth.admin.deleteUser(data.user.id);
        console.error('Errore profilo:', profErr.message);
        process.exit(1);
    }

    console.log('Owner creato!');
    console.log('  Email:    ' + data.user.email);
    console.log('  Nickname: ' + nickname);
    console.log('Puoi ora fare login nel pannello admin.');
    process.exit(0);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => rl.close());

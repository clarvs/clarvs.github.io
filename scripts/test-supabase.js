const { supabase, supabaseAnon } = require('../supabase');
require('dotenv').config();

console.log('--- DIAGNOSI AVANZATA SUPABASE ---');
console.log('URL:', process.env.SUPABASE_URL);

async function runDiagnostics() {
    try {
        console.log('\n1. Test Connessione Database (Table: site_links)...');
        const { data: dbData, error: dbError } = await supabase.from('site_links').select('count', { count: 'exact', head: true });
        if (dbError) {
            console.error('ERRORE DATABASE:', dbError.message);
        } else {
            console.log('DATABASE OK. Tabella site_links accessibile.');
        }

        console.log('\n2. Test Sistema di Autenticazione (Auth)...');
        const { data: { users }, error: authListError } = await supabase.auth.admin.listUsers();
        if (authListError) {
            console.error('ERRORE AUTH ADMIN:', authListError.message);
        } else {
            console.log('AUTH ADMIN OK. Utenti trovati nel sistema:', users.length);
            const targetUser = users.find(u => u.email === 'licidenis09@gmail.com');
            if (targetUser) {
                console.log('   - Utente licidenis09@gmail.com TROVATO (ID:', targetUser.id, ')');
            } else {
                console.warn('   - Utente licidenis09@gmail.com NON TROVATO. Crealo dalla Dashboard!');
            }
        }

        console.log('\n3. Verifica Profilo Pubblico (Profiles)...');
        const { data: profData, error: profError } = await supabase.from('profiles').select('*');
        if (profError) {
            console.error('ERRORE PROFILI:', profError.message);
        } else {
            console.log('TABELLA PROFILI OK. Numero profili:', profData.length);
        }

    } catch (e) {
        console.error('ERRORE IMPREVISTO DURANTE DIAGNOSI:', e);
    }
}

runDiagnostics();

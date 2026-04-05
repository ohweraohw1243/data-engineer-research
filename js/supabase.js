const SUPABASE_URL = 'https://ptpxlmedpbdchevpoome.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cHhsbWVkcGJkY2hldnBvb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTA5MzcsImV4cCI6MjA5MDkyNjkzN30.UhJEC40pM43LoYCXVqd8p0iriRMa437LNoGnB5jEtc8';

let supabaseClient = null;

if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized.');
} else {
    console.error('Supabase library not loaded.');
}

// ==== AUTHENTICATION ====
async function signInWithGithub() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) console.error('Error signing in:', error.message);
}

async function signOut() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    else window.location.reload();
}

async function getCurrentUser() {
    if (!supabaseClient) return null;
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session ? session.user : null;
}

// ==== APP LOGIC API ====
// Эти функции будут сохранять лайки и решения в БД
async function toggleFavoriteTask(taskId, taskType, taskTitle) {
    const user = await getCurrentUser();
    if (!user) return alert('Войдите через GitHub, чтобы добавлять в избранное');
    
    // Проверяем, есть ли уже в избранном
    const { data: existing } = await supabaseClient
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();
        
    if (existing) {
        // Удаляем
        await supabaseClient.from('favorites').delete().eq('id', existing.id);
        return false; // Забрали лайк
    } else {
        // Добавляем
        await supabaseClient.from('favorites').insert([
            { user_id: user.id, task_id: taskId, task_type: taskType, task_title: taskTitle }
        ]);
        return true; // Поставили лайк
    }
}

async function markTaskAsSolved(taskId, taskType) {
    const user = await getCurrentUser();
    if (!user) return; // Гости локально помечают, в БД не пишем

    await supabaseClient.from('solved_tasks').insert([
        { user_id: user.id, task_id: taskId, task_type: taskType }
    ]);
}

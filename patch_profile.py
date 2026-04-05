import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add switchTab logic
content = re.sub(
    r"(if \(tabId === 'coding'\) await initCodingSection\(\);)",
    r"\1\n                if (tabId === 'profile') { if(typeof initProfileSection === 'function') { await initProfileSection(); } }",
    content
)

profile_logic = """

        async function initProfileSection() {
            const authSection = document.getElementById('profile-auth-section');
            const userSection = document.getElementById('profile-user-section');
            
            if (!authSection || !userSection) return;

            if (typeof getCurrentUser === 'undefined') {
                authSection.innerHTML = '<p style="color:var(--text-dim)">База данных отключена.</p>';
                return;
            }

            const user = await getCurrentUser();
            if (user) {
                authSection.style.display = 'none';
                userSection.style.display = 'block';

                const meta = user.user_metadata || {};
                document.getElementById('profile-name').textContent = meta.full_name || meta.user_name || user.email || 'Аноним';
                document.getElementById('profile-email').textContent = user.email || '';
                
                const avatar = document.getElementById('profile-avatar');
                if (meta.avatar_url) {
                    avatar.src = meta.avatar_url;
                } else {
                    avatar.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%2324292e"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23fff"/></svg>';
                }

                loadProfileStats();
            } else {
                authSection.style.display = 'block';
                userSection.style.display = 'none';
            }
        }

        async function loadProfileStats() {
            const list = document.getElementById('profile-favorites-list');
            if (!list || typeof supabaseClient === 'undefined' || !supabaseClient) return;

            try {
                const user = await getCurrentUser();
                
                const { count: solvedCount } = await supabaseClient
                    .from('solved_tasks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                    
                const { data: favorites } = await supabaseClient
                    .from('favorites')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                document.getElementById('stat-solved').textContent = solvedCount || 0;
                document.getElementById('stat-favorites').textContent = (favorites || []).length || 0;

                if (favorites && favorites.length > 0) {
                    list.innerHTML = favorites.map(fav => `
                        <div style="background:var(--bg-card); border:1px solid rgba(255,255,255,0.05); padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:12px; color:var(--accent1); font-weight:600; text-transform:uppercase; margin-bottom:4px; display:block;">${fav.task_type}</span>
                                <div style="font-weight:600; color:#fff;">${fav.task_title || fav.task_id}</div>
                            </div>
                            <button class="btn btn-secondary" style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; padding:8px 16px; font-weight:600; border-radius:8px; cursor:pointer;" onclick="toggleFavoriteTask('${fav.task_id}', '${fav.task_type}', '${fav.task_title}').then(()=>loadProfileStats())">Убрать</button>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = '<p style="color: var(--text-dim);">У вас пока нет сохраненных вопросов.</p>';
                }
            } catch (err) {
                console.error('Ошибка загрузки статистики:', err);
                list.innerHTML = '<p style="color:var(--red);">Не удалось загрузить данные. Проверьте БД.</p>';
            }
        }

        async function initCodingSection() {"""

content = re.sub(r'(\s+)async function initCodingSection\(\) \{', r'\1' + profile_logic, content)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

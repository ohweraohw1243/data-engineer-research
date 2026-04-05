const fs = require('fs');

let content = fs.readFileSync('js/app.js', 'utf8');

// Добавляем вызов initProfileSection в switchTab
content = content.replace(
    /if \(tabId === 'coding'\) await initCodingSection\(\);/,
    "if (tabId === 'coding') await initCodingSection();\n                if (tabId === 'profile') await initProfileSection();"
);

// Добавляем функцию initProfileSection
const profileLogic = `
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

                const meta = user.identities?.[0]?.identity_data || {};
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
            if (!list || !supabaseClient) return;

            try {
                const user = await getCurrentUser();
                
                const { count: solvedCount } = await supabaseClient
                    .from('solved_tasks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                    
                const { data: favorites, count: favoritesCount } = await supabaseClient
                    .from('favorites')
                    .select('*', { count: 'exact' })
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                document.getElementById('stat-solved').textContent = solvedCount || 0;
                document.getElementById('stat-favorites').textContent = favoritesCount || 0;

                if (favorites && favorites.length > 0) {
                    list.innerHTML = favorites.map(fav => \`
                        <div style="background:var(--bg-card); border:1px solid rgba(255,255,255,0.05); padding:16px; border-radius:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:12px; color:var(--accent1); font-weight:600; text-transform:uppercase; margin-bottom:4px; display:block;">\${fav.task_type}</span>
                                <div style="font-weight:600; color:#fff;">\${fav.task_title}</div>
                            </div>
                            <button class="btn btn-secondary" style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; padding:8px 16px; font-weight:600;" onclick="toggleFavoriteTask('\${fav.task_id}', '\${fav.task_type}', '\${fav.task_title}').then(()=>loadProfileStats())">Удалить</button>
                        </div>
                    \`).join('');
                } else {
                    list.innerHTML = '<p style="color: var(--text-dim);">У вас пока нет сохраненных вопросов.</p>';
                }
            } catch (err) {
                console.error('Ошибка загрузки статистики', err);
                list.innerHTML = '<p style="color:var(--red);">Не удалось загрузить данные.</p>';
            }
        }
`;

content = content.replace(
    /async function initCodingSection\(\) \{/,
    profileLogic + "\n        async function initCodingSection() {"
);

fs.writeFileSync('js/app.js', content, 'utf8');


// ==== ОБЛАЧНАЯ ПОИСКОВАЯ СТРОКА (Cmd+K / Ctrl+K) ====
const _CMD_PALETTE_DATA = [
    { title: 'Главная страница', sub: 'Сводка и метрики', tab: 'home', icon: '🎯' },
    { title: 'Дорожная карта', sub: 'Общий чеклист', tab: 'roadmap', icon: '🗺️' },
    { title: 'SQL & Базы Данных', sub: 'Оконные функции, индексы, планы', tab: 'stage1', icon: '🐘' },
    { title: 'Python', sub: 'ETL, Airflow, Pydantic', tab: 'stage2', icon: '🐍' },
    { title: 'Spark', sub: 'Tuning, Joins, AQE', tab: 'stage3', icon: '⚡' },
    { title: 'Kafka', sub: 'Streaming, Consumer, Watermarks', tab: 'stage4', icon: '🌊' },
    { title: 'System Design', sub: 'Архитектура данных', tab: 'stage5', icon: '🏗️' },
    { title: 'Практические проекты', sub: 'GitHub и портфолио', tab: 'projects', icon: '💼' },
    { title: 'Теория (Вопросы)', sub: 'Тренажер вопросов', tab: 'questions', icon: '💬' },
    { title: 'Лайв-кодинг', sub: 'Писать код с ИИ и без', tab: 'coding', icon: '⌨️' },
    { title: 'Собеседование', sub: 'Mock-интервью', tab: 'interview', icon: '🎤' },
    { title: 'Профиль', sub: 'Сохраненные достижения', tab: 'profile', icon: '👤' }
];

let _cmdPaletteSelectedIndex = 0;

function initCommandPalette() {
    const backdrop = document.getElementById('cmd-palette-backdrop');
    const input = document.getElementById('cmd-input');
    const resultsContainer = document.getElementById('cmd-results');
    if (!backdrop || !input) return;

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            backdrop.style.display = 'flex';
            input.value = '';
            input.focus();
            renderCmdResults('');
        }
        if (e.key === 'Escape' && backdrop.style.display === 'flex') {
            backdrop.style.display = 'none';
        }
        if (backdrop.style.display === 'flex') {
            const items = document.querySelectorAll('.cmd-result-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                _cmdPaletteSelectedIndex = Math.min(_cmdPaletteSelectedIndex + 1, items.length - 1);
                updateCmdSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                _cmdPaletteSelectedIndex = Math.max(_cmdPaletteSelectedIndex - 1, 0);
                updateCmdSelection(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (items[_cmdPaletteSelectedIndex]) items[_cmdPaletteSelectedIndex].click();
            }
        }
    });

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.style.display = 'none';
    });

    input.addEventListener('input', (e) => renderCmdResults(e.target.value));

    function renderCmdResults(query) {
        _cmdPaletteSelectedIndex = 0;
        const q = query.toLowerCase();
        let filtered = _CMD_PALETTE_DATA;
        
        if (q) {
            filtered = _CMD_PALETTE_DATA.filter(item => 
                item.title.toLowerCase().includes(q) || 
                item.sub.toLowerCase().includes(q)
            );
            
            // Если ничего нет в меню, ищем среди локальных задач Stage 1-4
            if (filtered.length === 0) {
                // Прямой поиск по LIVE_CODING_LOCAL_FALLBACK_TASK_POOL
                Object.keys(LIVE_CODING_LOCAL_FALLBACK_TASK_POOL).forEach(stage => {
                    LIVE_CODING_LOCAL_FALLBACK_TASK_POOL[stage].forEach(task => {
                        if (task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)) {
                            filtered.push({
                                title: task.title,
                                sub: `Задача по кодингу (Этап ${stage})`,
                                tab: 'coding', // Отправим на страницу кодинга
                                icon: '📝'
                            });
                        }
                    });
                });
            }
        }

        resultsContainer.innerHTML = filtered.map((res, i) => `
            <div class="cmd-result-item ${i === 0 ? 'selected' : ''}" data-index="${i}" onclick="document.getElementById('cmd-palette-backdrop').style.display='none'; switchTab('${res.tab}'); window.location.hash='/${res.tab}';">
                <span class="cmd-result-item-icon">${res.icon}</span>
                <div>
                    <div class="cmd-result-item-title">${escapeHtml(res.title)}</div>
                    <div class="cmd-result-item-subtitle">${escapeHtml(res.sub)}</div>
                </div>
            </div>
        `).join('');
    }

    function updateCmdSelection(items) {
        items.forEach(el => el.classList.remove('selected'));
        if (items[_cmdPaletteSelectedIndex]) {
            items[_cmdPaletteSelectedIndex].classList.add('selected');
            items[_cmdPaletteSelectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }
}

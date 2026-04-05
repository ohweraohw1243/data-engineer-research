function injectFavoriteButtons() {
    // Для раздела Вопросы (.accordion-header)
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        // Проверяем, нет ли уже кнопки
        if (!header.querySelector('button[title="В избранное"]')) {
            const titleSpan = header.querySelector('span'); // первый span обычно это текст
            if (!titleSpan) return;
            
            const questionText = titleSpan.textContent.trim();
            const btn = document.createElement('button');
            btn.innerHTML = '☆';
            btn.title = 'В избранное';
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.style.marginLeft = '8px';
            
            // Восстанавливаем состояние из базы если возможно
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                const taskId = btoa(unescape(encodeURIComponent(questionText)));
                getCurrentUser().then(user => {
                    if (user) {
                        supabaseClient.from('favorites').select('id').eq('user_id', user.id).eq('task_id', taskId).single()
                        .then(({data}) => {
                            if (data) btn.innerHTML = '⭐';
                        }).catch(()=>{});
                    }
                });
            }

            btn.onclick = (e) => {
                e.stopPropagation();
                const taskId = btoa(unescape(encodeURIComponent(questionText)));
                toggleFavoriteTask(taskId, 'Теоретический вопрос', questionText)
                    .then(res => { if (res !== undefined) btn.innerHTML = res ? '⭐' : '☆'; })
                    .catch(console.error);
            };
            
            // Обернем titleSpan и кнопку во flex контейнер если его нет
            if (titleSpan.parentElement.tagName !== 'DIV' || !titleSpan.parentElement.style.display.includes('flex')) {
                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '8px';
                header.insertBefore(wrapper, titleSpan);
                wrapper.appendChild(titleSpan);
                wrapper.appendChild(btn);
            } else {
                titleSpan.parentElement.appendChild(btn);
            }
        }
    });

    // Для раздела Лайв-кодинг (.task-box h4, .card h4)
    const taskHeaders = document.querySelectorAll('.task-box h4, .card h4');
    taskHeaders.forEach(h4 => {
        const container = h4.closest('.task-box, .card');
        if (!container || !container.hasAttribute('data-task-id')) return;
        
        const wrapper = h4.parentElement;
        if (!wrapper.querySelector('button[title="В избранное"]')) {
            const taskId = container.getAttribute('data-task-id');
            const taskTitle = h4.textContent.trim();
            const btn = document.createElement('button');
            btn.innerHTML = '☆';
            btn.title = 'В избранное';
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.fontSize = '20px';
            btn.style.cursor = 'pointer';
            
            if (wrapper.style.display !== 'flex') {
                wrapper.style.display = 'flex';
                wrapper.style.justifyContent = 'space-between';
                wrapper.style.alignItems = 'flex-start';
            }

            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                getCurrentUser().then(user => {
                    if (user) {
                        supabaseClient.from('favorites').select('id').eq('user_id', user.id).eq('task_id', taskId).single()
                        .then(({data}) => {
                            if (data) btn.innerHTML = '⭐';
                        }).catch(()=>{});
                    }
                });
            }

            btn.onclick = (e) => {
                e.stopPropagation();
                toggleFavoriteTask(taskId, 'Лайв-кодинг', taskTitle)
                    .then(res => { if (res !== undefined) btn.innerHTML = res ? '⭐' : '☆'; })
                    .catch(console.error);
            };
            wrapper.appendChild(btn);
        }
    });
}

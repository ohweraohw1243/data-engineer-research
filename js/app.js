// ===== ТАЙМЕР И РАСПИСАНИЕ =====
        const SCHEDULE = {
            // Неделя 1 (нечетная) и Неделя 2 (четная) расписание
            1: { // Понедельник
                odd: { hours: 4, start: '13:00', end: '17:00' },
                even: { hours: 4, start: '13:00', end: '17:00' }
            },
            2: { // Вторник
                odd: { hours: 5, start: '09:00', end: '14:00' },
                even: { hours: 3, start: '08:30', end: '11:30' }
            },
            3: { // Среда
                odd: { hours: 4.5, start: '08:30', end: '11:00', start2: '17:00', end2: '19:00' },
                even: { hours: 3, start: '13:00', end: '16:00' }
            },
            4: { // Четверг
                odd: { hours: 4, start: '13:00', end: '17:00' },
                even: { hours: 2, start: '09:00', end: '11:00' }
            },
            5: { // Пятница
                odd: { hours: 4, start: '15:00', end: '19:00' },
                even: { hours: 4, start: '15:00', end: '19:00' }
            },
            6: { // Суббота
                odd: { hours: 5, start: '09:00', end: '11:00', start2: '19:00', end2: '22:00' },
                even: { hours: 5, start: '09:00', end: '11:00', start2: '19:00', end2: '22:00' }
            },
            0: { // Воскресенье
                odd: { hours: 6, start: '10:00', end: '16:00' },
                even: { hours: 6, start: '10:00', end: '16:00' }
            }
        };

        let pomodoroState = {
            isRunning: false,
            workTime: 25 * 60,
            breakTime: 5 * 60,
            timeLeft: 25 * 60,
            isWork: true,
            sessionsCompleted: 0
        };

        // ===== ЛОКАЛЬНОЕ ХРАНИЛИЩЕ =====
        function saveProgress() {
            try {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                const completedTasks = [];
                checkboxes.forEach((el, i) => {
                    if (el.checked) {
                        completedTasks.push({
                            id: i,
                            module: el.getAttribute('data-module'),
                            label: el.nextElementSibling?.textContent || ''
                        });
                    }
                });

                // Сохраняем текущие ответы студента
                const answers = {};
                document.querySelectorAll('.answer-textarea').forEach(textarea => {
                    const taskId = textarea.closest('[data-task-id]')?.getAttribute('data-task-id');
                    if (taskId && textarea.value) {
                        answers[taskId] = textarea.value;
                    }
                });
                if (Object.keys(answers).length > 0) {
                    localStorage.setItem('userAnswers', JSON.stringify(answers));
                }

                const progress = {
                    version: 1,
                    timestamp: Date.now(),
                    completedTasks: completedTasks,
                    currentTab: document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'home',
                    pomodoroSessions: pomodoroState.sessionsCompleted || 0,
                    pomodoroHistory: pomodoroState.history || []
                };

                const dataStr = JSON.stringify(progress);
                
                // Проверка размера перед сохранением
                if (dataStr.length > 1024 * 1024) { // 1MB limit
                    console.warn('Данные для сохранения слишком большие');
                    cleanOldStorageData();
                }

                localStorage.setItem('streamflow_progress', dataStr);
                localStorage.setItem('streamflow_last_saved', new Date().toISOString());
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.warn('LocalStorage переполнен, очищаю старые данные...');
                    cleanOldStorageData();
                    try {
                        // Пробуем снова после очистки
                        localStorage.setItem('streamflow_progress', JSON.stringify({
                            version: 1,
                            timestamp: Date.now(),
                            completedTasks: [],
                            currentTab: 'home'
                        }));
                    } catch (err) {
                        console.error('Не удается сохранить даже после очистки:', err);
                    }
                } else {
                    console.error('Ошибка при сохранении прогресса:', e);
                }
            }
        }

        function loadProgress() {
            try {
                const saved = localStorage.getItem('streamflow_progress');
                const lastSaved = localStorage.getItem('streamflow_last_saved');

                if (saved) {
                    const progress = JSON.parse(saved);

                    // Валидация версии
                    if (!progress.version || progress.version > 1) {
                        console.log('Несовместимый формат данных, используем значения по умолчанию');
                        return;
                    }

                    // Восстановление активной вкладки
                    if (progress.currentTab && document.getElementById(progress.currentTab)) {
                        switchTab(progress.currentTab);
                    }

                    // Восстановление выполненных задач
                    if (Array.isArray(progress.completedTasks) && progress.completedTasks.length > 0) {
                        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                        progress.completedTasks.forEach(task => {
                            if (task.id < checkboxes.length) {
                                checkboxes[task.id].checked = true;
                            }
                        });
                    }

                    // Восстановление Pomodoro
                    if (progress.pomodoroSessions !== undefined) {
                        pomodoroState.sessionsCompleted = progress.pomodoroSessions;
                    }
                    if (progress.pomodoroHistory) {
                        pomodoroState.history = progress.pomodoroHistory;
                    }

                    console.log(`Прогресс загружен (сохранено: ${lastSaved})`);
                }
            } catch (e) {
                console.error('Ошибка при загрузке прогресса:', e);
                // При ошибке парсинга пытаемся очистить и начать заново
                try {
                    localStorage.removeItem('streamflow_progress');
                    showErrorMessage('Произошла ошибка при загрузке данных. Данные сброшены.');
                } catch (err) {
                    console.error('Не удается очистить localStorage:', err);
                }
            }
        }

        // ===== НАВИГАЦИЯ ПО ВКЛАДКАМ =====
        async function switchTab(tabId) {
            const container = document.getElementById('page-container');
            if (!container) return;
            
            try {
                let basePath = '';
                if (window.location.hostname.includes('github.io')) {
                    const parts = window.location.pathname.split('/');
                    if (parts.length > 1 && parts[1] !== '') {
                        basePath = '/' + parts[1] + '/';
                    }
                }
                const nocache = new Date().getTime();
                const response = await fetch(`${basePath}pages/${tabId}.html?v=${nocache}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const html = await response.text();
                container.innerHTML = html;
                
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
                });
                
                if (typeof setupAnswerField !== 'undefined') {
                    document.querySelectorAll('[data-task-id]').forEach(setupAnswerField);
                }
                if (typeof loadSavedAnswers !== 'undefined') loadSavedAnswers();
                if (typeof updateAnswerProgress !== 'undefined') updateAnswerProgress();
                saveProgress();
                
            } catch (error) {
                console.error('Error loading page:', error);
                container.innerHTML = `<h2>Ошибка загрузки страницы.</h2><p>Убедитесь, что страница загружена на хостинг с сохранением папок <code>pages/</code>, <code>css/</code>, <code>js/</code>.</p><p><small>${error.message}</small></p>`;
            }
        }

        // ===== АККОРДЕОН =====
        function toggleAccordion(header) {
            if (header.classList) {
                header.classList.toggle('active');
                if (header.nextElementSibling) {
                    header.nextElementSibling.classList.toggle('active');
                }
                const toggle = header.querySelector('.accordion-toggle');
                if (toggle) toggle.classList.toggle('active');
            }
        }

        // ===== ПОДСКАЗКИ И РЕШЕНИЯ =====
        function showHint(btn, level) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const hint = container.querySelector(`.hint-level:nth-of-type(${level})`);
            if (hint) {
                hint.classList.add('active');
            }
        }

        function showSQLSolution(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const solution = container.querySelector('.solution-code');
            if (solution) {
                solution.style.display = solution.style.display === 'none' ? 'block' : 'none';
            }
        }

        // ===== ПРОВЕРКА ОТВЕТОВ =====
        function checkAnswer(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const textarea = container.querySelector('.answer-textarea');
            const resultDiv = container.querySelector('.check-result');
            const expectedAnswer = container.querySelector('.solution-code')?.textContent?.trim().toLowerCase() || '';
            const userAnswer = textarea?.value?.trim().toLowerCase() || '';

            if (!textarea || !userAnswer) {
                showResultMessage(resultDiv, 'incorrect', '⚠️ Пожалуйста, напишите свой ответ');
                return;
            }

            // Нормализуем оба ответа для сравнения
            const normalizedUser = normalizeSQL(userAnswer);
            const normalizedExpected = normalizeSQL(expectedAnswer);

            // Точное совпадение
            if (normalizedUser === normalizedExpected) {
                showResultMessage(resultDiv, 'correct', 
                    '✅ Отлично! Ваш ответ совпадает с правильным решением.');
                textarea.style.borderColor = 'var(--accent1)';
                updateAnswerProgress();
                return;
            }

            // Проверка на частичное совпадение (основные компоненты)
            const similarity = calculateSimilarity(normalizedUser, normalizedExpected);
            if (similarity > 0.7) {
                showResultMessage(resultDiv, 'partial', 
                    `⚠️ Похоже! Сходство ${Math.round(similarity * 100)}%. Но есть небольшие различия.<br>Подсказка: Проверьте синтаксис, названия функций и порядок условий.`);
                textarea.style.borderColor = 'var(--accent3)';
                updateAnswerProgress();
                return;
            }

            // Проверка наличия ключевых элементов
            const keywordsFound = findKeywords(userAnswer);
            if (keywordsFound.length > 0) {
                showResultMessage(resultDiv, 'partial', 
                    `⚠️ Направление правильное! Вы используете ${keywordsFound.join(', ')}.<br>Но нужно еще доработать логику. Нажмите "Показать решение" для подсказки.`);
                textarea.style.borderColor = 'var(--accent3)';
                updateAnswerProgress();
                return;
            }

            // Ответ неправильный
            showResultMessage(resultDiv, 'incorrect',
                '❌ Это не совпадает с правильным ответом.<br>💡 Подсказка: Нажмите "Подсказка" чтобы узнать, какой использовать подход.');
            textarea.style.borderColor = 'var(--red)';
            updateAnswerProgress();
        }

        function showResultMessage(resultDiv, type, message) {
            if (!resultDiv) return;
            resultDiv.className = `check-result show ${type}`;
            resultDiv.innerHTML = message;
        }

        // Нормализует SQL для сравнения
        function normalizeSQL(sql) {
            return sql
                .replace(/\s+/g, ' ')  // Объединяем множественные пробелы
                .replace(/;+$/g, '')   // Удаляем точку с запятой в конце
                .trim();
        }

        // Вычисляет сходство между двумя строками (Левенштейн)
        function calculateSimilarity(str1, str2) {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0) return 1.0;

            const editDistance = getEditDistance(longer, shorter);
            return (longer.length - editDistance) / longer.length;
        }

        // Расстояние Левенштейна
        function getEditDistance(s1, s2) {
            const costs = [];
            for (let i = 0; i <= s1.length; i++) {
                let lastValue = i;
                for (let j = 0; j <= s2.length; j++) {
                    if (i === 0) {
                        costs[j] = j;
                    } else if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
                if (i > 0) costs[s2.length] = lastValue;
            }
            return costs[s2.length];
        }

        // Находит ключевые SQL элементы в ответе
        function findKeywords(answer) {
            const keywords = [
                'select', 'from', 'where', 'join', 'group by', 'order by',
                'window', 'over', 'partition', 'rank', 'row_number', 'dense_rank',
                'count', 'sum', 'avg', 'max', 'min', 'with', 'cte'
            ];
            return keywords.filter(kw => answer.includes(kw));
        }

        // Оснащение поля ввода функциями
        function setupAnswerField(target) {
            const container = target?.matches?.('.answer-textarea')
                ? target.closest('[data-task-id], .card, .task-box')
                : target;
            const textarea = target?.matches?.('.answer-textarea')
                ? target
                : container?.querySelector('.answer-textarea');

            if (!container || !textarea) return;
            if (textarea.dataset.enhanced === 'true') return;
            textarea.dataset.enhanced = 'true';

            // Поддержка Tab для отступов в textarea
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                }
            });

            // Автосохранение ответа в localStorage
            textarea.addEventListener('change', () => {
                const taskId = container.getAttribute('data-task-id');
                if (taskId) {
                    const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                    answers[taskId] = textarea.value;
                    localStorage.setItem('userAnswers', JSON.stringify(answers));
                    updateAnswerProgress();
                }
            });
        }

        // Восстановление сохраненных ответов
        function loadSavedAnswers() {
            try {
                const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                Object.keys(answers).forEach(taskId => {
                    const container = document.querySelector(`[data-task-id="${taskId}"]`);
                    if (container) {
                        const textarea = container.querySelector('.answer-textarea');
                        if (textarea) {
                            textarea.value = answers[taskId];
                        }
                    }
                });
            } catch (error) {
                console.warn('Ошибка при загрузке сохраненных ответов:', error);
            }
        }

        // Обновление индикатора прогресса ответов
        function updateAnswerProgress() {
            const sections = {
                'stage1': '.page-content [data-task-id^="stage1"]',
                'stage2': '.page-content [data-task-id^="stage2"]',
                'stage3': '.page-content [data-task-id^="stage3"]',
                'stage4': '.page-content [data-task-id^="stage4"]',
                'stage5': '.page-content [data-task-id^="stage5"]'
            };

            const activeTab = document.querySelector('.nav-item.active');
            if (!activeTab) return;
            const tabId = activeTab.getAttribute('data-tab');

            if (sections[tabId]) {
                const containers = document.querySelectorAll(sections[tabId]);
                const total = containers.length;
                if (total === 0) return;
                
                const answered = Array.from(containers).filter(c => {
                    const textarea = c.querySelector('.answer-textarea');
                    return textarea && textarea.value.trim().length > 0;
                }).length;
                
                const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"] span:last-child`);
                if (navItem) {
                    const percent = Math.round((answered / total) * 100);
                    navItem.setAttribute('data-progress', `${answered}/${total}`);
                    
                    if (percent === 100) {
                        navItem.style.color = 'var(--accent1)';
                    } else if (percent >= 50) {
                        navItem.style.color = 'var(--accent3)';
                    }
                }
            }
        }

        // ===== POMODORO ТАЙМЕР =====
        function startPomodoro() {
            if (!pomodoroState.isRunning) {
                pomodoroState.isRunning = true;
                const interval = setInterval(() => {
                    pomodoroState.timeLeft--;
                    updateTimerDisplay();
                    
                    if (pomodoroState.timeLeft <= 0) {
                        clearInterval(interval);
                        completePomodoroSession();
                    }
                }, 1000);
            }
        }

        function updateTimerDisplay() {
            const mins = Math.floor(pomodoroState.timeLeft / 60);
            const secs = pomodoroState.timeLeft % 60;
            const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            document.title = `${display} — StreamFlow`;
        }

        function completePomodoroSession() {
            pomodoroState.sessionsCompleted++;
            if (pomodoroState.isWork) {
                alert(`✅ Помодоро #${pomodoroState.sessionsCompleted} завершено! Время на перерыв.`);
                pomodoroState.isWork = false;
                pomodoroState.timeLeft = pomodoroState.breakTime;
            } else {
                alert('☕ Перерыв окончен! Начинаем новую сессию.');
                pomodoroState.isWork = true;
                pomodoroState.timeLeft = pomodoroState.workTime;
            }
            pomodoroState.isRunning = false;
            saveProgress();
            updateTimerDisplay();
        }

        // ===== СЛУЧАЙНЫЙ ВОПРОС =====
        function randomQuestion() {
            const accordions = document.querySelectorAll('.accordion-item');
            const randomIndex = Math.floor(Math.random() * accordions.length);
            const randomAccordion = accordions[randomIndex];
            randomAccordion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const header = randomAccordion.querySelector('.accordion-header');
            if (header && !header.classList.contains('active')) {
                toggleAccordion(header);
            }
        }

        // ===== ФИЛЬТР РЕСУРСОВ =====
        function filterResources(tag) {
            document.querySelectorAll('.resource-item').forEach(item => {
                if (tag === 'all') {
                    item.style.display = 'flex';
                } else {
                    const tags = (item.getAttribute('data-tags') || '').split(',');
                    item.style.display = tags.includes(tag) ? 'flex' : 'none';
                }
            });
        }

        // ===== УПРАВЛЕНИЕ ЧЕКЛИСТОМ =====
        function updateChecklist() {
            document.querySelectorAll('[data-module]').forEach(module => {
                const moduleName = module.getAttribute('data-module');
                const checkboxes = document.querySelectorAll(`input[data-module="${moduleName}"]`);
                const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
                const total = checkboxes.length;
                const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
                
                const progressLabel = document.getElementById(`progress-${moduleName}`);
                const progressBar = document.getElementById(`progress-${moduleName}-bar`);
                
                if (progressLabel) progressLabel.textContent = `${checked}/${total}`;
                if (progressBar) progressBar.style.width = `${percent}%`;
            });

            const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
            const overallPercent = allCheckboxes.length > 0 ? Math.round((allChecked / allCheckboxes.length) * 100) : 0;
            
            const overallProgress = document.getElementById('overall-progress');
            const overallBar = document.getElementById('overall-progress-bar');
            
            if (overallProgress) overallProgress.textContent = `${overallPercent}%`;
            if (overallBar) overallBar.style.width = `${overallPercent}%`;

            saveProgress();
        }

        function exportChecklist() {
            const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(cb => ({
                checked: cb.checked,
                module: cb.getAttribute('data-module')
            }));
            const dataStr = JSON.stringify(checkboxes, null, 2);
            const dataURI = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const link = document.createElement('a');
            link.setAttribute('href', dataURI);
            link.setAttribute('download', 'streamflow-checklist.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function importChecklist() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        let i = 0;
                        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                            if (data[i]) checkbox.checked = data[i].checked;
                            i++;
                        });
                        updateChecklist();
                    } catch (err) {
                        alert('Ошибка при импорте файла');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        function resetChecklist() {
            if (confirm('Вы уверены? Все чекбоксы будут сброшены.')) {
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                updateChecklist();
            }
        }

        // ===== ИНИЦИАЛИЗАЦИЯ =====
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    const tabId = item.getAttribute('data-tab');
                    switchTab(tabId);
                });
            });

            // Инициализация с обработкой ошибок
            try {
                loadProgress();
                loadSavedAnswers();
                updateChecklist();
                updateTimerDisplay();
                updateAnswerProgress();
                
                // Подготовка всех полей ввода ответов
                document.querySelectorAll('[data-task-id]').forEach(container => {
                    setupAnswerField(container);
                });
                
                const currTab = localStorage.getItem('streamflow_current_tab') || 'home';
                switchTab(currTab);
            } catch (error) {
                console.error('Ошибка при инициализации:', error);
                showErrorMessage('Ошибка при загрузке данных. Некоторые функции могут работать неправильно.');
            }

            setInterval(saveProgress, 30000);
            window.addEventListener('beforeunload', saveProgress);

            // Очистка LocalStorage при переполнении
            window.addEventListener('storage', handleStorageEvent);
        });

        // ===== ФУНКЦИИ ВАЛИДАЦИИ =====
        function validateStorageSize() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, 'test');
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn('LocalStorage переполнен. Очищаю старые данные...');
                    cleanOldStorageData();
                    return false;
                }
                return true;
            }
        }

        function cleanOldStorageData() {
            try {
                const keys = Object.keys(localStorage);
                const pomodoroHistory = JSON.parse(localStorage.getItem('pomodoroHistory') || '[]');
                
                // Оставляем только последние 30 дней истории
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const recentHistory = pomodoroHistory.filter(entry => entry.timestamp > thirtyDaysAgo);
                
                localStorage.setItem('pomodoroHistory', JSON.stringify(recentHistory));
                showSuccessMessage('Старые данные удалены. Хранилище оптимизировано.');
            } catch (error) {
                console.error('Ошибка при очистке хранилища:', error);
            }
        }

        function handleStorageEvent(e) {
            if (e.key === null) {
                // LocalStorage был очищен в другой вкладке
                console.log('LocalStorage очищен в другой вкладке');
                loadProgress();
            }
        }

        // ===== СООБЩЕНИЯ ОБ ОШИБКАХ =====
        function showErrorMessage(message) {
            const container = document.querySelector('.page.active') || document.body;
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message show';
            errorDiv.textContent = message;
            container.insertBefore(errorDiv, container.firstChild);
            
            setTimeout(() => {
                errorDiv.classList.remove('show');
                setTimeout(() => errorDiv.remove(), 200);
            }, 5000);
        }

        function showSuccessMessage(message) {
            const container = document.querySelector('.page.active') || document.body;
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message show';
            successDiv.textContent = message;
            container.insertBefore(successDiv, container.firstChild);
            
            setTimeout(() => {
                successDiv.classList.remove('show');
                setTimeout(() => successDiv.remove(), 200);
            }, 3000);
        }

        // ===== УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК =====
        window.addEventListener('error', (event) => {
            console.error('Глобальная ошибка:', event.error);
            showErrorMessage('Произошла техническая ошибка. Пожалуйста, обновите страницу.');
        });

        // Обработка unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Необработанное обещание отклонено:', event.reason);
            showErrorMessage('Ошибка при загрузке данных. Попробуйте еще раз.');
        });

        // ===== ПРОВЕРКА ПРОИЗВОДИТЕЛЬНОСТИ =====
        function logPerformanceMetrics() {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const pageTime = timing.loadEventEnd - timing.pageLoadStart || 0;
                console.log(`Время загрузки страницы: ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    console.warn('⚠️ Страница загружается долго. Проверьте интернет-соединение или производительность браузера.');
                }
            }
        }

        // Запуск проверки производительности при загрузке
        window.addEventListener('load', () => {
            setTimeout(logPerformanceMetrics, 100);
        });

        // ===== УЛУЧШЕННАЯ СОХРАНЕНИЕ ПРОГРЕССА =====
        function saveProgressSafely() {
            try {
                if (!validateStorageSize()) {
                    return;
                }
                saveProgress();
            } catch (error) {
                console.error('Ошибка при сохранении прогресса:', error);
                showErrorMessage('Ошибка при сохранении. Проверьте место на диске.');
            }
        }

        // ===== УТИЛИТЫ ОТЛАДКИ =====
        window.StreamFlowDebug = {
            // Экспортировать все данные для отладки
            exportData: function() {
                const data = {
                    progress: localStorage.getItem('streamflow_progress'),
                    lastSaved: localStorage.getItem('streamflow_last_saved'),
                    pomodoroState: pomodoroState,
                    userAgent: navigator.userAgent,
                    storageSize: new Blob([localStorage.getItem('streamflow_progress')]).size
                };
                console.log('=== StreamFlow Debug Data ===', data);
                return data;
            },

            // Получить статистику
            getStats: function() {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
                return {
                    totalTasks: checkboxes.length,
                    completedTasks: checked,
                    completionPercent: Math.round((checked / checkboxes.length) * 100),
                    pomodoroSessions: pomodoroState.sessionsCompleted,
                    storageFreePercent: 100 - Math.round((new Blob([localStorage.getItem('streamflow_progress')]).size / (5 * 1024 * 1024)) * 100)
                };
            },

            // Очистить все данные (осторожно!)
            resetAll: function() {
                if (confirm('⚠️ Это удалит ВСЕ данные! Вы уверены?')) {
                    localStorage.clear();
                    pomodoroState = { isRunning: false, isWork: true, timeLeft: 25 * 60, workTime: 25 * 60, breakTime: 5 * 60, sessionsCompleted: 0, history: [] };
                    location.reload();
                }
            },

            // Проверить здоровье приложения
            healthCheck: function() {
                console.log('📊 === StreamFlow Health Check ===');
                
                // Проверка LocalStorage
                try {
                    const test = '__health_test__';
                    localStorage.setItem(test, 'ok');
                    localStorage.removeItem(test);
                    console.log('✅ LocalStorage: OK');
                } catch (e) {
                    console.error('❌ LocalStorage: ПРОБЛЕМА', e.message);
                }

                // Проверка DOM элементов
                const requiredElements = ['home', 'resources', 'checklist'];
                requiredElements.forEach(el => {
                    const elem = document.getElementById(el);
                    console.log(`${elem ? '✅' : '❌'} Page "${el}": ${elem ? 'OK' : 'NOT FOUND'}`);
                });

                // Проверка функций
                const requiredFunctions = ['switchTab', 'startPomodoro', 'saveProgress', 'loadProgress', 'updateChecklist'];
                requiredFunctions.forEach(fn => {
                    const exists = typeof window[fn] === 'function';
                    console.log(`${exists ? '✅' : '❌'} Function "${fn}": ${exists ? 'OK' : 'NOT FOUND'}`);
                });

                console.log('=== End Health Check ===');
            },

            // Просмотр всех ответов студента
            getAnswers: function() {
                const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                console.log('=== Все ответы студента ===');
                Object.keys(answers).forEach(taskId => {
                    console.log(`\n📝 ${taskId}:`);
                    console.log(answers[taskId]);
                });
                return answers;
            },

            // Экспортировать ответы в JSON
            exportAnswers: function() {
                const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                const exportData = {
                    exportDate: new Date().toISOString(),
                    totalAnswers: Object.keys(answers).length,
                    answers: answers
                };
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataURI = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const link = document.createElement('a');
                link.setAttribute('href', dataURI);
                link.setAttribute('download', `streamflow-answers-${new Date().getTime()}.json`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('✅ Ответы экспортированы');
            },

            // Получить статистику ответов
            getAnswerStats: function() {
                const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                const results = {};
                
                document.querySelectorAll('[data-task-id]').forEach(container => {
                    const taskId = container.getAttribute('data-task-id');
                    const resultDiv = container.querySelector('.check-result');
                    results[taskId] = {
                        hasAnswer: !!answers[taskId],
                        answerLength: (answers[taskId] || '').length,
                        isChecked: resultDiv?.classList.contains('show'),
                        status: resultDiv?.classList.contains('correct') ? '✅ correct' : 
                                resultDiv?.classList.contains('partial') ? '⚠️ partial' :
                                resultDiv?.classList.contains('incorrect') ? '❌ incorrect' : '⏳ not checked'
                    };
                });
                
                console.log('=== Статистика ответов ===');
                console.log(results);
                return results;
            },

            // Очистить все ответы (но сохранить прогресс)
            clearAnswers: function() {
                if (confirm('Вы уверены? Все ответы будут удалены, но прогресс сохранится.')) {
                    localStorage.removeItem('userAnswers');
                    document.querySelectorAll('.answer-textarea').forEach(textarea => {
                        textarea.value = '';
                    });
                    document.querySelectorAll('.check-result').forEach(div => {
                        div.classList.remove('show');
                    });
                    console.log('✅ Ответы очищены');
                }
            }
        };

        // Заменяем обычный saveProgress на безопасную версию каждые 30 сек
        const autoSaveInterval = setInterval(saveProgressSafely, 30000);

        // ===== ОЧИСТКА ПРИ ВЫХОДЕ =====
        window.addEventListener('beforeunload', () => {
            clearInterval(autoSaveInterval);
            saveProgressSafely();
        });

        // Логирование при успешной загрузке
        console.log('🚀 StreamFlow Study Portal инициализирован');
        console.log('📝 Функции отладки (используйте StreamFlowDebug):');
        console.log('   - healthCheck() → проверка здоровья приложения');
        console.log('   - getStats() → статистика выполнения');
        console.log('   - getAnswers() → просмотр всех ответов');
        console.log('   - getAnswerStats() → статистика проверки ответов');
        console.log('   - exportAnswers() → скачать ответы в JSON');
        console.log('   - exportData() → экспорт всех данных');
        console.log('   - clearAnswers() → очистить ответы (сохраняя прогресс)');
        console.log('   - resetAll() → сбросить ВСЕ данные (с подтверждением)');
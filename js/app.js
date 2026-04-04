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

        const STAGE_TASKS = {
            stage1: [
                { id: 'stage1-sql-top3', label: 'Топ-3 по просмотрам в категории' },
                { id: 'stage1-sql-moving-avg', label: 'Скользящее среднее за 7 дней' },
                { id: 'stage1-sql-running-total', label: 'Running total по датам' },
                { id: 'stage1-sql-agg', label: 'JOIN + GROUP BY + HAVING' },
                { id: 'stage1-sql-window', label: 'Оконная функция ROW_NUMBER' },
                { id: 'stage1-explain-analyze', label: 'Чтение EXPLAIN ANALYZE' },
                { id: 'stage1-index-strategy', label: 'Стратегия индексов под workload' },
                { id: 'stage1-docker', label: 'Docker Compose и различие Image/Container' },
                { id: 'stage1-dwh', label: 'Модель STG / DDS / Fact / Dimension' },
                { id: 'stage1-scd2-merge', label: 'SCD2 и MERGE/UPSERT' }
            ],
            stage2: [
                { id: 'stage2-api', label: 'Python API коннектор' },
                { id: 'stage2-psycopg', label: 'Массовый INSERT через psycopg2' },
                { id: 'stage2-dockerfile', label: 'Dockerfile для ETL' },
                { id: 'stage2-async-retry', label: 'Asyncio + retry/backoff' },
                { id: 'stage2-airflow-dag', label: 'DAG с ретраями и SLA' },
                { id: 'stage2-data-validation', label: 'Валидация JSON/Pydantic' }
            ],
            stage3: [
                { id: 'stage3-pyspark-etl', label: 'PySpark ETL mini-проект' },
                { id: 'stage3-broadcast-join', label: 'Broadcast join оптимизация' },
                { id: 'stage3-skew-salting', label: 'Борьба с data skew через salting' },
                { id: 'stage3-plan-debug', label: 'Разбор физического Spark-плана' }
            ],
            stage4: [
                { id: 'stage4-kafka-streaming', label: 'Kafka producer + DQ check' },
                { id: 'stage4-consumer-commit', label: 'Consumer с manual commit' },
                { id: 'stage4-schema-registry', label: 'Schema Registry контракт' },
                { id: 'stage4-streaming-window', label: 'Streaming window + watermark' }
            ],
            stage5: [
                { id: 'stage5-data-modeling', label: 'Star Schema DDL mini-проект' },
                { id: 'stage5-lakehouse-design', label: 'Lakehouse System Design' },
                { id: 'stage5-clickhouse-tuning', label: 'ClickHouse модель и тюнинг' },
                { id: 'stage5-cdc-zeroetl', label: 'CDC и Zero-ETL архитектура' }
            ]
        };

        const STAGE_READY_THRESHOLD = {
            stage1: 70,
            stage2: 70,
            stage3: 70,
            stage4: 70,
            stage5: 70
        };

        const INTERVIEW_QUESTION_BANK = [
            { id: 'int-s1-1', stage: 'stage1', prompt: 'Как вы оптимизируете запрос с Seq Scan на таблице 300M строк: какие индексы и как проверите результат?' },
            { id: 'int-s1-2', stage: 'stage1', prompt: 'Объясните разницу между CTE, подзапросом и materialized view в контексте аналитики.' },
            { id: 'int-s1-3', stage: 'stage1', prompt: 'Как проектировать факт и измерения для витрины продаж, чтобы не потерять историю изменений атрибутов?' },
            { id: 'int-s1-4', stage: 'stage1', prompt: 'Где в DWH применим SCD2, а где достаточно SCD1? Дайте практический пример.' },

            { id: 'int-s2-1', stage: 'stage2', prompt: 'Как реализовать retry/backoff для внешнего API, чтобы не создать шторм запросов?' },
            { id: 'int-s2-2', stage: 'stage2', prompt: 'Когда в Python использовать asyncio, а когда multiprocessing в data pipeline?' },
            { id: 'int-s2-3', stage: 'stage2', prompt: 'Как бы вы построили idempotent ETL шаг загрузки в Postgres?' },
            { id: 'int-s2-4', stage: 'stage2', prompt: 'Какие базовые проверки данных добавите перед записью в DWH?' },

            { id: 'int-s3-1', stage: 'stage3', prompt: 'Почему broadcast join ускоряет Spark job и когда он опасен?' },
            { id: 'int-s3-2', stage: 'stage3', prompt: 'Как диагностировать data skew по Spark UI и как лечить salting/partitioning?' },
            { id: 'int-s3-3', stage: 'stage3', prompt: 'Что именно смотреть в explain(formatted) у Spark DataFrame запроса?' },
            { id: 'int-s3-4', stage: 'stage3', prompt: 'Чем отличается cache от persist и в каких шагах ETL это дает выигрыш?' },

            { id: 'int-s4-1', stage: 'stage4', prompt: 'Как обеспечить atleast-once и приблизиться к exactly-once при обработке Kafka?' },
            { id: 'int-s4-2', stage: 'stage4', prompt: 'Как организовать Schema Registry контракт, чтобы изменения схемы не ломали витрины?' },
            { id: 'int-s4-3', stage: 'stage4', prompt: 'Что такое watermark в streaming и как он влияет на late events?' },
            { id: 'int-s4-4', stage: 'stage4', prompt: 'Какие DQ проверки обязательны для потока транзакций в real-time?' },

            { id: 'int-s5-1', stage: 'stage5', prompt: 'Спроектируйте high-level pipeline: S3 -> Kafka -> Spark -> ClickHouse -> BI.' },
            { id: 'int-s5-2', stage: 'stage5', prompt: 'Как выстроить CDC pipeline и стратегию backfill без дублей в факте?' },
            { id: 'int-s5-3', stage: 'stage5', prompt: 'Какие ключевые настройки MergeTree в ClickHouse важны для быстрых отчетов?' },
            { id: 'int-s5-4', stage: 'stage5', prompt: 'Какие SLO/метрики вы поставите для продакшен data platform?' }
        ];

        const INTERVIEW_STAGE_ORDER = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];

        let interviewState = {
            questions: [],
            currentIndex: 0,
            answers: {},
            confident: {},
            startedAt: null,
            durationMinutes: 45,
            isRunning: false,
            timerInterval: null
        };

        function getStageDisplayName(stageTab) {
            const labels = {
                stage1: 'SQL & DWH',
                stage2: 'Python & ETL',
                stage3: 'Spark',
                stage4: 'Kafka & Streaming',
                stage5: 'System Design'
            };
            return labels[stageTab] || 'General';
        }

        function shuffleList(items) {
            const clone = [...items];
            for (let i = clone.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [clone[i], clone[j]] = [clone[j], clone[i]];
            }
            return clone;
        }

        function pickRandomQuestions(items, count) {
            return shuffleList(items).slice(0, Math.max(0, count));
        }

        function buildInterviewQuestionSet(totalQuestions = 15) {
            const grouped = INTERVIEW_STAGE_ORDER.reduce((acc, stage) => {
                acc[stage] = INTERVIEW_QUESTION_BANK.filter(q => q.stage === stage);
                return acc;
            }, {});

            const basePerStage = Math.floor(totalQuestions / INTERVIEW_STAGE_ORDER.length);
            const remainder = totalQuestions % INTERVIEW_STAGE_ORDER.length;

            let selected = [];
            INTERVIEW_STAGE_ORDER.forEach((stage, index) => {
                const planned = basePerStage + (index < remainder ? 1 : 0);
                selected = selected.concat(pickRandomQuestions(grouped[stage], planned));
            });

            if (selected.length < totalQuestions) {
                const selectedIds = new Set(selected.map(q => q.id));
                const fallbackPool = INTERVIEW_QUESTION_BANK.filter(q => !selectedIds.has(q.id));
                selected = selected.concat(pickRandomQuestions(fallbackPool, totalQuestions - selected.length));
            }

            return shuffleList(selected).slice(0, totalQuestions);
        }

        function saveInterviewState() {
            try {
                const snapshot = {
                    questions: interviewState.questions,
                    currentIndex: interviewState.currentIndex,
                    answers: interviewState.answers,
                    confident: interviewState.confident,
                    startedAt: interviewState.startedAt,
                    durationMinutes: interviewState.durationMinutes,
                    isRunning: interviewState.isRunning
                };
                localStorage.setItem('streamflow_interview_state', JSON.stringify(snapshot));
            } catch (error) {
                console.warn('Не удалось сохранить сессию собеседования:', error);
            }
        }

        function loadInterviewState() {
            try {
                const saved = JSON.parse(localStorage.getItem('streamflow_interview_state') || '{}');
                if (!saved || typeof saved !== 'object') return;

                interviewState.questions = Array.isArray(saved.questions) ? saved.questions : [];
                interviewState.currentIndex = Number.isInteger(saved.currentIndex) ? saved.currentIndex : 0;
                interviewState.answers = saved.answers && typeof saved.answers === 'object' ? saved.answers : {};
                interviewState.confident = saved.confident && typeof saved.confident === 'object' ? saved.confident : {};
                interviewState.startedAt = saved.startedAt || null;
                interviewState.durationMinutes = saved.durationMinutes || 45;
                interviewState.isRunning = Boolean(saved.isRunning);
                interviewState.timerInterval = null;
            } catch (error) {
                console.warn('Не удалось загрузить сессию собеседования:', error);
            }
        }

        function getInterviewStats() {
            const total = interviewState.questions.length;
            const answered = Object.values(interviewState.answers || {}).filter(v => (v || '').trim().length > 0).length;
            const confident = Object.values(interviewState.confident || {}).filter(Boolean).length;

            const answeredPercent = total > 0 ? Math.round((answered / total) * 100) : 0;
            const confidentPercent = total > 0 ? Math.round((confident / total) * 100) : 0;
            const readinessScore = Math.round(answeredPercent * 0.75 + confidentPercent * 0.25);

            return {
                total,
                answered,
                confident,
                answeredPercent,
                confidentPercent,
                readinessScore
            };
        }

        function formatInterviewTimer(ms) {
            const totalSec = Math.max(0, Math.floor(ms / 1000));
            const mins = Math.floor(totalSec / 60);
            const secs = totalSec % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function getInterviewRemainingMs() {
            const durationMs = (interviewState.durationMinutes || 45) * 60 * 1000;
            if (!interviewState.startedAt) {
                return durationMs;
            }
            return Math.max(0, durationMs - (Date.now() - interviewState.startedAt));
        }

        function updateInterviewTimerDisplay() {
            const timerEl = document.getElementById('interview-timer');
            if (!timerEl) return;
            timerEl.textContent = formatInterviewTimer(getInterviewRemainingMs());
        }

        function stopInterviewTimer() {
            if (interviewState.timerInterval) {
                clearInterval(interviewState.timerInterval);
                interviewState.timerInterval = null;
            }
        }

        function startInterviewTimer() {
            if (interviewState.timerInterval) return;

            interviewState.timerInterval = setInterval(() => {
                const remaining = getInterviewRemainingMs();
                updateInterviewTimerDisplay();

                if (remaining <= 0) {
                    stopInterviewTimer();
                    interviewState.isRunning = false;
                    saveInterviewState();
                    finishInterviewSession();
                }
            }, 1000);
        }

        function createInterviewSession(totalQuestions = 15) {
            interviewState.questions = buildInterviewQuestionSet(totalQuestions);
            interviewState.currentIndex = 0;
            interviewState.answers = {};
            interviewState.confident = {};
            interviewState.startedAt = null;
            interviewState.isRunning = false;
            stopInterviewTimer();
            saveInterviewState();
            renderInterviewState();
        }

        function renderInterviewSummary() {
            const scoreEl = document.getElementById('interview-score');
            const summaryEl = document.getElementById('interview-summary');
            if (!scoreEl || !summaryEl) return;

            const stats = getInterviewStats();
            scoreEl.textContent = `Отвечено: ${stats.answered}/${stats.total}, уверенно: ${stats.confident}/${stats.total}, готовность: ${stats.readinessScore}%.`;

            if (stats.total === 0) {
                summaryEl.textContent = 'Сначала сгенерируйте сессию вопросов.';
            } else if (stats.readinessScore >= 70) {
                summaryEl.textContent = 'Хороший результат для тренировочного уровня. Сфокусируйтесь на слабых вопросах и повторите сессию.';
            } else {
                summaryEl.textContent = 'Пока ниже целевого порога 70%. Пройдите еще одну сессию и разберите эталонные решения из лайв-кодинга.';
            }
        }

        function updateInterviewProgressUI() {
            const stats = getInterviewStats();
            const progressLabel = document.getElementById('interview-progress-label');
            const confidenceLabel = document.getElementById('interview-confidence-label');
            const readyLabel = document.getElementById('interview-ready-label');
            const progressBar = document.getElementById('interview-progress-bar');

            if (progressLabel) progressLabel.textContent = `Прогресс: ${stats.answered}/${stats.total}`;
            if (confidenceLabel) confidenceLabel.textContent = `Уверенных ответов: ${stats.confident}`;
            if (readyLabel) readyLabel.textContent = `Готовность: ${stats.readinessScore}%`;
            if (progressBar) progressBar.style.width = `${stats.answeredPercent}%`;

            renderInterviewSummary();
        }

        function renderInterviewQuestion() {
            const total = interviewState.questions.length;
            const index = interviewState.currentIndex;
            const currentQuestion = interviewState.questions[index];

            const counterEl = document.getElementById('interview-counter');
            const stageEl = document.getElementById('interview-stage-pill');
            const questionEl = document.getElementById('interview-question-text');
            const answerEl = document.getElementById('interview-answer');
            const prevBtn = document.getElementById('interview-prev-btn');
            const nextBtn = document.getElementById('interview-next-btn');
            const confidenceBtn = document.getElementById('interview-confidence-btn');

            if (!counterEl || !stageEl || !questionEl || !answerEl || !prevBtn || !nextBtn || !confidenceBtn) return;

            if (!currentQuestion) {
                counterEl.textContent = 'Вопрос 0/0';
                stageEl.textContent = 'Этап';
                questionEl.textContent = 'Нажмите «Сгенерировать сессию», чтобы начать.';
                answerEl.value = '';
                answerEl.disabled = true;
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                confidenceBtn.disabled = true;
                return;
            }

            counterEl.textContent = `Вопрос ${index + 1}/${total}`;
            stageEl.textContent = getStageDisplayName(currentQuestion.stage);
            questionEl.textContent = currentQuestion.prompt;
            answerEl.disabled = false;
            answerEl.value = interviewState.answers[currentQuestion.id] || '';

            prevBtn.disabled = index === 0;
            nextBtn.disabled = index >= total - 1;
            confidenceBtn.disabled = false;
            confidenceBtn.textContent = interviewState.confident[currentQuestion.id]
                ? 'Снять метку уверенности'
                : 'Отметить как уверенный ответ';
        }

        function renderInterviewState() {
            if (!document.getElementById('interview-question-text')) return;
            renderInterviewQuestion();
            updateInterviewProgressUI();
            updateInterviewTimerDisplay();
        }

        function goToNextInterviewQuestion() {
            if (interviewState.currentIndex < interviewState.questions.length - 1) {
                interviewState.currentIndex += 1;
                saveInterviewState();
                renderInterviewState();
            }
        }

        function goToPrevInterviewQuestion() {
            if (interviewState.currentIndex > 0) {
                interviewState.currentIndex -= 1;
                saveInterviewState();
                renderInterviewState();
            }
        }

        function toggleInterviewConfidence() {
            const currentQuestion = interviewState.questions[interviewState.currentIndex];
            if (!currentQuestion) return;

            interviewState.confident[currentQuestion.id] = !interviewState.confident[currentQuestion.id];
            saveInterviewState();
            renderInterviewState();
        }

        function finishInterviewSession() {
            interviewState.isRunning = false;
            stopInterviewTimer();
            saveInterviewState();
            renderInterviewState();
            showSuccessMessage('Сессия собеседования завершена. Проверьте блок «Итоги сессии».');
        }

        function resetInterviewSession() {
            if (!window.confirm('Сбросить текущую сессию собеседования?')) return;

            stopInterviewTimer();
            interviewState = {
                questions: [],
                currentIndex: 0,
                answers: {},
                confident: {},
                startedAt: null,
                durationMinutes: 45,
                isRunning: false,
                timerInterval: null
            };

            localStorage.removeItem('streamflow_interview_state');
            renderInterviewState();
        }

        function bindInterviewButton(id, handler) {
            const el = document.getElementById(id);
            if (!el || el.dataset.bound === 'true') return;
            el.addEventListener('click', handler);
            el.dataset.bound = 'true';
        }

        function ensureInterviewBindings() {
            bindInterviewButton('interview-generate-btn', () => createInterviewSession(15));
            bindInterviewButton('interview-start-btn', () => {
                if (interviewState.questions.length === 0) {
                    createInterviewSession(15);
                }
                if (!interviewState.startedAt) {
                    interviewState.startedAt = Date.now();
                }
                interviewState.isRunning = true;
                saveInterviewState();
                startInterviewTimer();
                renderInterviewState();
            });
            bindInterviewButton('interview-reset-btn', resetInterviewSession);
            bindInterviewButton('interview-prev-btn', goToPrevInterviewQuestion);
            bindInterviewButton('interview-next-btn', goToNextInterviewQuestion);
            bindInterviewButton('interview-confidence-btn', toggleInterviewConfidence);
            bindInterviewButton('interview-finish-btn', finishInterviewSession);

            const answerEl = document.getElementById('interview-answer');
            if (answerEl && answerEl.dataset.bound !== 'true') {
                answerEl.addEventListener('input', () => {
                    const currentQuestion = interviewState.questions[interviewState.currentIndex];
                    if (!currentQuestion) return;
                    interviewState.answers[currentQuestion.id] = answerEl.value;
                    saveInterviewState();
                    updateInterviewProgressUI();
                });
                answerEl.dataset.bound = 'true';
            }
        }

        function initInterviewSection() {
            loadInterviewState();
            ensureInterviewBindings();

            if (interviewState.isRunning && getInterviewRemainingMs() > 0) {
                startInterviewTimer();
            } else {
                interviewState.isRunning = false;
                stopInterviewTimer();
            }

            renderInterviewState();
        }

        function isStageTab(tabId) {
            return Object.prototype.hasOwnProperty.call(STAGE_TASKS, tabId);
        }

        function getStageNumber(tabId) {
            return Number((tabId || '').replace('stage', '')) || 0;
        }

        function getAdjacentStageTab(tabId, offset) {
            const stageNumber = getStageNumber(tabId);
            if (!stageNumber) return null;
            const adjacent = stageNumber + offset;
            if (adjacent < 1 || adjacent > 5) return null;
            return `stage${adjacent}`;
        }

        function getSavedAnswersMap() {
            try {
                const raw = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                return raw && typeof raw === 'object' ? raw : {};
            } catch (error) {
                console.warn('Не удалось прочитать сохраненные ответы:', error);
                return {};
            }
        }

        function getStageProgress(stageTab) {
            const tasks = STAGE_TASKS[stageTab] || [];
            const answers = getSavedAnswersMap();
            const answeredIds = new Set(
                tasks
                    .filter(task => {
                        const value = answers[task.id];
                        return typeof value === 'string' && value.trim().length > 0;
                    })
                    .map(task => task.id)
            );

            const total = tasks.length;
            const answered = answeredIds.size;
            const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
            const requiredPercent = STAGE_READY_THRESHOLD[stageTab] || 100;

            return {
                total,
                answered,
                percent,
                requiredPercent,
                ready: total > 0 && percent >= requiredPercent,
                missingTasks: tasks.filter(task => !answeredIds.has(task.id))
            };
        }

        function updateStageReadinessIndicators() {
            Object.keys(STAGE_TASKS).forEach(stageTab => {
                const navItem = document.querySelector(`.nav-item[data-tab="${stageTab}"]`);
                if (!navItem) return;

                const titleSpan = navItem.querySelector('span:last-child');
                if (!titleSpan) return;

                const progress = getStageProgress(stageTab);
                let badge = navItem.querySelector('.stage-mini-badge');

                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'stage-mini-badge';
                    navItem.appendChild(badge);
                }

                badge.textContent = `${progress.answered}/${progress.total}`;
                badge.classList.toggle('is-ready', progress.ready);
                badge.classList.toggle('is-not-ready', !progress.ready);
                badge.title = progress.ready
                    ? `Этап закрыт: ${progress.answered}/${progress.total}`
                    : `Этап в работе: ${progress.answered}/${progress.total}`;

                titleSpan.classList.toggle('stage-label-ready', progress.ready);
                titleSpan.classList.toggle('stage-label-not-ready', !progress.ready);
            });
        }

        function renderStageReadinessCard(tabId, container) {
            if (!isStageTab(tabId) || !container) return;

            const pageContent = container.querySelector('.page-content');
            const pageHeader = pageContent?.querySelector('.page-header');
            if (!pageContent || !pageHeader) return;

            const stageProgress = getStageProgress(tabId);
            const previousStage = getAdjacentStageTab(tabId, -1);
            const previousProgress = previousStage ? getStageProgress(previousStage) : null;
            const nextStage = getAdjacentStageTab(tabId, 1);
            const statusClass = stageProgress.ready ? 'is-ready' : 'is-not-ready';

            const missingLabels = stageProgress.missingTasks.map(task => task.label);
            const missingText = missingLabels.length > 0
                ? (missingLabels.length > 4
                    ? `${missingLabels.slice(0, 4).join(', ')} и еще ${missingLabels.length - 4}`
                    : missingLabels.join(', '))
                : 'Все практические задачи этапа закрыты.';

            const recommendationText = stageProgress.ready
                ? (nextStage
                    ? `Критерии перехода выполнены. Можно уверенно идти к этапу ${getStageNumber(nextStage)}.`
                    : 'Финальный этап закрыт. Можно переходить к проектам и собеседованиям.')
                : `Пока рано переходить: сейчас ${stageProgress.percent}% при пороге ${stageProgress.requiredPercent}%.`;

            const previousWarning = previousProgress && !previousProgress.ready
                ? `Перед этим этапом стоит закрыть этап ${getStageNumber(previousStage)}: сейчас ${previousProgress.answered}/${previousProgress.total}.`
                : '';

            const existingCard = pageContent.querySelector('.stage-readiness-card');
            if (existingCard) {
                existingCard.remove();
            }

            const card = document.createElement('section');
            card.className = `card stage-readiness-card ${statusClass}`;
            card.innerHTML = `
                <div class="stage-readiness-head">
                    <h3 class="card-title">Проверка готовности к следующей главе</h3>
                    <span class="stage-readiness-badge ${statusClass}">${stageProgress.ready ? 'Можно идти дальше' : 'Пока рано переходить'}</span>
                </div>
                <p class="stage-readiness-text">
                    Практика этапа: <strong>${stageProgress.answered}/${stageProgress.total}</strong>.
                    Порог перехода: <strong>${stageProgress.requiredPercent}%</strong>.
                </p>
                <div class="progress-bar stage-readiness-progress">
                    <div class="progress-fill" style="width: ${Math.min(stageProgress.percent, 100)}%;"></div>
                </div>
                <p class="stage-readiness-text">${recommendationText}</p>
                ${stageProgress.ready ? '' : `<p class="stage-readiness-text">Что осталось закрыть: ${missingText}</p>`}
                ${previousWarning ? `<p class="stage-readiness-warning">${previousWarning}</p>` : ''}
                <div class="stage-readiness-actions">
                    <button class="btn btn-secondary" onclick="switchTab('coding')">Открыть практику</button>
                    ${nextStage
                        ? `<button class="btn" ${stageProgress.ready ? '' : 'disabled'} onclick="switchTab('${nextStage}')">Перейти к этапу ${getStageNumber(nextStage)}</button>`
                        : '<button class="btn" onclick="switchTab(\'projects\')">Перейти к проектам</button>'}
                </div>
            `;

            pageHeader.insertAdjacentElement('afterend', card);
        }

        function confirmStageTransition(tabId, options = {}) {
            if (options.skipStageCheck || !isStageTab(tabId)) {
                return true;
            }

            const previousStage = getAdjacentStageTab(tabId, -1);
            if (!previousStage) {
                return true;
            }

            const previousProgress = getStageProgress(previousStage);
            if (previousProgress.ready) {
                return true;
            }

            return window.confirm(
                `Этап ${getStageNumber(previousStage)} пока не закрыт (${previousProgress.answered}/${previousProgress.total}). Все равно открыть этап ${getStageNumber(tabId)}?`
            );
        }

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

                    // Запоминаем последнюю вкладку, фактическая загрузка будет в DOMContentLoaded
                    if (progress.currentTab && document.querySelector(`.nav-item[data-tab="${progress.currentTab}"]`)) {
                        localStorage.setItem('streamflow_current_tab', progress.currentTab);
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
        async function switchTab(tabId, options = {}) {
            const container = document.getElementById('page-container');
            if (!container) return;

            if (!confirmStageTransition(tabId, options)) {
                return;
            }
            
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

                localStorage.setItem('streamflow_current_tab', tabId);
                updateStageReadinessIndicators();
                renderStageReadinessCard(tabId, container);
                
                if (typeof setupAnswerField !== 'undefined') {
                    document.querySelectorAll('[data-task-id]').forEach(setupAnswerField);
                }
                if (typeof loadSavedAnswers !== 'undefined') loadSavedAnswers();
                if (tabId === 'interview') initInterviewSection();
                if (typeof updateAnswerProgress !== 'undefined') updateAnswerProgress();
                saveProgress();
                
            } catch (error) {
                console.error('Error loading page:', error);
                container.innerHTML = `<h2>Ошибка загрузки страницы.</h2><p>Убедитесь, что страница загружена на хостинг с сохранением папок <code>pages/</code>, <code>css/</code>, <code>js/</code>.</p><p><small>${error.message}</small></p>`;
            }
        }

        // ===== АККОРДЕОН =====
        function toggleAccordion(header) {
            const item = header.parentElement;
            if (!item) return;
            const content = item.querySelector('.accordion-content') || header.nextElementSibling;
            const toggle = header.querySelector('.accordion-toggle');
            if (!content) return;
            
            const isVisible = content.style.display === 'block' || content.classList.contains('active');

            if (!isVisible) {
                content.style.display = 'block';
                content.classList.add('active');
                if (header) header.classList.add('active');
                if (toggle) {
                    toggle.classList.add('active');
                    toggle.style.transform = 'rotate(180deg)';
                    if (toggle.innerText.includes('ответ')) {
                        toggle.innerText = 'Скрыть ответ ▲';
                    }
                }
            } else {
                content.style.display = 'none';
                content.classList.remove('active');
                if (header) header.classList.remove('active');
                if (toggle) {
                    toggle.classList.remove('active');
                    toggle.style.transform = 'rotate(0deg)';
                    if (toggle.innerText.includes('ответ')) {
                        toggle.innerText = 'Показать ответ ▼';
                    }
                }
            }
        }

        function toggleAll(show) {
            document.querySelectorAll('.accordion-content').forEach(c => {
                c.style.display = show ? 'block' : 'none';
                if (show) c.classList.add('active');
                else c.classList.remove('active');
            });
            document.querySelectorAll('.accordion-header').forEach(h => {
                if (show) h.classList.add('active');
                else h.classList.remove('active');
            });
            document.querySelectorAll('.accordion-toggle').forEach(t => {
                if (show) t.classList.add('active');
                else t.classList.remove('active');
                t.style.transform = show ? 'rotate(180deg)' : 'rotate(0deg)';
                if (t.innerText.includes('ответ')) {
                    t.innerText = show ? 'Скрыть ответ ▲' : 'Показать ответ ▼';
                }
            });
        }

        function randomQuestion() {
            const items = document.querySelectorAll('.accordion-item');
            if (items.length === 0) return;
            
            toggleAll(false);
            
            const randomIndex = Math.floor(Math.random() * items.length);
            const selected = items[randomIndex];
            const header = selected.querySelector('.accordion-header');
            
            if (header) {
                header.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => { toggleAccordion(header); }, 300);
            }
        }

        // ===== ПОДСКАЗКИ И РЕШЕНИЯ =====
        function showHint(btn, level) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const hints = container.querySelectorAll('.hint-level');
            if (hints && hints.length >= level) {
                hints[level - 1].classList.add('active');
                hints[level - 1].style.display = 'block';
            }
        }

        function showSQLSolution(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const solution = container.querySelector('.solution-code');
            if (solution) {
                const isHidden = window.getComputedStyle(solution).display === 'none';
                solution.style.display = isHidden ? 'block' : 'none';
                if (isHidden) {
                    solution.classList.add('active');
                } else {
                    solution.classList.remove('active');
                }
            }
        }

        // ===== ПРОВЕРКА ОТВЕТОВ =====
        function checkAnswer(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const textarea = container.querySelector('.answer-textarea');
            const resultDiv = container.querySelector('.check-result');
            const expectedAnswer = getExpectedAnswer(container);
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

        function getExpectedAnswer(container) {
            const explicitSolution = container.querySelector('.solution-code')?.textContent?.trim();
            if (explicitSolution) {
                return explicitSolution.toLowerCase();
            }

            const detailsCode = container.querySelector('details code')?.textContent?.trim();
            if (detailsCode) {
                return detailsCode.toLowerCase();
            }

            const detailsText = container.querySelector('details p')?.textContent?.trim();
            if (detailsText) {
                return detailsText.toLowerCase();
            }

            return '';
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
            const activeTab = document.querySelector('.nav-item.active');
            if (!activeTab) return;
            const tabId = activeTab.getAttribute('data-tab');

            updateStageReadinessIndicators();

            if (isStageTab(tabId)) {
                const container = document.getElementById('page-container');
                renderStageReadinessCard(tabId, container);
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
                updateStageReadinessIndicators();
                
                // Подготовка всех полей ввода ответов
                document.querySelectorAll('[data-task-id]').forEach(container => {
                    setupAnswerField(container);
                });
                
                const currTab = localStorage.getItem('streamflow_current_tab') || 'home';
                switchTab(currTab, { skipStageCheck: true });
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
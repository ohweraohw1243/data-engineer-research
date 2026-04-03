import os
import json

questions = [
    # --- SQL & Databases ---
    {"category": "SQL и Базы Данных", "q": "В чем разница между WHERE и HAVING?", "a": "WHERE фильтрует данные до агрегации (GROUP BY), а HAVING — после."},
    {"category": "SQL и Базы Данных", "q": "Что такое нормализация и денормализация?", "a": "Нормализация — процесс устранения избыточности и аномалий обновления путем разделения таблиц (до 3NF). Денормализация — намеренное дублирование данных для ускорения SELECT-запросов (добавление избыточных колонок)."},
    {"category": "SQL и Базы Данных", "q": "Объясните разницу между INNER, LEFT, RIGHT и FULL JOIN.", "a": "INNER оставляет только совпадения в обеих таблицах. LEFT возвращает все строки левой и совпадения из правой. RIGHT — все из правой. FULL — объединяет все строки из обеих таблиц, подставляя NULL при отсутствии совпадений."},
    {"category": "SQL и Базы Данных", "q": "Как работают оконные функции (Window Functions)?", "a": "Оконные функции вычисляют агрегаты или ранги для набора строк, не группируя их в одну строку. Они используют конструкцию OVER (PARTITION BY ... ORDER BY ...)."},
    {"category": "SQL и Базы Данных", "q": "В чем отличие RANK() от DENSE_RANK()?", "a": "При одинаковых значениях оба дадут одинаковый ранг, но RANK() пропустит следующие номера (1, 1, 3), а DENSE_RANK() пойдет по порядку (1, 1, 2)."},
    {"category": "SQL и Базы Данных", "q": "Как работает индекс B-Tree?", "a": "B-Tree (сбалансированное дерево) — структура данных, которая сохраняет отсортированные ключи в узлах, позволяя искать, вставлять и удалять записи за O(log N)."},
    {"category": "SQL и Базы Данных", "q": "Что такое транзакция и свойства ACID?", "a": "Транзакция — логическая единица работы с БД. ACID: Atomicity, Consistency, Isolation, Durability."},
    {"category": "SQL и Базы Данных", "q": "Что такое CTE?", "a": "CTE (Common Table Expression) — временный именованный набор данных в рамках одного запроса (WITH CTE AS ...)."},
    {"category": "SQL и Базы Данных", "q": "Что такое Materialized View?", "a": "Физически сохраненный на диске результат запроса, в отличие от обычного View (виртуального). Требует обновления (refresh)."},
    {"category": "SQL и Базы Данных", "q": "Разница между Clustered и Non-Clustered индексом?", "a": "Кластерный индекс определяет физический порядок хранения данных (может быть только один). Некластерный создает отдельную структуру указателей (их может быть много)."},
    {"category": "SQL и Базы Данных", "q": "Как работает UNION и UNION ALL?", "a": "Оба объединяют результаты двух SELECT. UNION ALL просто склеивает, а UNION удаляет дубликаты (работает медленнее)."},

    # --- Python & Pyspark ---
    {"category": "Python и PySpark", "q": "В чем разница между списками (list) и кортежами (tuple)?", "a": "Списки изменяемые, кортежи неизменяемые. Кортежи быстрее и могут быть ключами словаря."},
    {"category": "Python и PySpark", "q": "Что такое декоратор в Python?", "a": "Функция-обертка, изменяющая поведение другой функции без изменения ее кода."},
    {"category": "Python и PySpark", "q": "Как работает yield?", "a": "Делает функцию генератором, возвращая значение и «замораживая» состояние до следующего вызова."},
    {"category": "Python и PySpark", "q": "Что такое GIL?", "a": "Мьютекс, блокирующий потоки в CPython. Из-за GIL многопоточность не ускоряет CPU-bound задачи."},
    {"category": "Python и PySpark", "q": "Разница между DataFrame и RDD в PySpark?", "a": "RDD — базовая неизменяемая коллекция объектов. DataFrame — табличная структура, поддерживающая оптимизатор Catalyst."},
    {"category": "Python и PySpark", "q": "Transformation vs Action в PySpark?", "a": "Трансформации «ленивы» и только строят план (DAG). Экшены запускают физическое вычисление (show, write, count)."},
    {"category": "Python и PySpark", "q": "Что такое Partitioning?", "a": "Разделение данных на части для параллельной обработки. Идеально по 128 MB."},
    {"category": "Python и PySpark", "q": "Что такое Shuffle?", "a": "Процесс перетасовки данных по сети между узлами. Возникает при join или groupBy."},
    {"category": "Python и PySpark", "q": "coalesce vs repartition?", "a": "coalesce уменьшает партиции без полного шаффла, repartition делает полный шаффл и балансирует данные."},
    {"category": "Python и PySpark", "q": "Broadcast Join?", "a": "Маленькая таблица целиком рассылается на все воркеры, чтобы избежать шаффла большой таблицы."},
    {"category": "Python и PySpark", "q": "Как избежать OutOfMemory при группировке?", "a": "Использовать ключи с высокой кардинальностью, включать skew-join (соль/salting keys) и избегать collect() огромных массивов."},
    {"category": "Python и PySpark", "q": "Что такое UDF?", "a": "User Defined Function. Позволяет применять Python-функции к колонкам DataFrame (медленно, так как вызывает сериализацию)."},
    {"category": "Python и PySpark", "q": "Что делает cache() и persist()?", "a": "Сохраняют промежуточный DataFrame в памяти для переиспользования. persist() позволяет выбрать уровень хранения (MEMORY_ONLY, DISK_ONLY)."},

    # --- Big Data Architecture ---
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "В чем разница между DWH и Data Lake?", "a": "DWH хранит строго структурированные (Schema-on-Write) данные для BI. Data Lake хранит полуструктурированные и сырые данные (Schema-on-Read)."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "Что такое Data Lakehouse?", "a": "Слияние DWH и Data Lake. Позволяет работать поверх S3-бакетов с поддержкой транзакций благодаря открытым форматам (Iceberg, Delta Lake)."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "Особенности формата Parquet?", "a": "Колоночный, бинарный формат с поддержкой сжатия. Идеален для аналитики с агрегациями (пропускает ненужные колонки)."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "Lambda vs Kappa архитектура?", "a": "Lambda разделяет потоки на Batch (медленный) и Speed (быстрый). Kappa обрабатывает всё единым потоком (Unified Stream)."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "Слои DWH: STG, ODS, DDS, CDM?", "a": "STG - сырые копии таблиц. ODS - очищенные. DDS - хранилище в Data Vault или Звезде. CDM - витрины для BI (Data Marts)."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "Что такое OLTP и OLAP?", "a": "OLTP - быстрые вставки/обновления для 1 записи. OLAP - тяжелые запросы по миллионам строк для аналитики."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "ETL vs ELT?", "a": "В ETL трансформация идет на выделенном сервере Spark. В ELT сырые данные сперва грузятся в DWH (ClickHouse), а затем трансформируются SQL-запросами самой БД."},
    {"category": "Архитектура Хранилищ (DWH & Data Lake)", "q": "Чем колоночная БД лучше строковой?", "a": "Она хранит колонки изолированно. Запрос SELECT SUM(cost) читает только одну колонку, экономя IO-операции на диске."},

    # --- Streaming & Orchestration ---
    {"category": "Streaming и Оркестрация", "q": "Как устроена Kafka (Topic, Partition)?", "a": "Topic делится на Partitions. Запись идет в Partition линейно (Append-only). Порядок сообщений гарантирован только внутри одной партиции."},
    {"category": "Streaming и Оркестрация", "q": "Зачем в Kafka нужен ZooKeeper / KRaft?", "a": "Для координации работы брокеров, выборов лидера партиции и хранения метаданных."},
    {"category": "Streaming и Оркестрация", "q": "Как работает Consumer Group?", "a": "Каждая партиция читается только одним Consumer-ом из группы. Обеспечивает параллельное масштабирование."},
    {"category": "Streaming и Оркестрация", "q": "Семантики доставки (At-least-once...)?", "a": "At-most-once (с потерями), At-least-once (с дублями), Exactly-once (строго 1 раз)."},
    {"category": "Streaming и Оркестрация", "q": "Apache Airflow: Основные компоненты?", "a": "Scheduler (планирует таски), Webserver (UI), Executor (выполняет задачи Celery) и MetaDb (хранит состояния)."},
    {"category": "Streaming и Оркестрация", "q": "Что такое DAG в Airflow?", "a": "Directed Acyclic Graph. Граф задач, описывающий пайплайн с направленными зависимостями без циклов."},
    {"category": "Streaming и Оркестрация", "q": "Разница между Task, Operator и Sensor?", "a": "Operator - код одной задачи. Task - инстанс оператора в графе. Sensor - оператор, ожидающий внешнее условие/событие."},
    {"category": "Streaming и Оркестрация", "q": "Что такое Идемпотентность (Idempotency)?", "a": "Гарантия того, что повторный запуск задачи поверх тех же или частично старых данных даст корректный, не задублированный результат."},
    {"category": "Streaming и Оркестрация", "q": "Что такое Backfilling?", "a": "Процесс перезапуска DAG-ов для исторических дат (пересчет данных из-за сбоя или новой логики)."},

    # --- Data Modeling & Quality ---
    {"category": "Моделирование и Качество данных", "q": "Звезда (Star Schema) vs Снежинка?", "a": "Звезда = таблица фактов в центре + денормализованные измерения. Снежинка = Звезда с нормализованными измерениями."},
    {"category": "Моделирование и Качество данных", "q": "Таблица Фактов vs Измерений?", "a": "Факты — метрики и численные события. Измерения — контекст (клиент, время, город)."},
    {"category": "Моделирование и Качество данных", "q": "Что такое Data Vault?", "a": "Архитектура из Hub, Link и Satellite. Сильно нормализована, идеальна для добавления систем и хранения истории изменений."},
    {"category": "Моделирование и Качество данных", "q": "SCD Type 1 и Type 2?", "a": "Type 1 — перезапись старого значения. Type 2 — добавление строки с флагом is_current, valid_from, valid_to (сохраняет историю)."},
    {"category": "Моделирование и Качество данных", "q": "Что такое Data Governance?", "a": "Свод политик для управления данными: безопасность, доступность и структура."},
    {"category": "Моделирование и Качество данных", "q": "Каталог Данных (Data Catalog) и Lineage?", "a": "Catalog — словарь (таблицы, владельцы). Lineage — граф потока данных (откуда и куда текут данные)."},
    {"category": "Моделирование и Качество данных", "q": "Data Contracts?", "a": "Соглашение о схеме между сервисом-отправителем и DWH, чтобы бэкенд не ломал пайплайны DE-команды."}
]

html_head = """<div class="page-content">
    <div class="page-header">
        <h1 class="page-title">Вопросы для <span>собеседований</span></h1>
        <p class="page-desc">50+ вопросов от уровня Junior до Senior с развернутыми ответами по всем ключевым модулям Data Engineering.</p>
    </div>

    <div style="margin-bottom: 20px;">
        <button class="btn" style="background:var(--accent1);color:#0a0a0a;font-weight:600;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;" onclick="randomQuestion()">🎲 Случайный вопрос</button>
    </div>
"""

cat_html = ""
categories_dict = {}
for q in questions:
    c = q["category"]
    if c not in categories_dict:
        categories_dict[c] = []
    categories_dict[c].append(q)

for cat, qs in categories_dict.items():
    cat_html += f'''
    <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; margin-top: 32px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">{cat}</h2>
    <div class="space-y-4">
'''
    for item in qs:
        cat_html += f'''        <div class="accordion-item" style="background: var(--bg-card); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
            <div class="accordion-header" style="padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleAccordion(this)">
                <span style="font-weight: 600; font-size: 15px;">{item['q']}</span>
                <span class="accordion-toggle" style="transition: transform 0.3s; color: var(--text-muted);">▼</span>
            </div>
            <div class="accordion-content" style="display: none; padding: 0 16px 16px 16px; color: var(--text-muted); line-height: 1.6; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 8px; padding-top: 12px;">
                <strong style="color: var(--accent1);">Ответ:</strong><br>{item['a']}
            </div>
        </div>
'''
    cat_html += '    </div>\n'

html_tail = """</div>
<script>
function toggleAccordion(header) {
    const item = header.parentElement;
    const content = item.querySelector('.accordion-content');
    const toggle = item.querySelector('.accordion-toggle');
    const isVisible = content.style.display === 'block';

    document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.accordion-toggle').forEach(t => t.style.transform = 'rotate(0deg)');

    if (!isVisible) {
        content.style.display = 'block';
        toggle.style.transform = 'rotate(180deg)';
    }
}

function randomQuestion() {
    const items = document.querySelectorAll('.accordion-item');
    if (items.length === 0) return;
    
    document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.accordion-toggle').forEach(t => t.style.transform = 'rotate(0deg)');
    
    const randomIndex = Math.floor(Math.random() * items.length);
    const selected = items[randomIndex];
    const header = selected.querySelector('.accordion-header');
    
    header.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { toggleAccordion(header); }, 300);
}
</script>
"""

with open("pages/questions.html", "w", encoding="utf-8") as f:
    f.write(html_head + cat_html + html_tail)

print("Questions generated successfully!")

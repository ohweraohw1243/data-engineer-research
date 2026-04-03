import json

html_template = """<div class="page-content">
    <div class="page-header">
        <h1 class="page-title">Книги, Инструменты и <span>Ресурсы</span></h1>
        <p class="page-desc">Расширенная подборка из 60+ узконаправленных и широких ресурсов по всему стеку Data Engineering.</p>
    </div>

    <div style="margin-bottom: 24px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn" onclick="filterResources('all')">📌 Все</button>
        <button class="btn btn-secondary" onclick="filterResources('sql')">🗄️ SQL & БД</button>
        <button class="btn btn-secondary" onclick="filterResources('python')">🐍 Python</button>
        <button class="btn btn-secondary" onclick="filterResources('bigdata')">⚡ Big Data (Spark/Kafka)</button>
        <button class="btn btn-secondary" onclick="filterResources('architecture')">🏛️ DWH & Архитектура</button>
    </div>

    <div id="resources-container">
{resources_html}
    </div>
</div>

<script>
function filterResources(tag) {{
    const items = document.querySelectorAll('.resource-item');
    const buttons = document.querySelectorAll('.btn');
    
    // Update active button
    buttons.forEach(btn => {{
        if (tag === 'all' && btn.innerText.includes('Все')) {{
            btn.classList.remove('btn-secondary');
        }}} else if (btn.getAttribute('onclick')?.includes(tag)) {{
            btn.classList.remove('btn-secondary');
        }}} else {{
            btn.classList.add('btn-secondary');
        }}
    }}});

    items.forEach(item => {{
        if (tag === 'all' || item.dataset.tags.includes(tag)) {{
            item.style.display = 'flex';
        }}} else {{
            item.style.display = 'none';
        }}
    }}});
}
}
</script>
"""

Item = """
        <div class="resource-item" data-tags="{tag}" style="margin-bottom: 16px; background: rgba(255,255,255,0.03); padding: 16px; border-radius: 12px; display: flex; gap: 16px; border: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;">
            <div class="resource-icon" style="font-size: 32px; flex-shrink: 0;">{icon}</div>
            <div class="resource-content" style="flex-grow: 1;">
                <div class="resource-title" style="font-size: 17px; font-weight: 600; color: #fff; margin-bottom: 6px;">{title}</div>
                <div class="resource-desc" style="color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 12px;">{desc}</div>
                <div class="resource-tags" style="display: flex; gap: 8px;">
                    <span class="tag" style="background: rgba(var(--accent1-rgb), 0.1); color: var(--accent1); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">#{tag}</span>
                    <span class="tag" style="background: rgba(255,255,255, 0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">{format_type}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <a href="#" target="_blank" class="resource-link" style="color: var(--accent1); text-decoration: none; font-weight: 600; font-size: 14px; background: rgba(var(--accent1-rgb), 0.1); padding: 8px 16px; border-radius: 8px; transition: background 0.3s; white-space: nowrap;">Смотреть →</a>
            </div>
        </div>"""

resources = [
    # SQL (15 items)
    {"tag": "sql", "icon": "📚", "format_type": "Book", "title": "High Performance MySQL", "desc": "Глубокое погружение во внутренности баз данных, индексы (B-Tree/Hash) и оптимизацию запросов."},
    {"tag": "sql", "icon": "📚", "format_type": "Book", "title": "SQL Antipatterns", "desc": "Книга Маркуса Винанда о типичных ошибках разработчиков при проектировании реляционных БД."},
    {"tag": "sql", "icon": "🌐", "format_type": "Website", "title": "Use The Index, Luke!", "desc": "Один из лучших сайтов, детально объясняющий работу индексов во всех популярных РСУБД."},
    {"tag": "sql", "icon": "🛠", "format_type": "Tool", "title": "explain.dalibo.com", "desc": "Интерактивный визуализатор планов запросов (EXPLAIN ANALYZE) для PostgreSQL. Помогает найти медленные ноды."},
    {"tag": "sql", "icon": "🎥", "format_type": "YouTube", "title": "Hussein Nasser", "desc": "Отличный канал для глубокого понимания архитектуры БД, транзакций, ACID, репликации."},
    {"tag": "sql", "icon": "🌐", "format_type": "Course", "title": "CMU Database Systems", "desc": "Лекции Университета Карнеги-Меллона (Andy Pavlo). Хардкор про внутренности баз данных."},
    {"tag": "sql", "icon": "📚", "format_type": "Docs", "title": "PostgreSQL Official Documentation", "desc": "Самый исчерпывающий и авторитетный источник. Читайте разделы 'Performance Tuning'."},
    {"tag": "sql", "icon": "🌐", "format_type": "Article", "title": "ClickHouse Performance Patterns", "desc": "Официальный гайд Яндекса по тюнингу запросов в ClickHouse (MergeTree, сортировки)."},
    {"tag": "sql", "icon": "🎥", "format_type": "YouTube", "title": "Алексей Лесовский — PostgreSQL", "desc": "Видео-доклады с конференций HighLoad по профилированию и мониторингу Postgres."},
    {"tag": "sql", "icon": "🛠", "format_type": "Platform", "title": "LeetCode SQL", "desc": "Раздел задач SQL (Medium-Hard) — оконные функции, рекурсивные CTE, парсинг логов."},
    {"tag": "sql", "icon": "📚", "format_type": "Book", "title": "Joe Celko's SQL for Smarties", "desc": "Продвинутый SQL для профессионалов. Иерархические деревья, графы, сложные агрегаты."},
    {"tag": "sql", "icon": "🌐", "format_type": "Blog", "title": "Percona Tech Blog", "desc": "Блог инженеров Percona. Кейсы оптимизации сложных запросов и дамп памяти."},
    {"tag": "sql", "icon": "🎥", "format_type": "YouTube", "title": "ByteByteGo Database Crash Course", "desc": "Анимационное объяснение кластеризации, шардирования и распределенных транзакций."},
    {"tag": "sql", "icon": "🛠", "format_type": "Tool", "title": "DB Fiddle / SQL Fiddle", "desc": "Песочница для тестирования SQL схем в Postgres/MySQL/SQLite прямо в браузере."},
    {"tag": "sql", "icon": "🌐", "format_type": "Article", "title": "Tuning PostgreSQL WAL", "desc": "Как настраивать Write-Ahead Log для повышения throughput базы данных на запись."},

    # PYTHON (15 items)
    {"tag": "python", "icon": "📚", "format_type": "Book", "title": "Fluent Python", "desc": "Тяжелая артиллерия Python. Генераторы, итераторы, метаклассы, потоки (GIL) от Лучано Рамальо."},
    {"tag": "python", "icon": "📚", "format_type": "Book", "title": "High Performance Python", "desc": "Профилирование, Cython, Numba, multiprocessing. Как выжать из Питона скорость."},
    {"tag": "python", "icon": "🎥", "format_type": "PyCon", "title": "Raymond Hettinger (Beyond PEP8)", "desc": "Легендарный докладчик PyCon. Учит писать чистый, идеоматичный (Pythonic) код."},
    {"tag": "python", "icon": "🌐", "format_type": "Docs", "title": "Asyncio Documentation", "desc": "Обязательно для парсинга API: понимание Event Loop, корутин, aiohttp и лимитов соединений."},
    {"tag": "python", "icon": "🌐", "format_type": "Blog", "title": "Real Python", "desc": "Огромные, детализированные статьи с примерами по ООП, декораторам, Docker+Python."},
    {"tag": "python", "icon": "🛠", "format_type": "Library", "title": "Pydantic Documentation", "desc": "Стандарт валидации данных (Data Validation). Незаменим при чтении грязных JSON-сообщений Kafka."},
    {"tag": "python", "icon": "🎥", "format_type": "YouTube", "title": "ArjanCodes", "desc": "Канал про архитектуру, паттерны проектирования, SOLID, и чистый код в Python."},
    {"tag": "python", "icon": "🛠", "format_type": "Tool", "title": "cProfile / PySpy", "desc": "Инструменты для профилирования Python-приложений (поиска бутылочного горлышка O(N^2))."},
    {"tag": "python", "icon": "🌐", "format_type": "Article", "title": "Understanding the Python GIL", "desc": "Статья Давида Бизли (David Beazley) о том, почему GIL убивает потоки на Multicore CPU."},
    {"tag": "python", "icon": "📚", "format_type": "Book", "title": "Python Tricks: A Buffet", "desc": "Короткие фокусы и скрытые фичи языка (Dan Bader), повышающие читаемость."},
    {"tag": "python", "icon": "🛠", "format_type": "Library", "title": "Requests vs HTTPX", "desc": "Различия в обработке HTTP-соединений. HTTPX нужен для поддержки асинхронных коннектов."},
    {"tag": "python", "icon": "🎥", "format_type": "PyCon", "title": "David Beazley - Generators", "desc": "Классика про пайплайны данных исключительно на генераторах, без загрузки в память (как grep в bash)."},
    {"tag": "python", "icon": "🌐", "format_type": "Tutorial", "title": "Python Testing with Pytest", "desc": "Как писать Data Tests: фикстуры, моки, параметризация. Важно для CI/CD DE скриптов."},
    {"tag": "python", "icon": "🛠", "format_type": "Tool", "title": "Poetry / Ruff", "desc": "Современный стандарт упаковки зависимостей и линтер на Rust (скорость проверки за миллисекунды)."},
    {"tag": "python", "icon": "🌐", "format_type": "Article", "title": "Garbage Collector Internals", "desc": "Как работает подсчет ссылок (Reference Counting) и поколения в процессах очистки памяти."},

    # BIG DATA & SPARK & KAFKA (15 items)
    {"tag": "bigdata", "icon": "📚", "format_type": "Book", "title": "Spark: The Definitive Guide", "desc": "Главная книга по PySpark от создателей платформы. Архитектура, Catalyst, Streaming."},
    {"tag": "bigdata", "icon": "📚", "format_type": "Book", "title": "Kafka: The Definitive Guide", "desc": "Все о топиках, партициях, Consumer Groups и доставке Exactly-Once."},
    {"tag": "bigdata", "icon": "🎥", "format_type": "YouTube", "title": "Confluent Channel (Kafka)", "desc": "Канал создателей Kafka. KRaft, Schema Registry, Stream Processing микросервисов."},
    {"tag": "bigdata", "icon": "🌐", "format_type": "Docs", "title": "Apache Spark Cluster Mode Overview", "desc": "Внутрянка кластера: разница между Driver, Executor, Memory Management, Task Scheduling."},
    {"tag": "bigdata", "icon": "🛠", "format_type": "Platform", "title": "Databricks Academy", "desc": "Официальные бесплатные курсы от Databricks (создателей Spark). Deep dive tuning."},
    {"tag": "bigdata", "icon": "🌐", "format_type": "Article", "title": "Handling Data Skew in PySpark", "desc": "Salting, broadcast joins, AQE (Adaptive Query Execution). Как спастись от OutOfMemory."},
    {"tag": "bigdata", "icon": "🎥", "format_type": "YouTube", "title": "Advancing Spark (Daniel Tomes)", "desc": "Канал от инженера Databricks. Детально разбирают тюнинг памяти, Spill to Disk и RDD."},
    {"tag": "bigdata", "icon": "📚", "format_type": "Book", "title": "Making Sense of Stream Processing", "desc": "От создателя Kafka. Зачем нужен Event Sourcing, потоковая обработка (Streams) и Flink."},
    {"tag": "bigdata", "icon": "🛠", "format_type": "Tool", "title": "Apache Airflow UI Simulator", "desc": "Локальное поднятие Airflow через docker-compose для написания DAG-ов, Operators, Backfilling."},
    {"tag": "bigdata", "icon": "🌐", "format_type": "WhitePaper", "title": "Resilient Distributed Datasets (RDD)", "desc": "Оригинальный научный пейпер (Paper) Матеи Захария 2012 года. Почему и как придуман Spark."},
    {"tag": "bigdata", "icon": "🎥", "format_type": "Talk", "title": "Under the Hood of Catalyst Optimizer", "desc": "Как Spark компилирует ваш Python-код в оптимизированный Java Bytecode."},
    {"tag": "bigdata", "icon": "🌐", "format_type": "Article", "title": "Avro vs Parquet vs ORC", "desc": "Разбираем бинарные форматы: потоковые (Avro - row based) против аналитических (Parquet - columnar)."},
    {"tag": "bigdata", "icon": "🛠", "format_type": "Tool", "title": "Debezium (CDC)", "desc": "Трансляция лога репликации PostgreSQL (WAL) в топик Kafka (Change Data Capture). Идеально для real-time."},
    {"tag": "bigdata", "icon": "🌐", "format_type": "Article", "title": "Zero-Copy in Apache Kafka", "desc": "Почему Kafka такая быстрая: чтение диска сетью через sendfile (Bypassing User Space)."},
    {"tag": "bigdata", "icon": "🎥", "format_type": "Course", "title": "Apache Flink Training", "desc": "Будущее Streaming'а: обработка данных событие за событием без микробатчей."},

    # ARCHITECTURE (15 items)
    {"tag": "architecture", "icon": "📚", "format_type": "Book", "title": "The Data Warehouse Toolkit", "desc": "Библия Ralph Kimball: Звезда, Витрины данных (Data Marts), Таблицы фактов и измерений, SCD Type 1-2."},
    {"tag": "architecture", "icon": "📚", "format_type": "Book", "title": "Designing Data-Intensive Applications", "desc": "Книга Мартина Клеппмана (DDIA) — шедевр по System Design, репликации и Big Data."},
    {"tag": "architecture", "icon": "📚", "format_type": "Book", "title": "Fundamentals of Data Engineering", "desc": "Joe Reis & Matt Housley. Жизненный цикл де-факто, слои абстракций, Data Governance."},
    {"tag": "architecture", "icon": "🌐", "format_type": "Article", "title": "Data Mesh Principles", "desc": "Оригинальная статья Zhamak Dehghani: Как децентрализовать DWH по доменам (Domain Ownership)."},
    {"tag": "architecture", "icon": "🎥", "format_type": "YouTube", "title": "System Design Interview (ByteByteGo)", "desc": "Как проектировать системы: балансировщики, кэш (Redis), шардирование баз, кэширование."},
    {"tag": "architecture", "icon": "🌐", "format_type": "Blog", "title": "Chad Sanderson On Substack", "desc": "Ведущий блог про Data Contracts, Data Quality и борьбу с инфраструктурным хаосом."},
    {"tag": "architecture", "icon": "🛠", "format_type": "Tool", "title": "dbt (Data Build Tool)", "desc": "Фреймворк для ELT трансформаций в DWH (Analytics Engineering) на SQL + Jinja + Тесты."},
    {"tag": "architecture", "icon": "🌐", "format_type": "WhitePaper", "title": "Apache Iceberg Architecture", "desc": "Объяснение формата открытых таблиц Lakehouse. Как работают Snapshots (метданные) поверх S3."},
    {"tag": "architecture", "icon": "🎥", "format_type": "YouTube", "title": "Lambda vs Kappa Architectures", "desc": "Почему две ветки (Batch+Stream) сложно поддерживать и как Kappa объединяет их в единый Stream."},
    {"tag": "architecture", "icon": "🌐", "format_type": "Docs", "title": "Data Vault 2.0 (Dan Linstedt)", "desc": "Альтернатива Kimball для корпоративных Enterprise-хранилищ: Hub, Link, Satellite."},
    {"tag": "architecture", "icon": "🛠", "format_type": "Platform", "title": "DataHub & Amundsen", "desc": "Изучение метаданных: Data Catalog и визуализация Data Lineage графов."},
    {"tag": "architecture", "icon": "🌐", "format_type": "Article", "title": "Modern Data Stack Overview", "desc": "Из чего состоят конвейеры сегодня: Fivetran, Snowflake, dbt, Airflow (Fivetran MDS Benchmark)."},
    {"tag": "architecture", "icon": "📚", "format_type": "Book", "title": "Monolith to Microservices", "desc": "Архитектурные паттерны: миграция корпоративных легаси-БД (Strangler Fig Pattern)."},
    {"tag": "architecture", "icon": "🛠", "format_type": "Tool", "title": "Great Expectations", "desc": "Как описывать Assert-контракты в Python на чистоту данных (No Nulls, в пределах Z-score)."},
    {"tag": "architecture", "icon": "🌐", "format_type": "Article", "title": "Rise of Zero-ETL", "desc": "Статьи о новых интеграциях Aurora+Redshift/Snowflake, позволяющих избегать Airflow-кода вообще."}
]

rendered_items = []
for resource in resources:
    rendered_items.append(Item.format(
        tag=resource["tag"],
        icon=resource["icon"],
        format_type=resource["format_type"],
        title=resource["title"],
        desc=resource["desc"]
    ))

html_output = html_template.format(resources_html="\\n".join(rendered_items))

with open("pages/resources.html", "w", encoding="utf-8") as f:
    f.write(html_output)

print("resources.html generated successfully!")

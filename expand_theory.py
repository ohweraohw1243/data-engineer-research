import os

html_wrapper = """<div class="{class_name}">
    <div class="page-header">
        <h1 class="page-title">{title}</h1>
        <p class="page-desc">{desc}</p>
    </div>

    <h2 style="font-size: 26px; font-weight: 600; margin-bottom: 24px; margin-top: 32px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">Теоретические модули</h2>

{modules}
</div>
"""

module_wrapper = """    <!-- Модуль {n} -->
    <div class="card theory-block" style="margin-bottom: 32px;">
        <h3 class="card-title">{title}</h3>
        <div class="card-text" style="margin-top: 16px;">
{content}
            <div class="resource-block" style="margin-top: 16px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                <h4 style="margin-top: 0">Что посмотреть/почитать:</h4>
                <ul>
{resources}
                </ul>
            </div>
        </div>
    </div>
"""

# STAGE 1
stage1_modules = [
    {
        "title": "🐘 Модуль 1: Базовый и Продвинутый SQL",
        "content": """            <p><strong>Оконные функции (Window Functions):</strong> Не группируют строки, как <code>GROUP BY</code>, а позволяют вычислять агрегаты для каждой строки на основе "окна" соседних строк (<code>OVER (PARTITION BY ... ORDER BY ...)</code>). Основные функции: <code>ROW_NUMBER()</code>, <code>RANK()</code>, <code>DENSE_RANK()</code>, <code>LEAD()</code>, <code>LAG()</code>.</p>
            <p><strong>CTE (Общие табличные выражения):</strong> Заменяют вложенные подзапросы, делая код более читаемым. Синтаксис <code>WITH ... AS (...)</code>. Существуют <strong>рекурсивные CTE</strong> для обхода графов или иерархий (например, структуры подчинения). Использование CTE материализует данные в памяти (в Postgres 12+ по умолчанию не материализует).</p>
            <p><strong>Индексы и Планы Запроса (Execution Plans):</strong></p>
            <ul>
                <li><strong>B-Tree (Сбалансированное дерево):</strong> Стандартный индекс в PostgreSQL. Идеально для поиска диапазонов (<code>BETWEEN</code>, <code>></code>, <code><</code>). Сложность поиска $O(\\log N)$.</li>
                <li><strong>Hash-индекс:</strong> Только для поиска точного соответствия (<code>=</code>).</li>
                <li><strong>Как читать EXPLAIN:</strong> Поиск идет от внутренних листьев к корню узла. Ключевые термины: <code>Seq Scan</code> (полный перебор, плохо), <code>Index Scan</code> (оптимально), <code>Merge Join</code> (для двух больших отсортированных таблиц), <code>Hash Join</code> (если одна таблица помещается в память, строится хеш-таблица).</li>
            </ul>""",
        "resources": "<li>📖 <strong>Книга:</strong> \"High Performance MySQL\" (базовое понимание индексов).</li><li>▶️ <strong>YouTube:</strong> Как читать EXPLAIN ANALYZE в PostgreSQL.</li>"
    },
    {
        "title": "🐳 Модуль 2: Контейнеризация и Docker",
        "content": """            <p>Data Engineer постоянно запускает локальную копию инфраструктуры (Kafka, Airflow, Spark).</p>
            <ul>
                <li><strong>Namespaces и Cgroups:</strong> Технологии ядра Linux, на которых базируется Docker (изоляция процессов и лимиты ресурсов CPU/RAM). Контейнер — это просто процесс в изоляции, а не виртуальная машина.</li>
                <li><strong>Volumes (Тома):</strong> Папки на хосте, примонтированные в контейнер. Без них удаление контейнера Postgres удалит и саму базу данных навсегда!</li>
                <li><strong>Networking:</strong> Виртуальные сети Docker (bridge, host). Чтобы Airflow увидел Postgres в том же docker-compose, они должны быть в одной сети. По IP обращаться нельзя, Airflow будет обращаться по DNS-имени сервиса (напр. <code>postgres:5432</code>).</li>
            </ul>""",
        "resources": "<li>📝 <strong>Документация:</strong> Docker Networking Overview.</li><li>▶️ <strong>YouTube:</strong> Как работает Docker под капотом (про cgroups).</li>"
    },
    {
        "title": "🏛 Модуль 3: Архитектура Хранилищ (DWH) и ACID",
        "content": """            <p><strong>Транзакции и ACID:</strong> Свойства транзакций в РСУБД:</p>
            <ul>
                <li><strong>A (Atomicity):</strong> Атомарность. Либо все операции транзакции выполняются (COMMIT), либо откатываются (ROLLBACK).</li>
                <li><strong>C (Consistency):</strong> Консистентность. База всегда будет в валидном состоянии, не нарушая FK (Внешних ключей).</li>
                <li><strong>I (Isolation):</strong> Изоляция. Транзакции не должны мешать друг другу (уровни Read Uncommitted -> Read Committed (PG Default) -> Repeatable Read -> Serializable).</li>
                <li><strong>D (Durability):</strong> Запись на диск. При сбое питания зафиксированные данные не удалятся (пишутся сперва в лог Write-Ahead Log, WAL).</li>
            </ul>
            <p><strong>Подходы Kimball vs Inmon:</strong> Ральф Кимбалл предложил строить DWH вокруг витрин (Звезда, "Снизу вверх"). Билл Инмон предложил строго нормализованное огромное Enterprise хранилище в центре (3NF), а витрины данных строить уже по краям поверх него ("Сверху вниз"). Сегодня в Big Data доминигует гибрид — Data Vault или Lakehouse со слоями ODS/DDS.</p>""",
        "resources": "<li>📖 <strong>Книга:</strong> \"The Data Warehouse Toolkit\" (Ralph Kimball) - глава 1.</li><li>📝 <strong>Статья:</strong> Транзакции ACID и уровни изоляции.</li>"
    }
]

# STAGE 2
stage2_modules = [
    {
        "title": "🐍 Модуль 1: Внутренности Python",
        "content": """            <p>Для написания консистентных коннекторов и API-скрейперов нужно знать Python под капотом:</p>
            <ul>
                <li><strong>GIL (Global Interpreter Lock):</strong> Главный бич многопоточности в CPython. Мьютекс, который не дает двум потокам исполнять байткод simultaneously. Для I/O операций (API, паузы сети) нужно использовать <code>asyncio</code> и <code>threading</code>, а для математики и CPU — процессы (<code>multiprocessing</code>).</li>
                <li><strong>Garbage Collector (GC):</strong> В Python памятью управляет счетчик ссылок (Reference Counting). Если счетчик падает до 0 — объект удаляется. Для решения проблемы циклических ссылок (A ссылается на B, B на A) включается сборщик поколений (Generational GC).</li>
                <li><strong>Генераторы и Итераторы:</strong> При выгрузке 10МБ JSON лучше не грузить его целиком в память <code>list</code>, а генерировать элементы по одному через <code>yield</code>. Итераторы (<code>__iter__ __next__</code>) экономят RAM (память) на Airflow Worker'e при парсинге файлов на терабайты.</li>
            </ul>""",
        "resources": "<li>📖 <strong>Книга:</strong> \"Fluent Python\" (Luciano Ramalho) – Глава про Итераторы и GIL.</li><li>▶️ <strong>YouTube:</strong> Raymond Hettinger - Advanced Python (PyCon).</li>"
    },
    {
        "title": "🕸 Модуль 2: REST API, JSON и Сетевые Протоколы",
        "content": """            <p>Сбор данных по HTTP (самая частая задача Data-инженера для интеграции Cloud-сервисов):</p>
            <ul>
                <li><strong>HTTP Методы и Коды:</strong> GET (получить), POST (отправить), PUT (перезаписать), PATCH (обновить часть). 200 (ОК), 401 (Unauthorized), 403 (Forbidden), 429 (Too Many Requests — нужно добавить логику Retry c экспоненциальным затуханием (Exponential Backoff!)), 500 (Ошибка сервера).</li>
                <li><strong>Pagination (Пагинация):</strong> Сторонние API отдают данные не сразу 1М записей, а «страницами» по 100 записей через курсоры (<code>cursor</code>). Нужно обрабатывать заголовки <code>Next-Page-Token</code> в While True цикле.</li>
                <li><strong>Асинхронность (Asyncio):</strong> Использование <code>aiohttp</code> позволяет делать 1000 HTTP запросов конкурентно в Event Loop, не блокируя приложение во время "ожидания" ответа удаленного сервера (I/O Bound task).</li>
            </ul>""",
        "resources": "<li>📝 <strong>Статья:</strong> Построение Resilient API-коннекторов для ETL.</li><li>▶️ <strong>Библиотеки:</strong> <code>requests</code> (sync) vs <code>httpx / aiohttp</code> (async).</li>"
    },
    {
        "title": "🐧 Модуль 3: Основы Linux и Bash для DE",
        "content": """            <p>Запуск дата-пайплайнов всегда происходит в Linux-окружении (Ubuntu, Debian, CentOS, RHEL). Без графической мышки.</p>
            <ul>
                <li><strong>Потоки ввода/вывода (Pipes <code>|</code>):</strong> Объединение утилит. <code>cat access.log | grep 'ERROR' | awk '{{print $1}}' | sort | uniq -c | sort -nr</code> — классический мощный конвейер для подсчета ТОП-IP адресов без написания скриптов на Python!</li>
                <li><strong>Управление процессами:</strong> <code>top</code> и <code>htop</code> (показывают кто жрет CPU/ОЗУ), <code>ps aux | grep python</code>, убийство зависшего Airflow-воркера <code>kill -9 $PID</code>. Перевод процесса в фон (<code>&</code>, <code>bg</code>, <code>fg</code>, <code>nohup</code>).</li>
                <li><strong>Крон (cron) и Systemd:</strong> Как запускать скрипты по расписанию "дедовским" способом без оркестраторов. Звездочки крона: <code>* * * * *</code> (минута, час, день, месяц, день недели).</li>
                <li><strong>Права доступа (chmod/chown):</strong> Разница между <code>drwxr-xr-x</code> (755) и <code>644</code>. Как выдать права на запись в папку S3/локального диска, чтобы Python-скрипт не падал с <code>Permission Denied</code>.</li>
            </ul>""",
        "resources": "<li>▶️ <strong>YouTube:</strong> The Linux Command Line for Beginners.</li><li>🎮 <strong>Практика:</strong> Игра OverTheWire Bandit (обучение терминалу SSH в формате CTF-квеста).</li>"
    }
]

# STAGE 3
stage3_modules = [
    {
        "title": "🚀 Модуль 1: Архитектура Spark и Управление Памятью",
        "content": """            <p><strong>Spark</strong> — движок распределенных in-memory вычислений (Hadoop MapReduce 2.0).</p>
            <ul>
                <li><strong>Driver vs Executor:</strong> Мозг (Driver) управляет SparkSession, строит логический Execution план (DAG) и раздаёт подзадачи (Tasks) Воркерам (Executors) на удаленных серверах кластера.</li>
                <li><strong>Управление памятью Executor'a (Unified Memory Management):</strong> Память делится на <code>Execution Memory</code> (рабочая зона для математики, джоинов, хэш-таблиц для Shuffle) и <code>Storage Memory</code> (память под резерв данных <code>df.cache()</code>, Broadcast переменные). Если места мало кластер не падает сразу, часть данных агрессивно сбрасывается на диск сервера (Spill to Disk), что убивает производительность до нуля.</li>
                <li><strong>Lazy Evaluation:</strong> Все трансформации ленивы (<code>select, groupBy</code>). Они записывают историю, генерируя Lineage граф, и вообще НЕ начинают считывать ваш терабайт данных с S3, пока вы не вызовете Action (например, <code>.count()</code>, <code>.write.parquet()</code>).</li>
            </ul>""",
        "resources": "<li>📖 <strong>Книга:</strong> Spark: The Definitive Guide (Bill Chambers, Matei Zaharia).</li><li>📝 <strong>Документация:</strong> Tuning Apache Spark (Memory Management Framework).</li>"
    },
    {
        "title": "🧠 Модуль 2: Catalyst Optimizer и Планы Выполнения",
        "content": """            <p>Как PySpark DataFrame преобразуется в JVM-байткод и магическим образом ускоряется:</p>
            <ul>
                <li><strong>Catalyst Optimizer:</strong> Встроенный движок Spark SQL. 1) Берет ваш Python-код -> 2) Строит <em>Unresolved Logical Plan</em> -> 3) Резолвит/проверяет к метаданным (а существует ли реально колонка <code>A</code>?) -> 4) Анализирует план (Rule-based optimization) -> 5) Генерирует физический план <em>Physical Plan</em>.</li>
                <li><strong>Predicate Pushdown:</strong> Вы читаете 1 ТБ Parquet-файлов за 3 года, но написали <code>df.filter(\"year = 2024\")</code>. Spark вообще не будет качать файлы за 2022 и 2023 год по сети из S3! Фильтр 'спустится' прямо на источник хранения.</li>
                <li><strong>Column Pruning:</strong> Spark загрузит с диска только те 2 колонки из Parquet, которые мы явно запросили в <code>.select()</code>, игнорируя остальные сотни полей файла, что радикально ускорит I/O.</li>
            </ul>""",
        "resources": "<li>▶️ <strong>Видео:</strong> A Deep Dive into Spark SQL's Catalyst Optimizer (DataBricks Presentation).</li><li>📝 <strong>Документация:</strong> Spark Web UI Metrics (как читать вкладку SQL).</li>"
    },
    {
        "title": "🔧 Модуль 3: Data Skew, Shuffle и Salting (Засолка)",
        "content": """            <p><strong>Проблема перекоса данных (Data Skew):</strong> Допустим, мы делаем <code>GROUP BY city</code>. Пользователи из 'Москвы' - это 80% данных (800GB), а из других городов - 20% (по 100MB). При операции Shuffle все строки с Москвой полетят в 1 единственную партицию! Один Экзекьютор зависнет намертво с OutOfMemory (OOM), а остальные 99 серверов будут простаивать с нагрузкой 0% CPU.</p>
            <ul>
                <li><strong>Лекарство - Соль (Salting):</strong> Искусственное добавление случайного числа от 1 до 100 к ключу (например, создаем колонку <code>'Москва_42'</code>, <code>'Москва_88'</code>). Это равномерно разбросает миллионы строк Москвы по сотням партиций (равномерный Shuffle), кластер сверхбыстро посчитает микро-агрегаты для кусков Москвы параллельно, а потом мы сделаем второй <code>GROUP BY</code> уже по очищенной начальной строке 'Москве', суммируя микро-агрегаты!</li>
                <li><strong>Broadcast Hash Join:</strong> Если к огромной триллионной таблице <code>F_SALES</code> джоинится крохотный справочник из 10 000 строк из Postgres (справочник валют) -> просто вызываем <code>F_SALES.join(broadcast(df_small))</code>. Справочник целиком копируется в память КАЖДОГО экзекьютора, и дорогого Shuffle огромной таблицы по ключам по сети вообще не происходит!</li>
            </ul>""",
        "resources": "<li>📝 <strong>Статьи:</strong> 'How to handle Data Skew in Databricks / Spark'.</li><li>▶️ <strong>YouTube:</strong> The mechanics of Salting in Big Data Architecture.</li>"
    }
]

# STAGE 4
stage4_modules = [
    {
        "title": "🌊 Модуль 1: Внутренности Apache Kafka",
        "content": """            <p>Горизонтально масштабируемый брокер для миллионов событий в секунду.</p>
            <ul>
                <li><strong>Topics и Partitions:</strong> Логика инженеров пишется в Topic-и, но физически топик - это набор Партиций (Partitions) раскиданных по жестким дискам разных Брокеров. Чем больше партиций — тем выше параллелизм записи консьюмер-группой. Минус: мы теряем гарантию порядка сообщений (порядок гарантируется лишь внутри 1 Partiton!).</li>
                <li><strong>Append-only Log + Zero Copy:</strong> Kafka - это не обычная база данных. Это просто линейный файл журнала. Запись идет строго в хвост файла на диске (Sequential I/O). За счет этого и технологии <em>Zero Copy Bypass</em> (передача байтов из диска сразу в сетевой сокет, минуя User-Space приложения), Kafka пишет на старый HDD диск так же быстро, как в оперативную память.</li>
                <li><strong>ZooKeeper vs KRaft:</strong> Исторически для консенсуса кластера (выбора мастер-лидера партиции) был сложный ZooKeeper. Сейчас Kafka (2.8+) имеет встроенный протокол консенсуса KRaft. Брокер сам себе выбирает 'контроллер-кворум', что ускоряет создание тысяч топиков.</li>
                <li><strong>Offsets:</strong> 'Закладки' (курсоры) того, на каком сообщении внутри конкретной партиции сейчас находится Consumer-клиент. Прочитал -> закоммитил оффсет на сервер.</li>
            </ul>""",
        "resources": "<li>📖 <strong>Книга:</strong> Kafka: The Definitive Guide (Gwen Shapira, Todd Palino).</li><li>▶️ <strong>YouTube:</strong> Understanding KRaft protocol Apache Kafka (Confluent).</li>"
    },
    {
        "title": "🧩 Модуль 2: Schema Registry, Форматы и Streaming",
        "content": """            <ul>
                <li><strong>Schema Registry:</strong> Кафка не знает, что внутри сообщения (для нее это просто массив [011000100]). Чтобы программист продюсера не сломал аналитика на приемке (вдруг он переименовал поле `id` в `user_id`), поднимается отдельный микросервис Schema Registry. Там хранятся жесткие схемы (JSON Schema). Если продюсер шлет грязный JSON — схема не пускает его и бросает Serialization Exception.</li>
                <li><strong>Форматы сериализации:</strong> В Big Data Кафку не гоняют чистым JSON (он раздувает сеть пробелами и ключами). Используют <strong>Avro</strong> или <strong>Protobuf</strong>: они бинарны, сжимают размер сообщений в 4-6 раз и требуют явного контракта.</li>
                <li><strong>Spark Structured Streaming и Kafka Streams:</strong> Когда мы читаем из Kafka в Data Lake, мы работаем с логикой бесконечного потока (unbounded stream table). Spark каждые 5-10 сек (Micro-batch interval) собирает пачку ивентов и процессит их как обычный DataFrame, используя те же агрегации Catalyst. Flink/Kafka Streams же идут еще дальше, обрабатывая ивент поштучно (Row-by-Row).</li>
            </ul>""",
        "resources": "<li>📝 <strong>Документация:</strong> Confluent Schema Registry Overview & Avro Serialization.</li><li>▶️ <strong>Видео:</strong> 'Structured Streaming in Apache Spark 3.x'.</li>"
    },
    {
        "title": "🛡️ Модуль 3: Data Quality, Contracts & Data Governance",
        "content": """            <p>Когда вы сливаете миллиарды грязных пользовательских строк в DWH, как доказать бизнесу, что метрики в BI-дашбордах - достоверны?</p>
            <ul>
                <li><strong>Data Contracts:</strong> Юридические обязательства от команды Backend'a. Бэкенд пушит контракты (схему таблиц) в репозиторий DE. Если на бэкенде Senior-developer внезапно мигрирует поле <code>user_age</code> из Integer в String, CI/CD Pipeline падает на этапе сборки приложения! Бэкенд физически не может выкатить релиз, пока не согласует изменение с DE-командой.</li>
                <li><strong>Качество Данных (Great Expectations / Soda Core):</strong> Пишем автотесты для табличных данных в Airflow: "Колонка <code>is_active</code> не может быть NULL", "Метрика <code>total_revenue</code> должна быть в диапазоне ±20% от вчерашнего дня (Аномалия!)" -> При отклонениях Airflow отправляет алерт в Slack/Telegram и <em>тормозит</em> пайплайн инъекции данных, не пуская мусор в BI.</li>
                <li><strong>Data Catalog & Lineage (DataHub / OpenMetadata / Amundsen):</strong> У гендиректора на дашборде упала конверсия. Он идет в Data Catalog (внутренняя Википедия Дата-Отдела). Ищет там дашборд и открывает вкладку Lineage (визуальный граф зависимостей данных): Дашборд -> Слой DDS_SALES -> Слой ODS_RAW -> Сырой лог из Kafka_Payment_Topic. Он видит красным светом, что сгорел сырой лог Kafka. Инцидент эскалируется к Backend-команде за 5 минут, а не за 3 дня раскопок дата-инженером.</li>
            </ul>""",
        "resources": "<li>📖 <strong>Книга:</strong> 'Data Quality Fundamentals' (O'Reilly).</li><li>▶️ <strong>YouTube:</strong> The rise of Data Contracts (Chad Sanderson) - System Design.</li>"
    }
]

# STAGE 5
stage5_modules = [
    {
        "title": "🏰 Модуль 1: От HDFS к S3 и Архитектура Lakehouse",
        "content": """            <p>Эволюция Big Data: почему мы перестали строить огромные кластеры Hadoop?</p>
            <ul>
                <li><strong>HDFS:</strong> Привязка компьютера к жесткому диску (Coupled Compute & Storage). Сервер (Node), считающий Spark-джобы, физически хранит части файлов на своих же дисках. Считалось, что локальный диск быстрее сети. Огромный минус: масштабирование. Чтобы увеличить хранилище петабайтов на 10% вам нужно покупать еще один мощнейший дорогущий сервер с 64 ядрами, которые будут простаивать!</li>
                <li><strong>S3 Object Storage (MinIO, AWS S3):</strong> Разделение вычислений и хранилища (Decoupled Architecture). В S3 данные лежат на дешевых медленных дисках клауда (Storage Layer), а Spark разворачивается отдельно в Kubernetes (Compute Layer). Сети стали 100 Gbit+, локальность больше не нужна.</li>
                <li><strong>Lakehouse (Iceberg / Delta Lake / Hudi):</strong> Раньше на S3 у вас лежали просто 10 миллионов голых Parquet файлов. Если вы читаете датасет, а Airflow в этот же момент его удаляет/переписывает — Data Lake возвращал ошибку файла (Отсутствие ACID!). Сегодня: <strong>Apache Iceberg</strong> добавляет слой Метаданных (Manifest files / Snapshots). Iceberg эмулирует полноценную SQL-базу поверх S3 (можно делать <code>UPDATE</code>, `MERGE INTO`, `DELETE`, получать Snapshot Isolation (транзакции) и Time-Travel — возможность запросом `SELECT * FROM tbl AS OF TIMESTAMP '12:00'` прочитать вчерашние данные озера!).</li>
            </ul>""",
        "resources": "<li>📝 <strong>Документация:</strong> Apache Iceberg Architecture Deep Dive.</li><li>▶️ <strong>YouTube:</strong> Data Lakehouse vs Data Warehouse.</li>"
    },
    {
        "title": "⚙️ Модуль 2: Lambda, Kappa и Zero-ETL",
        "content": """            <p>Эволюция систем обработки данных и корпоративных архитектур:</p>
            <ul>
                <li><strong>Lambda Architecture:</strong> Поток сырых событий делится на два ручья. Быстрый поток идет из Кафки сразу в NoSQL СУБД (приближенные быстрые метрики для сайта). Медленный лог идет в S3 Data Lake -> Spark Batch (раз в сутки) -> Мощный DWH (вечерняя сверка точных копеек и перезапись NoSQL). Минус: программисты дублируют одну и ту же логику дважды (Batch и Streaming). Дорогая поддержка 2-х пайплайнов.</li>
                <li><strong>Kappa Architecture:</strong> Оставляем ТОЛЬКО Стриминговый (Fast) слой на базе Apache Flink/Kafka Streams! Пересчет исторического бага (Backfilling) делается через пуш исторических данных в старый топик Кафки, который читается в режиме "потока". Идеально 1 Codebase для реал-тайма и батчей!</li>
                <li><strong>Zeta Architecture / Zero-ETL:</strong> Текущий мощный тренд облачных Cloud-вендоров (Snowflake/AWS/Databricks). Зачем DE-отделу писать сложные Airflow DAG-и для перекладывания из Postgres -> в аналитический DWH? AWS Aurora и Snowflake позволяют под капотом транслировать CDC репликации (Binary Log базы) в Snowflake/Iceberg автоматически в 1 клик! Инженеры данных (DE) сдвигаются от профессии 'перетаскивателей ETL' в инженеров качества, каталогизации и Analytics Engineers (SQL-трансформации в dbt).</li>
            </ul>""",
        "resources": "<li>📝 <strong>Статья:</strong> Questioning the Lambda Architecture (Jay Kreps, создатель Kafka).</li><li>📝 <strong>Документация:</strong> Zero-ETL Integrations in AWS/Snowflake.</li>"
    },
    {
        "title": "📊 Модуль 3: Массивные Аналитические БД (MPP / OLAP)",
        "content": """            <p>Где лежат самые быстрые и ценные витрины (Data Marts) для CEO-дашбордов:</p>
            <ul>
                <li><strong>РБД СУБД (PostgreSQL / MySQL) - это OLTP:</strong> (Online Transaction Processing). Они хранят данные построчно (Row-oriented). Отлично подходят для миллисекундных поисков одной транзакции юзера по ИНДЕКСУ (<code>SELECT * WHERE id=1</code>), но погибают при суммировании столбца из миллиарда строк.</li>
                <li><strong>Massively Parallel Processing (MPP) - это OLAP:</strong> (ClickHouse / Snowflake / Redshift / Greenplum). Колоночные кластерные системы (Columnar Storage). Данные одного столбца хранятся физически рядом на диске, что дает колоссальную степень сжатия (у одинаковых чисел в столбце высокая энтропия).</li>
                <li><strong>Как работает MPP:</strong> ClickHouse не имеет супер-материнской платы. Вы кидаете <code>SELECT sum(cost)</code> -> Coordinator Node разбивает запрос на 10 кусков -> рассылает 10 воркерам (Scatter) -> воркеры суммируют свои шарды -> отправляют ответ Координатору (Gather). </li>
                <li><strong>Векторная обработка (SIMD):</strong> Почему Яндекс.Метрика (ClickHouse) быстрее Greenplum? ClickHouse обрабатывает данные блоками (Векторами). CPU использует SIMD инструкции (Single Instruction, Multiple Data), обрабатывая 256 чисел математически за 1 такт процессора (кэшируя в регистрах L1), вместо циклов While!</li>
            </ul>""",
        "resources": "<li>📖 <strong>Материалы:</strong> Внутреннее устройство ClickHouse (MergeTree Engine, Secondary Indexes, SIMD).</li><li>▶️ <strong>YouTube:</strong> OLAP vs OLTP Database architecture differences.</li>"
    }
]

stages_info = [
    {
        "file": "pages/stage1.html",
        "class": "page-content",
        "title": "Этап 1: <span>Базовый SQL, Docker и Теория Хранилищ</span>",
        "desc": "Сверхдетальное погружение во внутренности баз данных, устройство B-Tree и Hash индексов, транзакции (ACID) и теорию построения нормализованных DWH.",
        "mods": stage1_modules
    },
    {
        "file": "pages/stage2.html",
        "class": "page-content",
        "title": "Этап 2: <span>Python Архитектура, API и ОС Linux</span>",
        "desc": "Сбор данных под микроскопом: как убивает GIL и работает Garbage Collector, как правильно масштабировать API коннекторы (Asyncio, HTTP), потоки I/O в Bash.",
        "mods": stage2_modules
    },
    {
        "file": "pages/stage3.html",
        "class": "page-content",
        "title": "Этап 3: <span>Spark, Catalyst & Оптимизация Big Data</span>",
        "desc": "Разбираем внутренности Spark Ecosystem. Структура памяти Executor'ов, как Catalyst Optimizer режет план запроса и методы \"засолки\" Data Skew.",
        "mods": stage3_modules
    },
    {
        "file": "pages/stage4.html",
        "class": "page-content",
        "title": "Этап 4: <span>Kafka, Стриминг и Data Governance</span>",
        "desc": "Массивная реал-тайм архитектура. Секреты Zero-Copy в топиках, ZooKeeper vs KRaft, Data Lineage и строгие Data Contracts.",
        "mods": stage4_modules
    },
    {
        "file": "pages/stage5.html",
        "class": "page-content",
        "title": "Этап 5: <span>System Design, Lakehouse и MPP базы данных</span>",
        "desc": "Системный дизайн: от Lambda до Zero-ETL подходов. Революция ACID-таблиц поверх S3 (От HDFS к Apache Iceberg) и векторные SQL движки ClickHouse.",
        "mods": stage5_modules
    }
]

for stage in stages_info:
    modules_html = ""
    for i, module in enumerate(stage["mods"], 1):
        modules_html += module_wrapper.format(n=i, title=module['title'], content=module['content'], resources=module['resources'])
    
    final_html = html_wrapper.format(class_name=stage['class'], title=stage['title'], desc=stage['desc'], modules=modules_html)
    
    with open(stage['file'], "w", encoding="utf-8") as f:
        f.write(final_html)

print("Theory expansion deeply complete across all 5 stages!")

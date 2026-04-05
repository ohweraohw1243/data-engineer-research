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
                { id: 'stage4-streaming-window', label: 'Streaming window + watermark' }
            ],
            stage5: [
                { id: 'stage5-data-modeling', label: 'Star Schema DDL mini-проект' },
                { id: 'stage5-clickhouse-tuning', label: 'ClickHouse модель и тюнинг' }
            ]
        };

        const STAGE_READY_THRESHOLD = {
            stage1: 70,
            stage2: 70,
            stage3: 70,
            stage4: 70,
            stage5: 70
        };

        const ANSWER_STATUS_STORAGE_KEY = 'streamflow_answer_status';

        const FALLBACK_INTERVIEW_QUESTION_BANK = [
            { id: 'int-fb-s1-1', stage: 'stage1', prompt: 'SQL: Топ-3 по category из streams(id, category, views).', answer: 'WITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY views DESC) AS rn FROM streams) SELECT * FROM ranked WHERE rn <= 3;' },
            { id: 'int-fb-s1-2', stage: 'stage1', prompt: 'SQL: Верните последний заказ каждого user_id через ROW_NUMBER().', answer: 'WITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn FROM orders) SELECT * FROM ranked WHERE rn = 1;' },
            { id: 'int-fb-s1-3', stage: 'stage1', prompt: 'SQL: Сумма и количество заказов по странам, где сумма > 5000.', answer: 'SELECT u.country, COUNT(*) AS orders_cnt, SUM(o.amount) AS total_amount FROM orders o JOIN users u ON u.id = o.user_id GROUP BY u.country HAVING SUM(o.amount) > 5000 ORDER BY total_amount DESC;' },
            { id: 'int-fb-s1-4', stage: 'stage1', prompt: 'SQL: Скользящее среднее views за 7 дней по daily_stats(date, views).', answer: 'SELECT date, views, AVG(views) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d FROM daily_stats ORDER BY date;' },
            { id: 'int-fb-s1-5', stage: 'stage1', prompt: 'SQL: running total amount по revenue(date, amount).', answer: 'SELECT date, amount, SUM(amount) OVER (ORDER BY date) AS running_total FROM revenue ORDER BY date;' },

            { id: 'int-fb-s2-1', stage: 'stage2', prompt: 'Python: Получите bitcoin priceUsd из CoinCap через requests.', answer: 'import requests\nurl = "https://api.coincap.io/v2/assets/bitcoin"\nprice = requests.get(url).json()["data"]["priceUsd"]\nprint(price)' },
            { id: 'int-fb-s2-2', stage: 'stage2', prompt: 'Python: aiohttp retry с exponential backoff на 5 попыток.', answer: 'for i in range(5):\n    try:\n        async with session.get(url) as resp:\n            if resp.status in (429, 500, 502, 503, 504):\n                raise RuntimeError()\n            return await resp.json()\n    except Exception:\n        if i == 4:\n            raise\n        await asyncio.sleep(2 ** i)' },
            { id: 'int-fb-s2-3', stage: 'stage2', prompt: 'Python: pydantic модель TransactionEvent с amount > 0.', answer: 'from pydantic import BaseModel, Field\nfrom datetime import datetime\nclass TransactionEvent(BaseModel):\n    txn_id: int\n    user_id: str\n    amount: float = Field(gt=0)\n    event_ts: datetime' },
            { id: 'int-fb-s2-4', stage: 'stage2', prompt: 'Python: Dockerfile для etl.py на python:3.10-slim.', answer: 'FROM python:3.10-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY etl.py .\nCMD ["python", "etl.py"]' },
            { id: 'int-fb-s2-5', stage: 'stage2', prompt: 'Python: executemany вставка users_data в dim_users(id, username).', answer: 'insert_query = "INSERT INTO dim_users (id, username) VALUES (%s, %s);"\ncursor.executemany(insert_query, users_data)\nconn.commit()' },

            { id: 'int-fb-s3-1', stage: 'stage3', prompt: 'PySpark: join большого и маленького справочника через broadcast.', answer: 'from pyspark.sql.functions import broadcast\nresult = df_sales.join(broadcast(df_currency), on="currency_code", how="left")' },
            { id: 'int-fb-s3-2', stage: 'stage3', prompt: 'PySpark: включите AQE и покажите explain formatted.', answer: 'spark.conf.set("spark.sql.adaptive.enabled", "true")\njoined = df_big.join(df_ref, "user_id", "left")\njoined.explain("formatted")' },
            { id: 'int-fb-s3-3', stage: 'stage3', prompt: 'PySpark: агрегируйте purchase amount по user_id и date.', answer: 'from pyspark.sql.functions import col, sum\nresult = df.filter(col("event_type") == "purchase").groupBy("user_id", "date").agg(sum("amount").alias("total_amount"))' },
            { id: 'int-fb-s3-4', stage: 'stage3', prompt: 'PySpark: запишите result в parquet с partitionBy(date).', answer: 'result.write.partitionBy("date").mode("overwrite").parquet("output_data/")' },
            { id: 'int-fb-s3-5', stage: 'stage3', prompt: 'PySpark: базовый salting-шаблон для борьбы с skew.', answer: 'salted = df.withColumn("salt", floor(rand() * 20))\npart_agg = salted.groupBy("city", "salt").agg(spark_sum("amount").alias("part_sum"))\nresult = part_agg.groupBy("city").agg(spark_sum("part_sum").alias("total_amount"))' },

            { id: 'int-fb-s4-1', stage: 'stage4', prompt: 'Kafka Producer: отправляйте только amount > 0.', answer: 'for txn in transactions:\n    if txn["amount"] <= 0:\n        continue\n    producer.send("transactions", value=txn)\nproducer.flush()' },
            { id: 'int-fb-s4-2', stage: 'stage4', prompt: 'Kafka Consumer: manual commit после обработки батча.', answer: 'consumer = KafkaConsumer("transactions", enable_auto_commit=False)\nbatch = []\nfor msg in consumer:\n    batch.append(msg)\n    if len(batch) >= 100:\n        consumer.commit()\n        batch = []' },
            { id: 'int-fb-s4-3', stage: 'stage4', prompt: 'Spark Streaming: window 10 min + watermark 15 min.', answer: 'agg = parsed.withWatermark("event_time", "15 minutes").groupBy(window(col("event_time"), "10 minutes")).agg(spark_sum("amount").alias("total_amount"))' },
            { id: 'int-fb-s4-4', stage: 'stage4', prompt: 'Kafka consumer должен читать из топика transactions в группе de-consumer.', answer: 'consumer = KafkaConsumer("transactions", bootstrap_servers=["localhost:9092"], group_id="de-consumer")' },
            { id: 'int-fb-s4-5', stage: 'stage4', prompt: 'Schema compatibility правило для безопасной эволюции: режим BACKWARD.', answer: 'Compatibility: BACKWARD\nRule: add new fields only with default values and do not drop required fields.' },

            { id: 'int-fb-s5-1', stage: 'stage5', prompt: 'SQL DDL: ClickHouse MergeTree c TTL 180 days.', answer: 'CREATE TABLE fact_events (event_date Date, user_id UInt64, event_type LowCardinality(String), amount Float64) ENGINE = MergeTree PARTITION BY toYYYYMM(event_date) ORDER BY (event_date, user_id) TTL event_date + INTERVAL 180 DAY;' },
            { id: 'int-fb-s5-2', stage: 'stage5', prompt: 'SQL DDL: Таблица dim_products(product_id, product_name, category, price).', answer: 'CREATE TABLE dim_products (product_id INT PRIMARY KEY, product_name VARCHAR(150), category VARCHAR(50), price DECIMAL(10,2));' },
            { id: 'int-fb-s5-3', stage: 'stage5', prompt: 'SQL DDL: Таблица fact_sales с time_id, product_id, quantity, total_amount.', answer: 'CREATE TABLE fact_sales (sale_id INT PRIMARY KEY, time_id INT, product_id INT, quantity INT, total_amount DECIMAL(15,2));' },
            { id: 'int-fb-s5-4', stage: 'stage5', prompt: 'SQL DDL: Таблица dim_time(time_id, sale_date).', answer: 'CREATE TABLE dim_time (time_id INT PRIMARY KEY, sale_date DATE);' },
            { id: 'int-fb-s5-5', stage: 'stage5', prompt: 'SQL: Создайте индекс idx_orders_user_created_at для orders(user_id, created_at).', answer: 'CREATE INDEX idx_orders_user_created_at ON orders (user_id, created_at);' }
        ];

        const TASK_BANK_MANIFEST_SOURCE = 'data/tasks-manifest.json';
        const TASK_BANK_CACHE_BUST = '4';
        const QUESTIONS_CONTENT_AI_SOURCE = 'data/questions-content-ai.html';
        const QUESTIONS_CONTENT_LOCAL_SOURCE = 'data/questions-content.html';
        const CODING_CONTENT_AI_SOURCE = 'data/coding-content-ai.html';
        const CODING_CONTENT_LOCAL_SOURCE = 'data/coding-content.html';
        const INTERVIEW_QUESTION_BANK_SOURCE = 'data/interview-questions.json';
        const INTERVIEW_MIN_BANK_SIZE = 25;
        const INTERVIEW_STAGE_ORDER = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];
        const LIVE_CODING_GENERATED_TITLES_STORAGE_KEY = 'streamflow_generated_task_titles_v1';
        const LIVE_CODING_GITHUB_TOKEN_STORAGE_KEY = 'streamflow_github_token';
        const LIVE_CODING_SECTION_SELECTION_STORAGE_KEY = 'streamflow_coding_section_selection_v2';
        const LIVE_CODING_MODE_STORAGE_KEY = 'streamflow_coding_mode_v1';
        const QUESTIONS_MODE_STORAGE_KEY = 'streamflow_questions_mode_v1';
        const LIVE_CODING_STARTER_FALLBACK_TASKS_PER_STAGE = 6;
        const LIVE_CODING_STAGE_MODEL_LABELS = {
            1: 'SQL',
            2: 'Python',
            3: 'Spark',
            4: 'Kafka',
            5: 'Sys Design'
        };
        const LIVE_CODING_STAGE_CONTEXT_RULES = {
            1: {
                focus: 'SQL аналитика в PostgreSQL: JOIN, GROUP BY/HAVING, CTE, подзапросы, CASE, оконные функции, индексы, EXPLAIN ANALYZE, DWH SQL шаблоны',
                avoid: 'Python-скрипты, Spark API, Kafka топики, системный дизайн сервисов'
            },
            2: {
                focus: 'Python ETL, API интеграции, pydantic, retry/backoff, Airflow DAG',
                avoid: 'чистые SQL-only задачи, Spark оптимизация, Kafka streaming deep dive'
            },
            3: {
                focus: 'PySpark трансформации, оптимизация Spark jobs, partitioning, skew, AQE',
                avoid: 'базовые Python CRUD скрипты, Kafka offsets, ClickHouse DDL'
            },
            4: {
                focus: 'Kafka producer/consumer, schema registry, streaming windowing, exactly-once паттерны',
                avoid: 'чистые SQL задачи, базовые requests скрипты, ClickHouse storage tuning'
            },
            5: {
                focus: 'DWH/system design, modeling, ClickHouse, SLA/SLO, reliability и архитектурные trade-off',
                avoid: 'узкие задачки уровня синтаксиса SQL/Python без архитектурного контекста'
            }
        };
        const LIVE_CODING_GENERATOR_CONFIG = {
            apiUrl: 'https://models.inference.ai.azure.com/chat/completions',
            model: 'gpt-4o-mini',
            requestTimeoutMs: 25000,
            // Fallback token (avoid committing real secrets to git)
            token: ''
        };
        const LIVE_CODING_AI_REQUEST_ATTEMPTS = 2;
        const QUESTIONS_AI_REQUEST_ATTEMPTS = 4;
        const LIVE_CODING_MAX_CONSECUTIVE_FAILURES = 3;
        const LIVE_CODING_GENERATOR_MODEL_FALLBACKS = ['gpt-4o'];
        const LIVE_CODING_CANDIDATES_PER_REQUEST = 2;
        const LIVE_CODING_PROMPT_HISTORY_LIMITS = {
            globalTitles: 36,
            stageTitles: 24,
            moduleTitles: 14
        };
        const LIVE_CODING_AI_MIN_REQUEST_INTERVAL_MS = 1200;
        const LIVE_CODING_AI_RATE_LIMIT_COOLDOWN_MS = 30000;
        const LIVE_CODING_AI_RATE_LIMIT_MAX_COOLDOWN_MS = 120000;
        const LIVE_CODING_AI_RETRY_AFTER_BUFFER_MS = 1500;
        const LIVE_CODING_GENERATOR_SYSTEM_PROMPT = 'Ты генератор практических задач для подготовки к собеседованию на позицию middle data engineer. Стек: PostgreSQL, PySpark, Kafka, Airflow, ClickHouse. Таблицы используй реалистичные: fact_orders, dim_user, daily_stats, streams, revenue, events. Отвечай ТОЛЬКО валидным JSON без markdown, без пояснений, без текста вне JSON.';
        const QUESTIONS_AI_GENERATED_STORAGE_KEY = 'streamflow_ai_questions_v1';
        const QUESTIONS_AI_PACK_SIZE = 20;
        const QUESTIONS_AI_CATEGORY_ORDER = [
            'SQL и Базы Данных',
            'Python и PySpark',
            'Архитектура Хранилищ (DWH & Data Lake)',
            'Streaming и Оркестрация',
            'Моделирование и Качество данных'
        ];
        const QUESTIONS_AI_GENERATOR_SYSTEM_PROMPT = 'Ты создаешь вопросы для подготовки к собеседованию Data Engineer. Пиши на русском языке. Отвечай только валидным JSON без markdown и без текста вне JSON.';
        const LIVE_CODING_LOCAL_FALLBACK_TASK_POOL = {
            1: [
                {
                    title: 'Оконная аналитика по заказам',
                    description: 'Рассчитайте для каждого пользователя номер заказа по дате и cumulative сумму покупок.',
                    tables: 'orders(order_id, user_id, amount, created_at)',
                    placeholder: 'WITH ranked AS (...) SELECT ...',
                    hint: 'Используйте ROW_NUMBER() и SUM() OVER(PARTITION BY ... ORDER BY ...).',
                    solution: 'SELECT\n  user_id,\n  order_id,\n  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS order_rank,\n  SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_amount\nFROM orders;',
                    difficulty: 'medium'
                },
                {
                    title: 'Отчет по странам с HAVING',
                    description: 'Соберите количество заказов и сумму продаж по странам, оставьте только страны с оборотом выше порога.',
                    tables: 'orders(order_id, user_id, amount), users(user_id, country)',
                    placeholder: 'SELECT ... FROM ... JOIN ... GROUP BY ... HAVING ...',
                    hint: 'Сначала JOIN orders и users, затем GROUP BY country и HAVING SUM(amount).',
                    solution: 'SELECT\n  u.country,\n  COUNT(*) AS orders_cnt,\n  SUM(o.amount) AS total_amount\nFROM orders o\nJOIN users u ON u.user_id = o.user_id\nGROUP BY u.country\nHAVING SUM(o.amount) > 10000\nORDER BY total_amount DESC;',
                    difficulty: 'easy'
                }
            ],
            2: [
                {
                    title: 'Надежная загрузка API в staging',
                    description: 'Получите данные из REST API, провалидируйте обязательные поля и загрузите в staging-таблицу.',
                    tables: 'stg_events(event_id, payload, loaded_at)',
                    placeholder: 'import requests\n# fetch + validate + load',
                    hint: 'Разделите код на fetch -> validate -> load и добавьте retry.',
                    solution: 'import requests\nimport time\n\nfor attempt in range(3):\n    try:\n        response = requests.get("https://example.com/events", timeout=15)\n        response.raise_for_status()\n        data = response.json()\n        valid = [item for item in data if item.get("event_id") and item.get("event_ts")]\n        # insert valid into stg_events\n        break\n    except Exception:\n        if attempt == 2:\n            raise\n        time.sleep(2 ** attempt)',
                    difficulty: 'medium'
                },
                {
                    title: 'Airflow DAG с проверкой качества',
                    description: 'Смоделируйте DAG: extract -> transform -> dq_check -> load с ретраями на extract и dq_check.',
                    tables: 'stg_orders, dds_orders',
                    placeholder: 'with DAG(...) as dag:\n    ...',
                    hint: 'Используйте PythonOperator и fail-fast если dq_check не пройден.',
                    solution: 'from airflow import DAG\nfrom airflow.operators.python import PythonOperator\n\nwith DAG("orders_pipeline", schedule="@daily", catchup=False) as dag:\n    extract = PythonOperator(task_id="extract", python_callable=extract_fn, retries=3)\n    transform = PythonOperator(task_id="transform", python_callable=transform_fn)\n    dq_check = PythonOperator(task_id="dq_check", python_callable=dq_fn, retries=2)\n    load = PythonOperator(task_id="load", python_callable=load_fn)\n\n    extract >> transform >> dq_check >> load',
                    difficulty: 'medium'
                }
            ],
            3: [
                {
                    title: 'PySpark join с оптимизацией',
                    description: 'Соедините факты и справочник, минимизируйте shuffle и покажите explain.',
                    tables: 'df_events, df_users',
                    placeholder: 'from pyspark.sql.functions import ...',
                    hint: 'Для маленького справочника используйте broadcast join.',
                    solution: 'from pyspark.sql.functions import broadcast\n\njoined = df_events.join(broadcast(df_users), on="user_id", how="left")\nresult = joined.groupBy("country").count()\nresult.explain("formatted")',
                    difficulty: 'medium'
                },
                {
                    title: 'Борьба со skew через salting',
                    description: 'Разбейте горячие ключи на под-ключи и выполните двухшаговую агрегацию.',
                    tables: 'df_tx(user_id, city, amount)',
                    placeholder: 'from pyspark.sql.functions import ...',
                    hint: 'Добавьте salt-колонку, агрегируйте по (key, salt), затем финально по key.',
                    solution: 'from pyspark.sql.functions import rand, floor, sum as spark_sum\n\nsalted = df_tx.withColumn("salt", floor(rand() * 20))\npart = salted.groupBy("city", "salt").agg(spark_sum("amount").alias("part_sum"))\nfinal = part.groupBy("city").agg(spark_sum("part_sum").alias("total_amount"))',
                    difficulty: 'hard'
                }
            ],
            4: [
                {
                    title: 'Kafka consumer с manual commit',
                    description: 'Реализуйте чтение батчами и коммит offset только после успешной обработки.',
                    tables: 'topic: transactions',
                    placeholder: 'from kafka import KafkaConsumer\n...',
                    hint: 'enable_auto_commit=False и commit после обработки батча.',
                    solution: 'from kafka import KafkaConsumer\n\nconsumer = KafkaConsumer("transactions", enable_auto_commit=False, group_id="de-group")\nbatch = []\nfor msg in consumer:\n    batch.append(msg.value)\n    if len(batch) >= 100:\n        process_batch(batch)\n        consumer.commit()\n        batch = []',
                    difficulty: 'medium'
                },
                {
                    title: 'Streaming окно и watermark',
                    description: 'Постройте агрегат сумм по 10-минутным окнам с учетом опоздавших событий.',
                    tables: 'stream events(event_time, amount)',
                    placeholder: 'parsed.withWatermark(...).groupBy(window(...))',
                    hint: 'Используйте withWatermark + window и агрегируйте sum(amount).',
                    solution: 'from pyspark.sql.functions import window, col, sum as spark_sum\n\nagg = parsed\n  .withWatermark("event_time", "15 minutes")\n  .groupBy(window(col("event_time"), "10 minutes"))\n  .agg(spark_sum("amount").alias("total_amount"))',
                    difficulty: 'medium'
                }
            ],
            5: [
                {
                    title: 'Star schema для продаж',
                    description: 'Опишите DDL для fact_sales и двух измерений, укажите ключи и grain.',
                    tables: 'fact_sales, dim_product, dim_date',
                    placeholder: 'CREATE TABLE ...',
                    hint: 'Сначала определите grain факта, затем FK на измерения.',
                    solution: 'CREATE TABLE dim_product (\n  product_id INT PRIMARY KEY,\n  category TEXT,\n  product_name TEXT\n);\n\nCREATE TABLE dim_date (\n  date_id INT PRIMARY KEY,\n  full_date DATE\n);\n\nCREATE TABLE fact_sales (\n  sale_id BIGINT PRIMARY KEY,\n  date_id INT REFERENCES dim_date(date_id),\n  product_id INT REFERENCES dim_product(product_id),\n  amount NUMERIC(12,2),\n  quantity INT\n);',
                    difficulty: 'medium'
                },
                {
                    title: 'SLA и алертинг для ETL',
                    description: 'Предложите контрольные метрики и алерты для ежедневного пайплайна загрузки.',
                    tables: 'pipeline_runs(run_id, started_at, finished_at, status, rows_loaded)',
                    placeholder: 'Опишите метрики и SQL/псевдокод проверки...',
                    hint: 'Добавьте latency, completeness, freshness и пороги алертов.',
                    solution: 'Ключевые проверки:\n1) Freshness: max(event_date) >= current_date - 1.\n2) Completeness: rows_loaded >= p95 за 14 дней * 0.8.\n3) SLA: finished_at - started_at <= 45 минут.\n\nПример SQL:\nSELECT\n  run_id,\n  status,\n  EXTRACT(EPOCH FROM (finished_at - started_at))/60 AS duration_min\nFROM pipeline_runs\nWHERE run_id = :run_id;',
                    difficulty: 'hard'
                }
            ]
        };
        const QUESTIONS_LOCAL_FALLBACK_POOL = [
            {
                category: 'SQL и Базы Данных',
                question: 'Как выбрать индекс под фильтр status + диапазон created_at?',
                answer: 'Обычно подходит составной индекс по (status, created_at), но порядок зависит от селективности. Важно проверить план через EXPLAIN ANALYZE и оценить влияние на запись.'
            },
            {
                category: 'SQL и Базы Данных',
                question: 'Когда стоит использовать materialized view вместо обычного view?',
                answer: 'Materialized view полезен для тяжелой агрегации, которую дорого считать на лету. Он хранит результат физически, но требует refresh и контроля актуальности.'
            },
            {
                category: 'Python и PySpark',
                question: 'Как в ETL сделать retry без дублирования уже загруженных данных?',
                answer: 'Нужна идемпотентность: use upsert/merge, дедуп по business key и контроль watermark/checkpoint. Retry должен повторять шаг безопасно без повторной записи дублей.'
            },
            {
                category: 'Python и PySpark',
                question: 'Почему DataFrame API в Spark обычно предпочтительнее RDD?',
                answer: 'DataFrame позволяет Catalyst оптимизировать план, включая pushdown и выбор стратегий join. Это дает стабильный прирост по производительности и удобнее для поддержки.'
            },
            {
                category: 'Архитектура Хранилищ (DWH & Data Lake)',
                question: 'Как выбрать grain фактовой таблицы при проектировании витрины?',
                answer: 'Сначала фиксируют бизнес-событие как атомарную запись и только потом строят агрегаты. Grain должен быть однозначным, иначе сложно обеспечить консистентность метрик.'
            },
            {
                category: 'Архитектура Хранилищ (DWH & Data Lake)',
                question: 'Зачем разделять слои staging и dds?',
                answer: 'Staging хранит сырые или почти сырые данные для трассируемости, а DDS — очищенные и согласованные сущности. Это упрощает отладку, replay и управление качеством.'
            },
            {
                category: 'Streaming и Оркестрация',
                question: 'Что контролировать в Kafka consumer lag и почему это важно?',
                answer: 'Lag показывает отставание обработки от потока событий и напрямую влияет на freshness данных. Резкий рост lag обычно сигнализирует о деградации consumer или инфраструктуры.'
            },
            {
                category: 'Streaming и Оркестрация',
                question: 'Как watermark влияет на поздние события в стриминге?',
                answer: 'Watermark ограничивает, как долго система ждет опоздавшие события. Слишком маленький watermark повышает риск потери late data, слишком большой увеличивает задержку результата.'
            },
            {
                category: 'Моделирование и Качество данных',
                question: 'Какие базовые DQ-проверки ставить перед загрузкой в витрину?',
                answer: 'Минимум: not null на ключах, уникальность бизнес-ключей, допустимые диапазоны значений и referential integrity. Плюс сверка объемов с историческими окнами.'
            },
            {
                category: 'Моделирование и Качество данных',
                question: 'Когда выбирать SCD Type 2 и какие риски у него есть?',
                answer: 'SCD2 используют, когда нужна история изменений атрибутов во времени. Риски: рост таблицы, усложнение join и требований к корректному закрытию интервалов valid_from/valid_to.'
            }
        ];
        let taskBankManifest = null;
        let taskBankManifestPromise = null;
        let interviewQuestionBank = [...FALLBACK_INTERVIEW_QUESTION_BANK];
        let interviewQuestionBankLoaded = false;
        let interviewQuestionBankPromise = null;
        let isGeneratingStarterPack = false;
        let isGeneratingCustomPack = false;
        let liveCodingRequestGate = {
            models: {}
        };

        let interviewState = {
            questions: [],
            currentIndex: 0,
            answers: {},
            results: {},
            startedAt: null,
            durationMinutes: 45,
            isRunning: false,
            isFinished: false,
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

        function getAppBasePath() {
            let basePath = '';
            if (window.location.hostname.includes('github.io')) {
                const parts = window.location.pathname.split('/');
                if (parts.length > 1 && parts[1] !== '') {
                    basePath = `/${parts[1]}/`;
                }
            }
            return basePath;
        }

        function resolveTaskSourceUrl(sourcePath) {
            if (!sourcePath || typeof sourcePath !== 'string') return '';

            const trimmed = sourcePath.trim();
            if (!trimmed) return '';

            if (/^https?:\/\//i.test(trimmed)) {
                return trimmed;
            }

            const normalized = trimmed.replace(/^\.\//, '').replace(/^\//, '');
            return `${getAppBasePath()}${normalized}`;
        }

        function withCacheBust(url, bustKey = TASK_BANK_CACHE_BUST) {
            if (!url) return '';
            return url.includes('?') ? `${url}&v=${bustKey}` : `${url}?v=${bustKey}`;
        }

        async function loadTaskBankManifest(forceReload = false) {
            if (taskBankManifest && !forceReload) {
                return taskBankManifest;
            }

            if (taskBankManifestPromise && !forceReload) {
                return taskBankManifestPromise;
            }

            const manifestUrl = withCacheBust(resolveTaskSourceUrl(TASK_BANK_MANIFEST_SOURCE));
            taskBankManifestPromise = fetch(manifestUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Не удалось загрузить манифест задач: ${response.status}`);
                    }
                    return response.json();
                })
                .then(payload => {
                    if (!payload || typeof payload !== 'object') {
                        throw new Error('Манифест задач имеет неверный формат');
                    }
                    taskBankManifest = payload;
                    return taskBankManifest;
                })
                .catch(error => {
                    console.warn('Не удалось загрузить манифест задач, использую локальные источники:', error);
                    taskBankManifest = null;
                    return null;
                })
                .finally(() => {
                    taskBankManifestPromise = null;
                });

            return taskBankManifestPromise;
        }

        function getTaskBankSectionConfig(sectionName) {
            const sections = taskBankManifest?.sections;
            if (!sections || typeof sections !== 'object') {
                return null;
            }

            const sectionConfig = sections[sectionName];
            if (!sectionConfig || typeof sectionConfig !== 'object') {
                return null;
            }

            return sectionConfig;
        }

        function getTaskBankSectionUrl(sectionName, fallbackSource) {
            const sectionConfig = getTaskBankSectionConfig(sectionName);
            const configuredUrl = typeof sectionConfig?.url === 'string' ? sectionConfig.url.trim() : '';
            const resolved = configuredUrl || fallbackSource;
            return resolveTaskSourceUrl(resolved);
        }

        function getTaskBankSectionMinItems(sectionName, fallbackMinItems) {
            const sectionConfig = getTaskBankSectionConfig(sectionName);
            const configuredMinItems = Number(sectionConfig?.minItems);
            return Number.isFinite(configuredMinItems) && configuredMinItems > 0
                ? Math.floor(configuredMinItems)
                : fallbackMinItems;
        }

        function getGitHubModelsToken() {
            const runtimeToken = typeof window !== 'undefined'
                ? (window.STREAMFLOW_CONFIG?.GITHUB_TOKEN || '')
                : '';

            const envToken = (typeof process !== 'undefined'
                && process
                && process.env
                && typeof process.env.GITHUB_TOKEN === 'string')
                ? process.env.GITHUB_TOKEN
                : '';

            let localToken = '';
            try {
                localToken = localStorage.getItem(LIVE_CODING_GITHUB_TOKEN_STORAGE_KEY) || '';
            } catch (error) {
                localToken = '';
            }

            return String(runtimeToken || envToken || localToken || LIVE_CODING_GENERATOR_CONFIG.token || '').trim();
        }

        function saveGitHubModelsToken(token) {
            try {
                localStorage.setItem(LIVE_CODING_GITHUB_TOKEN_STORAGE_KEY, String(token || '').trim());
            } catch (error) {
                // noop
            }
        }

        function clearGitHubModelsToken() {
            try {
                localStorage.removeItem(LIVE_CODING_GITHUB_TOKEN_STORAGE_KEY);
            } catch (error) {
                // noop
            }
        }

        function promptForGitHubModelsToken(prefillValue = '') {
            const message = [
                'Введите GitHub token для генерации задач (GitHub Models).',
                'Токен будет сохранен локально только в этом браузере.',
                'Оставьте пустым, чтобы удалить сохраненный токен.'
            ].join('\n');

            const value = window.prompt(message, String(prefillValue || '').trim());
            if (value === null) {
                return null;
            }

            return String(value).trim();
        }

        function getMaskedTokenLabel(token) {
            const normalized = String(token || '').trim();
            if (!normalized) return '';
            if (normalized.length <= 8) return '••••••••';
            return `${normalized.slice(0, 4)}••••${normalized.slice(-4)}`;
        }

        function updateTokenSettingsButtonState(button) {
            if (!button) return;

            const hasToken = Boolean(getGitHubModelsToken());
            button.classList.toggle('token-ready', hasToken);
            button.textContent = hasToken ? 'Токен: задан' : 'Указать токен';
            button.title = hasToken
                ? 'Токен найден. Нажмите, чтобы заменить или удалить.'
                : 'Нажмите, чтобы указать токен GitHub Models.';
        }

            function refreshTokenSettingsButtons() {
                document.querySelectorAll('.token-config-btn').forEach(updateTokenSettingsButtonState);
            }

        function openGitHubTokenSettings(tokenButton = null) {
            const currentToken = getGitHubModelsToken();
            const inputToken = promptForGitHubModelsToken(currentToken);

            if (inputToken === null) {
                if (tokenButton) updateTokenSettingsButtonState(tokenButton);
                return currentToken;
            }

            if (!inputToken) {
                clearGitHubModelsToken();
                showSuccessMessage('Токен удален из localStorage.');
                refreshTokenSettingsButtons();
                return '';
            }

            saveGitHubModelsToken(inputToken);
            showSuccessMessage(`Токен сохранен (${getMaskedTokenLabel(inputToken)}).`);
            refreshTokenSettingsButtons();
            return inputToken;
        }

        function normalizeTitleValue(rawTitle) {
            return String(rawTitle || '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function normalizeCodingMode(rawMode) {
            const mode = String(rawMode || '').trim().toLowerCase();
            return mode === 'local' ? 'local' : 'ai';
        }

        function getStoredCodingMode() {
            try {
                return normalizeCodingMode(localStorage.getItem(LIVE_CODING_MODE_STORAGE_KEY));
            } catch (error) {
                return 'ai';
            }
        }

        function saveStoredCodingMode(mode) {
            try {
                localStorage.setItem(LIVE_CODING_MODE_STORAGE_KEY, normalizeCodingMode(mode));
            } catch (error) {
                // noop
            }
        }

        function normalizeQuestionsMode(rawMode) {
            const mode = String(rawMode || '').trim().toLowerCase();
            return mode === 'ai' ? 'ai' : 'local';
        }

        function getStoredQuestionsMode() {
            try {
                return normalizeQuestionsMode(localStorage.getItem(QUESTIONS_MODE_STORAGE_KEY));
            } catch (error) {
                return 'local';
            }
        }

        function saveStoredQuestionsMode(mode) {
            try {
                localStorage.setItem(QUESTIONS_MODE_STORAGE_KEY, normalizeQuestionsMode(mode));
            } catch (error) {
                // noop
            }
        }

        function isCodingAiMode(root = null) {
            const rootMode = String(root?.dataset?.codingMode || '').trim().toLowerCase();
            if (rootMode === 'ai' || rootMode === 'local') {
                return rootMode === 'ai';
            }

            return getStoredCodingMode() === 'ai';
        }

        function isQuestionsAiMode(root = null) {
            const rootMode = String(root?.dataset?.questionsMode || '').trim().toLowerCase();
            if (rootMode === 'ai' || rootMode === 'local') {
                return rootMode === 'ai';
            }

            return getStoredQuestionsMode() === 'ai';
        }

        function hasGeneratedCodingTasks(root) {
            return Boolean(root?.querySelector('.generated-task-box'));
        }

        function applyCodingAiModeVisibility(root) {
            if (!root) return;
            if (!isCodingAiMode(root)) return;

            const taskBoxes = root.querySelectorAll('.task-box[data-task-id]');
            taskBoxes.forEach(taskBox => {
                taskBox.style.display = '';
            });

            const note = root.querySelector('.coding-ai-mode-note');
            if (!note) return;

            if (hasGeneratedCodingTasks(root)) {
                note.textContent = 'Режим "С ИИ": задачи ниже сгенерированы через AI.';
                return;
            }

            if (!getGitHubModelsToken()) {
                note.textContent = 'Режим "С ИИ": укажите токен и сгенерируйте задачи.';
                return;
            }

            note.textContent = 'Режим "С ИИ": локальный fallback отключен, генерируются только AI-задачи.';
        }

        function ensureCodingTaskSourceLabels(root) {
            if (!root) return;
            root.querySelectorAll('.task-source-inline').forEach(node => node.remove());
        }

        function getLiveCodingRateLimitRemainingMs(model = null) {
            if (!model) {
                return 0;
            }
            const modelState = liveCodingRequestGate.models[model] || {};
            const nextAllowedAt = Number(modelState.nextAllowedAt || 0);
            if (!Number.isFinite(nextAllowedAt) || nextAllowedAt <= 0) {
                return 0;
            }
            return Math.max(0, nextAllowedAt - Date.now());
        }

        function updateLiveCodingRateLimitRemainingMs(model, cooldownMs) {
            if (!model) return;
            const modelState = liveCodingRequestGate.models[model] || { nextAllowedAt: 0, lastRequestAt: 0 };
            modelState.nextAllowedAt = Math.max(
                Number(modelState.nextAllowedAt || 0),
                Date.now() + cooldownMs
            );
            liveCodingRequestGate.models[model] = modelState;
        }

        function setLiveCodingLastRequestAt(model) {
            if (!model) return;
            const modelState = liveCodingRequestGate.models[model] || { nextAllowedAt: 0, lastRequestAt: 0 };
            modelState.lastRequestAt = Date.now();
            liveCodingRequestGate.models[model] = modelState;
        }

        function getLiveCodingLastRequestAt(model) {
            if (!model) return 0;
            const modelState = liveCodingRequestGate.models[model] || {};
            return Number(modelState.lastRequestAt || 0);
        }

        function parseRetryAfterToMs(retryAfterValue) {
            const rawValue = String(retryAfterValue || '').trim();
            if (!rawValue) {
                return 0;
            }

            const parsedSeconds = Number(rawValue);
            if (Number.isFinite(parsedSeconds) && parsedSeconds >= 0) {
                return Math.floor(parsedSeconds * 1000);
            }

            const parsedDate = Date.parse(rawValue);
            if (Number.isFinite(parsedDate)) {
                return Math.max(0, parsedDate - Date.now());
            }

            return 0;
        }

        function buildRateLimitCooldownMs(retryAfterMs = 0) {
            const parsedRetryAfterMs = Number(retryAfterMs);
            const retryAfterWithBuffer = Number.isFinite(parsedRetryAfterMs) && parsedRetryAfterMs > 0
                ? parsedRetryAfterMs + LIVE_CODING_AI_RETRY_AFTER_BUFFER_MS
                : LIVE_CODING_AI_RATE_LIMIT_COOLDOWN_MS;

            return Math.max(
                LIVE_CODING_AI_RATE_LIMIT_COOLDOWN_MS,
                Math.min(LIVE_CODING_AI_RATE_LIMIT_MAX_COOLDOWN_MS, Math.floor(retryAfterWithBuffer))
            );
        }

        function createLiveCodingRateLimitError(retryAfterMs = 0) {
            const waitMs = buildRateLimitCooldownMs(retryAfterMs);
            const waitSeconds = Math.max(1, Math.ceil(waitMs / 1000));
            const error = new Error(`GitHub Models API: 429; retry-after=${waitSeconds}s`);

            error.statusCode = 429;
            error.retryAfterMs = waitMs;
            error.isRateLimit = true;

            return error;
        }

        function isLiveCodingRateLimitError(error) {
            if (!error) {
                return false;
            }

            if (Number(error.statusCode) === 429 || error.isRateLimit) {
                return true;
            }

            const normalized = String(error.message || '').toLowerCase();
            return normalized.includes('429') || normalized.includes('rate limit') || normalized.includes('too many requests');
        }

        function describeLiveCodingGenerationError(error) {
            const message = String(error?.message || error || '').trim();
            const normalized = message.toLowerCase();

            if (!normalized) {
                return {
                    code: 'unknown',
                    userMessage: 'Сервис AI временно недоступен. Повторите попытку чуть позже.'
                };
            }

            if (normalized.includes('401') || normalized.includes('403') || normalized.includes('токен')) {
                return {
                    code: 'token',
                    userMessage: 'Проблема с токеном: проверьте валидность и сохраните токен заново.'
                };
            }

            if (normalized.includes('429') || normalized.includes('rate limit') || normalized.includes('too many requests') || isLiveCodingRateLimitError(error)) {
                // Approximate from the error property or default to a reasonable minute
                const waitMs = Math.max(
                    Number(error?.retryAfterMs || 0),
                    LIVE_CODING_AI_RATE_LIMIT_COOLDOWN_MS
                );
                const waitSeconds = waitMs > 0
                    ? Math.max(15, Math.ceil(waitMs / 1000))
                    : 45;

                return {
                    code: 'rate-limit',
                    userMessage: `Лимит запросов к AI исчерпан для всех доступных моделей. Подождите около ${waitSeconds} сек и повторите.`
                };
            }

            if (normalized.includes('таймаут') || normalized.includes('aborterror') || normalized.includes('timeout')) {
                return {
                    code: 'timeout',
                    userMessage: 'AI отвечает слишком долго. Повторите генерацию или уменьшите размер пакета.'
                };
            }

            if (normalized.includes('уникальн') || normalized.includes('дубли')) {
                return {
                    code: 'duplicates',
                    userMessage: 'AI вернул дубли задач. Смените этап/модуль или повторите попытку.'
                };
            }

            if (normalized.includes('не по выбранному модулю') || normalized.includes('модул')) {
                return {
                    code: 'module-mismatch',
                    userMessage: 'AI вернул задачу не по выбранному модулю. Повторите генерацию или выберите другой модуль.'
                };
            }

            if (['500', '502', '503', '504'].some(code => normalized.includes(`api: ${code}`) || normalized.includes(` ${code}`))) {
                return {
                    code: 'server',
                    userMessage: 'Сервер AI временно недоступен. Повторите чуть позже.'
                };
            }

            return {
                code: 'generic',
                userMessage: 'Ошибка AI API. Повторите попытку через несколько секунд.'
            };
        }

        function saveLiveCodingFailureState(failureState, error) {
            if (!failureState || typeof failureState !== 'object') return;
            failureState.lastError = error || null;
            failureState.lastReason = describeLiveCodingGenerationError(error);
        }

        function getStoredGeneratedTaskTitles() {
            try {
                const parsed = JSON.parse(localStorage.getItem(LIVE_CODING_GENERATED_TITLES_STORAGE_KEY) || '[]');
                if (!Array.isArray(parsed)) return [];
                return parsed
                    .map(normalizeTitleValue)
                    .filter(Boolean)
                    .slice(-300);
            } catch (error) {
                return [];
            }
        }

        function saveStoredGeneratedTaskTitles(titles) {
            const uniqueTitles = Array.from(new Set((titles || [])
                .map(normalizeTitleValue)
                .filter(Boolean)));

            localStorage.setItem(
                LIVE_CODING_GENERATED_TITLES_STORAGE_KEY,
                JSON.stringify(uniqueTitles.slice(-300))
            );
        }

        function rememberGeneratedTaskTitle(title) {
            const normalized = normalizeTitleValue(title);
            if (!normalized) return;
            const current = getStoredGeneratedTaskTitles();
            if (!current.includes(normalized)) {
                current.push(normalized);
                saveStoredGeneratedTaskTitles(current);
            }
        }

        function syncGeneratedTaskTitlesFromCodingDom(root) {
            if (!root) return;

            const domTitles = Array.from(root.querySelectorAll('.task-box h4'))
                .map(el => normalizeTitleValue(el.textContent))
                .filter(Boolean);

            const merged = getStoredGeneratedTaskTitles().concat(domTitles);
            saveStoredGeneratedTaskTitles(merged);
        }

        function isStageHeadingElement(node) {
            return Boolean(
                node
                && node.tagName === 'H2'
                && /Практические\s+Задачи\s*\(Этап\s*\d+\)/i.test(node.textContent || '')
            );
        }

        function isCodingSectionHeadingElement(node) {
            return Boolean(
                node
                && node.tagName === 'H2'
                && /Практические\s+Задачи\s*\((Этап\s*\d+|Математика[^)]*)\)/i.test(node.textContent || '')
            );
        }

        function getCodingSectionKeyFromHeading(headingText, fallbackIndex = 0) {
            const text = String(headingText || '');
            const stageMatch = text.match(/Этап\s*(\d+)/i);
            if (stageMatch) {
                return `stage${stageMatch[1]}`;
            }

            if (/матем/i.test(text)) {
                return 'math';
            }

            return `section-${fallbackIndex}`;
        }

        function getCodingSectionLabelFromHeading(headingText, fallbackIndex = 0) {
            const text = String(headingText || '');
            const stageMatch = text.match(/Этап\s*(\d+)/i);
            if (stageMatch) {
                return `Этап ${stageMatch[1]}`;
            }

            if (/матем/i.test(text)) {
                return 'Математика';
            }

            return `Раздел ${fallbackIndex + 1}`;
        }

        function collectCodingSections(root) {
            if (!root) return [];

            const wrappedSections = Array.from(root.querySelectorAll('.coding-section-group[data-section-key]'));
            if (wrappedSections.length > 0) {
                return wrappedSections.map((container, index) => {
                    const heading = container.querySelector('h2');
                    const key = String(container.dataset.sectionKey || getCodingSectionKeyFromHeading(heading?.textContent, index))
                        .trim()
                        .toLowerCase();
                    const label = String(container.dataset.sectionLabel || getCodingSectionLabelFromHeading(heading?.textContent, index)).trim();

                    return {
                        key,
                        label,
                        heading,
                        nodes: [container],
                        container
                    };
                });
            }

            const headings = Array.from(root.querySelectorAll('h2'))
                .filter(isCodingSectionHeadingElement);

            const usedKeys = new Set();

            const sections = headings.map((heading, index) => {
                const nodes = [heading];

                let pointer = heading.nextElementSibling;
                while (pointer && !isCodingSectionHeadingElement(pointer)) {
                    nodes.push(pointer);
                    pointer = pointer.nextElementSibling;
                }

                const baseKey = String(getCodingSectionKeyFromHeading(heading.textContent, index))
                    .trim()
                    .toLowerCase() || `section-${index + 1}`;

                let uniqueKey = baseKey;
                let duplicateSuffix = 2;
                while (usedKeys.has(uniqueKey)) {
                    uniqueKey = `${baseKey}-${duplicateSuffix}`;
                    duplicateSuffix += 1;
                }
                usedKeys.add(uniqueKey);

                return {
                    key: uniqueKey,
                    label: getCodingSectionLabelFromHeading(heading.textContent, index),
                    heading,
                    nodes,
                    container: null
                };
            });

            sections.forEach(section => {
                const parent = section.heading?.parentElement;
                if (!parent) return;

                const wrapper = document.createElement('section');
                wrapper.className = 'coding-section-group';
                wrapper.dataset.sectionKey = section.key;
                wrapper.dataset.sectionLabel = section.label;

                parent.insertBefore(wrapper, section.heading);
                section.nodes.forEach(node => wrapper.appendChild(node));

                section.container = wrapper;
                section.nodes = [wrapper];
            });

            return sections;
        }

        function normalizeCodingSectionSelectionOrder(selection, sections) {
            const allowedKeys = new Set((sections || []).map(section => section.key));
            const normalized = [];

            (Array.isArray(selection) ? selection : []).forEach(rawKey => {
                const key = String(rawKey || '').trim().toLowerCase();
                if (!key || !allowedKeys.has(key) || normalized.includes(key)) return;
                normalized.push(key);
            });

            return normalized;
        }

        function getStoredCodingSectionSelectionOrder() {
            try {
                const raw = localStorage.getItem(LIVE_CODING_SECTION_SELECTION_STORAGE_KEY);
                if (raw === null) return null;

                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) return [];

                return parsed
                    .map(item => String(item || '').trim().toLowerCase())
                    .filter(Boolean);
            } catch (error) {
                return null;
            }
        }

        function saveStoredCodingSectionSelectionOrder(selection) {
            try {
                const normalized = Array.from(new Set((Array.isArray(selection) ? selection : [])
                    .map(item => String(item || '').trim().toLowerCase())
                    .filter(Boolean)));

                localStorage.setItem(
                    LIVE_CODING_SECTION_SELECTION_STORAGE_KEY,
                    JSON.stringify(normalized)
                );
            } catch (error) {
                // noop
            }
        }

        function getCodingPracticeSwitcher(root) {
            const contentContainer = root?.querySelector('.page-content') || root;
            return contentContainer?.querySelector('.coding-practice-switcher') || null;
        }

        function readCodingSelectionFromSwitcher(switcher) {
            if (!switcher) return [];

            try {
                const parsed = JSON.parse(switcher.dataset.selection || '[]');
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                return [];
            }
        }

        function refreshCodingPracticeSelectorState(root, selectedOrder, sections = null) {
            const switcher = getCodingPracticeSwitcher(root);
            if (!switcher) return;

            const activeSections = Array.isArray(sections) && sections.length > 0
                ? sections
                : collectCodingSections(root);

            const normalized = normalizeCodingSectionSelectionOrder(selectedOrder, activeSections);
            const activeOrderMap = new Map(normalized.map((key, index) => [key, index + 1]));

            switcher.dataset.selection = JSON.stringify(normalized);

            switcher.querySelectorAll('.coding-practice-chip').forEach(button => {
                const key = String(button.dataset.sectionKey || '').trim().toLowerCase();
                const orderNumber = activeOrderMap.get(key) || 0;
                const isActive = orderNumber > 0;

                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');

                const orderBadge = button.querySelector('.coding-practice-chip-order');
                if (orderBadge) {
                    orderBadge.textContent = isActive ? String(orderNumber) : '';
                }
            });

            const hint = switcher.querySelector('.coding-practice-hint');
            if (!hint) return;

            if (normalized.length === 0) {
                hint.textContent = 'Выберите один или несколько этапов, чтобы показать их задачи.';
                return;
            }

            hint.textContent = `Выбрано этапов: ${normalized.length}. Задачи идут в порядке ваших нажатий.`;
        }

        function applyCodingSectionSelection(root, selectionOrder) {
            const sections = collectCodingSections(root);
            if (sections.length === 0) return;

            const normalized = normalizeCodingSectionSelectionOrder(selectionOrder, sections);
            const selectedSet = new Set(normalized);
            const sectionByKey = new Map(sections.map(section => [section.key, section]));

            const parent = sections[0]?.container?.parentElement
                || sections[0]?.nodes?.[0]?.parentElement
                || null;

            if (parent) {
                normalized.forEach(key => {
                    const section = sectionByKey.get(key);
                    if (section?.container && section.container.parentElement === parent) {
                        parent.appendChild(section.container);
                    }
                });

                sections.forEach(section => {
                    const container = section.container || section.nodes[0];
                    if (!container || container.parentElement !== parent) return;
                    if (!selectedSet.has(section.key)) {
                        parent.appendChild(container);
                    }
                });
            }

            sections.forEach(section => {
                const visible = selectedSet.has(section.key);
                const container = section.container || section.nodes[0];

                if (container) {
                    container.style.display = visible ? '' : 'none';
                    return;
                }

                section.nodes.forEach(node => {
                    node.style.display = visible ? '' : 'none';
                });
            });

            saveStoredCodingSectionSelectionOrder(normalized);
            refreshCodingPracticeSelectorState(root, normalized, sections);
        }

        function getVisibleCodingStageHeadings(root) {
            const sections = collectCodingSections(root);
            const visibleHeadings = [];

            sections.forEach(section => {
                const container = section.container || section.nodes?.[0] || null;
                if (!container || container.style.display === 'none') return;

                container.querySelectorAll('h2').forEach(heading => {
                    if (isStageHeadingElement(heading)) {
                        visibleHeadings.push(heading);
                    }
                });
            });

            return visibleHeadings;
        }

        function refreshCodingStageGenerationControls(root) {
            if (!root) return;
            try {
                root.querySelectorAll('.coding-stage-actions').forEach(control => control.remove());
                if (isCodingAiMode(root)) {
                    ensureCodingAiModeControls(root);
                }
            } catch (error) {
                console.error('Не удалось обновить контролы генерации по разделам:', error);
            }
        }

        function ensureCodingPracticeSelector(root) {
            if (!root) return;

            const sections = collectCodingSections(root);
            if (sections.length === 0) return;

            const contentContainer = root.querySelector('.page-content') || root;
            const pageHeader = contentContainer.querySelector('.page-header');
            if (!pageHeader) return;

            let switcher = contentContainer.querySelector('.coding-practice-switcher');
            if (!switcher) {
                switcher = document.createElement('div');
                switcher.className = 'coding-practice-switcher';

                const label = document.createElement('p');
                label.className = 'coding-practice-label';
                label.textContent = 'Выберите этапы:';

                const chips = document.createElement('div');
                chips.className = 'coding-practice-chips';

                sections.forEach(section => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'coding-practice-chip';
                    chip.dataset.sectionKey = section.key;
                    chip.setAttribute('aria-pressed', 'false');

                    const chipLabel = document.createElement('span');
                    chipLabel.className = 'coding-practice-chip-label';
                    chipLabel.textContent = section.label;

                    const chipOrder = document.createElement('span');
                    chipOrder.className = 'coding-practice-chip-order';
                    chipOrder.textContent = '';

                    chip.appendChild(chipLabel);
                    chip.appendChild(chipOrder);

                    chip.addEventListener('click', () => {
                        const currentSelection = readCodingSelectionFromSwitcher(switcher);
                        const normalizedCurrent = normalizeCodingSectionSelectionOrder(currentSelection, collectCodingSections(root));

                        let nextSelection = [];
                        if (normalizedCurrent.includes(section.key)) {
                            nextSelection = normalizedCurrent.filter(key => key !== section.key);
                        } else {
                            nextSelection = normalizedCurrent.concat(section.key);
                        }

                        applyCodingSectionSelection(root, nextSelection);
                        refreshCodingStageGenerationControls(root);
                    });

                    chips.appendChild(chip);
                });

                const hint = document.createElement('p');
                hint.className = 'coding-practice-hint';
                hint.textContent = '';

                switcher.appendChild(label);
                switcher.appendChild(chips);
                switcher.appendChild(hint);
                pageHeader.insertAdjacentElement('afterend', switcher);
            }

            const storedSelection = getStoredCodingSectionSelectionOrder();
            const initialSelection = storedSelection === null
                ? sections.map(section => section.key)
                : normalizeCodingSectionSelectionOrder(storedSelection, sections);

            applyCodingSectionSelection(root, initialSelection);
            refreshCodingStageGenerationControls(root);
        }

        function extractStageNumberFromHeading(headingText) {
            const match = String(headingText || '').match(/Этап\s*(\d+)/i);
            return match ? Number(match[1]) : 0;
        }

        function normalizeTaskTitleList(titles) {
            const normalized = (Array.isArray(titles) ? titles : [])
                .map(normalizeTitleValue)
                .filter(Boolean);
            return Array.from(new Set(normalized));
        }

        function getTaskTitlesFromBoxes(taskBoxes) {
            return normalizeTaskTitleList(
                (Array.isArray(taskBoxes) ? taskBoxes : [])
                    .map(box => normalizeTitleValue(box?.querySelector?.('h4')?.textContent || ''))
            );
        }

        function getStageContextRule(stageNumber) {
            return LIVE_CODING_STAGE_CONTEXT_RULES[stageNumber] || {
                focus: 'Практическая задача для middle data engineer с реалистичным прод-контекстом',
                avoid: 'дубли существующих задач и темы из соседних этапов'
            };
        }

        function getModuleScopeByName(stageScope, moduleName) {
            const normalizedTarget = normalizeTitleValue(moduleName).toLowerCase();
            const scopes = stageScope?.moduleScopes || [];
            return scopes.find(scope => scope.key === normalizedTarget) || scopes[0] || null;
        }

        function getStageTaskTitles(stageScope) {
            return getTaskTitlesFromBoxes(stageScope?.taskBoxes || []);
        }

        function getModuleTaskTitles(stageScope, moduleName) {
            const moduleScope = getModuleScopeByName(stageScope, moduleName);
            return getTaskTitlesFromBoxes(moduleScope?.taskBoxes || []);
        }

        function getStageStarterTargetCount(stageNumber) {
            if (!stageNumber) {
                return LIVE_CODING_STARTER_FALLBACK_TASKS_PER_STAGE;
            }

            const stageTasks = STAGE_TASKS[`stage${stageNumber}`];
            if (Array.isArray(stageTasks) && stageTasks.length > 0) {
                return stageTasks.length;
            }

            return LIVE_CODING_STARTER_FALLBACK_TASKS_PER_STAGE;
        }

        function makeUniqueTitle(baseTitle, existingTitlesSet) {
            const normalizedBase = normalizeTitleValue(baseTitle) || `Задача ${Date.now()}`;
            const used = existingTitlesSet instanceof Set ? existingTitlesSet : new Set();

            let candidate = normalizedBase;
            let suffix = 2;

            while (used.has(candidate.toLowerCase())) {
                candidate = `${normalizedBase} #${suffix}`;
                suffix += 1;
            }

            return candidate;
        }

        function buildLocalFallbackLiveCodingTask(stageNumber, moduleName, generationContext = {}) {
            const templates = LIVE_CODING_LOCAL_FALLBACK_TASK_POOL[stageNumber] || LIVE_CODING_LOCAL_FALLBACK_TASK_POOL[1];
            const selectedTemplate = shuffleList(templates)[0] || templates[0];

            const existingTitles = new Set(
                normalizeTaskTitleList(generationContext.shownTitles || []).map(title => title.toLowerCase())
            );

            const baseTitle = `${selectedTemplate.title} (${moduleName || 'Общий модуль'})`;
            const uniqueTitle = makeUniqueTitle(baseTitle, existingTitles);

            return {
                title: uniqueTitle,
                description: selectedTemplate.description,
                tables: selectedTemplate.tables,
                placeholder: selectedTemplate.placeholder || 'Опишите решение и приведите код/запрос.',
                hint: selectedTemplate.hint,
                solution: selectedTemplate.solution,
                difficulty: selectedTemplate.difficulty || 'medium'
            };
        }

        function getStageSectionScope(stageHeading) {
            const stageNumber = extractStageNumberFromHeading(stageHeading?.textContent || '');
            const nodes = [];
            const stageContainer = stageHeading?.closest('.coding-section-group') || null;

            let pointer = stageHeading?.nextElementSibling || null;
            while (pointer && !isStageHeadingElement(pointer)) {
                nodes.push(pointer);
                pointer = pointer.nextElementSibling;
            }

            const moduleNames = [];
            const taskBoxes = [];
            const moduleScopes = [];

            let sequence = [];
            if (stageContainer) {
                sequence = Array.from(stageContainer.querySelectorAll('h3, .task-box'));
            } else {
                nodes.forEach(node => {
                    if (node.matches?.('h3, .task-box')) {
                        sequence.push(node);
                    }
                    node.querySelectorAll?.('h3, .task-box').forEach(item => sequence.push(item));
                });
                sequence = Array.from(new Set(sequence));
            }

            let activeModule = null;
            sequence.forEach(node => {
                if (node.tagName === 'H3') {
                    const moduleName = normalizeTitleValue(node.textContent);
                    if (!moduleName) {
                        activeModule = null;
                        return;
                    }

                    moduleNames.push(moduleName);
                    activeModule = {
                        key: moduleName.toLowerCase(),
                        moduleName,
                        heading: node,
                        taskBoxes: [],
                        lastAnchorNode: node
                    };
                    moduleScopes.push(activeModule);
                    return;
                }

                if (node.classList?.contains('task-box')) {
                    taskBoxes.push(node);

                    if (activeModule) {
                        activeModule.taskBoxes.push(node);
                        activeModule.lastAnchorNode = node;
                    }
                }
            });

            const uniqueTaskBoxes = Array.from(new Set(taskBoxes));
            const uniqueModuleNames = Array.from(new Set(moduleNames.filter(Boolean)));

            return {
                stageNumber,
                stageLabel: LIVE_CODING_STAGE_MODEL_LABELS[stageNumber] || 'SQL',
                stageContainer,
                nodes,
                moduleNames: uniqueModuleNames,
                moduleScopes,
                taskBoxes: uniqueTaskBoxes,
                lastTaskBox: uniqueTaskBoxes[uniqueTaskBoxes.length - 1] || null
            };
        }

        function resolveStageInsertionContainer(stageScope, fallbackRoot) {
            if (stageScope?.lastTaskBox?.parentElement) {
                return stageScope.lastTaskBox.parentElement;
            }

            const spaceContainer = stageScope?.nodes?.find(node =>
                node.classList && node.classList.contains('space-y-6')
            );

            if (spaceContainer) {
                return spaceContainer;
            }

            return fallbackRoot || document.getElementById('coding-content-root');
        }

        function resolveModuleInsertionAnchor(stageScope, moduleName) {
            const moduleScope = getModuleScopeByName(stageScope, moduleName);
            if (!moduleScope) return null;

            if (moduleScope.lastAnchorNode && moduleScope.lastAnchorNode.parentElement) {
                return moduleScope.lastAnchorNode;
            }

            return moduleScope.heading || null;
        }

        function setGenerateTaskButtonLoading(button, isLoading) {
            if (!button) return;

            if (!button.dataset.defaultLabel) {
                button.dataset.defaultLabel = button.textContent || 'Новая задача';
            }

            if (isLoading) {
                button.disabled = true;
                button.classList.add('is-loading');
                button.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span><span>Генерация...</span>';
                return;
            }

            button.disabled = false;
            button.classList.remove('is-loading');
            button.textContent = button.dataset.defaultLabel;
        }

        function extractModuleNumber(moduleName) {
            const match = String(moduleName || '').match(/модуль\s*(\d+)/i);
            return match ? Number(match[1]) : 0;
        }

        function getLiveCodingModuleRule(stageNumber, moduleName) {
            const moduleNumber = extractModuleNumber(moduleName);
            const moduleLower = String(moduleName || '').toLowerCase();

            if (stageNumber === 1) {
                if (moduleNumber === 2 || moduleLower.includes('индекс') || moduleLower.includes('производительн')) {
                    return {
                        focus: 'SQL производительность: EXPLAIN ANALYZE, индексы (composite/partial), plan tuning, устранение bottleneck.',
                        avoid: 'общие аналитические отчеты без performance-разбора и DWH-моделирование.',
                        requiredKeywords: ['index', 'индекс', 'explain', 'analyze', 'plan', 'seq scan', 'bitmap', 'cost', 'кардин', 'filter']
                    };
                }

                if (moduleNumber === 3 || moduleLower.includes('dwh') || moduleLower.includes('витрин') || moduleLower.includes('шаблон')) {
                    return {
                        focus: 'DWH SQL паттерны: SCD2, MERGE/UPSERT, snapshot/incremental load, fact/dim моделирование, surrogate keys.',
                        avoid: 'обычные ad-hoc GROUP BY отчеты без DWH-контекста и узкие задачи только про оконные функции.',
                        requiredKeywords: ['scd', 'merge', 'upsert', 'snapshot', 'incremental', 'fact', 'dim', 'surrogate', 'dwh', 'mart', 'витрин']
                    };
                }

                return {
                    focus: 'SQL аналитика: JOIN, GROUP BY/HAVING, CTE, подзапросы, CASE, оконные функции в бизнес-контексте.',
                    avoid: 'узкие performance-only кейсы и DWH ETL-паттерны из других модулей.',
                    requiredKeywords: ['join', 'group by', 'having', 'cte', 'window', 'row_number', 'rank', 'aggregate', 'sum(', 'count(']
                };
            }

            if (stageNumber === 2) {
                if (moduleNumber === 2 || moduleLower.includes('retry') || moduleLower.includes('надежн')) {
                    return {
                        focus: 'Надежность ETL: retry/backoff, идемпотентность, обработка ошибок, мониторинг и контроль качества.',
                        avoid: 'базовые API запросы без надежности и orchestration-only сценарии.',
                        requiredKeywords: ['retry', 'backoff', 'idempot', 'идемп', 'error', 'exception', 'dq', 'validation']
                    };
                }

                if (moduleNumber === 3 || moduleLower.includes('airflow') || moduleLower.includes('orchestration')) {
                    return {
                        focus: 'Airflow orchestration: DAG design, task dependencies, retries, SLA, scheduling, sensors.',
                        avoid: 'чистые python-скрипты без DAG и sql-only задачи.',
                        requiredKeywords: ['airflow', 'dag', 'task', 'schedule', 'sla', 'operator']
                    };
                }

                return {
                    focus: 'API интеграции и базовые загрузки в ETL: extraction, parsing, basic validation, loading.',
                    avoid: 'глубокая orchestration и reliability-only сценарии.',
                    requiredKeywords: ['api', 'request', 'json', 'load', 'ingest', 'staging']
                };
            }

            if (stageNumber === 3) {
                if (moduleNumber === 2 || moduleLower.includes('shuffle') || moduleLower.includes('join')) {
                    return {
                        focus: 'Spark join/shuffle оптимизация: broadcast, partitioning, skew mitigation, shuffle reduction.',
                        avoid: 'чистые transform-only задачи без performance-акцента.',
                        requiredKeywords: ['join', 'shuffle', 'broadcast', 'partition', 'skew']
                    };
                }

                if (moduleNumber === 3 || moduleLower.includes('aqe') || moduleLower.includes('debug')) {
                    return {
                        focus: 'Spark performance debugging: AQE, explain plan, skew diagnosis, tuning конфигов.',
                        avoid: 'базовые трансформации без анализа производительности.',
                        requiredKeywords: ['aqe', 'explain', 'plan', 'skew', 'tuning', 'adaptive']
                    };
                }

                return {
                    focus: 'Core PySpark трансформации и базовые ETL-пайплайны на DataFrame API.',
                    avoid: 'узкие tuning-only кейсы.',
                    requiredKeywords: ['pyspark', 'dataframe', 'transform', 'select', 'withcolumn']
                };
            }

            if (stageNumber === 4) {
                if (moduleNumber === 2 || moduleLower.includes('exactly') || moduleLower.includes('ошиб')) {
                    return {
                        focus: 'Exactly-once паттерны, offset management, error handling, DLQ/retry для streaming.',
                        avoid: 'простые producer/consumer примеры без надежности.',
                        requiredKeywords: ['exactly-once', 'offset', 'commit', 'dlq', 'retry', 'error']
                    };
                }

                if (moduleNumber === 3 || moduleLower.includes('window') || moduleLower.includes('watermark')) {
                    return {
                        focus: 'Streaming windows, watermark, event-time processing, late-arrival handling.',
                        avoid: 'producer/consumer CRUD без stream-aggregation.',
                        requiredKeywords: ['window', 'watermark', 'event time', 'late', 'streaming']
                    };
                }

                return {
                    focus: 'Kafka producer/consumer паттерны, schema compatibility, basic stream processing flow.',
                    avoid: 'сложные exactly-once и windowing-only кейсы.',
                    requiredKeywords: ['kafka', 'producer', 'consumer', 'topic', 'schema']
                };
            }

            if (stageNumber === 5) {
                if (moduleNumber === 2 || moduleLower.includes('clickhouse') || moduleLower.includes('storage')) {
                    return {
                        focus: 'ClickHouse storage strategy: table engines, partitioning, order keys, TTL, compression.',
                        avoid: 'generic architecture рассуждения без ClickHouse-конкретики.',
                        requiredKeywords: ['clickhouse', 'mergetree', 'partition', 'order by', 'ttl', 'engine']
                    };
                }

                if (moduleNumber === 3 || moduleLower.includes('reliability') || moduleLower.includes('trade')) {
                    return {
                        focus: 'Reliability и архитектурные trade-offs: SLA/SLO, failure domains, observability, recovery.',
                        avoid: 'узкие SQL-реализации без архитектурного контекста.',
                        requiredKeywords: ['sla', 'slo', 'reliability', 'trade-off', 'latency', 'monitoring', 'observability']
                    };
                }

                return {
                    focus: 'DWH/Data Mart modeling: fact/dim design, grain, keys, slowly changing dimensions.',
                    avoid: 'низкоуровневые performance-оптимизации без моделирования.',
                    requiredKeywords: ['fact', 'dim', 'grain', 'model', 'schema', 'mart']
                };
            }

            return {
                focus: 'Строгое соответствие выбранному модулю и его практическому контексту.',
                avoid: 'темы из соседних модулей.',
                requiredKeywords: []
            };
        }

        function isTaskAlignedWithModule(task, stageNumber, moduleName) {
            const moduleRule = getLiveCodingModuleRule(stageNumber, moduleName);
            const text = [
                task?.title,
                task?.description,
                task?.tables,
                task?.hint,
                task?.solution
            ].map(value => String(value || '').toLowerCase()).join(' ');

            const required = Array.isArray(moduleRule.requiredKeywords)
                ? moduleRule.requiredKeywords
                : [];

            if (required.length === 0) return true;
            return required.some(keyword => text.includes(String(keyword).toLowerCase()));
        }

        function buildLiveCodingUserPrompt(stageLabel, moduleName, generationContext = {}) {
            const shownTitles = normalizeTaskTitleList(generationContext.shownTitles || []);
            const stageTitles = normalizeTaskTitleList(generationContext.stageTitles || []);
            const moduleTitles = normalizeTaskTitleList(generationContext.moduleTitles || []);
            const candidateCountRaw = Number(generationContext.candidateCount);
            const candidateCount = Number.isFinite(candidateCountRaw)
                ? Math.max(1, Math.min(5, Math.floor(candidateCountRaw)))
                : LIVE_CODING_CANDIDATES_PER_REQUEST;

            const titleList = shownTitles.length > 0
                ? JSON.stringify(shownTitles.slice(-LIVE_CODING_PROMPT_HISTORY_LIMITS.globalTitles), null, 0)
                : '[]';

            const stageTitleList = stageTitles.length > 0
                ? JSON.stringify(stageTitles.slice(-LIVE_CODING_PROMPT_HISTORY_LIMITS.stageTitles), null, 0)
                : '[]';

            const moduleTitleList = moduleTitles.length > 0
                ? JSON.stringify(moduleTitles.slice(-LIVE_CODING_PROMPT_HISTORY_LIMITS.moduleTitles), null, 0)
                : '[]';

            const stageRule = generationContext.stageRule || {};
            const focusRule = String(stageRule.focus || '').trim();
            const avoidRule = String(stageRule.avoid || '').trim();
            const moduleRule = getLiveCodingModuleRule(generationContext.stageNumber, moduleName);
            const moduleFocus = String(moduleRule.focus || '').trim();
            const moduleAvoid = String(moduleRule.avoid || '').trim();
            const stageLabelLower = String(stageLabel || '').toLowerCase();
            const moduleNameLower = String(moduleName || '').toLowerCase();
            const isStageOneSql = stageLabelLower.includes('sql') || moduleNameLower.includes('sql');
            const windowTaskCount = moduleTitles.filter(title => /окон|window|row_number|dense_rank|rank\s*\(/i.test(title)).length;
            const moduleDiversificationRule = isStageOneSql
                ? (windowTaskCount >= 1
                    ? 'В этом модуле уже были задачи на оконные функции: сгенерируй новую задачу БЕЗ оконных функций, с акцентом на JOIN/GROUP BY/CTE/индексах/EXPLAIN.'
                    : 'Для этапа SQL обеспечь разнообразие: чередуй JOIN, GROUP BY/HAVING, CTE, подзапросы, индексы и EXPLAIN; не своди задачи только к оконным функциям.')
                : 'Соблюдай разнообразие техник внутри модуля и избегай однотипных задач подряд.';

            return `Сгенерируй ${candidateCount} новых практических задач для middle data engineer.\nЭтап: ${stageLabel}. Модуль: ${moduleName}.\n\nПравила контекста этапа:\n- Stage Focus: ${focusRule || 'только темы выбранного этапа'}\n- Stage Avoid: ${avoidRule || 'не использовать темы других этапов'}\n- Module Focus (ОБЯЗАТЕЛЬНО): ${moduleFocus || 'строго тема выбранного модуля'}\n- Module Avoid: ${moduleAvoid || 'темы соседних модулей'}\n\nУже были задачи в этом этапе: ${stageTitleList}.\nУже были задачи в этом модуле: ${moduleTitleList}.\nВсе показанные задачи (глобально): ${titleList}.\n\nКритично:\n- Не повторяй ни названия, ни идею задач из списков выше.\n- Каждая задача должна быть строго в контексте выбранного этапа и выбранного модуля.\n- ${moduleDiversificationRule}\n- Если задача не соответствует Module Focus, не включай ее в итоговый JSON.\n- solution должен быть непустой, прикладной и проверяемый (SQL/Python/псевдокод по теме), минимум 4 строки.\n- hint должен быть конкретным шагом к решению, не общая фраза.\n\nВерни строго этот JSON:\n{\n  "tasks": [\n    {\n      "title": "string",\n      "description": "string",\n      "tables": "string",\n      "placeholder": "string",\n      "hint": "string",\n      "solution": "string",\n      "difficulty": "easy | medium | hard"\n    }\n  ]\n}`;
        }

        function extractJsonObjectFromModelText(rawText) {
            const text = String(rawText || '').trim();
            if (!text) {
                throw new Error('Пустой ответ модели');
            }

            const withoutFences = text
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();

            const firstBrace = withoutFences.indexOf('{');
            const lastBrace = withoutFences.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
                throw new Error('В ответе модели не найден JSON-объект');
            }

            const jsonChunk = withoutFences.slice(firstBrace, lastBrace + 1);
            return JSON.parse(jsonChunk);
        }

        function normalizeGeneratedTaskPayload(payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error('Неверный формат задачи');
            }

            const title = normalizeTitleValue(payload.title);
            const description = String(payload.description || '').trim();
            const tables = String(payload.tables || '').trim();
            const placeholder = String(payload.placeholder || '').trim();
            const hint = String(payload.hint || '').trim();
            const solution = String(payload.solution || '').trim();
            const rawDifficulty = String(payload.difficulty || '').trim().toLowerCase();
            const difficulty = ['easy', 'medium', 'hard'].includes(rawDifficulty) ? rawDifficulty : 'medium';

            if (!title || !description || !solution) {
                throw new Error('JSON задачи не содержит обязательных полей');
            }

            if (solution.length < 24 || description.length < 24) {
                throw new Error('Модель вернула слишком короткий эталон или описание');
            }

            return {
                title,
                description,
                tables,
                placeholder: placeholder || 'Напишите решение здесь...',
                hint: hint || 'Сначала опишите короткий план решения, затем реализуйте его.',
                solution,
                difficulty
            };
        }

        function normalizeGeneratedTaskCandidates(payload, desiredCount = LIVE_CODING_CANDIDATES_PER_REQUEST) {
            const source = Array.isArray(payload?.tasks)
                ? payload.tasks
                : (Array.isArray(payload) ? payload : [payload]);

            const maxCount = Math.max(1, Math.min(5, Number(desiredCount) || LIVE_CODING_CANDIDATES_PER_REQUEST));
            const unique = [];
            const seen = new Set();

            source.forEach(item => {
                try {
                    const normalized = normalizeGeneratedTaskPayload(item);
                    const key = normalizeTitleValue(normalized.title).toLowerCase();
                    if (!key || seen.has(key)) return;
                    seen.add(key);
                    unique.push(normalized);
                } catch (error) {
                    // Ignore malformed candidates and keep valid ones.
                }
            });

            if (unique.length === 0) {
                throw new Error('Модель не вернула валидные задачи в пакете');
            }

            return unique.slice(0, maxCount);
        }

        function extractModelContent(responseData) {
            const direct = responseData?.choices?.[0]?.message?.content;
            if (typeof direct === 'string' && direct.trim()) {
                return direct;
            }

            if (Array.isArray(direct)) {
                const joined = direct
                    .map(item => item?.text || item?.content || '')
                    .join('')
                    .trim();
                if (joined) return joined;
            }

            if (typeof responseData?.output_text === 'string' && responseData.output_text.trim()) {
                return responseData.output_text;
            }

            throw new Error('Не удалось извлечь текст из ответа модели');
        }

        async function requestGitHubModelsContent(token, messages, options = {}) {
            const normalizedToken = String(token || '').trim();
            if (!normalizedToken) {
                throw new Error('Токен GitHub Models не задан');
            }

            const fallbackModels = Array.isArray(options.modelFallbacks)
                ? options.modelFallbacks
                : LIVE_CODING_GENERATOR_MODEL_FALLBACKS;
            const preferredModel = String(options.model || LIVE_CODING_GENERATOR_CONFIG.model || '').trim();
            const modelCandidates = Array.from(new Set(
                [preferredModel].concat(fallbackModels)
                    .map(value => String(value || '').trim())
                    .filter(Boolean)
            ));

            const requestVariants = [
                { includeApiKey: true, forceJsonObject: true }
            ];

            if (options.allowApiKeyFallbackVariant === true) {
                requestVariants.push({ includeApiKey: false, forceJsonObject: true });
            }

            if (options.allowNonJsonVariant === true) {
                requestVariants.push({ includeApiKey: true, forceJsonObject: false });
            }

            const normalizedMessages = Array.isArray(messages) ? messages : [];
            if (normalizedMessages.length === 0) {
                throw new Error('Пустой список сообщений для запроса к модели');
            }

            const timeoutMsRaw = Number(options.timeoutMs);
            const timeoutMs = Number.isFinite(timeoutMsRaw) && timeoutMsRaw >= 5000
                ? Math.floor(timeoutMsRaw)
                : LIVE_CODING_GENERATOR_CONFIG.requestTimeoutMs;

            const maxProviderAttemptsRaw = Number(options.maxProviderAttempts);
            const maxProviderAttempts = Number.isFinite(maxProviderAttemptsRaw) && maxProviderAttemptsRaw > 0
                ? Math.floor(maxProviderAttemptsRaw)
                : Math.max(1, modelCandidates.length * requestVariants.length);

            let lastError = null;
            let providerAttempts = 0;

            for (const model of modelCandidates) {
                const cooldownRemainingMs = getLiveCodingRateLimitRemainingMs(model);
                if (cooldownRemainingMs > 0) {
                    lastError = createLiveCodingRateLimitError(cooldownRemainingMs);
                    continue;
                }

                for (const variant of requestVariants) {
                    if (providerAttempts >= maxProviderAttempts) {
                        break;
                    }
                    providerAttempts += 1;

                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), timeoutMs);

                    try {
                        const elapsedSinceLastRequest = Date.now() - getLiveCodingLastRequestAt(model);
                        const waitBeforeRequestMs = LIVE_CODING_AI_MIN_REQUEST_INTERVAL_MS - elapsedSinceLastRequest;
                        if (waitBeforeRequestMs > 0) {
                            await new Promise(resolve => setTimeout(resolve, waitBeforeRequestMs));
                        }

                        setLiveCodingLastRequestAt(model);

                        const headers = {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${normalizedToken}`
                        };

                        if (variant.includeApiKey) {
                            headers['api-key'] = normalizedToken;
                        }

                        const requestBody = {
                            model,
                            temperature: Number.isFinite(options.temperature) ? options.temperature : 0.85,
                            max_tokens: Number.isFinite(options.maxTokens) ? options.maxTokens : 1200,
                            messages: normalizedMessages
                        };

                        if (variant.forceJsonObject) {
                            requestBody.response_format = { type: 'json_object' };
                        }

                        const response = await fetch(LIVE_CODING_GENERATOR_CONFIG.apiUrl, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(requestBody),
                            signal: controller.signal
                        });

                        if (!response.ok) {
                            if (response.status === 429) {
                                const retryAfterMs = parseRetryAfterToMs(response.headers.get('retry-after'));
                                const cooldownMs = buildRateLimitCooldownMs(retryAfterMs);
                                updateLiveCodingRateLimitRemainingMs(model, cooldownMs);

                                const apiError = createLiveCodingRateLimitError(cooldownMs);
                                // Is NOT terminal anymore, so we can try fallback model!
                                throw apiError;
                            }

                            const errorText = await response.text();
                            const apiError = new Error(
                                `GitHub Models API: ${response.status}; model=${model}; json=${variant.forceJsonObject ? '1' : '0'}; apiKey=${variant.includeApiKey ? '1' : '0'}; ${errorText.slice(0, 220)}`
                            );
                            apiError.statusCode = response.status;
                            if (response.status === 401 || response.status === 403) {
                                apiError.isTerminal = true;
                            }
                            throw apiError;
                        }

                        const payload = await response.json();
                        const content = extractModelContent(payload);
                        return {
                            content,
                            model,
                            variant
                        };
                    } catch (error) {
                        lastError = error?.name === 'AbortError'
                            ? new Error(`Таймаут запроса к GitHub Models (${timeoutMs} мс)`)
                            : error;

                        if (isLiveCodingRateLimitError(lastError)) {
                            throw lastError;
                        }

                        if (error?.isTerminal) {
                            throw error;
                        }
                    } finally {
                        clearTimeout(timeout);
                    }
                }

                if (providerAttempts >= maxProviderAttempts) {
                    break;
                }
            }

            throw lastError || new Error('Не удалось получить ответ от GitHub Models');
        }

        async function requestGeneratedLiveCodingTask(stageLabel, moduleName, generationContext, token) {
            const candidateCountRaw = Number(generationContext?.candidateCount);
            const candidateCount = Number.isFinite(candidateCountRaw)
                ? Math.max(1, Math.min(5, Math.floor(candidateCountRaw)))
                : LIVE_CODING_CANDIDATES_PER_REQUEST;
            const maxTokens = candidateCount >= 3
                ? 1200
                : (candidateCount === 2 ? 980 : 760);

            const result = await requestGitHubModelsContent(token, [
                { role: 'system', content: LIVE_CODING_GENERATOR_SYSTEM_PROMPT },
                { role: 'user', content: buildLiveCodingUserPrompt(stageLabel, moduleName, generationContext) }
            ], {
                model: LIVE_CODING_GENERATOR_CONFIG.model,
                temperature: 0.75,
                maxTokens,
                timeoutMs: 20000,
                maxProviderAttempts: 1,
                modelFallbacks: LIVE_CODING_GENERATOR_MODEL_FALLBACKS
            });

            return normalizeGeneratedTaskCandidates(extractJsonObjectFromModelText(result.content), candidateCount);
        }

        function normalizeQuestionsCategory(rawCategory) {
            const category = String(rawCategory || '').trim().toLowerCase();

            if (!category) return QUESTIONS_AI_CATEGORY_ORDER[0];

            if (category.includes('sql') || category.includes('бд') || category.includes('баз') || category.includes('database')) {
                return QUESTIONS_AI_CATEGORY_ORDER[0];
            }

            if (category.includes('python') || category.includes('pyspark') || category.includes('spark')) {
                return QUESTIONS_AI_CATEGORY_ORDER[1];
            }

            if (category.includes('архит') || category.includes('dwh') || category.includes('lake') || category.includes('warehouse')) {
                return QUESTIONS_AI_CATEGORY_ORDER[2];
            }

            if (category.includes('stream') || category.includes('kafka') || category.includes('airflow') || category.includes('оркестр')) {
                return QUESTIONS_AI_CATEGORY_ORDER[3];
            }

            if (
                category.includes('модел')
                || category.includes('кач')
                || category.includes('govern')
                || category.includes('vault')
                || category.includes('scd')
                || category.includes('catalog')
            ) {
                return QUESTIONS_AI_CATEGORY_ORDER[4];
            }

            return QUESTIONS_AI_CATEGORY_ORDER[0];
        }

        function getStoredGeneratedQuestions() {
            try {
                const parsed = JSON.parse(localStorage.getItem(QUESTIONS_AI_GENERATED_STORAGE_KEY) || '[]');
                if (!Array.isArray(parsed)) {
                    return [];
                }

                const unique = [];
                const used = new Set();
                let filteredAny = false;

                parsed.forEach(item => {
                    if (!item || typeof item !== 'object') return;

                    const question = normalizeTitleValue(item.question || item.title || item.prompt || '');
                    const answer = String(item.answer || item.solution || '').trim();
                    const category = normalizeQuestionsCategory(item.category || item.topic || '');
                    const key = question.toLowerCase();

                    // Исключаем автоматически сгенерированные заглушки-вопросы из старых версий
                    if (key.includes('практический вопрос') && key.includes('по теме')) {
                        filteredAny = true;
                        return;
                    }

                    if (!question || !answer || used.has(key)) return;

                    used.add(key);
                    unique.push({ category, question, answer });
                });

                if (filteredAny) {
                    saveStoredGeneratedQuestions(unique);
                }

                return unique.slice(-300);
            } catch (error) {
                return [];
            }
        }

        function saveStoredGeneratedQuestions(items) {
            const source = Array.isArray(items) ? items : [];
            const unique = [];
            const used = new Set();

            source.forEach(item => {
                if (!item || typeof item !== 'object') return;

                const question = normalizeTitleValue(item.question || item.title || item.prompt || '');
                const answer = String(item.answer || item.solution || '').trim();
                const category = normalizeQuestionsCategory(item.category || item.topic || '');
                const key = question.toLowerCase();

                if (!question || !answer || used.has(key)) return;

                used.add(key);
                unique.push({ category, question, answer });
            });

            localStorage.setItem(
                QUESTIONS_AI_GENERATED_STORAGE_KEY,
                JSON.stringify(unique.slice(-300))
            );
        }

        function getQuestionPromptFromAccordionHeader(header) {
            if (!header) return '';

            const label = header.querySelector('span:not(.accordion-toggle)') || header.querySelector('span');
            return normalizeTitleValue(label?.textContent || '');
        }

        function collectExistingQuestionPrompts(root = document) {
            const prompts = Array.from(root.querySelectorAll('.accordion-item .accordion-header'))
                .map(getQuestionPromptFromAccordionHeader)
                .filter(Boolean);

            return normalizeTaskTitleList(prompts);
        }

        function normalizeGeneratedQuestionPack(payload) {
            const source = Array.isArray(payload)
                ? payload
                : (Array.isArray(payload?.questions) ? payload.questions : []);

            if (source.length === 0) {
                throw new Error('Модель не вернула список вопросов');
            }

            const unique = [];
            const used = new Set();

            source.forEach(item => {
                if (!item || typeof item !== 'object') return;

                const question = normalizeTitleValue(item.question || item.title || item.prompt || '');
                const answer = String(item.answer || item.solution || item.explanation || '').trim();
                const category = normalizeQuestionsCategory(item.category || item.topic || item.section || '');
                const key = question.toLowerCase();

                if (!question || !answer || used.has(key)) return;
                if (question.length < 8 || answer.length < 24) return;

                used.add(key);
                unique.push({ category, question, answer });
            });

            if (unique.length < 4) {
                throw new Error('Слишком мало валидных вопросов в ответе модели');
            }

            return unique.slice(0, QUESTIONS_AI_PACK_SIZE);
        }

        function buildQuestionsGenerationUserPrompt(existingPrompts = []) {
            const seenList = normalizeTaskTitleList(existingPrompts);
            const seenJson = seenList.length > 0
                ? JSON.stringify(seenList.slice(-250), null, 0)
                : '[]';

            const categoriesJson = JSON.stringify(QUESTIONS_AI_CATEGORY_ORDER, null, 0);

            return `Сгенерируй ${QUESTIONS_AI_PACK_SIZE} новых вопросов для подготовки к собеседованию на middle data engineer.

Требования к контенту:
- Формат как в текущем разделе: короткий вопрос и развернутый ответ (2-5 предложений), практический и конкретный.
- Вопросы должны быть на русском языке.
- Не повторяй уже существующие вопросы.
- Используй только категории из списка: ${categoriesJson}.

Уже существующие вопросы: ${seenJson}.

Верни только JSON строго в формате:
{
  "questions": [
    {
      "category": "string",
      "question": "string",
      "answer": "string"
    }
  ]
}`;
        }

        async function requestGeneratedQuestionsPack(existingPrompts, token) {
            const result = await requestGitHubModelsContent(token, [
                { role: 'system', content: QUESTIONS_AI_GENERATOR_SYSTEM_PROMPT },
                { role: 'user', content: buildQuestionsGenerationUserPrompt(existingPrompts) }
            ], {
                model: LIVE_CODING_GENERATOR_CONFIG.model,
                temperature: 0.85,
                maxTokens: 4000
            });

            return normalizeGeneratedQuestionPack(extractJsonObjectFromModelText(result.content));
        }

        function createGeneratedQuestionAccordionItem(item) {
            const question = normalizeTitleValue(item?.question || '');
            const answer = String(item?.answer || '').trim();
            const safeAnswer = answer || 'Ответ временно недоступен. Нажмите "Добавить вопросы" еще раз, чтобы получить обновленный вариант.';

            const wrapper = document.createElement('div');
            wrapper.className = 'accordion-item generated-question-item';
            wrapper.setAttribute('data-generated-question', 'true');
            wrapper.style.background = 'var(--bg-card)';
            wrapper.style.borderRadius = '12px';
            wrapper.style.marginBottom = '12px';
            wrapper.style.border = '1px solid rgba(74,240,196,0.25)';
            wrapper.style.overflow = 'hidden';

            wrapper.innerHTML = `
                <div class="accordion-header" style="padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleAccordion(this)">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-weight: 600; font-size: 15px;">${escapeHtml(question)}</span>
                        <button onclick="event.stopPropagation(); toggleFavoriteTask(btoa(unescape(encodeURIComponent(String(this.previousElementSibling.textContent)))), 'Вопрос сгенерированный ИИ', String(this.previousElementSibling.textContent)).then(res=>{if(res!==undefined) {this.textContent=res?'⭐':'☆';}}).catch(e=>{console.error(e)})" style="background:transparent; border:none; font-size:16px; cursor:pointer;" title="В избранное">☆</button>
                    </div>
                    <span class="accordion-toggle" style="transition: transform 0.3s; color: var(--accent1); font-size: 13px; font-weight: 500;">Показать ответ ▼</span>
                </div>
                <div class="accordion-content" style="display: none; padding: 0 16px 16px 16px; color: var(--text-muted); line-height: 1.6; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 8px; padding-top: 12px;">
                    <strong style="color: var(--accent1);">Ответ:</strong><br>${escapeHtml(safeAnswer).replace(/\n/g, '<br>')}
                </div>
            `;

            return wrapper;
        }

        function findQuestionsCategoryContainer(root, category) {
            const targetCategory = normalizeQuestionsCategory(category);
            const headings = Array.from(root.querySelectorAll('h2'));

            for (const heading of headings) {
                const headingCategory = normalizeQuestionsCategory(heading.textContent || '');
                if (headingCategory !== targetCategory) continue;

                let candidate = heading.nextElementSibling;
                while (candidate) {
                    if (candidate.classList?.contains('space-y-4')) {
                        return candidate;
                    }

                    if (candidate.tagName === 'H2') {
                        break;
                    }

                    candidate = candidate.nextElementSibling;
                }
            }

            return null;
        }

        function ensureQuestionsGeneratedFallbackContainer(root) {
            const contentContainer = root.querySelector('.page-content') || root;
            let list = contentContainer.querySelector('.questions-ai-generated-list');
            if (list) return list;

            const heading = document.createElement('h2');
            heading.className = 'questions-ai-generated-heading';
            heading.textContent = 'AI-добавленные вопросы';

            list = document.createElement('div');
            list.className = 'space-y-4 questions-ai-generated-list';

            contentContainer.appendChild(heading);
            contentContainer.appendChild(list);

            return list;
        }

        function appendGeneratedQuestions(root, questions, options = {}) {
            const source = Array.isArray(questions) ? questions : [];
            if (source.length === 0) return 0;

            const existingSet = new Set(
                collectExistingQuestionPrompts(root).map(value => value.toLowerCase())
            );

            const addedItems = [];

            source.forEach(item => {
                const question = normalizeTitleValue(item?.question || '');
                const answer = String(item?.answer || '').trim();
                const category = normalizeQuestionsCategory(item?.category || '');
                const key = question.toLowerCase();

                if (!question || !answer || existingSet.has(key)) {
                    return;
                }

                const container = findQuestionsCategoryContainer(root, category)
                    || ensureQuestionsGeneratedFallbackContainer(root);

                container.appendChild(createGeneratedQuestionAccordionItem({ category, question, answer }));
                existingSet.add(key);
                addedItems.push({ category, question, answer });
            });

            if (addedItems.length > 0 && options.persist !== false) {
                const merged = getStoredGeneratedQuestions().concat(addedItems);
                saveStoredGeneratedQuestions(merged);
            }

            return addedItems.length;
        }

        function hydrateStoredGeneratedQuestions(root) {
            const stored = getStoredGeneratedQuestions();
            if (stored.length === 0) return;
            appendGeneratedQuestions(root, stored, { persist: false });
        }

        function refreshQuestionsAiControls(root = document.getElementById('questions-content-root')) {
            if (!root) return;

            const tokenButton = root.querySelector('.questions-token-btn');
            if (tokenButton) {
                updateTokenSettingsButtonState(tokenButton);
            }

            const note = root.querySelector('.questions-ai-note');
            if (!note) return;

            const generatedCount = root.querySelectorAll('.accordion-item[data-generated-question="true"]').length;
            note.textContent = generatedCount > 0
                ? `AI-добавлено вопросов: ${generatedCount}. Можно добавить еще ${QUESTIONS_AI_PACK_SIZE}.`
                : `Сгенерируй еще ${QUESTIONS_AI_PACK_SIZE} вопросов и ответов в текущем стиле.`;
        }

        function setQuestionsGenerateButtonLoading(button, isLoading) {
            if (!button) return;

            if (!button.dataset.defaultLabel) {
                button.dataset.defaultLabel = button.textContent || `Добавить ${QUESTIONS_AI_PACK_SIZE} AI-вопросов`;
            }

            if (isLoading) {
                button.disabled = true;
                button.classList.add('is-loading');
                button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>Генерация ${QUESTIONS_AI_PACK_SIZE}...</span>`;
                return;
            }

            button.disabled = false;
            button.classList.remove('is-loading');
            button.textContent = button.dataset.defaultLabel;
        }

        function openQuestionsTokenSettings(button) {
            openGitHubTokenSettings(button || null);
            refreshQuestionsAiControls(document.getElementById('questions-content-root'));
        }

        async function generateQuestionsPack(triggerButton = null) {
            const root = document.getElementById('questions-content-root');
            if (!root) return;

            let token = getGitHubModelsToken();
            if (!token) {
                token = openGitHubTokenSettings(root.querySelector('.questions-token-btn') || null);
                refreshQuestionsAiControls(root);
            }

            if (!token) {
                showErrorMessage('Токен не задан. Укажите токен GitHub Models и повторите генерацию.');
                return;
            }

            setQuestionsGenerateButtonLoading(triggerButton, true);
            try {
                const existingPrompts = collectExistingQuestionPrompts(root);
                const usedPrompts = new Set(existingPrompts.map(value => value.toLowerCase()));
                const generationContext = [...existingPrompts];

                const generated = [];
                let lastApiError = null;

                for (
                    let attempt = 0;
                    attempt < QUESTIONS_AI_REQUEST_ATTEMPTS && generated.length < QUESTIONS_AI_PACK_SIZE;
                    attempt += 1
                ) {
                    try {
                        const pack = await requestGeneratedQuestionsPack(generationContext, token);
                        const fresh = pack.filter(item => {
                            const key = item.question.toLowerCase();
                            if (usedPrompts.has(key)) return false;
                            usedPrompts.add(key);
                            return true;
                        });

                        generated.push(...fresh);
                        generationContext.push(...fresh.map(item => item.question));
                    } catch (error) {
                        lastApiError = error;
                        if (error?.isTerminal || isLiveCodingRateLimitError(error)) {
                            break;
                        }
                        continue;
                    }
                }

                if (generated.length === 0 && lastApiError) {
                    console.warn('AI генерация вопросов не удалась после повторов:', lastApiError);
                    const reason = describeLiveCodingGenerationError(lastApiError);
                    showErrorMessage(reason.userMessage);
                    return;
                }

                if (generated.length === 0) {
                    showErrorMessage('Не удалось сгенерировать новые вопросы. Измените параметры или попробуйте позже.');
                    return;
                }

                const added = appendGeneratedQuestions(root, generated.slice(0, QUESTIONS_AI_PACK_SIZE));
                if (added === 0) {
                    throw new Error('Новые вопросы не были добавлены из-за дублей.');
                }

                refreshQuestionsAiControls(root);
                showSuccessMessage(`Добавлено новых AI-вопросов: ${added}.`);

            } catch (error) {
                console.error('Ошибка генерации вопросов:', error);
                const failureReason = describeLiveCodingGenerationError(error);
                showErrorMessage(failureReason.userMessage);
            } finally {
                setQuestionsGenerateButtonLoading(triggerButton, false);
            }
        }

        function getStageAccentColor(stageNumber) {
            if (stageNumber === 1 || stageNumber === 2) return 'var(--accent1)';
            if (stageNumber === 3) return 'var(--accent3)';
            if (stageNumber === 4) return '#a855f7';
            if (stageNumber === 5) return '#ef4444';
            return 'var(--accent2)';
        }

        function createGeneratedTaskCard(task, stageNumber, moduleName) {
            const taskId = `generated-stage${stageNumber}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const safeSolution = String(task?.solution || '').trim()
                || 'Эталон ответа временно недоступен. Нажмите "Добавить задачи" еще раз, чтобы получить новый вариант.';
            const sourceKey = String(task?.source || '').toLowerCase() === 'ai' ? 'ai' : 'local';
            const card = document.createElement('div');
            card.className = 'task-box generated-task-box';
            card.setAttribute('data-task-id', taskId);
            card.setAttribute('data-task-hint', task.hint);
            card.setAttribute('data-task-solution', safeSolution);
            card.setAttribute('data-task-stage', String(stageNumber || 0));
            card.setAttribute('data-task-module', moduleName || '');
            card.setAttribute('data-task-source', sourceKey);
            card.style.background = 'rgba(255,255,255,0.05)';
            card.style.padding = '20px';
            card.style.borderRadius = '8px';
            card.style.borderLeft = `4px solid ${getStageAccentColor(stageNumber)}`;

            const difficultyLabel = task.difficulty === 'hard'
                ? 'Hard'
                : task.difficulty === 'easy'
                    ? 'Easy'
                    : 'Medium';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 style="margin-top:0; color:#fff; font-size: 1.1rem; margin-bottom: 12px;">🆕 ${escapeHtml(task.title)}</h4>
                    <button onclick="toggleFavoriteTask('${taskId}', 'Лайв-кодинг ИИ', String(this.previousElementSibling.textContent).replace('🆕 ', '')).then(res=>{if(res!==undefined) {this.textContent=res?'⭐':'☆';}}).catch(e=>{console.error(e)})" style="background:transparent; border:none; font-size:20px; cursor:pointer;" title="В избранное">☆</button>
                </div>
                <p style="margin-bottom: 10px; color:#cbd5e1;"><strong>Сложность:</strong> ${escapeHtml(difficultyLabel)}</p>
                <p style="margin-bottom: 12px;">${escapeHtml(task.description)}</p>
                ${task.tables ? `<p style="margin-bottom: 16px;"><strong>Таблицы/данные:</strong> <code>${escapeHtml(task.tables)}</code></p>` : ''}

                <div class="answer-input-area">
                    <label>Ваше решение:</label>
                    <textarea rows="10" class="answer-textarea" placeholder="${escapeHtml(task.placeholder)}"></textarea>
                    <button class="check-answer-btn" onclick="checkAnswer(this)">Проверить мое решение</button>
                    <div class="check-result"></div>
                </div>

                <details style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 4px; cursor: pointer; border: 1px solid rgba(74, 222, 128, 0.3);">
                    <summary style="font-weight: 600; color: #4ade80; outline:none;">✅ Показать эталон</summary>
                    <pre style="background:#1e293b; padding:12px; border-radius:6px; margin-top: 12px; margin-bottom: 0; color:#e2e8f0; overflow-x: auto;"><code class="generated-solution-code">${escapeHtml(safeSolution)}</code></pre>
                </details>
            `;

            return card;
        }

        function appendGeneratedTaskToStage(root, stageHeading, task, moduleName, options = {}) {
            const stageScope = getStageSectionScope(stageHeading);
            const card = createGeneratedTaskCard(task, stageScope.stageNumber, moduleName);

            const moduleAnchor = resolveModuleInsertionAnchor(stageScope, moduleName);
            if (moduleAnchor && moduleAnchor.parentElement) {
                moduleAnchor.insertAdjacentElement('afterend', card);
            } else {
                const targetContainer = resolveStageInsertionContainer(stageScope, root);
                targetContainer.appendChild(card);
            }

            if (typeof setupAnswerField !== 'undefined') {
                setupAnswerField(card);
            }
            if (typeof ensureTaskHints !== 'undefined') {
                ensureTaskHints(card);
            }

            ensureCodingTaskSourceLabels(root);

            if (options.scrollIntoView !== false) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return card;
        }

        async function handleStageTaskGeneration(root, stageHeading, moduleSelect, triggerButton, options = {}) {
            if (!isCodingAiMode(root)) {
                if (!options.silentFailure) {
                    showErrorMessage('AI-генерация доступна только в режиме "С ИИ".');
                }
                saveLiveCodingFailureState(options.failureState, new Error('AI-генерация доступна только в режиме "С ИИ".'));
                return false;
            }

            const stageScope = getStageSectionScope(stageHeading);
            if (!stageScope.stageNumber) {
                showErrorMessage('Не удалось определить этап для генерации задачи.');
                saveLiveCodingFailureState(options.failureState, new Error('Не удалось определить этап для генерации задачи.'));
                return false;
            }

            const stageLabel = stageScope.stageLabel;
            const moduleName = normalizeTitleValue(moduleSelect?.value || stageScope.moduleNames[0] || 'Общий модуль');
            let token = String(options.preferredToken || getGitHubModelsToken() || '').trim();

            if (!token && !options.skipTokenPrompt) {
                token = openGitHubTokenSettings();
            }

            if (!token) {
                if (!options.silentFailure) {
                    showErrorMessage('Токен не задан. Укажите токен GitHub Models и повторите генерацию.');
                }
                saveLiveCodingFailureState(options.failureState, new Error('Токен не задан.'));
                return false;
            }

            syncGeneratedTaskTitlesFromCodingDom(root);
            const stageTitles = getStageTaskTitles(stageScope);
            const moduleTitles = getModuleTaskTitles(stageScope, moduleName);
            const shownTitles = normalizeTaskTitleList(
                getStoredGeneratedTaskTitles().concat(stageTitles)
            );

            const generationContext = {
                stageNumber: stageScope.stageNumber,
                candidateCount: LIVE_CODING_CANDIDATES_PER_REQUEST,
                shownTitles,
                stageTitles,
                moduleTitles,
                stageRule: getStageContextRule(stageScope.stageNumber)
            };

            const existingTitlesSet = new Set(shownTitles.map(title => title.toLowerCase()));

            setGenerateTaskButtonLoading(triggerButton, true);
            try {
                let task = null;
                let lastApiError = null;

                for (let attempt = 0; attempt < LIVE_CODING_AI_REQUEST_ATTEMPTS; attempt += 1) {
                    generationContext.candidateCount = Math.max(1, LIVE_CODING_CANDIDATES_PER_REQUEST - attempt);

                    let candidates = null;
                    try {
                        candidates = await requestGeneratedLiveCodingTask(stageLabel, moduleName, generationContext, token);
                    } catch (apiError) {
                        lastApiError = apiError;
                        if (apiError?.isTerminal || isLiveCodingRateLimitError(apiError)) {
                            break;
                        }
                        continue;
                    }

                    const pack = Array.isArray(candidates) ? candidates : [];
                    let hadUniqueCandidate = false;

                    for (const candidate of pack) {
                        const normalizedTitle = normalizeTitleValue(candidate.title).toLowerCase();
                        if (existingTitlesSet.has(normalizedTitle)) {
                            continue;
                        }

                        hadUniqueCandidate = true;

                        if (isTaskAlignedWithModule(candidate, stageScope.stageNumber, moduleName)) {
                            task = candidate;
                            break;
                        }

                        lastApiError = new Error(`AI вернул задачу не по выбранному модулю: ${moduleName}`);
                    }

                    if (task) {
                        break;
                    }

                    if (!hadUniqueCandidate) {
                        lastApiError = new Error('AI вернул только дубли задач.');
                    }
                }

                if (!task) {
                    throw (lastApiError || new Error('AI не вернул новую уникальную задачу'));
                }

                task = {
                    ...task,
                    source: 'ai'
                };

                if (options.generationStats && typeof options.generationStats === 'object') {
                    options.generationStats.ai = Number(options.generationStats.ai || 0) + 1;
                }

                appendGeneratedTaskToStage(root, stageHeading, task, moduleName, {
                    scrollIntoView: options.disableAutoScroll ? false : true
                });
                rememberGeneratedTaskTitle(task.title);
                applyCodingAiModeVisibility(root);

                if (!options.silentSuccess) {
                    showSuccessMessage('Новая AI-задача добавлена.');
                }

                return true;
            } catch (error) {
                console.error('Ошибка генерации задачи:', error);
                const failureReason = describeLiveCodingGenerationError(error);
                saveLiveCodingFailureState(options.failureState, error);
                if (!options.silentFailure) {
                    showErrorMessage(failureReason.userMessage);
                }
                return false;
            } finally {
                setGenerateTaskButtonLoading(triggerButton, false);
            }
        }

        async function generateStarterTasksForVisibleStages(root, triggerButton = null) {
            if (!root) return;
            if (isGeneratingStarterPack) {
                return;
            }

            const stageHeadings = getVisibleCodingStageHeadings(root);
            if (stageHeadings.length === 0) {
                showErrorMessage('Нет выбранных этапов для генерации стартового набора.');
                return;
            }

            let token = getGitHubModelsToken();
            if (!token) {
                token = openGitHubTokenSettings();
            }

            if (!token) {
                showErrorMessage('Токен не задан. Укажите токен GitHub Models и повторите генерацию.');
                return;
            }

            isGeneratingStarterPack = true;
            setGenerateTaskButtonLoading(triggerButton, true);

            let generatedCount = 0;
            let plannedCount = 0;
            const generationStats = { ai: 0 };
            let consecutiveFailures = 0;
            let stoppedByApiFailures = false;
            const failureState = { lastError: null, lastReason: null };
            try {
                for (const stageHeading of stageHeadings) {
                    const stageScope = getStageSectionScope(stageHeading);
                    const targetCount = getStageStarterTargetCount(stageScope.stageNumber);
                    let currentCount = stageScope.taskBoxes.length;
                    const remainingCount = Math.max(0, targetCount - currentCount);

                    const moduleNames = stageScope.moduleNames.length > 0
                        ? stageScope.moduleNames
                        : ['Общий модуль'];

                    plannedCount += remainingCount;

                    const maxAttempts = Math.max(remainingCount * 5, remainingCount + moduleNames.length);
                    let attempts = 0;
                    let moduleCursor = 0;

                    while (currentCount < targetCount && attempts < maxAttempts) {
                        const moduleName = moduleNames[moduleCursor % moduleNames.length];
                        moduleCursor += 1;
                        attempts += 1;

                        const moduleSelect = { value: moduleName };
                        const created = await handleStageTaskGeneration(root, stageHeading, moduleSelect, null, {
                            silentSuccess: true,
                            silentFailure: true,
                            skipTokenPrompt: true,
                            preferredToken: token,
                            generationStats,
                            failureState,
                            disableAutoScroll: true
                        });

                        if (created) {
                            generatedCount += 1;
                            currentCount += 1;
                            consecutiveFailures = 0;
                        } else {
                            consecutiveFailures += 1;
                            const isRateLimited = failureState.lastReason?.code === 'rate-limit';
                            if (isRateLimited || consecutiveFailures >= LIVE_CODING_MAX_CONSECUTIVE_FAILURES) {
                                stoppedByApiFailures = true;
                                break;
                            }
                        }
                    }

                    if (stoppedByApiFailures) {
                        break;
                    }
                }
                applyCodingAiModeVisibility(root);
                const sourceSummary = ` (AI: ${generationStats.ai})`;
                const reasonSuffix = failureState.lastReason?.userMessage
                    ? ` Причина: ${failureState.lastReason.userMessage}`
                    : '';

                if (stoppedByApiFailures && generatedCount > 0) {
                    showErrorMessage(`Генерация остановлена после серии ошибок API, добавлено ${generatedCount} из ${plannedCount}${sourceSummary}.${reasonSuffix}`);
                } else if (stoppedByApiFailures) {
                    showErrorMessage(`Генерация остановлена после серии ошибок API.${reasonSuffix}`);
                } else if (plannedCount === 0) {
                    showSuccessMessage('Для выбранных этапов полный стартовый набор уже сформирован.');
                } else if (generatedCount >= plannedCount) {
                    showSuccessMessage(`Стартовый AI-набор готов: ${generatedCount} задач${sourceSummary}.`);
                } else if (generatedCount > 0) {
                    showErrorMessage(`Сгенерировано ${generatedCount} из ${plannedCount}${sourceSummary}. Можно нажать кнопку еще раз для добора.`);
                } else {
                    showErrorMessage('Не удалось сгенерировать полный стартовый набор. Попробуйте еще раз.');
                }
            } catch (error) {
                console.error('Ошибка генерации стартового AI-набора:', error);
                showErrorMessage('Не удалось сгенерировать стартовый набор задач.');
            } finally {
                isGeneratingStarterPack = false;
                setGenerateTaskButtonLoading(triggerButton, false);
            }
        }

        function getVisibleStageOptionsForGeneration(root) {
            const stageHeadings = getVisibleCodingStageHeadings(root);
            const options = [];
            const seenStageNumbers = new Set();

            stageHeadings.forEach(stageHeading => {
                const stageScope = getStageSectionScope(stageHeading);
                const stageNumber = Number(stageScope.stageNumber || 0);
                if (!stageNumber || seenStageNumbers.has(stageNumber)) return;

                seenStageNumbers.add(stageNumber);
                options.push({
                    value: String(stageNumber),
                    label: `Этап ${stageNumber} (${stageScope.stageLabel || 'General'})`,
                    heading: stageHeading,
                    modules: stageScope.moduleNames.length > 0 ? stageScope.moduleNames : ['Общий модуль']
                });
            });

            return options;
        }

        function populateTopGenerationModuleOptions(stageSelect, moduleSelect, stageOptions) {
            if (!stageSelect || !moduleSelect) return;

            const selectedStage = String(stageSelect.value || 'all');
            const previousModule = String(moduleSelect.value || 'all');
            moduleSelect.innerHTML = '';

            if (selectedStage === 'all') {
                const option = document.createElement('option');
                option.value = 'all';
                option.textContent = 'Все модули выбранных этапов';
                moduleSelect.appendChild(option);
                moduleSelect.value = 'all';
                moduleSelect.disabled = true;
                return;
            }

            const selectedStageOption = (Array.isArray(stageOptions) ? stageOptions : [])
                .find(item => item.value === selectedStage);
            const modules = selectedStageOption?.modules?.length > 0
                ? selectedStageOption.modules
                : ['Общий модуль'];

            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'Все модули этапа';
            moduleSelect.appendChild(allOption);

            modules.forEach(moduleName => {
                const option = document.createElement('option');
                option.value = moduleName;
                option.textContent = moduleName;
                moduleSelect.appendChild(option);
            });

            moduleSelect.disabled = false;
            if (Array.from(moduleSelect.options).some(option => option.value === previousModule)) {
                moduleSelect.value = previousModule;
            } else {
                moduleSelect.value = 'all';
            }
        }

        async function generateTasksFromTopControls(root, panel, triggerButton) {
            if (!root || !panel) return;
            if (isGeneratingStarterPack || isGeneratingCustomPack) return;

            const stageSelect = panel.querySelector('.coding-global-stage-select');
            const moduleSelect = panel.querySelector('.coding-global-module-select');
            const countInput = panel.querySelector('.coding-global-count-input');
            const tokenButton = panel.querySelector('.coding-global-token-btn');

            if (!stageSelect || !moduleSelect || !countInput) {
                showErrorMessage('Не удалось прочитать параметры генерации.');
                return;
            }

            const stageOptions = getVisibleStageOptionsForGeneration(root);
            if (stageOptions.length === 0) {
                showErrorMessage('Нет выбранных этапов для генерации.');
                return;
            }

            let plannedCount = Number.parseInt(String(countInput.value || '1'), 10);
            if (!Number.isFinite(plannedCount)) plannedCount = 1;
            plannedCount = Math.max(1, Math.min(20, plannedCount));
            countInput.value = String(plannedCount);

            const selectedStage = String(stageSelect.value || 'all');
            const selectedModule = String(moduleSelect.value || 'all');
            let token = String(getGitHubModelsToken() || '').trim();
            if (!token) {
                token = String(openGitHubTokenSettings(tokenButton || null) || '').trim();
                if (tokenButton) updateTokenSettingsButtonState(tokenButton);
            }

            if (!token) {
                showErrorMessage('Токен не задан. Укажите токен GitHub Models и повторите генерацию.');
                return;
            }

            const targets = [];

            if (selectedStage === 'all') {
                const moduleCursorByStage = new Map();
                for (let i = 0; i < plannedCount; i += 1) {
                    const stageOption = stageOptions[i % stageOptions.length];
                    const modules = stageOption.modules.length > 0 ? stageOption.modules : ['Общий модуль'];
                    const cursor = moduleCursorByStage.get(stageOption.value) || 0;
                    const moduleName = modules[cursor % modules.length];

                    moduleCursorByStage.set(stageOption.value, cursor + 1);
                    targets.push({ heading: stageOption.heading, moduleName });
                }
            } else {
                const stageOption = stageOptions.find(item => item.value === selectedStage);
                if (!stageOption) {
                    showErrorMessage('Выбранный этап недоступен для генерации.');
                    return;
                }

                const modules = stageOption.modules.length > 0 ? stageOption.modules : ['Общий модуль'];
                for (let i = 0; i < plannedCount; i += 1) {
                    const moduleName = selectedModule === 'all'
                        ? modules[i % modules.length]
                        : selectedModule;
                    targets.push({ heading: stageOption.heading, moduleName });
                }
            }

            isGeneratingCustomPack = true;
            setGenerateTaskButtonLoading(triggerButton, true);

            let generatedCount = 0;
            const generationStats = { ai: 0 };
            let consecutiveFailures = 0;
            let stoppedByApiFailures = false;
            const failureState = { lastError: null, lastReason: null };
            try {
                for (const target of targets) {
                    const created = await handleStageTaskGeneration(
                        root,
                        target.heading,
                        { value: target.moduleName },
                        null,
                        {
                            silentSuccess: true,
                            silentFailure: true,
                            skipTokenPrompt: true,
                            preferredToken: token,
                            generationStats,
                            failureState,
                            disableAutoScroll: true
                        }
                    );

                    if (created) {
                        generatedCount += 1;
                        consecutiveFailures = 0;
                    } else {
                        consecutiveFailures += 1;
                        const isRateLimited = failureState.lastReason?.code === 'rate-limit';
                        if (isRateLimited || consecutiveFailures >= LIVE_CODING_MAX_CONSECUTIVE_FAILURES) {
                            stoppedByApiFailures = true;
                            break;
                        }
                    }
                }

                applyCodingAiModeVisibility(root);
                const sourceSummary = ` (AI: ${generationStats.ai})`;
                const reasonSuffix = failureState.lastReason?.userMessage
                    ? ` Причина: ${failureState.lastReason.userMessage}`
                    : '';

                if (stoppedByApiFailures && generatedCount > 0) {
                    showErrorMessage(`Генерация остановлена после серии ошибок API. Добавлено задач: ${generatedCount}${sourceSummary}.${reasonSuffix}`);
                } else if (stoppedByApiFailures) {
                    showErrorMessage(`Генерация остановлена после серии ошибок API.${reasonSuffix}`);
                } else if (generatedCount === 0) {
                    showErrorMessage('Не удалось добавить задачи. Попробуйте еще раз.');
                } else if (generatedCount < targets.length) {
                    showErrorMessage(`Добавлено задач: ${generatedCount} из ${targets.length}${sourceSummary}. Можно повторить для добора.`);
                } else {
                    showSuccessMessage(`Добавлено задач: ${generatedCount}${sourceSummary}.`);
                }
            } catch (error) {
                console.error('Ошибка массовой генерации задач:', error);
                showErrorMessage('Ошибка при массовой генерации задач.');
            } finally {
                isGeneratingCustomPack = false;
                setGenerateTaskButtonLoading(triggerButton, false);
            }
        }

        function ensureCodingAiModeControls(root) {
            if (!root) return;

            const contentContainer = root.querySelector('.page-content') || root;
            if (!isCodingAiMode(root)) {
                contentContainer.querySelectorAll('.coding-ai-mode-controls').forEach(panel => panel.remove());
                return;
            }

            const pageHeader = contentContainer.querySelector('.page-header');
            if (!pageHeader) return;

            let panel = contentContainer.querySelector('.coding-ai-mode-controls');
            if (!panel) {
                panel = document.createElement('div');
                panel.className = 'coding-ai-mode-controls';

                panel.innerHTML = `
                    <div class="coding-controls-primary">
                        <button type="button" class="btn btn-secondary token-config-btn coding-global-token-btn">Токен</button>
                        <button type="button" class="btn btn-secondary coding-ai-starter-btn">Стартовый набор</button>
                    </div>
                    <div class="coding-controls-secondary">
                        <select class="coding-module-select coding-global-stage-select"></select>
                        <select class="coding-module-select coding-global-module-select"></select>
                        <input type="number" class="coding-count-input coding-global-count-input" min="1" max="20" step="1" value="1" />
                        <button type="button" class="btn generate-task-btn coding-global-generate-btn">Сгенерировать</button>
                    </div>
                    <p class="coding-ai-mode-note"></p>
                `;

                const anchor = contentContainer.querySelector('.coding-practice-switcher') || pageHeader;
                anchor.insertAdjacentElement('afterend', panel);
            }

            const starterButton = panel.querySelector('.coding-ai-starter-btn');
            const tokenButton = panel.querySelector('.coding-global-token-btn');
            const stageSelect = panel.querySelector('.coding-global-stage-select');
            const moduleSelect = panel.querySelector('.coding-global-module-select');
            const generateButton = panel.querySelector('.coding-global-generate-btn');
            const countInput = panel.querySelector('.coding-global-count-input');

            if (!starterButton || !tokenButton || !stageSelect || !moduleSelect || !generateButton || !countInput) return;

            const stageOptions = getVisibleStageOptionsForGeneration(root);
            const previousStage = String(stageSelect.value || 'all');
            stageSelect.innerHTML = '';

            const allStagesOption = document.createElement('option');
            allStagesOption.value = 'all';
            allStagesOption.textContent = 'Все выбранные этапы';
            stageSelect.appendChild(allStagesOption);

            stageOptions.forEach(optionData => {
                const option = document.createElement('option');
                option.value = optionData.value;
                option.textContent = optionData.label;
                stageSelect.appendChild(option);
            });

            if (Array.from(stageSelect.options).some(option => option.value === previousStage)) {
                stageSelect.value = previousStage;
            } else {
                stageSelect.value = 'all';
            }

            populateTopGenerationModuleOptions(stageSelect, moduleSelect, stageOptions);
            updateTokenSettingsButtonState(tokenButton);

            if (panel.dataset.bound !== 'true') {
                starterButton.addEventListener('click', () => {
                    generateStarterTasksForVisibleStages(root, starterButton);
                });

                tokenButton.addEventListener('click', () => {
                    openGitHubTokenSettings(tokenButton);
                    updateTokenSettingsButtonState(tokenButton);
                });

                stageSelect.addEventListener('change', () => {
                    const options = getVisibleStageOptionsForGeneration(root);
                    populateTopGenerationModuleOptions(stageSelect, moduleSelect, options);
                });

                generateButton.addEventListener('click', () => {
                    generateTasksFromTopControls(root, panel, generateButton);
                });

                panel.dataset.bound = 'true';
            }

            applyCodingAiModeVisibility(root);
        }

        function attachCodingStageGenerationControls(root) {
            if (!root) return;

            const stageHeadings = getVisibleCodingStageHeadings(root);

            stageHeadings.forEach(stageHeading => {
                const existingControls = stageHeading.nextElementSibling;
                if (existingControls && existingControls.classList?.contains('coding-stage-actions')) {
                    return;
                }

                const stageScope = getStageSectionScope(stageHeading);
                const modules = stageScope.moduleNames.length > 0 ? stageScope.moduleNames : ['Общий модуль'];

                const controls = document.createElement('div');
                controls.className = 'coding-stage-actions';

                const moduleSelect = document.createElement('select');
                moduleSelect.className = 'coding-module-select';

                modules.forEach(moduleName => {
                    const option = document.createElement('option');
                    option.value = moduleName;
                    option.textContent = moduleName;
                    moduleSelect.appendChild(option);
                });

                const generateButton = document.createElement('button');
                generateButton.type = 'button';
                generateButton.className = 'btn generate-task-btn';
                generateButton.textContent = 'Новая задача';
                generateButton.addEventListener('click', () => {
                    handleStageTaskGeneration(root, stageHeading, moduleSelect, generateButton);
                });

                const tokenButton = document.createElement('button');
                tokenButton.type = 'button';
                tokenButton.className = 'btn btn-secondary token-config-btn';
                tokenButton.addEventListener('click', () => {
                    openGitHubTokenSettings(tokenButton);
                });
                updateTokenSettingsButtonState(tokenButton);

                controls.appendChild(moduleSelect);
                controls.appendChild(tokenButton);
                controls.appendChild(generateButton);
                stageHeading.insertAdjacentElement('afterend', controls);
            });
        }

        async function loadTaskBankSectionText(sectionName, fallbackSource, forceReload = false) {
            await loadTaskBankManifest(forceReload);

            const preferredUrl = withCacheBust(getTaskBankSectionUrl(sectionName, fallbackSource));
            const fallbackUrl = withCacheBust(resolveTaskSourceUrl(fallbackSource));
            const candidates = [preferredUrl, fallbackUrl]
                .filter(Boolean)
                .filter((value, index, arr) => arr.indexOf(value) === index);

            let lastError = null;

            for (const url of candidates) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Не удалось загрузить раздел ${sectionName}: ${response.status}`);
                    }
                    return await response.text();
                } catch (error) {
                    lastError = error;
                    console.warn(`Ошибка загрузки ${sectionName} из ${url}:`, error);
                }
            }

            throw lastError || new Error(`Не удалось загрузить раздел ${sectionName}`);
        }

        function pickRandomQuestions(items, count) {
            return shuffleList(items).slice(0, Math.max(0, count));
        }

        function normalizeInterviewQuestionBank(payload) {
            const source = Array.isArray(payload)
                ? payload
                : (Array.isArray(payload?.questions) ? payload.questions : []);

            const usedIds = new Set();
            return source.map(item => {
                if (!item || typeof item !== 'object') return false;
                const id = typeof item.id === 'string' ? item.id.trim() : '';
                const stage = typeof item.stage === 'string' ? item.stage.trim() : '';
                const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : '';
                const answer = typeof item.answer === 'string' ? item.answer.trim() : '';

                if (!id || !prompt || !answer || !INTERVIEW_STAGE_ORDER.includes(stage)) return false;
                if (usedIds.has(id)) return false;

                usedIds.add(id);
                return { id, stage, prompt, answer };
            }).filter(Boolean);
        }

        async function loadInterviewQuestionBank(forceReload = false) {
            if (interviewQuestionBankLoaded && !forceReload) {
                return interviewQuestionBank;
            }

            if (interviewQuestionBankPromise && !forceReload) {
                return interviewQuestionBankPromise;
            }

            await loadTaskBankManifest(forceReload);
            const sourceUrl = withCacheBust(getTaskBankSectionUrl('interview', INTERVIEW_QUESTION_BANK_SOURCE));
            const minBankSize = getTaskBankSectionMinItems('interview', INTERVIEW_MIN_BANK_SIZE);

            interviewQuestionBankPromise = fetch(sourceUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Не удалось загрузить банк интервью (${sourceUrl}): ${response.status}`);
                    }
                    return response.json();
                })
                .then(payload => {
                    const normalized = normalizeInterviewQuestionBank(payload);
                    if (normalized.length < minBankSize) {
                        throw new Error(`Слишком маленький пул вопросов: ${normalized.length}`);
                    }
                    interviewQuestionBank = normalized;
                    interviewQuestionBankLoaded = true;
                    return interviewQuestionBank;
                })
                .catch(error => {
                    console.warn('Использую fallback-пул вопросов:', error);
                    interviewQuestionBank = [...FALLBACK_INTERVIEW_QUESTION_BANK];
                    interviewQuestionBankLoaded = true;
                    return interviewQuestionBank;
                })
                .finally(() => {
                    interviewQuestionBankPromise = null;
                });

            return interviewQuestionBankPromise;
        }

        function buildInterviewQuestionSet(totalQuestions = 15) {
            const grouped = INTERVIEW_STAGE_ORDER.reduce((acc, stage) => {
                acc[stage] = interviewQuestionBank.filter(q => q.stage === stage);
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
                const fallbackPool = interviewQuestionBank.filter(q => !selectedIds.has(q.id));
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
                    results: interviewState.results,
                    startedAt: interviewState.startedAt,
                    durationMinutes: interviewState.durationMinutes,
                    isRunning: interviewState.isRunning,
                    isFinished: interviewState.isFinished
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
                interviewState.results = saved.results && typeof saved.results === 'object' ? saved.results : {};
                interviewState.startedAt = saved.startedAt || null;
                interviewState.durationMinutes = saved.durationMinutes || 45;
                interviewState.isRunning = Boolean(saved.isRunning);
                interviewState.isFinished = Boolean(saved.isFinished);
                interviewState.timerInterval = null;
            } catch (error) {
                console.warn('Не удалось загрузить сессию собеседования:', error);
            }
        }

        function syncInterviewQuestionsWithBank() {
            if (!Array.isArray(interviewState.questions) || interviewState.questions.length === 0) {
                return;
            }

            const bankMap = new Map(interviewQuestionBank.map(q => [q.id, q]));
            let updated = false;

            interviewState.questions = interviewState.questions.map(question => {
                const latest = bankMap.get(question.id);
                if (!latest) return question;

                if (question.prompt !== latest.prompt || question.answer !== latest.answer || question.stage !== latest.stage) {
                    updated = true;
                    return {
                        ...question,
                        prompt: latest.prompt,
                        answer: latest.answer,
                        stage: latest.stage
                    };
                }

                return question;
            });

            if (updated) {
                saveInterviewState();
            }
        }

        function getCurrentInterviewQuestion() {
            return interviewState.questions[interviewState.currentIndex] || null;
        }

        function escapeHtml(value) {
            return (value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function evaluateInterviewResponse(question, rawAnswer) {
            const text = (rawAnswer || '').trim();
            if (!text) {
                return { status: 'empty', similarity: 0 };
            }

            const normalizedUser = normalizeSQL(text.toLowerCase());
            const normalizedExpected = normalizeSQL((question?.answer || '').toLowerCase());
            if (!normalizedExpected) {
                return { status: 'incorrect', similarity: 0 };
            }

            const similarity = calculateSimilarity(normalizedUser, normalizedExpected);
            const isCorrect = normalizedUser === normalizedExpected || (normalizedUser.length >= 16 && similarity >= 0.74);

            return {
                status: isCorrect ? 'correct' : 'incorrect',
                similarity
            };
        }

        function getInterviewStats() {
            const total = interviewState.questions.length;
            const values = Object.values(interviewState.results || {});
            const correct = values.filter(v => v === 'correct').length;
            const incorrect = values.filter(v => v === 'incorrect').length;
            const skipped = values.filter(v => v === 'skipped').length;
            const processed = correct + incorrect + skipped;
            const unchecked = Math.max(0, total - processed);
            const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

            return {
                total,
                correct,
                incorrect,
                skipped,
                processed,
                unchecked,
                scorePercent,
                poolSize: interviewQuestionBank.length
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
                    finishInterviewSession('timer');
                }
            }, 1000);
        }

        async function createInterviewSession(totalQuestions = 15, options = {}) {
            await loadInterviewQuestionBank();

            const settings = {
                autoStart: true,
                ...options
            };

            interviewState.questions = buildInterviewQuestionSet(totalQuestions);
            interviewState.currentIndex = 0;
            interviewState.answers = {};
            interviewState.results = {};
            interviewState.isFinished = false;
            stopInterviewTimer();

            if (settings.autoStart) {
                interviewState.startedAt = Date.now();
                interviewState.isRunning = true;
                startInterviewTimer();
            } else {
                interviewState.startedAt = null;
                interviewState.isRunning = false;
            }

            saveInterviewState();
            renderInterviewState();
        }

        function renderInterviewSummary() {
            const scoreEl = document.getElementById('interview-score');
            const summaryEl = document.getElementById('interview-summary');
            if (!scoreEl || !summaryEl) return;

            const stats = getInterviewStats();
            scoreEl.textContent = `Правильных: ${stats.correct}/${stats.total}. Неправильных: ${stats.incorrect}. Пропущенных: ${stats.skipped}. Итог: ${stats.scorePercent}%.`;

            if (stats.total === 0) {
                summaryEl.textContent = 'Сначала сгенерируйте сессию вопросов.';
                return;
            }

            if (!interviewState.isFinished) {
                summaryEl.textContent = `Идет сессия: проверено ${stats.processed}/${stats.total}. Можно отвечать или пропускать вопросы.`;
                return;
            }

            if (stats.scorePercent >= 70) {
                summaryEl.textContent = 'Сессия закрыта успешно. Разберите неверные и снова прогоните набор.';
            } else {
                summaryEl.textContent = 'Сессия завершена. Рекомендуется повторить блоки с ошибками и пройти новый прогон.';
            }
        }

        function updateInterviewProgressUI() {
            const stats = getInterviewStats();
            const progressLabel = document.getElementById('interview-progress-label');
            const confidenceLabel = document.getElementById('interview-confidence-label');
            const readyLabel = document.getElementById('interview-ready-label');
            const progressBar = document.getElementById('interview-progress-bar');
            const poolLabel = document.getElementById('interview-pool-label');

            if (progressLabel) progressLabel.textContent = `Проверено: ${stats.processed}/${stats.total}`;
            if (confidenceLabel) confidenceLabel.textContent = `Правильных: ${stats.correct}`;
            if (readyLabel) readyLabel.textContent = `Неправильных: ${stats.incorrect} | Пропущено: ${stats.skipped}`;
            if (poolLabel) poolLabel.textContent = `Пул вопросов: ${stats.poolSize}`;
            if (progressBar) {
                const percent = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;
                progressBar.style.width = `${percent}%`;
            }

            renderInterviewSummary();
        }

        function renderInterviewCheckFeedback() {
            const feedbackEl = document.getElementById('interview-current-result');
            const question = getCurrentInterviewQuestion();
            if (!feedbackEl || !question) return;

            const status = interviewState.results[question.id];
            feedbackEl.className = 'interview-current-result';

            if (!status) {
                feedbackEl.textContent = 'Ответ пока не проверен.';
                return;
            }

            if (status === 'correct') {
                feedbackEl.classList.add('correct');
                feedbackEl.textContent = 'Статус: правильно.';
                return;
            }

            if (status === 'incorrect') {
                feedbackEl.classList.add('incorrect');
                feedbackEl.textContent = 'Статус: неправильно. В конце сессии увидите эталон.';
                return;
            }

            feedbackEl.classList.add('skipped');
            feedbackEl.textContent = 'Статус: вопрос пропущен.';
        }

        function renderInterviewReview() {
            const reviewEl = document.getElementById('interview-review-list');
            if (!reviewEl) return;

            if (!interviewState.isFinished || interviewState.questions.length === 0) {
                reviewEl.innerHTML = '<p class="card-text" style="color: var(--text-dim);">После завершения сессии здесь появятся ваши ответы и эталоны.</p>';
                return;
            }

            const rows = interviewState.questions.map((question, index) => {
                const status = interviewState.results[question.id] || 'unchecked';
                const statusLabel = status === 'correct'
                    ? 'Правильно'
                    : (status === 'incorrect' ? 'Неправильно' : (status === 'skipped' ? 'Пропущено' : 'Не проверено'));
                const userAnswer = interviewState.answers[question.id] || '—';
                const expected = question.answer || '—';

                return `
                    <div class="interview-review-item ${status}">
                        <div class="interview-review-head">
                            <span class="interview-review-index">#${index + 1}</span>
                            <span class="interview-review-status ${status}">${statusLabel}</span>
                        </div>
                        <p class="interview-review-question">${escapeHtml(question.prompt)}</p>
                        <p class="interview-review-label">Ваш ответ</p>
                        <pre class="interview-review-code">${escapeHtml(userAnswer)}</pre>
                        <p class="interview-review-label">Эталон</p>
                        <pre class="interview-review-code">${escapeHtml(expected)}</pre>
                    </div>
                `;
            });

            reviewEl.innerHTML = rows.join('');
        }

        function renderInterviewQuestion() {
            const total = interviewState.questions.length;
            const index = interviewState.currentIndex;
            const currentQuestion = interviewState.questions[index];

            const counterEl = document.getElementById('interview-counter');
            const stageEl = document.getElementById('interview-stage-pill');
            const questionEl = document.getElementById('interview-question-text');
            const answerEl = document.getElementById('interview-answer');
            const checkBtn = document.getElementById('interview-check-btn');
            const skipBtn = document.getElementById('interview-skip-btn');

            if (!counterEl || !stageEl || !questionEl || !answerEl || !checkBtn || !skipBtn) return;

            if (!currentQuestion) {
                counterEl.textContent = 'Вопрос 0/0';
                stageEl.textContent = 'Этап';
                questionEl.textContent = 'Нажмите «Сгенерировать и стартовать», чтобы начать.';
                answerEl.value = '';
                answerEl.disabled = true;
                checkBtn.disabled = true;
                skipBtn.disabled = true;
                renderInterviewCheckFeedback();
                return;
            }

            counterEl.textContent = `Вопрос ${index + 1}/${total}`;
            stageEl.textContent = getStageDisplayName(currentQuestion.stage);
            
            questionEl.textContent = '';
            questionEl.appendChild(document.createTextNode(currentQuestion.prompt + ' '));
            
            const favBtn = document.createElement("button");
            favBtn.innerHTML = "☆";
            favBtn.title = "В избранное";
            favBtn.style.background = "transparent";
            favBtn.style.border = "none";
            favBtn.style.fontSize = "20px";
            favBtn.style.cursor = "pointer";
            favBtn.style.verticalAlign = "middle";
            const taskId = btoa(unescape(encodeURIComponent(currentQuestion.prompt)));
            
            if (typeof supabaseClient !== "undefined" && supabaseClient) {
                getCurrentUser().then(user => {
                    if (user) {
                        supabaseClient.from("favorites").select("id").eq("user_id", user.id).eq("task_id", taskId).single()
                        .then(({data}) => { if (data) favBtn.innerHTML = "⭐"; }).catch(()=>{});
                    }
                });
            }
            
            favBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavoriteTask(taskId, "Вопрос собеседования", currentQuestion.prompt)
                    .then(res => { if (res !== undefined) favBtn.innerHTML = res ? "⭐" : "☆"; })
                    .catch(console.error);
            };
            questionEl.appendChild(favBtn);

            if (typeof injectMonacoEditor !== 'undefined') {
                setTimeout(() => injectMonacoEditor(answerEl), 100);
            }

            answerEl.disabled = interviewState.isFinished;
            answerEl.value = interviewState.answers[currentQuestion.id] || '';

            checkBtn.disabled = interviewState.isFinished;
            skipBtn.disabled = interviewState.isFinished;

            renderInterviewCheckFeedback();
        }

        function renderInterviewState() {
            if (!document.getElementById('interview-question-text')) return;
            renderInterviewQuestion();
            updateInterviewProgressUI();
            updateInterviewTimerDisplay();
            renderInterviewReview();
        }

        function advanceInterviewFlow() {
            if (interviewState.currentIndex < interviewState.questions.length - 1) {
                interviewState.currentIndex += 1;
                saveInterviewState();
                renderInterviewState();
            } else {
                finishInterviewSession('completed');
            }
        }

        async function checkCurrentInterviewAnswer() {
            const question = getCurrentInterviewQuestion();
            if (!question || interviewState.isFinished) return;

            const answerText = (interviewState.answers[question.id] || "").trim();
            if (!answerText) {
                showErrorMessage("Введите ответ или нажмите «Пропустить вопрос».");
                return;
            }

            showSuccessMessage("⏳ ИИ оценивает ваш ответ как Senior Data Engineer...");
            const aiAssessment = await executeInterviewAICheck(question, answerText);
            
            let assessment = { status: "incorrect", similarity: 0 };
            if (aiAssessment) {
                assessment.status = aiAssessment.status;
                assessment.reason = aiAssessment.reason;
            } else {
                assessment = evaluateInterviewResponse(question, answerText);
            }
            
            interviewState.results[question.id] = assessment.status;
            saveInterviewState();

            if (assessment.status === "correct") {
                showSuccessMessage("Оценка ИИ: ✅ Ответ принят!");
            } else {
                const baseMsg = assessment.reason ? ("❌ ИИ не принял ответ: " + assessment.reason) : ("Ответ не совпал с эталоном (сходство " + Math.round(assessment.similarity * 100) + "%).");
                showErrorMessage(baseMsg.substring(0, 150) + "... Переходим дальше.");
            }

            setTimeout(() => advanceInterviewFlow(), 2000);
        }

        function skipCurrentInterviewQuestion() {
            const question = getCurrentInterviewQuestion();
            if (!question || interviewState.isFinished) return;
            interviewState.results[question.id] = 'skipped';
            saveInterviewState();
            advanceInterviewFlow();
        }

        function finishInterviewSession(reason = 'manual') {
            interviewState.isRunning = false;
            interviewState.isFinished = true;
            stopInterviewTimer();

            // Все непроверенные вопросы считаем пропущенными к моменту завершения
            interviewState.questions.forEach(question => {
                if (!interviewState.results[question.id]) {
                    interviewState.results[question.id] = 'skipped';
                }
            });

            saveInterviewState();
            renderInterviewState();

            if (reason === 'timer') {
                showErrorMessage('Время вышло. Сессия завершена автоматически.');
            } else {
                showSuccessMessage('Сессия собеседования завершена. Ниже доступен полный разбор ответов.');
            }
        }

        function resetInterviewSession() {
            if (!window.confirm('Сбросить текущую сессию собеседования?')) return;

            stopInterviewTimer();
            interviewState = {
                questions: [],
                currentIndex: 0,
                answers: {},
                results: {},
                startedAt: null,
                durationMinutes: 45,
                isRunning: false,
                isFinished: false,
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
            bindInterviewButton('interview-generate-btn', async () => {
                try {
                    await createInterviewSession(15, { autoStart: true });
                } catch (error) {
                    console.error('Не удалось создать сессию:', error);
                    showErrorMessage('Не удалось создать сессию собеседования. Попробуйте снова.');
                }
            });

            bindInterviewButton('interview-start-btn', async () => {
                if (interviewState.questions.length === 0) {
                    try {
                        await createInterviewSession(15, { autoStart: true });
                        return;
                    } catch (error) {
                        console.error('Не удалось запустить сессию:', error);
                        showErrorMessage('Не удалось запустить сессию собеседования.');
                        return;
                    }
                }

                interviewState.startedAt = Date.now();
                interviewState.isRunning = true;
                interviewState.isFinished = false;
                stopInterviewTimer();
                startInterviewTimer();
                saveInterviewState();
                renderInterviewState();
            });

            bindInterviewButton('interview-reset-btn', resetInterviewSession);
            bindInterviewButton('interview-check-btn', checkCurrentInterviewAnswer);
            bindInterviewButton('interview-skip-btn', skipCurrentInterviewQuestion);
            bindInterviewButton('interview-finish-btn', () => finishInterviewSession('manual'));

            const answerEl = document.getElementById('interview-answer');
            if (answerEl && answerEl.dataset.bound !== 'true') {
                answerEl.addEventListener('input', () => {
                    const currentQuestion = getCurrentInterviewQuestion();
                    if (!currentQuestion || interviewState.isFinished) return;
                    interviewState.answers[currentQuestion.id] = answerEl.value;
                    saveInterviewState();
                });
                answerEl.dataset.bound = 'true';
            }
        }

        function initInterviewSection() {
            loadInterviewState();
            ensureInterviewBindings();
            loadInterviewQuestionBank().then(() => {
                syncInterviewQuestionsWithBank();
                updateInterviewProgressUI();
                renderInterviewState();
            });

            if (!interviewState.isFinished && interviewState.isRunning && getInterviewRemainingMs() > 0) {
                startInterviewTimer();
            } else {
                interviewState.isRunning = false;
                stopInterviewTimer();
            }

            renderInterviewState();
        }

        async function initQuestionsSection() {
            const root = document.getElementById('questions-content-root');
            if (!root) return;

            root.innerHTML = `
                <div class="coding-mode-switcher">
                    <p class="coding-mode-label">Выберите формат вопросов:</p>
                    <div class="coding-mode-actions">
                        <button type="button" class="btn btn-secondary coding-mode-btn questions-mode-btn" data-questions-mode="local">Без ИИ (локальные вопросы)</button>
                        <button type="button" class="btn btn-secondary coding-mode-btn questions-mode-btn" data-questions-mode="ai">С ИИ (только AI-вопросы)</button>
                    </div>
                    <p class="coding-mode-hint questions-mode-hint"></p>
                </div>
                <div class="questions-mode-content-root" id="questions-dynamic-root">
                    <div style="text-align:center; color: var(--text-dim); margin-top: 24px;">Загрузка вопросов...</div>
                </div>
            `;

            const modeButtons = Array.from(root.querySelectorAll('.questions-mode-btn'));
            const modeHint = root.querySelector('.questions-mode-hint');
            const modeContentRoot = root.querySelector('.questions-mode-content-root');

            if (!modeHint || !modeContentRoot || modeButtons.length === 0) {
                root.innerHTML = '<div style="text-align:center; color: var(--red); margin-top: 24px;">Не удалось инициализировать режимы вопросов.</div>';
                return;
            }

            const applyModeButtonState = mode => {
                const normalizedMode = normalizeQuestionsMode(mode);
                modeButtons.forEach(button => {
                    const buttonMode = normalizeQuestionsMode(button.dataset.questionsMode);
                    const isActive = buttonMode === normalizedMode;
                    button.classList.toggle('is-active', isActive);
                    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });

                modeHint.textContent = normalizedMode === 'ai'
                    ? 'Среда "С ИИ": ваша личная база вопросов. Если здесь пусто — выберите нужную категорию и сгенерируйте.'
                    : 'Среда "Без ИИ": статические вопросы. Генерация недоступна.';
            };

            const loadQuestionsMode = async mode => {
                const normalizedMode = normalizeQuestionsMode(mode);
                saveStoredQuestionsMode(normalizedMode);
                applyModeButtonState(normalizedMode);

                modeContentRoot.dataset.questionsMode = normalizedMode;
                modeContentRoot.innerHTML = '<div style="text-align:center; color: var(--text-dim); margin-top: 24px;">Загрузка вопросов...</div>';

                const sectionName = normalizedMode === 'ai' ? 'questions-ai' : 'questions-local';
                const source = normalizedMode === 'ai'
                    ? QUESTIONS_CONTENT_AI_SOURCE
                    : QUESTIONS_CONTENT_LOCAL_SOURCE;

                try {
                    const html = await loadTaskBankSectionText(sectionName, source);
                    modeContentRoot.innerHTML = html;
                    modeContentRoot.dataset.questionsMode = normalizedMode;

                    if (normalizedMode === 'ai') {
                        hydrateStoredGeneratedQuestions(modeContentRoot);
                        refreshQuestionsAiControls(modeContentRoot);
                    }
                    if (typeof injectFavoriteButtons !== 'undefined') injectFavoriteButtons(modeContentRoot);
                } catch (error) {
                    console.error('Не удалось загрузить контент вопросов:', error);
                    modeContentRoot.innerHTML = '<div style="text-align:center; color: var(--red); margin-top: 24px;">Не удалось загрузить вопросы. Попробуйте обновить страницу.</div>';
                }
            };

            modeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const mode = button.dataset.questionsMode;
                    if (normalizeQuestionsMode(mode) === normalizeQuestionsMode(modeContentRoot.dataset.questionsMode)) {
                        return;
                    }
                    loadQuestionsMode(mode);
                });
            });

            loadQuestionsMode(getStoredQuestionsMode());
        }

        

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

                // ============= ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ: КОД ============= 
                // Восстанавливаем решения из Supabase
                if (typeof fetchProfileFromCloud === 'function') {
                    fetchProfileFromCloud().then(profile => {
                        if (profile && profile.saved_answers) {
                            const localAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                            const merged = { ...profile.saved_answers, ...localAnswers };
                            localStorage.setItem('userAnswers', JSON.stringify(merged));
                            loadSavedAnswers(); // Если вкладка уже открыта, подсосет данные в Monaco/Textarea
                        }
                    });
                }
                // ========================================================

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

        // ==== ADMIN SECTION ====
        async function initAdminSection() {
            const authWarning = document.getElementById('admin-auth-warning');
            const adminContent = document.getElementById('admin-content');
            
            if (!authWarning || !adminContent) return;

            if (typeof checkIsAdmin === 'undefined') {
                authWarning.style.display = 'block';
                authWarning.textContent = 'Ошибка: Supabase не подключен.';
                return;
            }

            const isAdmin = await checkIsAdmin();
            if (!isAdmin) {
                authWarning.style.display = 'block';
                adminContent.style.display = 'none';
                return;
            }

            authWarning.style.display = 'none';
            adminContent.style.display = 'block';

            // Инициализация редакторов если Monaco доступен
            if (typeof require !== 'undefined') {
                require(['vs/editor/editor.main'], function() {
                    const descTarget = document.getElementById('admin-task-desc');
                    const solTarget = document.getElementById('admin-task-solution');
                    if(descTarget && typeof injectMonacoEditor === 'function') injectMonacoEditor(descTarget);
                    if(solTarget && typeof injectMonacoEditor === 'function') injectMonacoEditor(solTarget);
                });
            }

            await loadAdminTasks();
        }

        async function loadAdminTasks() {
            const listDiv = document.getElementById('admin-tasks-list');
            if (!listDiv) return;

            const tasks = await getGlobalTasks();
            
            if (!tasks || tasks.length === 0) {
                listDiv.innerHTML = '<p style="color:var(--text-dim)">Задач пока нет. Добавьте первую!</p>';
                return;
            }

            listDiv.innerHTML = tasks.map(t => `
                <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <strong style="color: #fff;">${escapeHtml(t.title)}</strong>
                        <span style="color: var(--accent1); font-size:12px;">${escapeHtml(t.stage)}</span>
                    </div>
                    <div style="color: var(--text-dim); margin-bottom: 12px; font-size:14px; white-space:pre-wrap;">${escapeHtml(Math.min(t.description.length, 100) === 100 ? t.description.slice(0, 100) + '...' : t.description)}</div>
                </div>
            `).join('');
        }

        async function adminSubmitTask() {
            const title = document.getElementById('admin-task-title')?.value;
            const stage = document.getElementById('admin-task-stage')?.value;
            const desc = document.getElementById('admin-task-desc')?.value;
            const sol = document.getElementById('admin-task-solution')?.value;
            const statusDiv = document.getElementById('admin-submit-status');

            if (!title || !desc || !sol) {
                statusDiv.style.color = '#ef4444';
                statusDiv.textContent = 'Пожалуйста, заполните все поля.';
                return;
            }

            statusDiv.style.color = '#60a5fa';
            statusDiv.textContent = 'Сохранение...';

            const { data, error } = await addGlobalTask(title, stage, desc, sol);
            
            if (error) {
                statusDiv.style.color = '#ef4444';
                statusDiv.textContent = 'Ошибка: ' + error.message;
            } else {
                statusDiv.style.color = '#4ade80';
                statusDiv.textContent = 'Успешно сохранено!';
                // Сброс формы
                document.getElementById('admin-task-title').value = '';
                
                try {
                    const descWrapper = document.getElementById('admin-task-desc').nextElementSibling;
                    const solWrapper = document.getElementById('admin-task-solution').nextElementSibling;
                    if(descWrapper && descWrapper.classList.contains('monaco-editor-wrapper')) {
                        document.getElementById('admin-task-desc').value = '';
                        document.getElementById('admin-task-solution').value = '';
                    }
                } catch(e) {}
                
                setTimeout(() => {
                    statusDiv.textContent = '';
                    loadAdminTasks();
                }, 2000);
            }
        }
        async function initCodingSection() {
            const root = document.getElementById('coding-content-root');
            if (!root) return;

            root.innerHTML = `
                <div class="coding-mode-switcher">
                    <p class="coding-mode-label">Выберите формат лайв-кодинга:</p>
                    <div class="coding-mode-actions">
                        <button type="button" class="btn btn-secondary coding-mode-btn" data-coding-mode="local">Без ИИ (локальные задачи)</button>
                        <button type="button" class="btn btn-secondary coding-mode-btn" data-coding-mode="ai">С ИИ (только AI-задачи)</button>
                    </div>
                    <p class="coding-mode-hint"></p>
                </div>
                <div class="coding-mode-content-root">
                    <div style="text-align:center; color: var(--text-dim); margin-top: 24px;">Загрузка практики...</div>
                </div>
            `;

            const modeButtons = Array.from(root.querySelectorAll('.coding-mode-btn'));
            const modeHint = root.querySelector('.coding-mode-hint');
            const modeContentRoot = root.querySelector('.coding-mode-content-root');

            if (!modeHint || !modeContentRoot || modeButtons.length === 0) {
                root.innerHTML = '<div style="text-align:center; color: var(--red); margin-top: 24px;">Не удалось инициализировать режимы лайв-кодинга.</div>';
                return;
            }

            const applyModeButtonState = mode => {
                const normalizedMode = normalizeCodingMode(mode);
                modeButtons.forEach(button => {
                    const buttonMode = normalizeCodingMode(button.dataset.codingMode);
                    const isActive = buttonMode === normalizedMode;
                    button.classList.toggle('is-active', isActive);
                    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });

                modeHint.textContent = normalizedMode === 'ai'
                    ? 'Режим "С ИИ": локальный fallback отключен. Все новые задачи добавляются только через AI.'
                    : 'Режим "Без ИИ": отображаются только локальные задания из базы.';
            };

            const loadCodingMode = async mode => {
                const normalizedMode = normalizeCodingMode(mode);
                saveStoredCodingMode(normalizedMode);
                applyModeButtonState(normalizedMode);

                modeContentRoot.dataset.codingMode = normalizedMode;
                modeContentRoot.innerHTML = '<div style="text-align:center; color: var(--text-dim); margin-top: 24px;">Загрузка практики...</div>';

                const sectionName = normalizedMode === 'ai' ? 'coding' : 'coding-local';
                const source = normalizedMode === 'ai'
                    ? CODING_CONTENT_AI_SOURCE
                    : CODING_CONTENT_LOCAL_SOURCE;

                try {
                    const html = await loadTaskBankSectionText(sectionName, source);
                    modeContentRoot.innerHTML = html;
                    modeContentRoot.dataset.codingMode = normalizedMode;

                    try {
                        if (normalizedMode === 'ai') {
                            syncGeneratedTaskTitlesFromCodingDom(modeContentRoot);
                        }
                        ensureCodingPracticeSelector(modeContentRoot);
                        if (typeof injectFavoriteButtons !== 'undefined') injectFavoriteButtons(modeContentRoot);
                    } catch (error) {
                        console.error('Ошибка инициализации фильтров/контекстов лайв-кодинга:', error);
                    }

                    try {
                        refreshCodingStageGenerationControls(modeContentRoot);
                    } catch (error) {
                        console.error('Ошибка инициализации контролов лайв-кодинга:', error);
                    }

                    try {
                        if (typeof ensureTaskHints !== 'undefined') ensureTaskHints(modeContentRoot);
                        if (typeof setupAnswerField !== 'undefined') {
                            modeContentRoot.querySelectorAll('[data-task-id]').forEach(setupAnswerField);
                        }
                        if (typeof loadSavedAnswers !== 'undefined') loadSavedAnswers();
                        ensureCodingTaskSourceLabels(modeContentRoot);
                    } catch (error) {
                        console.error('Ошибка инициализации ответов/подсказок лайв-кодинга:', error);
                    }
                } catch (error) {
                    console.error('Не удалось загрузить контент лайв-кодинга:', error);
                    modeContentRoot.innerHTML = '<div style="text-align:center; color: var(--red); margin-top: 24px;">Не удалось загрузить задания лайв-кодинга. Попробуйте обновить страницу.</div>';
                }
            };

            modeButtons.forEach(button => {
                if (button.dataset.bound === 'true') return;
                button.addEventListener('click', () => {
                    loadCodingMode(button.dataset.codingMode);
                });
                button.dataset.bound = 'true';
            });

            await loadCodingMode(getStoredCodingMode());
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

        function getAnswerStatusMap() {
            try {
                const raw = JSON.parse(localStorage.getItem(ANSWER_STATUS_STORAGE_KEY) || '{}');
                return raw && typeof raw === 'object' ? raw : {};
            } catch (error) {
                console.warn('Не удалось прочитать статусы ответов:', error);
                return {};
            }
        }

        function setAnswerStatus(taskId, status) {
            if (!taskId) return;
            const statuses = getAnswerStatusMap();
            statuses[taskId] = status;
            localStorage.setItem(ANSWER_STATUS_STORAGE_KEY, JSON.stringify(statuses));
            if (status === 'correct' && typeof window.markTaskAsSolved === 'function') {
                window.markTaskAsSolved(taskId, 'Практическая задача').catch(e => console.error(e));
            }
        }

        function clearAnswerStatus(taskId) {
            if (!taskId) return;
            const statuses = getAnswerStatusMap();
            if (Object.prototype.hasOwnProperty.call(statuses, taskId)) {
                delete statuses[taskId];
                localStorage.setItem(ANSWER_STATUS_STORAGE_KEY, JSON.stringify(statuses));
            }
        }

        function getStageProgress(stageTab) {
            const tasks = STAGE_TASKS[stageTab] || [];
            const statuses = getAnswerStatusMap();
            const confirmedIds = new Set(
                tasks
                    .filter(task => {
                        return statuses[task.id] === 'correct';
                    })
                    .map(task => task.id)
            );
            const partialIds = new Set(
                tasks
                    .filter(task => {
                        return statuses[task.id] === 'partial';
                    })
                    .map(task => task.id)
            );

            const total = tasks.length;
            const answered = confirmedIds.size;
            const partial = partialIds.size;
            const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
            const requiredPercent = STAGE_READY_THRESHOLD[stageTab] || 100;

            return {
                total,
                answered,
                partial,
                percent,
                requiredPercent,
                ready: total > 0 && percent >= requiredPercent,
                missingTasks: tasks.filter(task => !confirmedIds.has(task.id))
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
                    ? `Этап закрыт: ${progress.answered}/${progress.total} (частично: ${progress.partial})`
                    : `Этап в работе: ${progress.answered}/${progress.total} (частично: ${progress.partial})`;

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
                    Подтверждено задач: <strong>${stageProgress.answered}/${stageProgress.total}</strong>.
                    Частично: <strong>${stageProgress.partial}</strong>.
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
                const basePath = getAppBasePath();
                const nocache = new Date().getTime();
                const response = await fetch(`${basePath}pages/${tabId}.html?v=${nocache}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const html = await response.text();
                container.innerHTML = html;
                
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
                });

                localStorage.setItem('streamflow_current_tab', tabId);
                
                // Обновляем Hash-роутинг
                if (!options.skipHistory) {
                    const newHash = '#/' + tabId;
                    if (window.location.hash !== newHash) {
                        window.history[options.replaceHistory ? 'replaceState' : 'pushState'](null, null, newHash);
                    }
                }

                updateStageReadinessIndicators();
                renderStageReadinessCard(tabId, container);
                if (typeof ensureTaskHints !== 'undefined') ensureTaskHints(container);
                if (typeof injectFavoriteButtons !== 'undefined') injectFavoriteButtons(container);
                
                if (typeof setupAnswerField !== 'undefined') {
                    document.querySelectorAll('[data-task-id]').forEach(setupAnswerField);
                }
                if (typeof loadSavedAnswers !== 'undefined') loadSavedAnswers();
                if (tabId === 'interview') initInterviewSection();
                if (tabId === 'questions') await initQuestionsSection();
                if (tabId === 'coding') await initCodingSection();
                if (tabId === 'profile') { if(typeof initProfileSection === 'function') { await initProfileSection(); } }
                if (tabId === 'admin') { if(typeof initAdminSection === 'function') { await initAdminSection(); } }
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
        function extractHintTerms(text) {
            const lower = (text || '').toLowerCase();
            const dictionary = [
                'select', 'join', 'group by', 'having', 'order by', 'where',
                'window', 'over', 'partition', 'row_number', 'rank',
                'explain analyze', 'index', 'create index',
                'docker-compose', 'dockerfile',
                'requests', 'json', 'psycopg2', 'executemany',
                'asyncio', 'aiohttp', 'retry', 'backoff',
                'airflow', 'dag',
                'spark', 'broadcast', 'salting', 'partitioning',
                'kafka', 'consumer', 'offset', 'schema registry', 'watermark',
                'cdc', 'merge', 'upsert', 'clickhouse',
                'fact', 'dimension', 'stg', 'dds'
            ];

            return dictionary.filter(term => lower.includes(term)).slice(0, 3);
        }

        function buildTaskHint(container) {
            const explicitHint = normalizeTitleValue(container?.getAttribute?.('data-task-hint') || '');
            if (explicitHint) {
                return explicitHint;
            }

            const taskText = container.textContent || '';
            const terms = extractHintTerms(taskText);

            if (terms.length > 0) {
                return `Мягкий намек: сначала определите итоговый результат и только потом соберите запрос/код вокруг ${terms.slice(0, 2).join(' и ')}.`;
            }

            return 'Мягкий намек: сначала опишите входные данные, затем шаг преобразования, и в конце ожидаемый формат результата.';
        }

        function ensureTaskHints(root = document) {
            const taskBoxes = root.querySelectorAll('.task-box[data-task-id]');

            taskBoxes.forEach(taskBox => {
                const answerArea = taskBox.querySelector('.answer-input-area');
                const checkButton = answerArea?.querySelector('.check-answer-btn');
                if (!answerArea || !checkButton) return;

                if (!answerArea.querySelector('.hint-actions')) {
                    const actions = document.createElement('div');
                    actions.className = 'hint-actions';
                    actions.style.display = 'flex';
                    actions.style.gap = '8px';
                    actions.style.alignItems = 'center';

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'hint-btn';
                    button.textContent = 'Подсказка';
                    button.setAttribute('onclick', 'showHint(this, 1)');
                    actions.appendChild(button);

                    const aiBtn = document.createElement('button');
                    aiBtn.type = 'button';
                    aiBtn.className = 'hint-btn ai-mentor-btn';
                    aiBtn.innerHTML = '🤖 ИИ Ментор';
                    aiBtn.setAttribute('onclick', 'askAIMentor(this)');
                    
                    // Highlight the AI button slightly
                    aiBtn.style.background = 'rgba(56, 189, 248, 0.1)';
                    aiBtn.style.color = '#38bdf8';
                    aiBtn.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                    actions.appendChild(aiBtn);

                    const runBtn = document.createElement('button');
                    runBtn.type = 'button';
                    runBtn.className = 'hint-btn run-code-btn';
                    runBtn.innerHTML = '▶️ Выполнить код';
                    runBtn.setAttribute('onclick', 'executeTaskCode(this)');
                    runBtn.style.background = 'rgba(74, 222, 128, 0.1)';
                    runBtn.style.color = '#4ade80';
                    runBtn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                    actions.appendChild(runBtn);
                    
                    const shareBtn = document.createElement('button');
                    shareBtn.type = 'button';
                    shareBtn.className = 'hint-btn share-code-btn';
                    shareBtn.innerHTML = '🔗 Поделиться';
                    shareBtn.setAttribute('onclick', 'shareCodeSnippet(this)');
                    shareBtn.style.background = 'rgba(167, 139, 250, 0.1)';
                    shareBtn.style.color = '#a78bfa';
                    shareBtn.style.borderColor = 'rgba(167, 139, 250, 0.5)';
                    actions.appendChild(shareBtn);

                    const result = answerArea.querySelector('.check-result');
                    if (result) {
                        answerArea.insertBefore(actions, result);
                    } else {
                        answerArea.appendChild(actions);
                    }
                }

                if (taskBox.querySelectorAll('.hint-level').length === 0) {
                    const hintBlock = document.createElement('div');
                    hintBlock.className = 'hint-level';
                    hintBlock.dataset.level = '1';
                    hintBlock.textContent = buildTaskHint(taskBox);
                    answerArea.appendChild(hintBlock);
                }
            });
        }

        function showHint(btn, level) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const hints = container.querySelectorAll('.hint-level');
            const hintButtons = container.querySelectorAll('.hint-btn');
            if (!hints || hints.length === 0) return;

            hints.forEach((hint, index) => {
                const isVisible = index === (level - 1);
                hint.classList.toggle('active', isVisible);
                hint.style.display = isVisible ? 'block' : 'none';
            });

            hintButtons.forEach(button => {
                button.classList.add('active');
            });
        }

        // ==== ИИ МЕНТОР ====
        async function askAIMentor(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;

            let mentorDiv = container.querySelector('.ai-mentor-response');
            if (mentorDiv) mentorDiv.remove();

            mentorDiv = document.createElement('div');
            mentorDiv.className = 'ai-mentor-response';
            mentorDiv.style.marginTop = '12px';
            mentorDiv.style.marginBottom = '12px';
            mentorDiv.style.padding = '12px';
            mentorDiv.style.background = 'rgba(56, 189, 248, 0.1)';
            mentorDiv.style.border = '1px solid rgba(56, 189, 248, 0.3)';
            mentorDiv.style.borderRadius = '8px';
            mentorDiv.innerHTML = '<span style="color: #38bdf8;">Анализирую ваш код... 🧠</span>';

            const actionArea = container.querySelector('.hint-actions');
            if (actionArea) {
                actionArea.after(mentorDiv);
            } else {
                container.querySelector('.answer-input-area')?.appendChild(mentorDiv);
            }

            const textarea = container.querySelector('.answer-textarea');
            const userCode = textarea ? textarea.value : '';

            const pTags = Array.from(container.querySelectorAll('p'));
            const desc = pTags.length > 0 ? pTags[0].textContent + '\n' + (pTags[1] ? pTags[1].textContent : '') : '';
            
            const preTags = container.querySelectorAll('pre');
            const expectedCode = preTags.length > 0 ? Array.from(preTags).map(p => p.textContent).join('\n') : '';

            const token = localStorage.getItem('streamflow_github_token') || LIVE_CODING_GENERATOR_CONFIG?.token;
            if (!token) {
                mentorDiv.innerHTML = '<span style="color: #ef4444;">Для вызова ИИ-подсказки требуется GitHub Models Token (введите в режиме "С ИИ").</span>';
                return;
            }

            try {
                const response = await fetch(LIVE_CODING_GENERATOR_CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        model: LIVE_CODING_GENERATOR_CONFIG.model,
                        messages: [
                            { role: 'system', content: 'Ты доброжелательный AI-ментор на платформе StreamFlow DWH. Оцени код студента по сравнению с эталоном. Не решай задачу за него и не пиши готовый код! Дай подсказку в 2-3 предложения, на что обратить внимание (напр. синтаксическая ошибка, или стоит использовать другую функцию). Если код на 100% идеален — похвали.' },
                            { role: 'user', content: `Условие:\n${desc}\n\nЭталон:\n${expectedCode}\n\nКод студента:\n${userCode}` }
                        ],
                        temperature: 0.6,
                        max_tokens: 300
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API ${response.status} - Возможны лимиты Github Models`);
                }
                const payload = await response.json();
                const content = payload.choices?.[0]?.message?.content || 'Нет ответа';
                mentorDiv.innerHTML = `<strong style="color: #38bdf8;">ИИ Ментор:</strong> <span style="color: #e0f2fe; white-space: pre-wrap; font-size: 14px;">${escapeHtml(content)}</span>`;
            } catch(e) {
                mentorDiv.innerHTML = `<span style="color: #ef4444;">Ошибка: ${e.message}</span>`;
            }
        }

        function showSQLSolution(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const solution = container.querySelector('.solution-code, .generated-solution-code');
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

        function getExpectedAnswerRaw(container) {
            const generatedSolution = String(container?.getAttribute?.('data-task-solution') || '').trim();
            if (generatedSolution) {
                return generatedSolution;
            }

            const explicitSolution = container.querySelector('.solution-code, .generated-solution-code')?.textContent?.trim();
            if (explicitSolution) {
                return explicitSolution;
            }

            const detailsCode = container.querySelector('details code')?.textContent?.trim();
            if (detailsCode) {
                return detailsCode;
            }

            const detailsText = container.querySelector('details p')?.textContent?.trim();
            if (detailsText) {
                return detailsText;
            }

            return '';
        }

        function buildExpectedAnswerHtml(expectedAnswerRaw) {
            const safe = String(expectedAnswerRaw || '').trim();
            if (!safe) return '';
            return `<br><strong>Эталон от AI:</strong><pre class="expected-answer-preview">${escapeHtml(safe)}</pre>`;
        }

        function revealExpectedAnswer(container) {
            const details = container?.querySelector?.('details');
            if (details) {
                details.open = true;
            }
        }

        // ===== ПРОВЕРКА ОТВЕТОВ =====
        function checkAnswer(btn) {
            const container = btn.closest('.card, .task-box');
            if (!container) return;
            const taskId = container.getAttribute('data-task-id');
            const textarea = container.querySelector('.answer-textarea');
            const resultDiv = container.querySelector('.check-result');
            const expectedAnswerRaw = getExpectedAnswerRaw(container);
            const expectedAnswer = getExpectedAnswer(container);
            const userAnswer = textarea?.value?.trim().toLowerCase() || '';

            if (!textarea || !userAnswer) {
                showResultMessage(resultDiv, 'incorrect', '⚠️ Пожалуйста, напишите свой ответ');
                setAnswerStatus(taskId, 'incorrect');
                updateAnswerProgress();
                return;
            }

            // Нормализуем оба ответа для сравнения
            const normalizedUser = normalizeSQL(userAnswer);
            const normalizedExpected = normalizeSQL(expectedAnswer);

            if (!normalizedExpected) {
                const hasStrongStructure = normalizedUser.length >= 100;

                if (hasStrongStructure) {
                    showResultMessage(resultDiv, 'partial',
                        '⚠️ Для этой задачи нет эталона от модели, поэтому доступна только базовая проверка. Ответ выглядит достаточно развернутым, но финальная оценка требует эталона.');
                    textarea.style.borderColor = 'var(--accent3)';
                    setAnswerStatus(taskId, 'partial');
                } else {
                    showResultMessage(resultDiv, 'incorrect',
                        '❌ Эталон для этой задачи не был сгенерирован, и текущий ответ слишком короткий для базовой проверки. Нажмите «Новая задача», чтобы получить вариант с корректным эталоном.');
                    textarea.style.borderColor = 'var(--red)';
                    setAnswerStatus(taskId, 'incorrect');
                }

                updateAnswerProgress();
                return;
            }

            if (normalizedUser.length < 24) {
                showResultMessage(resultDiv, 'incorrect',
                    '❌ Ответ слишком короткий для зачета. Нужен полноценный запрос/код с логикой решения.');
                textarea.style.borderColor = 'var(--red)';
                setAnswerStatus(taskId, 'incorrect');
                updateAnswerProgress();
                return;
            }

            const similarity = normalizedExpected
                ? calculateSimilarity(normalizedUser, normalizedExpected)
                : 0;

            // Точное совпадение
            if (normalizedExpected && (normalizedUser === normalizedExpected || similarity >= 0.9)) {
                showResultMessage(resultDiv, 'correct', 
                    '✅ Отлично! Ваш ответ совпадает с правильным решением.');
                textarea.style.borderColor = 'var(--accent1)';
                setAnswerStatus(taskId, 'correct');
                updateAnswerProgress();
                return;
            }

            // Проверка на частичное совпадение (основные компоненты)
            if (normalizedExpected && similarity >= 0.65 && normalizedUser.length >= 60) {
                showResultMessage(resultDiv, 'partial', 
                    `⚠️ Похоже! Сходство ${Math.round(similarity * 100)}%. Но есть небольшие различия.<br>Подсказка: Проверьте синтаксис, названия функций и порядок условий.${buildExpectedAnswerHtml(expectedAnswerRaw)}`);
                textarea.style.borderColor = 'var(--accent3)';
                setAnswerStatus(taskId, 'partial');
                revealExpectedAnswer(container);
                updateAnswerProgress();
                return;
            }

            // Проверка наличия ключевых элементов
            const keywordsFound = findKeywords(userAnswer);
            if (keywordsFound.length >= 3 && normalizedUser.length >= 80) {
                showResultMessage(resultDiv, 'partial', 
                    `⚠️ Направление правильное! Вы используете ${keywordsFound.join(', ')}.<br>Но нужно еще доработать логику.${buildExpectedAnswerHtml(expectedAnswerRaw)}`);
                textarea.style.borderColor = 'var(--accent3)';
                setAnswerStatus(taskId, 'partial');
                revealExpectedAnswer(container);
                updateAnswerProgress();
                return;
            }

            // Ответ неправильный
            showResultMessage(resultDiv, 'incorrect',
                `❌ Это не совпадает с правильным ответом.<br>💡 Подсказка: Нажмите "Подсказка" чтобы узнать подход к решению.${buildExpectedAnswerHtml(expectedAnswerRaw)}`);
            textarea.style.borderColor = 'var(--red)';
            setAnswerStatus(taskId, 'incorrect');
            revealExpectedAnswer(container);
            updateAnswerProgress();
        }

        function getExpectedAnswer(container) {
            const expected = getExpectedAnswerRaw(container);
            return expected ? expected.toLowerCase() : '';
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

        function injectMonacoEditor(textarea) {
            if (textarea.dataset.monacoInjected === 'true') return;
            textarea.dataset.monacoInjected = 'true';
            
            const wrapper = document.createElement('div');
            wrapper.className = 'monaco-editor-wrapper';
            const rows = textarea.rows || 10;
            wrapper.style.height = `${Math.max(150, rows * 20)}px`;
            wrapper.style.width = '100%';
            wrapper.style.border = '1px solid rgba(255,255,255,0.2)';
            wrapper.style.borderRadius = '4px';
            wrapper.style.marginTop = '8px';
            wrapper.style.marginBottom = '8px';
            wrapper.style.overflow = 'hidden';

            textarea.style.display = 'none';
            textarea.parentElement.insertBefore(wrapper, textarea.nextSibling);

            const ph = (textarea.placeholder || '').toLowerCase();
            let lang = 'sql';
            if (ph.includes('import ') || ph.includes('def ') || ph.includes('from ') || ph.includes('spark')) lang = 'python';
            else if (ph.includes('docker') || ph.includes('image') || ph.includes('yaml')) lang = 'yaml';

            const editor = monaco.editor.create(wrapper, {
                value: textarea.value || '',
                language: lang,
                theme: 'vs-dark',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                automaticLayout: true
            });

            editor.onDidChangeModelContent(() => {
                textarea.value = editor.getValue();
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // Проверяем программное обновление (например loadSavedAnswers)
            let lastValue = textarea.value;
            setInterval(() => {
                if (textarea.value !== lastValue && textarea.value !== editor.getValue()) {
                    editor.setValue(textarea.value);
                }
                lastValue = textarea.value;
            }, 500);
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

            // Подключаем Monaco Editor если библиотека загружена
            if (typeof require !== 'undefined') {
                require(['vs/editor/editor.main'], function() {
                    injectMonacoEditor(textarea);
                });
            }

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

            const persistAnswer = () => {
                const taskId = container.getAttribute('data-task-id');
                if (!taskId) return;
                const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
                answers[taskId] = textarea.value;
                localStorage.setItem('userAnswers', JSON.stringify(answers));
                
                // Связь нового и старого: Облачная синхронизация решений кода
                if (typeof syncAnswersToCloud === 'function') {
                    syncAnswersToCloud(answers);
                }
            };

            const clearCheckedStateOnEdit = () => {
                const taskId = container.getAttribute('data-task-id');
                if (!taskId) return;

                const statuses = getAnswerStatusMap();
                if (!Object.prototype.hasOwnProperty.call(statuses, taskId)) return;

                clearAnswerStatus(taskId);

                const resultDiv = container.querySelector('.check-result');
                if (resultDiv) {
                    resultDiv.className = 'check-result';
                    resultDiv.innerHTML = '';
                }

                textarea.style.borderColor = 'var(--border)';
                updateAnswerProgress();
            };

            textarea.addEventListener('input', () => {
                persistAnswer();
                clearCheckedStateOnEdit();
            });

            // Автосохранение ответа в localStorage
            textarea.addEventListener('change', () => {
                persistAnswer();
                clearCheckedStateOnEdit();
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
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof initCommandPalette === 'function') initCommandPalette();
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
                
                // Подгружаем комьюнити-задачи в локальный пул
                if (typeof getGlobalTasks === 'function') {
                    getGlobalTasks().then(tasks => {
                        tasks.forEach(t => {
                            let stageNum = 1;
                            if (t.stage.includes('Python')) stageNum = 2;
                            if (t.stage.includes('Spark')) stageNum = 3;
                            if (t.stage.includes('Kafka')) stageNum = 4;
                            
                            if (!LIVE_CODING_LOCAL_FALLBACK_TASK_POOL[stageNum]) {
                                LIVE_CODING_LOCAL_FALLBACK_TASK_POOL[stageNum] = [];
                            }
                            
                            LIVE_CODING_LOCAL_FALLBACK_TASK_POOL[stageNum].push({
                                title: `[CMS] ${t.title}`,
                                description: t.description,
                                placeholder: 'Напишите решение...',
                                solution: t.solution,
                                difficulty: 'medium'
                            });
                        });
                        console.log('Community tasks loaded into Local pool:', tasks.length);
                    }).catch(err => console.error('Failed fetching community tasks', err));
                }

                let currTab = 'home';
                const hash = window.location.hash.replace('#/', '');
                if (hash && document.querySelector(`.nav-item[data-tab="${hash}"]`)) {
                    currTab = hash;
                } else {
                    currTab = localStorage.getItem('streamflow_current_tab') || 'home';
                }
                switchTab(currTab, { skipStageCheck: true, replaceHistory: true });

                // Слушаем кнопки Назад/Вперед в браузере
                window.addEventListener('popstate', () => {
                    let h = window.location.hash.replace('#/', '');
                    if (!h) h = 'home';
                    if (document.querySelector(`.nav-item[data-tab="${h}"]`)) {
                        switchTab(h, { skipStageCheck: true, skipHistory: true });
                    }
                });

                // Проверяем админские права для сайдбара
                if (typeof checkIsAdmin === 'function') {
                    checkIsAdmin().then(isAdmin => {
                        if (isAdmin) {
                            const adminBtn = document.getElementById('nav-admin-btn');
                            if (adminBtn) adminBtn.style.display = 'flex';
                        }
                    });
                }

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
// ==== ВЫПОЛНЕНИЕ КОДА В БРАУЗЕРЕ ====

let pyodideInstance = null;
let sqlInstance = null;
let executionTerminalInstalled = false;

// Добавим кнопку "Выполнить код" ко всем задачам
function injectRunButton(container) {
    if (!container) return;
    const actions = container.querySelector('.hint-actions');
    const textArea = container.querySelector('.answer-textarea');
    if (!actions || !textArea) return;
    
    if (!container.querySelector('.run-code-btn')) {
        const runBtn = document.createElement('button');
        runBtn.type = 'button';
        runBtn.className = 'hint-btn run-code-btn';
        runBtn.innerHTML = '▶️ Выполнить';
        runBtn.style.background = 'rgba(74, 222, 128, 0.1)';
        runBtn.style.color = '#4ade80';
        runBtn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
        runBtn.setAttribute('onclick', 'executeTaskCode(this)');
        actions.appendChild(runBtn);
    }
}

// Запуск кода при клике
async function executeTaskCode(btn) {
    const container = btn.closest('.card, .task-box');
    const textArea = container.querySelector('.answer-textarea');
    if (!textArea) return;
    const code = textArea.value.trim();
    if (!code) return;

    // Создаем или находим терминал вывода
    let outputDiv = container.querySelector('.code-execution-output');
    if (!outputDiv) {
        outputDiv = document.createElement('div');
        outputDiv.className = 'code-execution-output';
        outputDiv.style.marginTop = '12px';
        outputDiv.style.padding = '12px';
        outputDiv.style.background = '#0f172a';
        outputDiv.style.border = '1px solid #334155';
        outputDiv.style.borderRadius = '6px';
        outputDiv.style.fontFamily = 'monospace';
        outputDiv.style.fontSize = '14px';
        outputDiv.style.color = '#e2e8f0';
        outputDiv.style.whiteSpace = 'pre-wrap';
        outputDiv.style.maxHeight = '250px';
        outputDiv.style.overflow = 'auto';
        
        const actionArea = container.querySelector('.hint-actions');
        actionArea.after(outputDiv);
    }

    outputDiv.innerHTML = '<span style="color:#94a3b8;">⏳ Выполнение...</span>';
    
    // Определяем язык по простому эвристическому правилу
    const isSQL = /^(select|with|create|insert|update|delete|drop)\b/i.test(code);
    const isJS = code.includes('console.log') || code.includes('const ') || code.includes('let ');
    const isPython = !isSQL && !isJS; // По умолчанию считаем питоном или неизвестным, если не очевидно

    try {
        if (isSQL) {
            outputDiv.innerHTML = await executeSQL(code);
        } else if (isPython && !isJS) {
            outputDiv.innerHTML = await executePython(code);
        } else {
            // JS fallback (в браузере небезопасно, но для обучения сойдет. Завернем в песочницу)
            outputDiv.innerHTML = executeJS(code);
        }
    } catch (e) {
        let errStr = e.toString();
        if (isSQL && errStr.toLowerCase().includes("no such table")) {
            errStr += "\n\n💡 Внимание: БД в браузере изначально пустая. Чтобы ваш SELECT сработал, добавьте команды CREATE TABLE и INSERT INTo сверху для создания таблиц с мок-данными.";
        }
        outputDiv.innerHTML = `<span style="color:#ef4444;">${escapeHtml(errStr)}</span>`;
    }
}

async function executePython(code) {
    if (!pyodideInstance) {
        if (typeof loadPyodide === "undefined") {
            await loadScript("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");
        }
        pyodideInstance = await loadPyodide({
            stdout: (msg) => { if (window.pyodideOutputBuffer) window.pyodideOutputBuffer.push(String(msg)); },
            stderr: (msg) => { if (window.pyodideOutputBuffer) window.pyodideOutputBuffer.push(String(msg)); }
        });
    }
    window.pyodideOutputBuffer = [];
    try {
        await pyodideInstance.loadPackagesFromImports(code);
        await pyodideInstance.runPythonAsync(code);
        const out = window.pyodideOutputBuffer.join("\n");
        return out ? escapeHtml(out) : "<span style=\"color:#94a3b8;\">(выполнено успешно, нет вывода)</span>";
    } catch (e) {
        return "<span style=\"color:#ef4444;\">" + escapeHtml(e.toString()) + "</span>";
    }
}

async function executeSQL(code) {
    if (!sqlInstance) {
        if (typeof initSqlJs === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js');
        }
        const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
        sqlInstance = new SQL.Database();
    }
    const res = sqlInstance.exec(code);
    if (!res || res.length === 0) return '<span style="color:#94a3b8;">(выполнено успешно)</span>';
    
    // Рендер таблицы результатов
    let html = '<table style="width:100%; border-collapse:collapse; text-align:left;">';
    html += '<thead><tr style="border-bottom:1px solid #334155;">';
    res[0].columns.forEach(col => { html += `<th style="padding:4px 8px;">${escapeHtml(col)}</th>`; });
    html += '</tr></thead><tbody>';
    res[0].values.forEach(row => {
        html += '<tr style="border-bottom:1px dashed #1e293b;">';
        row.forEach(val => { html += `<td style="padding:4px 8px; color:#cbd5e1;">${escapeHtml(String(val))}</td>`; });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

function executeJS(code) {
    let output = [];
    const _log = console.log;
    console.log = function(...args) { output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')); };
    try {
        new Function(code)();
    } finally {
        console.log = _log;
    }
    return output.join('\n') || '<span style="color:#94a3b8;">(выполнено успешно)</span>';
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// ==== SHARE CODE LINKS ====
function shareCodeSnippet(btn) {
    const container = btn.closest('.card, .task-box');
    const textArea = container.querySelector('.answer-textarea');
    if (!textArea) return;
    const code = textArea.value;
    if (!code.trim()) {
        alert('Сначала напишите код, чтобы поделиться!');
        return;
    }
    
    const h4 = container.querySelector('h4');
    const title = h4 ? h4.textContent.replace('🆕 ', '').replace('⭐', '').replace('☆', '').trim() : 'Лайв-кодинг';

    const payload = JSON.stringify({
        title: title,
        code: code
    });
    
    const encoded = btoa(encodeURIComponent(payload));
    const url = window.location.origin + window.location.pathname + '?share=' + encoded + window.location.hash;
    
    navigator.clipboard.writeText(url).then(() => {
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '✅ Скопировано!';
        btn.style.color = '#34d399';
        setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.style.color = '#a78bfa';
        }, 2000);
    }).catch(() => alert('Не удалось скопировать URL.'));
}

// Check for shared code on boot
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    if (sharedData) {
        try {
            const payload = JSON.parse(decodeURIComponent(atob(sharedData)));
            if (payload && payload.code) {
                setTimeout(() => showSharedCodeModal(payload.title, payload.code), 500);
            }
        } catch(e) {
            console.error('Ошибка расшифровки shared code', e);
        }
        // Очищаем URL чтобы не мешать при рефреше
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
});

function showSharedCodeModal(title, code) {
    let modal = document.getElementById('shared-code-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'shared-code-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '100000';
    
    const box = document.createElement('div');
    box.style.background = '#1e293b';
    box.style.padding = '24px';
    box.style.borderRadius = '12px';
    box.style.width = '600px';
    box.style.maxWidth = '90%';
    box.style.border = '1px solid #334155';
    box.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '16px';
    header.innerHTML = `<h3 style="margin:0;color:#e2e8f0;font-size:18px;">🔗 Поделились кодом: ${escapeHtml(title)}</h3><button style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;" onclick="document.getElementById('shared-code-modal').remove()">&times;</button>`;
    
    const pre = document.createElement('pre');
    pre.style.background = '#0f172a';
    pre.style.padding = '16px';
    pre.style.borderRadius = '8px';
    pre.style.overflow = 'auto';
    pre.style.color = '#e2e8f0';
    pre.style.maxHeight = '400px';
    pre.textContent = code;
    
    const actionRow = document.createElement('div');
    actionRow.style.marginTop = '16px';
    actionRow.style.textAlign = 'right';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-primary';
    copyBtn.style.padding = '8px 16px';
    copyBtn.textContent = 'Копировать код';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => copyBtn.textContent = 'Копировать код', 2000);
        });
    };
    
    actionRow.appendChild(copyBtn);
    box.appendChild(header);
    box.appendChild(pre);
    box.appendChild(actionRow);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

function injectFavoriteButtons(root = document) {
    if (!root) return;
    
    // Для раздела Вопросы (.accordion-header)
    const headers = root.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        // Проверяем, нет ли уже кнопки
        if (!header.querySelector('.fav-btn')) {
            const titleSpan = header.querySelector('span'); // первый span обычно это текст
            if (!titleSpan) return;
            
            const questionText = titleSpan.textContent.trim();
            const btn = document.createElement('button');
            btn.innerHTML = '☆';
            btn.title = 'В избранное';
            btn.className = 'fav-btn';
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.style.marginLeft = '8px';
            // Не кликаем аккордеон
            btn.onclick = (e) => {
                e.stopPropagation();
                const taskId = btoa(unescape(encodeURIComponent(questionText)));
                toggleFavoriteTask(taskId, 'Теоретический вопрос', questionText)
                    .then(res => { if (res !== undefined) btn.innerHTML = res ? '⭐' : '☆'; })
                    .catch(console.error);
            };
            
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                const taskId = btoa(unescape(encodeURIComponent(questionText)));
                getCurrentUser().then(user => {
                    if (user) {
                        supabaseClient.from('favorites').select('id').eq('user_id', user.id).eq('task_id', taskId).single()
                        .then(({data}) => { if (data) btn.innerHTML = '⭐'; }).catch(()=>{});
                    }
                });
            }

            // Обернем titleSpan и кнопку во flex контейнер
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
    const taskHeaders = root.querySelectorAll('.task-box h4, .card h4');
    taskHeaders.forEach(h4 => {
        const container = h4.closest('.task-box, .card');
        if (!container || !container.hasAttribute('data-task-id')) return;
        
        const wrapper = h4.parentElement;
        if (!wrapper.querySelector('.fav-btn') && !wrapper.dataset.hasFav) {
            wrapper.dataset.hasFav = "true";
            const taskId = container.getAttribute('data-task-id');
            const taskTitle = h4.textContent.trim().replace('🆕 ', '').replace('⭐', '').replace('☆', '');
            const btn = document.createElement('button');
            btn.innerHTML = '☆';
            btn.title = 'В избранное';
            btn.className = 'fav-btn';
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
                        .then(({data}) => { if (data) btn.innerHTML = '⭐'; }).catch(()=>{});
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
async function executeInterviewAICheck(question, answerText) {
    const token = localStorage.getItem('streamflow_github_token') || (typeof LIVE_CODING_GENERATOR_CONFIG !== 'undefined' ? LIVE_CODING_GENERATOR_CONFIG.token : '');
    if (!token) {
        return null; // Fallback on local regex check if no token
    }

    try {
        const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Используем mini для экономии лимитов
                messages: [
                    { role: 'system', content: 'Ты строгий, но справедливый Senior Data Engineer, проводящий собеседование. Твоя задача оценить ответ кандидата на вопрос. Если ответ по сути верен или улавливает ключевую идею (пусть и не слово в слово) - верни строку "correct". Если ответ в корне неверный - верни строку "incorrect". В следующей строке коротко поясни почему.' },
                    { role: 'user', content: `Вопрос: ${question.prompt}\n\nОжидаемый ответ: ${question.answer || 'Отсутствует'}\n\nОтвет кандидата: ${answerText}` }
                ],
                temperature: 0.1,
                max_tokens: 250
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                console.warn('API Rate limit reached, falling back to local check');
                return null; // fallback
            }
            throw new Error('API call failed with status ' + response.status);
        }
        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content || '';
        
        const lines = content.split('\n');
        const statusStr = lines[0].toLowerCase().trim();
        const reason = lines.slice(1).join('\n').trim();
        
        const isCorrect = statusStr.includes('correct') && !statusStr.includes('incorrect');
        
        return { status: isCorrect ? 'correct' : 'incorrect', reason: reason };
    } catch(e) {
        console.error('AI Interview evaluation error', e);
        return null;
    }
}

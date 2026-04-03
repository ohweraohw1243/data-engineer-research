import re

file_q = "pages/questions.html"
with open(file_q, "r", encoding="utf-8") as f:
    q_content = f.read()

# Replace single random question button with grouped top buttons
old_btn = r'<button class="btn" style="background:var\(--accent1\);color:#0a0a0a;font-weight:600;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;" onclick="randomQuestion\(\)">🎲 Случайный вопрос</button>'
new_btns = """<div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn" style="background:var(--accent1);color:#0a0a0a;font-weight:600;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;" onclick="randomQuestion()">🎲 Случайный вопрос</button>
        <button class="btn" style="background:rgba(255,255,255,0.1);color:#fff;font-weight:600;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;" onclick="toggleAll(true)">Развернуть все ответы</button>
        <button class="btn" style="background:rgba(255,255,255,0.1);color:#fff;font-weight:600;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;" onclick="toggleAll(false)">Свернуть все</button>
    </div>"""

q_content = re.sub(old_btn, new_btns, q_content)

# Replace toggle text
q_content = re.sub(
    r'<span class="accordion-toggle" style="transition: transform 0\.3s; color: var\(--text-muted\);">▼</span>',
    r'<span class="accordion-toggle" style="transition: transform 0.3s; color: var(--accent1); font-size: 13px; font-weight: 500;">Показать ответ ▼</span>',
    q_content
)

# Replace script
script_addition = """
function toggleAll(show) {
    document.querySelectorAll('.accordion-content').forEach(c => c.style.display = show ? 'block' : 'none');
    document.querySelectorAll('.accordion-toggle').forEach(t => {
        t.style.transform = show ? 'rotate(180deg)' : 'rotate(0deg)';
        t.innerText = show ? 'Скрыть ответ ▲' : 'Показать ответ ▼';
    });
}

function toggleAccordion(header) {
    const item = header.parentElement;
    const content = item.querySelector('.accordion-content');
    const toggle = item.querySelector('.accordion-toggle');
    const isVisible = content.style.display === 'block';

    if (!isVisible) {
        content.style.display = 'block';
        toggle.style.transform = 'rotate(180deg)';
        toggle.innerText = 'Скрыть ответ ▲';
    } else {
        content.style.display = 'none';
        toggle.style.transform = 'rotate(0deg)';
        toggle.innerText = 'Показать ответ ▼';
    }
}
"""
q_content = re.sub(r'function toggleAccordion\(header\) \{.*?\}', script_addition, q_content, flags=re.DOTALL)

# Let's fix the randomQuestion function so it changes the text too
random_q_fix = """
    const isVisible = content.style.display === 'block';

    document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.accordion-toggle').forEach(t => {
        t.style.transform = 'rotate(0deg)';
        t.innerText = 'Показать ответ ▼';
    });

    if (!isVisible) {
        content.style.display = 'block';
        toggle.style.transform = 'rotate(180deg)';
        toggle.innerText = 'Скрыть ответ ▲';
    }
"""

q_content = re.sub(r'document\.querySelectorAll\(\'\.accordion-content\'\)\.forEach\(c => c\.style\.display = \'none\'\);\n\s*document\.querySelectorAll\(\'\.accordion-toggle\'\)\.forEach\(t => t\.style\.transform = \'rotate\(0deg\)\'\);\n\n\s*if \(\!isVisible\) \{\n\s*content\.style\.display = \'block\';\n\s*toggle\.style\.transform = \'rotate\(180deg\)\';\n\s*\}', random_q_fix, q_content, flags=re.DOTALL)

with open(file_q, "w", encoding="utf-8") as f:
    f.write(q_content)


# 2. Re-write Math
math_content = """<div class="page-content">
    <div class="page-header">
        <h1 class="page-title">Математика для <span>Data Engineer</span></h1>
        <p class="page-desc">Какие разделы математики и Computer Science действительно нужны в реальной работе с Big Data и БД.</p>
    </div>

    <div class="space-y-6">
        <div class="card theory-block" style="margin-bottom: 24px;">
            <h3 class="card-title" style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 16px;"><span style="font-size:24px;margin-right:8px;">📈</span>О-большое (Big O) и Сложность</h3>
            <div class="card-text" style="line-height: 1.7; font-size: 15px; color: var(--text-muted);">
                <p>При чтении <strong>EXPLAIN ANALYZE</strong> (плана выполнения запросов в БД) вы сталкиваетесь с оценкой стоимости.</p>
                <ul style="margin-top: 12px; margin-bottom: 16px; padding-left: 20px;">
                    <li><strong>O(1)</strong> — Константинное время. Идеально. Hash-индексы, Hash Map в Python.</li>
                    <li><strong>O(log N)</strong> — Логарифмическое время. Отлично. B-Tree индексы (PostgreSQL).</li>
                    <li><strong>O(N)</strong> — Линейное время. Seq Scan (Table Scan), когда база читает все подряд.</li>
                    <li><strong>O(N log N)</strong> — Сортировки, ORDER BY, агрегации.</li>
                    <li><strong>O(N²)</strong> — Квадратичное время. Катастрофа для Big Data (Nested Loop Join).</li>
                </ul>
            </div>
        </div>

        <div class="card theory-block" style="margin-bottom: 24px;">
            <h3 class="card-title" style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 16px;"><span style="font-size:24px;margin-right:8px;">📊</span>Теория вероятностей в Data Quality</h3>
            <div class="card-text" style="line-height: 1.7; font-size: 15px; color: var(--text-muted);">
                <p>Используется для проверок качества данных (Аномальное поведение).</p>
                <ul style="margin-top: 12px; margin-bottom: 16px; padding-left: 20px;">
                    <li><strong>Нормальное распределение (3σ):</strong> 99.7% значений лежат в пределах 3 стандартых отклонений. Выход за рамки = баг или аномалия.</li>
                    <li><strong>Z-Score:</strong> Измеряет дистанцию метрики от среднего значения в отклонениях.</li>
                    <li><strong>Экспоненциальный Backoff:</strong> Математика повторных попыток API: Wait = 2^c + random().</li>
                </ul>
            </div>
        </div>

        <div class="card theory-block" style="margin-bottom: 24px;">
            <h3 class="card-title" style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 16px;"><span style="font-size:24px;margin-right:8px;">🔢</span>Теория множеств (SQL Joins)</h3>
            <div class="card-text" style="line-height: 1.7; font-size: 15px; color: var(--text-muted);">
                <ul style="margin-top: 12px; margin-bottom: 16px; padding-left: 20px;">
                    <li><strong>INNER JOIN (A ∩ B):</strong> Пересечение множеств.</li>
                    <li><strong>FULL OUTER JOIN (A ∪ B):</strong> Объединение.</li>
                    <li><strong>LEFT JOIN A ∪ (A ∩ B):</strong> Все из А + совпадения из B.</li>
                    <li><strong>CROSS JOIN (A × B):</strong> Декартово умножение строк (очень дорого!).</li>
                </ul>
            </div>
        </div>

        <div class="card theory-block">
            <h3 class="card-title" style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 16px;"><span style="font-size:24px;margin-right:8px;">📐</span>Векторная алгебра в MPP БД</h3>
            <div class="card-text" style="line-height: 1.7; font-size: 15px; color: var(--text-muted);">
                <ul style="margin-top: 12px; margin-bottom: 0; padding-left: 20px;">
                    <li><strong>SIMD:</strong> ClickHouse векторно считает блоки цифр за такт процессора.</li>
                    <li><strong>Cosine Similarity (Косинусное сходство):</strong> Мера подобия двух векторов для RAG-систем.</li>
                    <li><strong>Консистентное хеширование H(key) mod M:</strong> Механизм распределения партиций в Kafka/Spark.</li>
                </ul>
            </div>
        </div>
    </div>
</div>"""
with open("pages/math.html", "w", encoding="utf-8") as f:
    f.write(math_content)

print("done")

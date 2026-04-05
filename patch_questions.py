import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Patch createGeneratedQuestionAccordionItem
old_accordion = r'(<span style="font-weight: 600; font-size: 15px;">\${escapeHtml\(question\)}</span>)'
new_accordion = r'''<div style="display:flex; align-items:center; gap:8px;">
                        \1
                        <button onclick="event.stopPropagation(); toggleFavoriteTask(btoa(unescape(encodeURIComponent('${escapeHtml(question)}'))), 'Вопрос сгенерированный ИИ', '${escapeHtml(question).replace(/'/g, "\\'")}').then(()=>this.textContent=this.textContent==='⭐'?'☆':'⭐')" style="background:transparent; border:none; font-size:16px; cursor:pointer;" title="В избранное">☆</button>
                    </div>'''
content = re.sub(old_accordion, new_accordion, content)

# Patch createGeneratedTaskCard
old_card_head = r'(<h4 style="margin-top:0; color:#fff; font-size: 1\.1rem; margin-bottom: 12px;">🆕 \${escapeHtml\(task\.title\)}</h4>)'
new_card_head = r'''<div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    \1
                    <button onclick="toggleFavoriteTask('${taskId}', 'Лайв-кодинг ИИ', '${escapeHtml(task.title).replace(/'/g, "\\'")}').then(()=>this.textContent=this.textContent==='⭐'?'☆':'⭐')" style="background:transparent; border:none; font-size:20px; cursor:pointer;" title="В избранное">☆</button>
                </div>'''

content = re.sub(old_card_head, new_card_head, content)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

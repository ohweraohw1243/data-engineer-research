import re
import os

with open('streamflow-study-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(style_match.group(1).strip())
    content = content.replace(style_match.group(0), '<link rel="stylesheet" href="css/style.css">')

# 2. Extract Scripts
script_matches = list(re.finditer(r'<script>(.*?)</script>', content, re.DOTALL))
scripts_combined = ""
for match in script_matches:
    scripts_combined += match.group(1) + "\n\n"
    content = content.replace(match.group(0), '')

# For simplicity, we just put all scripts in app.js
if scripts_combined.strip():
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(scripts_combined.strip())
    content = content.replace('</body>', '    <script src="js/app.js"></script>\n</body>')

# 3. Extract Pages
page_matches = list(re.finditer(r'<section id="([^"]+)" class="page[^"]*">(.*?)</section>', content, re.DOTALL))
os.makedirs('pages', exist_ok=True)
for match in page_matches:
    page_id = match.group(1)
    page_content = match.group(2).strip()
    with open(f'pages/{page_id}.html', 'w', encoding='utf-8') as f:
        f.write(f'<div class="page-content">\n{page_content}\n</div>')
    # Remove from index.html
    content = content.replace(match.group(0), '')

# 4. Add dynamic loading script to index.html
dynamic_script = """
    <script>
        // Override switchTab to load pages dynamically
        async function switchTab(tabId) {
            const container = document.getElementById('page-container');
            if (!container) return;
            
            try {
                const response = await fetch(`pages/${tabId}.html`);
                if (!response.ok) throw new Error('Network response was not ok');
                const html = await response.text();
                container.innerHTML = html;
                
                // Keep the active state on the navigation
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
                });
                
                // Re-initialize any JS needed for this page (e.g. textareas)
                if (window.setupAnswerField) {
                    document.querySelectorAll('.answer-textarea').forEach(window.setupAnswerField);
                }
            } catch (error) {
                console.error('Error loading page:', error);
                container.innerHTML = '<h2>Ошибка загрузки страницы.</h2><p>Пожалуйста, запустите сайт через локальный сервер (Live Server), так как политика CORS браузера блокирует загрузку файлов напрямую через file://</p>';
            }
        }
        
        // Initial load
        window.addEventListener('DOMContentLoaded', () => {
            const currentTab = localStorage.getItem('streamflow_current_tab') || 'home';
            switchTab(currentTab);
        });
    </script>
"""
content = content.replace('<!-- PAGES -->', '<div id="page-container"></div>\n<!-- PAGES -->')
content = content.replace('</body>', dynamic_script + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Split completed successfully!")

sed -i '' '/showSuccessMessage("⏳ ИИ оценивает ваш ответ как Senior Data Engineer...");/c\
\
            const feedbackEl = document.getElementById("interview-current-result");\
            if (feedbackEl) {\
                feedbackEl.className = "interview-current-result";\
                feedbackEl.style.color = "#38bdf8";\
                feedbackEl.textContent = "⏳ ИИ оценивает ваш ответ как Senior Data Engineer...";\
            }\
' js/app.js
bash patch-update2.sh
rm patch-update2.sh

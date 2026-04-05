sed -i '' '/counterEl.textContent = .Вопрос \${index + 1}\/\${total}.;/a\
\
            const questionText = currentQuestion.prompt;\
            questionEl.innerHTML = escapeHtml(questionText) + " ";\
            const favBtn = document.createElement("button");\
            favBtn.innerHTML = "☆";\
            favBtn.title = "В избранное";\
            favBtn.style.background = "transparent";\
            favBtn.style.border = "none";\
            favBtn.style.fontSize = "20px";\
            favBtn.style.cursor = "pointer";\
            favBtn.style.verticalAlign = "middle";\
            const taskId = btoa(unescape(encodeURIComponent(questionText)));\
            if (typeof supabaseClient !== "undefined" && supabaseClient) {\
                getCurrentUser().then(user => {\
                    if (user) {\
                        supabaseClient.from("favorites").select("id").eq("user_id", user.id).eq("task_id", taskId).single()\
                        .then(({data}) => { if (data) favBtn.innerHTML = "⭐"; }).catch(()=>{});\
                    }\
                });\
            }\
            favBtn.onclick = (e) => {\
                e.stopPropagation();\
                toggleFavoriteTask(taskId, "Вопрос собеседования", questionText)\
                    .then(res => { if (res !== undefined) favBtn.innerHTML = res ? "⭐" : "☆"; })\
                    .catch(console.error);\
            };\
            questionEl.appendChild(favBtn);\
            \
            // Подключаем Monaco для собеседования\
            if (typeof injectMonacoEditor !== "undefined") injectMonacoEditor(answerEl);
' js/app.js
bash patch-interview.sh
rm patch-interview.sh

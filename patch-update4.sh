sed -i '' '/const expected = question.answer || .—.s*;/a\
                const reason = (interviewState.reasons && interviewState.reasons[question.id]) || "";\
' js/app.js
sed -i '' '/<pre class=.interview-review-code.>\${escapeHtml(expected)}<\/pre>/a\
                        \${reason ? `<div style="margin-top:12px; padding:12px; background:rgba(56,189,248,0.1); border-left:4px solid #38bdf8; border-radius:4px; color:#e0f2fe;"><strong>🤖 Комментарий ИИ-интервьюера:</strong><br>\${escapeHtml(reason)}</div>` : ""}\
' js/app.js
bash patch-update4.sh
rm patch-update4.sh

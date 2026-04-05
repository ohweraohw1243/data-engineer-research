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
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Ты строгий, но справедливый Senior Data Engineer, проводящий собеседование. Твоя задача оценить ответ кандидата на вопрос. Если ответ по сути верен или улавливает ключевую идею (пусть и не слово в слово) - верни строку "correct". Если ответ в корне неверный - верни строку "incorrect". В следующей строке поясни почему.' },
                    { role: 'user', content: `Вопрос: ${question.prompt}\n\nОжидаемый ответ: ${question.answer || 'Отсутствует'}\n\nОтвет кандидата: ${answerText}` }
                ],
                temperature: 0.1,
                max_tokens: 300
            })
        });

        if (!response.ok) throw new Error('API call failed');
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

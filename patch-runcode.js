async function executePython(code) {
    if (!window.pyodideInstance) {
        if (typeof loadPyodide === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
        }
        window.pyodideInstance = await loadPyodide({
            stdout: (msg) => {
                if (window.pyodideOutputBuffer !== undefined) window.pyodideOutputBuffer.push(msg);
            }
        });
    }
    
    window.pyodideOutputBuffer = [];
    
    try {
        await pyodideInstance.loadPackagesFromImports(code);
        await window.pyodideInstance.runPythonAsync(code);
        const out = window.pyodideOutputBuffer.join('\n');
        return out ? escapeHtml(out) : '<span style="color:#94a3b8;">(выполнено успешно)</span>';
    } catch (e) {
        return `<span style="color:#ef4444;">${escapeHtml(e.toString())}</span>`;
    }
}

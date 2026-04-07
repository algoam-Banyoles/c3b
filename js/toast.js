// ============================================================================
// Sistema de toasts (notificacions discretes a la cantonada inferior dreta).
// API: toast.success(msg), toast.error(msg), toast.warning(msg), toast.info(msg)
// ============================================================================

(function () {
    const TOAST_CONTAINER_ID = 'toastContainer';
    const DEFAULT_DURATION = 3500;
    const ERROR_DURATION = 5500;

    const STYLES = {
        success: { bg: '#10b981', icon: '✅' },
        error:   { bg: '#dc2626', icon: '❌' },
        warning: { bg: '#f59e0b', icon: '⚠️' },
        info:    { bg: '#2563eb', icon: 'ℹ️' },
    };

    function ensureContainer() {
        let c = document.getElementById(TOAST_CONTAINER_ID);
        if (c) return c;
        c = document.createElement('div');
        c.id = TOAST_CONTAINER_ID;
        c.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column-reverse;
            gap: 10px;
            z-index: 10000;
            pointer-events: none;
            max-width: calc(100vw - 40px);
        `;
        document.body.appendChild(c);
        return c;
    }

    function show(message, type = 'info', duration) {
        const cont = ensureContainer();
        const style = STYLES[type] || STYLES.info;
        const dur = duration || (type === 'error' ? ERROR_DURATION : DEFAULT_DURATION);

        const t = document.createElement('div');
        t.style.cssText = `
            background: ${style.bg};
            color: white;
            padding: 12px 18px;
            border-radius: 10px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            font-size: 14px;
            font-weight: 500;
            min-width: 240px;
            max-width: 380px;
            display: flex;
            align-items: center;
            gap: 10px;
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(120%);
            transition: transform 0.25s ease-out, opacity 0.25s ease-out;
            opacity: 0;
        `;
        t.innerHTML = `<span style="font-size:18px; flex-shrink:0;">${style.icon}</span><span style="flex:1;">${escapeHtml(message)}</span>`;
        cont.appendChild(t);

        // Animar entrada
        requestAnimationFrame(() => {
            t.style.transform = 'translateX(0)';
            t.style.opacity = '1';
        });

        const dismiss = () => {
            t.style.transform = 'translateX(120%)';
            t.style.opacity = '0';
            setTimeout(() => t.remove(), 250);
        };

        t.addEventListener('click', dismiss);
        setTimeout(dismiss, dur);
    }

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    window.toast = {
        success: (msg, dur) => show(msg, 'success', dur),
        error:   (msg, dur) => show(msg, 'error', dur),
        warning: (msg, dur) => show(msg, 'warning', dur),
        info:    (msg, dur) => show(msg, 'info', dur),
    };
})();

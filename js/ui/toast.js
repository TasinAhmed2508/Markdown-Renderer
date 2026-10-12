/**
 * Toast UI Module
 * Small non-blocking feedback message (export errors, insertions, ...)
 */

let current = null;

/**
 * @param {string} message
 * @param {'info'|'error'|'success'} [type]
 * @param {number} [duration] milliseconds
 */
export function showToast(message, type = 'info', duration = 2600) {
    if (typeof document === 'undefined') return;

    if (current) current.remove();

    const colors = {
        info: { bg: 'rgba(15, 23, 42, 0.92)', border: 'rgba(148, 163, 184, 0.35)', text: '#e2e8f0' },
        success: { bg: 'rgba(6, 78, 59, 0.92)', border: 'rgba(52, 211, 153, 0.45)', text: '#d1fae5' },
        error: { bg: 'rgba(80, 7, 20, 0.94)', border: 'rgba(248, 113, 113, 0.5)', text: '#fee2e2' },
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.className = 'renderx-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '96px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(560px, 90vw)',
        padding: '10px 18px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        borderRadius: '10px',
        fontSize: '13px',
        lineHeight: '1.45',
        zIndex: '9999',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'none',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        textAlign: 'center',
    });

    document.body.appendChild(toast);
    current = toast;

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 8px)';
        setTimeout(() => {
            toast.remove();
            if (current === toast) current = null;
        }, 260);
    }, duration);
}

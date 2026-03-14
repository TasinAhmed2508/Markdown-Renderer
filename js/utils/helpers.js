export function debounce(func, wait) {
    let timeout;
    const debounced = function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func.apply(this, args);
        }, wait);
    };
    debounced.cancel = () => {
        clearTimeout(timeout);
        timeout = null;
    };
    return debounced;
}

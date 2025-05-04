document.addEventListener('DOMContentLoaded', function () {
    const style     = document.createElement('style');
    style.innerHTML = `
        code, pre {
            font-family: 'Fira Code' !important;
        }
    `;
    document.head.appendChild(style);
});

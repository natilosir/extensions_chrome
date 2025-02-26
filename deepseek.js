function Placeholder(text) {
    const textarea = document.getElementById('chat-input');
    if (textarea) {
        textarea.placeholder = text;
    }
}

const button = document.createElement('button');
button.innerText = 'LTR';
button.style.position = 'fixed';
button.style.top = '10px';
button.style.right = '10px';
button.style.padding = '10px 20px';
button.style.backgroundColor = '#4d6bfe';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '14px';
button.style.cursor = 'pointer';

document.body.appendChild(button);

const dynamicStyles = document.createElement('style');
dynamicStyles.id = 'dynamicStyles';
dynamicStyles.innerHTML = `
    .f9bf7997, .fbb737a4, .c92459f0, .ds-textarea__textarea {
        direction: rtl;
    }
`;
document.head.appendChild(dynamicStyles);

let isRTL = true;

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            const textarea = document.getElementById('chat-input');
            if (textarea) {
                Placeholder('چی میقای؟');
                observer.disconnect();
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

button.addEventListener('click', function () {
    if (isRTL) {
        Placeholder('what the fuck');
        dynamicStyles.innerHTML = '';
        button.innerText = 'RTL';
    } else {
        Placeholder('چی میقای؟');
        dynamicStyles.innerHTML = `
            .f9bf7997, .fbb737a4, .c92459f0, .ds-textarea__textarea {
                direction: rtl;
            }
        `;
        button.innerText = 'LTR';
    }

    isRTL = !isRTL;
});

window.onload = function () {
    button.innerText = 'RTL';
};


document.addEventListener('click', function (event) {
    if (event.target.classList.contains('b64fb9ae')) {
        Placeholder('چی میقای؟');
    }
});
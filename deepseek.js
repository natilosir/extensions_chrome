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
    .f9bf7997, .fbb737a4, .c92459f0, .ds-textarea__textarea ,table, th, td, tr{
        direction: rtl !important;
        text-align: right !important;

    }
`;
document.head.appendChild(dynamicStyles);

let isRTL = true;

let counter = 0;

const interval = setInterval(() => {
    Placeholder('چی میقای؟');
    counter++;

    if (counter === 2) {
        clearInterval(interval);
    }
}, 99);

button.addEventListener('click', function () {
    if (isRTL) {
        Placeholder('what the fuck');
        dynamicStyles.innerHTML = '';
        button.innerText = 'RTL';
    } else {
        Placeholder('چی میقای؟');
        dynamicStyles.innerHTML = `
            .f9bf7997, .fbb737a4, .c92459f0, .ds-textarea__textarea ,table, th, td, tr{
                direction: rtl !important;
                text-align: right !important;

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
    const target = event.target;

    if (
        target.classList.contains('f9edaa3c') ||
        target.classList.contains('ec92d1d3') ||
        target.classList.contains('e066abb8') ||
        target.classList.contains('c08e6e93') ||
        target.closest('.e066abb8 svg')
    ) {
        let counter = 0;

        const interval = setInterval(() => {
            const message = target.closest('.e066abb8 svg') ? 'چی میقای؟' : 'دیگه چی میقای؟';
            Placeholder(message);
            counter++;

            if (counter === 2) {
                clearInterval(interval);
            }
        }, 20);
    }
});



const observer = new MutationObserver(function(mutations) {
    const textarea = document.getElementById('chat-input');
    if (textarea) {
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                textarea.focus();
            }
        });
        observer.disconnect(); 
    }
});

observer.observe(document.body, { childList: true, subtree: true });


document.addEventListener('DOMContentLoaded', function () {
    const style     = document.createElement('style');
    style.innerHTML = `
        code, pre {
            font-family: 'Fira Code' !important;
        }
    `;
    document.head.appendChild(style);
});


const button                 = document.createElement('button');
button.innerText             = 'LTR';
button.style.position        = 'fixed';
button.style.top             = '60px';
button.style.right           = '10px';
button.style.padding         = '8px 16px';
button.style.backgroundColor = '#4d6bfe';
button.style.color           = 'white';
button.style.border          = 'none';
button.style.borderRadius    = '14px';
button.style.cursor          = 'pointer';
button.style.zIndex          = '9999';

document.body.appendChild(button);

const dynamicStyles = document.createElement('style');
dynamicStyles.id    = 'dynamicStyles';
document.head.appendChild(dynamicStyles);

let isRTL = true;

function toggleDirection () {
    isRTL           = !isRTL;
    const direction = isRTL ? 'ltr' : 'rtl';
    const textAlign = isRTL ? 'left' : 'right';

    dynamicStyles.innerHTML = `
       .text-token-text-primary,.gap-1,.markdown {
            direction: ${ direction } !important;
            text-align: ${ textAlign } !important;
        }
    `;

    button.innerText = isRTL ? 'LTR' : 'RTL';
}

toggleDirection();
button.addEventListener('click', toggleDirection);

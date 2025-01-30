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
    .f9bf7997, .fbb737a4, .c92459f0 {
        direction: rtl;
    }
`;
document.head.appendChild(dynamicStyles);

let isRTL = true;

button.addEventListener('click', function() {
    if (isRTL) {
        dynamicStyles.innerHTML = '';
        button.innerText = 'RTL';
    } else {
        dynamicStyles.innerHTML = `
            .f9bf7997, .fbb737a4 {
                direction: rtl;
            }
        `;
        button.innerText = 'LTR';
    }

    isRTL = !isRTL;
});

window.onload = function() {
    button.innerText = 'RTL';
};

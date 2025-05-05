function removeAllComments () {
    const commentsContainer = document.getElementById('response-content-container');
    if ( commentsContainer ) {
        commentsContainer.innerHTML = '';
    }
}

const button                 = document.createElement('button');
button.innerText             = 'LTR';
button.style.position        = 'fixed';
button.style.top             = '10px';
button.style.right           = '10px';
button.style.padding         = '10px 20px';
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
        #response-content-container, textarea {
            direction: ${ direction } !important;
            text-align: ${ textAlign } !important;
        }
    `;

    button.innerText = isRTL ? 'LTR' : 'RTL';
}

toggleDirection();
button.addEventListener('click', toggleDirection);
removeAllComments();
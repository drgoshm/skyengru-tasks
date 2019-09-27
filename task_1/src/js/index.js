
(() => {
    const newMessageTextInp = document.getElementById('new-message-text'),
        newMessageSendBtn = document.getElementById('new-message-send'),
        messageList = document.getElementById('messages'),
        messageTemplate = document.getElementById('message-template'),
        messageDisableBtn = document.getElementById('message-disable'), 
        alternateBox = document.getElementById('message-alternate'),
        alternatePeriod = 1800,
        sendMessage = () => {
            if(newMessageTextInp.value !== '') {
                messageTemplate.content
                    .querySelector('.message-text')
                    .textContent = newMessageTextInp.value;
                messageList.appendChild(document.importNode(messageTemplate.content, true));
                newMessageTextInp.value = '';
                newMessageTextInp.focus();
                newMessageSendBtn.disabled = true;
            }
        };
    let current = -1;

    newMessageTextInp.addEventListener('keyup', (event) => {
        newMessageSendBtn.disabled = newMessageTextInp.value === '';
        if(event.code === 'Enter') sendMessage();
    });

    newMessageSendBtn.addEventListener('click', sendMessage);

    messageDisableBtn.addEventListener('click', () => {
        const messages = messageList.querySelectorAll('.message:not(.disabled)');
        if(messages.length && current >= 0) { 
            messages[current].classList.add('disabled');
            if(messages.length === 1){
                alternateBox.textContent = '';
                current = -1;
                return;
            }
            current = current < messages.length - 2 ? current + 1 : 0;
            alternateBox.textContent = messages[current].textContent;
        }
    });

    setInterval(() => {
        const messages = messageList.querySelectorAll('.message:not(.disabled)');
        if(messages.length) {
            current = current < messages.length - 1 ? current + 1 : 0;
            alternateBox.textContent = messages[current].textContent;
        } else if(alternateBox.textContent !== ''){
            alternateBox.textContent = '';
        }
    }, alternatePeriod);


})();
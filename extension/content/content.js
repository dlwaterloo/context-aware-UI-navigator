async function sendChatMessage(messageText) {
    const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ text: messageText }),
    });
    return response.json();
}

function createChatBox() {
    if (document.getElementById('chatbox-container')) return;

    const chatboxContainer = document.createElement('div');
    chatboxContainer.id = 'chatbox-container';
    chatboxContainer.style = 'position: fixed; bottom: 20px; right: 20px; width: 300px; height: 450px; background-color: #f1f1f1; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; display: flex; flex-direction: column; z-index: 99999;';

    const chatboxHeader = document.createElement('div');
    chatboxHeader.style = 'padding: 10px; background-color: #007bff; color: #ffffff; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;';
    chatboxHeader.innerHTML = 'AI Chatbox';
    chatboxContainer.appendChild(chatboxHeader);

    const chatboxMessages = document.createElement('div');
    chatboxMessages.id = 'chatbox-messages';
    chatboxMessages.style = 'flex-grow: 1; overflow-y: auto; padding: 10px;';
    chatboxContainer.appendChild(chatboxMessages);

    const chatboxInputContainer = document.createElement('div');
    chatboxInputContainer.style = 'padding: 10px;';
    const chatboxInput = document.createElement('input');
    chatboxInput.id = 'chatbox-input';
    chatboxInput.type = 'text';
    chatboxInput.style = 'width: 97%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;';
    chatboxInputContainer.appendChild(chatboxInput);
    chatboxContainer.appendChild(chatboxInputContainer);

    chatboxInput.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter' && chatboxInput.value.trim() !== '') {
            const userMessage = document.createElement('div');
            userMessage.style.textAlign = 'right';
            userMessage.innerHTML = `<div style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${chatboxInput.value}</div>`;
            chatboxMessages.appendChild(userMessage);
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            const response = await sendChatMessage(chatboxInput.value);
            const responseMessage = document.createElement('div');
            responseMessage.style.textAlign = 'left';
            responseMessage.innerHTML = `<div style="display: inline-block; background-color: #f1f1f1; color: #333; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${response.output}</div>`;
            chatboxMessages.appendChild(responseMessage);
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            chatboxInput.value = '';
        }
    });

    document.body.appendChild(chatboxContainer);
}

// Call createChatBox to display the chatbox when the extension is loaded
// createChatBox();


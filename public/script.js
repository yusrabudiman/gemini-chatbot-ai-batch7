document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderMarkdown(text) {
        const safeText = escapeHtml(text);

        if (window.marked) {
            return window.marked.parse(safeText, {
                gfm: true,
                breaks: true,
            });
        }

        return safeText.replace(/\n/g, '<br>');
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            return;
        }

        appendMessage('user', userMessage);
        userInput.value = '';

        const thinkingMessage = appendMessage('bot', 'Thinking...');

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation: [{ role: 'user', text: userMessage }],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server.');
            }

            const data = await response.json();

            if (data.result) {
                thinkingMessage.innerHTML = renderMarkdown(data.result);
            } else {
                thinkingMessage.textContent = 'Sorry, no response received.';
            }
        } catch (error) {
            console.error('Error:', error);
            thinkingMessage.textContent = 'Failed to get response from server.';
        }
    });

    function appendMessage(role, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${role}-message`);
        if (role === 'bot') {
            messageElement.innerHTML = renderMarkdown(text);
        } else {
            messageElement.textContent = text;
        }
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }
});

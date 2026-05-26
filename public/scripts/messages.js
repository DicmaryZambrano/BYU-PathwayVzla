document.addEventListener("DOMContentLoaded", async() => {
    
    // Generar ID único de usuario
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }

    const response = await fetch("/api/messages");
    let messages = await response.json();

    const messagesList = document.getElementById("messagesList");
    const messagesCount = document.getElementById("messagesCount");

    const btnSendMessage = document.getElementById("btnSendMessage");
    const messageTextarea = document.getElementById("messageTextarea");
    const nameInput = document.getElementById("nameInput");
    const locationSelect = document.getElementById("locationSelect");
    const anonymousCheck = document.getElementById("anonymousCheck");

    function renderMessages() {
        messagesList.innerHTML = "";

        messages.forEach(message => {
            const messageCard = document.createElement("div");
            messageCard.className = "message-card fade-in visible";

            // Determinar si el usuario actual ha dado like
            const isLiked = message.likedBy && message.likedBy.includes(userId);

            messageCard.innerHTML = `
                <div class="message-card-top">
                    <div class="message-avatar">
                        <img src="${message.avatar}" alt="${message.name}">
                    </div>
                    <div class="message-card-content">
                        <div class="message-card-header">
                            <div>
                                <h5 class="message-name">${escapeHtml(message.name)}</h5>
                                <span class="message-location">
                                    ${escapeHtml(message.location)}
                                </span>
                            </div>
                            <div class="message-card-actions">
                                <span class="message-time">
                                    ${message.time}
                                </span>
                                <button 
                                    class="message-like-btn"
                                    data-message-id="${message.id}"
                                >
                                    <svg 
                                        viewBox="0 0 24 24"
                                        fill="${isLiked ? '#EF4444' : 'none'}"
                                        stroke="#EF4444"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    <span class="likes-count">
                                        ${message.likes}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <p class="message-text">
                            ${escapeHtml(message.text)}
                        </p>
                    </div>
                </div>
            `;

            messagesList.appendChild(messageCard);
        });

        messagesCount.textContent = messages.length;
        attachLikeHandlers();
    }

    function attachLikeHandlers() {
        const likeButtons = document.querySelectorAll('.message-like-btn');
        
        likeButtons.forEach(button => {
            // Remover event listener anterior si existe
            button.removeEventListener('click', handleLike);
            // Agregar nuevo
            button.addEventListener('click', handleLike);
        });
    }

    async function handleLike(event) {
        const button = event.currentTarget;
        const messageId = parseInt(button.dataset.messageId);
        
        // Encontrar el mensaje actual
        const currentMessage = messages.find(m => m.id === messageId);
        const wasLiked = currentMessage.likedBy && currentMessage.likedBy.includes(userId);
        
        // Guardar estado actual para posible revert
        const previousLikes = currentMessage.likes;
        const previousLikedBy = [...currentMessage.likedBy];
        
        // Optimistic update - Actualizar UI inmediatamente
        const likesSpan = button.querySelector('.likes-count');
        const svg = button.querySelector('svg');
        
        if (wasLiked) {
            // Quitar like
            likesSpan.textContent = parseInt(likesSpan.textContent) - 1;
            svg.setAttribute('fill', 'none');
            currentMessage.likes -= 1;
            currentMessage.likedBy = currentMessage.likedBy.filter(id => id !== userId);
        } else {
            // Agregar like
            likesSpan.textContent = parseInt(likesSpan.textContent) + 1;
            svg.setAttribute('fill', '#EF4444');
            currentMessage.likes += 1;
            currentMessage.likedBy.push(userId);
        }
        
        try {
            // Enviar al backend
            const response = await fetch("/api/messages", {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    id: messageId, 
                    userId: userId 
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update like');
            }
            
            const updatedMessage = await response.json();
            
            // Sincronizar con la respuesta del servidor
            const messageIndex = messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
                messages[messageIndex] = updatedMessage;
            }
            
            // Actualizar UI con datos del servidor
            likesSpan.textContent = updatedMessage.likes;
            if (updatedMessage.liked) {
                svg.setAttribute('fill', '#EF4444');
            } else {
                svg.setAttribute('fill', 'none');
            }
            
        } catch (error) {
            console.error('Error updating like:', error);
            
            // Revertir cambios
            if (wasLiked) {
                likesSpan.textContent = previousLikes;
                svg.setAttribute('fill', '#EF4444');
                currentMessage.likes = previousLikes;
                currentMessage.likedBy = previousLikedBy;
            } else {
                likesSpan.textContent = previousLikes;
                svg.setAttribute('fill', 'none');
                currentMessage.likes = previousLikes;
                currentMessage.likedBy = previousLikedBy;
            }
            
            alert('Error al actualizar el like. Por favor intenta de nuevo.');
        }
    }

    // Función de seguridad para evitar XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    messageTextarea.addEventListener('input', () => {
    console.log('TEXTAREA VALUE:', messageTextarea.value);
    });

    btnSendMessage.addEventListener('click', async (event) => {
        event.preventDefault();

        console.log("ANTES:", messageTextarea.value);

        const text = messageTextarea.value.trim();

        console.log("DESPUÉS:", text);
        
        const location = locationSelect.value;

        let name = nameInput.value.trim();

        if (anonymousCheck.checked) {
            name = "Invitado";
        }

        console.log({
            name,
            location,
            text
        });

        if (!name || !location || !text) {
            alert("Por favor completa todos los campos");
            return;
        }

        try {

            btnSendMessage.disabled = true;
            btnSendMessage.textContent = "Enviando...";

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    location,
                    message: text
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create message');
            }

            const newMessage = await response.json();

            // Agregar arriba del feed
            messages.unshift(newMessage);

            // Render
            renderMessages();

            // Reset form
            messageTextarea.value = '';
            nameInput.value = '';
            locationSelect.selectedIndex = 0;
            anonymousCheck.checked = false;

            // Reset counter
            document.getElementById('charCounter').textContent = '0/500';

        } catch (error) {

            console.error(error);

            alert('Error enviando mensaje');

        } finally {

            btnSendMessage.disabled = false;
            btnSendMessage.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Enviar mensaje
            `;
        }
    });

    renderMessages();
});
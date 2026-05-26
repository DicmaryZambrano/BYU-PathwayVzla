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

    function renderMessages() {
        messagesList.innerHTML = "";

        messages.forEach(message => {
            const messageCard = document.createElement("div");
            messageCard.className = "message-card fade-in.visible";

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

    renderMessages();
});
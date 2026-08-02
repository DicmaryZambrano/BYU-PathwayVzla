document.addEventListener("DOMContentLoaded", async() => {
    
    // Generar ID único de usuario
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }

    let messages = [];

    let currentPage = 1;

    const PAGE_SIZE = 10;

    let currentSort = "recent";

    let hasMore = true;

    const messagesList = document.getElementById("messagesList");
    const messagesCount = document.getElementById("messagesCount");

    const btnSendMessage = document.getElementById("btnSendMessage");
    const messageTextarea = document.getElementById("messageTextarea");
    const nameInput = document.getElementById("nameInput");
    const locationSelect = document.getElementById("locationSelect");
    const anonymousCheck = document.getElementById("anonymousCheck");
    const btnLoadMore = document.querySelector(".btn-load-more");
    const sortSelect = document.querySelector(".sort-select");
    const btnShareLink = document.querySelector('.btn-share-link');

    const charCounter = document.getElementById('charCounter');

    if (messageTextarea && charCounter) {
        messageTextarea.addEventListener('input', function () {
            var currentLength = this.value.length;
            charCounter.textContent = currentLength + '/500';
            if (currentLength >= 480) {
                charCounter.style.color = '#ef4444';
            } else {
                charCounter.style.color = '';
            }
        });
    }

    async function loadStats() {

        try {

            const response =
                await fetch(
                    "/api/message-stats"
                );

            const stats =
                await response.json();

            document.getElementById(
                "statMessages"
            ).textContent =
                stats.totalMessages;

            document.getElementById(
                "statLikes"
            ).textContent =
                stats.totalLikes;

            document.getElementById(
                "statParticipants"
            ).textContent =
                stats.totalParticipants;

        } catch (error) {

            console.error(
                "Error loading stats",
                error
            );
        }
    }

    async function loadMessages(reset = false) {
        if (reset) {

            currentPage = 1;

            messages = [];

            messagesList.innerHTML = "";
        }

        const response =
            await fetch(
                `/api/messages?page=${currentPage}&limit=${PAGE_SIZE}&sort=${currentSort}`
            );

        const data =
            await response.json();

        messages.push(...data.messages);

        hasMore = data.hasMore;

        if (messagesCount) {
            messagesCount.textContent = data.total;
        }

        renderMessages();

        updateLoadMoreButton();
    }

    async function loadFeaturedMessages() {

    const response =
        await fetch(
            "/api/messages?featured=true"
        );

    const featured =
        await response.json();

    const featuredContent =
        document.getElementById(
            "featuredContent"
        );

    const sliderDots =
        document.getElementById(
            "sliderDots"
        );

    featuredContent.innerHTML = "";

    sliderDots.innerHTML = "";

    featured.forEach(
            (message, index) => {

                featuredContent.innerHTML += `
                    <div
                        class="featured-item"
                        style="${
                            index === 0
                                ? ""
                                : "display:none;"
                        }"
                    >

                        <div
                            class="featured-item-top"
                        >

                            <div
                                class="message-avatar message-avatar-sm"
                            >

                                <img
                                    src="${message.avatar}"
                                >

                            </div>

                            <div>

                                <h5
                                    class="featured-name"
                                >
                                    ${escapeHtml(
                                        message.name
                                    )}
                                </h5>

                                <span
                                    class="featured-location"
                                >
                                    ${escapeHtml(
                                        message.location
                                    )}
                                </span>

                            </div>

                        </div>

                        <p
                            class="featured-text"
                        >
                            ${escapeHtml(
                                message.text
                            )}
                        </p>

                        <div
                            class="featured-badge"
                        >
                            ⭐
                            ${message.likes}
                            reacciones
                        </div>

                    </div>
                `;

                sliderDots.innerHTML += `
                    <span
                        class="dot ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                    ></span>
                `;
            });

        initializeFeaturedSlider();
    }

    function initializeFeaturedSlider() {

        const sliderPrev =
            document.getElementById(
                'sliderPrev'
            );

        const sliderNext =
            document.getElementById(
                'sliderNext'
            );

        const featuredContent =
            document.getElementById(
                'featuredContent'
            );

        const sliderDots =
            document.getElementById(
                'sliderDots'
            );

        let currentSlide = 0;

        function showSlide(index) {

            const items =
                featuredContent.querySelectorAll(
                    '.featured-item'
                );

            const dots =
                sliderDots.querySelectorAll(
                    '.dot'
                );

            items.forEach(
                (item, i) => {

                    item.style.display =
                        i === index
                            ? 'block'
                            : 'none';
                }
            );

            dots.forEach(
                (dot, i) => {

                    dot.classList.toggle(
                        'active',
                        i === index
                    );
                }
            );

            currentSlide = index;
        }

        sliderPrev.onclick = () => {

            const total =
                featuredContent.querySelectorAll(
                    '.featured-item'
                ).length;

            showSlide(
                (currentSlide - 1 + total)
                % total
            );
        };

        sliderNext.onclick = () => {

            const total =
                featuredContent.querySelectorAll(
                    '.featured-item'
                ).length;

            showSlide(
                (currentSlide + 1)
                % total
            );
        };
    }

    function updateLoadMoreButton() {

        if (!hasMore) {

            btnLoadMore.innerHTML =
                "No hay más mensajes";

            btnLoadMore.disabled = true;

            return;
        }

        btnLoadMore.innerHTML = `
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
            </svg>
            Cargar más mensajes
        `;

        btnLoadMore.disabled = false;
    }

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

    btnLoadMore.addEventListener(
        "click",
        async () => {

            if (!hasMore)
                return;

            currentPage++;

            await loadMessages();
        }
    );

    sortSelect.addEventListener(
        "change",
        async () => {

            const value =
                sortSelect.value;

            if (value === "Más recientes")
                currentSort = "recent";

            if (value === "Más populares")
                currentSort = "popular";

            if (value === "Más antiguos")
                currentSort = "oldest";

            await loadMessages(true);
        }
    );

    btnSendMessage.addEventListener('click', async (event) => {
        event.preventDefault();

        const text = messageTextarea.value.trim();

        
        const location = locationSelect.value;

        let name = nameInput.value.trim();

        if (anonymousCheck.checked) {
            name = "Invitado";
        }

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

            if (response.ok) {
            alert('Mensaje enviado. Será revisado por nuestros moderadores antes de aparecer en el muro.');
            }

            if (!response.ok) {
                throw new Error('Failed to create message');
            }

            const newMessage = await response.json();

            // Render
            await loadMessages(true);

            charCounter.textContent = '0/500';

            await loadStats();

            // Reset form
            messageTextarea.value = '';
            nameInput.value = '';
            locationSelect.selectedIndex = 0;
            anonymousCheck.checked = false;

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

    if (btnShareLink) {
        btnShareLink.addEventListener('click', function () {
            const currentUrl = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(currentUrl).then(function () {
                    btnShareLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Enlace copiado!';
                    setTimeout(function () {
                        btnShareLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Compartir enlace';
                    }, 2000);
                });
            }
        });
    }

    await loadMessages(true);

    await loadFeaturedMessages();

    await loadStats();
});
document.addEventListener("DOMContentLoaded", async() => {

    const response = await fetch("/api/messages");
    const messages = await response.json();

    const messagesList = document.getElementById("messagesList");
    const messagesCount = document.getElementById("messagesCount");

    function renderMessages() {

        messagesList.innerHTML = "";

        messages.forEach(message => {

            const messageCard = document.createElement("div");

            messageCard.className = "message-card fade-in.visible";

            messageCard.innerHTML = `
            
                <div class="message-card-top">

                    <div class="message-avatar">
                        <img src="${message.avatar}" alt="${message.name}">
                    </div>

                    <div class="message-card-content">

                        <div class="message-card-header">

                            <div>
                                <h5 class="message-name">${message.name}</h5>

                                <span class="message-location">
                                    ${message.location}
                                </span>
                            </div>

                            <div class="message-card-actions">

                                <span class="message-time">
                                    ${message.time}
                                </span>

                                <button 
                                    class="message-like-btn"
                                    data-liked="false"
                                    data-count="${message.likes}"
                                >

                                    <svg 
                                        viewBox="0 0 24 24"
                                        fill="none"
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
                            ${message.text}
                        </p>

                    </div>

                </div>

            `;

            messagesList.appendChild(messageCard);
        });

        messagesCount.textContent = messages.length;
    }

    renderMessages();

});
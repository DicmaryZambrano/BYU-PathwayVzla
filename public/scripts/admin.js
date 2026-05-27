const username =
    sessionStorage.getItem(
        'admin_username'
    );

const password =
    sessionStorage.getItem(
        'admin_password'
    );

if (!username || !password) {

    window.location.href =
        'login.html';
}

async function loadMessages() {

    const response = await fetch(
        '/api/admin/messages',
        {
            headers: {
                username,
                password
            }
        }
    );

    if (!response.ok) {

        alert('Unauthorized');

        window.location.href =
            'login.html';

        return;
    }

    const messages =
        await response.json();

    renderMessages(messages);
}

function renderMessages(messages) {

    const container =
        document.getElementById('messages');

    if (messages.length === 0) {

        container.innerHTML = `
            <p>No hay mensajes pendientes.</p>
        `;

        return;
    }

    container.innerHTML = messages.map(m => `
        <div class="message-card">

            <h3>${escapeHtml(m.name)}</h3>

            <p>${escapeHtml(m.text)}</p>

            <small>
                ${new Date(m.createdAt).toLocaleString()}
            </small>

            <br><br>

            <button
                onclick="moderate(${m.id}, 'approve')"
            >
                Aprobar
            </button>

            <button
                onclick="moderate(${m.id}, 'reject')"
            >
                Rechazar
            </button>

        </div>
    `).join('');
}

async function moderate(id, action) {

    await fetch('/api/admin/messages', {
        method: 'PUT',

        headers: {
            'Content-Type': 'application/json',
            username,
            password
        },

        body: JSON.stringify({
            id,
            action,
            reviewerName: username
        })
    });

    loadMessages();
}

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
}

loadMessages();
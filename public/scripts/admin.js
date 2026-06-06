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

function extractYoutubeId(url) {

    const regex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;

    const match =
        url.match(regex);

    return match
        ? match[1]
        : "";
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

function renderPhotos(photos) {

    const container =
        document.getElementById('fotos');

    if (photos.length === 0) {

        container.innerHTML =
            '<p>No hay fotos pendientes.</p>';

        return;
    }

    container.innerHTML = photos.map(p => `

        <div class="message-card">

            <h3>
                ${escapeHtml(p.title)}
            </h3>

            <p>
                <strong>Usuario:</strong>
                ${escapeHtml(p.uploader)}
            </p>

            <p>
                <strong>Categoría:</strong>
                ${escapeHtml(p.category)}
            </p>

            <img
                src="${p.imageUrl}"
                alt="${p.title}"
                class="photo-preview"
            >

            <small>
                ${new Date(
                    p.createdAt
                ).toLocaleString()}
            </small>

            <div class="action-buttons">

                <button
                    class="approve-btn"
                    onclick="
                        moderatePhoto(
                            ${p.id},
                            'approve'
                        )
                    "
                >
                    Aprobar
                </button>

                <button
                    class="reject-btn"
                    onclick="
                        moderatePhoto(
                            ${p.id},
                            'reject'
                        )
                    "
                >
                    Rechazar
                </button>

            </div>

        </div>

    `).join('');
}

async function loadVideos() {

    const response = await fetch(
        '/api/admin/videos',
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

    const videos =
        await response.json();

    renderVideos(videos);
}

function renderVideos(videos) {

    const container =
        document.getElementById('videos');

    if (videos.length === 0) {

        container.innerHTML =
            '<p>No hay videos pendientes.</p>';

        return;
    }

    container.innerHTML =
        videos.map(v => {

            const videoId =
            extractYoutubeId(
                v.videoUrl
            );

            const preview =

                v.type === "youtube"

                ?

                `
                <iframe
                    width="100%"
                    height="220"
                    src="https://www.youtube.com/embed/${videoId}"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
                `

                :

                `
                <video
                    class="video-preview"
                    controls
                >
                    <source
                        src="${v.videoUrl}"
                        type="video/mp4"
                    >
                </video>
                `;

            return `

                <div class="message-card">

                    <h3>
                        ${escapeHtml(v.title)}
                    </h3>

                    <p>
                        <strong>Usuario:</strong>
                        ${escapeHtml(v.uploader)}
                    </p>

                    ${preview}

                    <small>
                        ${new Date(
                            v.createdAt
                        ).toLocaleString()}
                    </small>

                    <div class="action-buttons">

                        <button
                            class="approve-btn"
                            onclick="
                                moderateVideo(
                                    ${v.id},
                                    'approve'
                                )
                            "
                        >
                            Aprobar
                        </button>

                        <button
                            class="reject-btn"
                            onclick="
                                moderateVideo(
                                    ${v.id},
                                    'reject'
                                )
                            "
                        >
                            Rechazar
                        </button>

                    </div>

                </div>

            `;

        }).join('');
}

async function loadPhotos() {

    const response = await fetch(
        '/api/admin/photos',
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

    const photos =
        await response.json();

    renderPhotos(photos);
}

function renderPhotos(photos) {

    const container =
        document.getElementById('fotos');

    if (photos.length === 0) {

        container.innerHTML = `
            <p>No hay fotos pendientes.</p>
        `;

        return;
    }

    container.innerHTML = photos.map(p => `
        <div class="message-card">

            <h3>${escapeHtml(p.uploader)}</h3>

            <p>${escapeHtml(p.category)}</p>

            <img src="${p.imageUrl}" alt="${p.title}" style="max-width: 100%; height: auto;">

            <small>
                ${new Date(p.createdAt).toLocaleString()}
            </small>

            <br><br>

            <button
                onclick="moderatePhoto(${p.id}, 'approve')"
            >
                Aprobar
            </button>

            <button
                onclick="moderatePhoto(${p.id}, 'reject')"
            >
                Rechazar
            </button>

        </div>
    `).join('');
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
                onclick="moderateMessage(${m.id}, 'approve')"
            >
                Aprobar
            </button>

            <button
                onclick="moderateMessage(${m.id}, 'reject')"
            >
                Rechazar
            </button>

        </div>
    `).join('');
}

async function moderateMessage(id, action) {

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

async function moderatePhoto(id, action) {

    await fetch('/api/admin/photos', {
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

    loadPhotos();
}

async function moderateVideo(
    id,
    action
) {

    await fetch(
        '/api/admin/videos',
        {
            method: 'PUT',

            headers: {
                'Content-Type':
                    'application/json',
                username,
                password
            },

            body: JSON.stringify({
                id,
                action,
                reviewerName:
                    username
            })
        }
    );

    loadVideos();
}

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
}

loadMessages();
loadPhotos();
loadVideos();
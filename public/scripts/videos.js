// ============================================
// VIDEOS PAGE - SPECIFIC LOGIC
// ============================================
// Toda la lógica específica de videos.html
// La lógica compartida (header scroll, mobile menu)
// se hereda de animaciones.js
// ============================================
/*
(function () {
    'use strict';

    // ============================================
    // VIDEO MODAL
    // ============================================
    var videoModal = document.getElementById('videoModal');
    var modalVideoTitle = document.getElementById('modalVideoTitle');

    window.openVideoModal = function (title) {
        if (!videoModal || !modalVideoTitle) return;
        modalVideoTitle.textContent = title;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeVideoModal = function () {
        if (!videoModal) return;
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (videoModal) {
        videoModal.addEventListener('click', function (e) {
            if (e.target === videoModal) window.closeVideoModal();
        });
    }

    // ============================================
    // LINK MODAL
    // ============================================
    var linkModal = document.getElementById('linkModal');

    window.showLinkModal = function () {
        if (!linkModal) return;
        linkModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLinkModal = function () {
        if (!linkModal) return;
        linkModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (linkModal) {
        linkModal.addEventListener('click', function (e) {
            if (e.target === linkModal) window.closeLinkModal();
        });
    }

    window.submitLink = function () {
        var linkInput = document.getElementById('linkInput');
        if (!linkInput) return;
        var url = linkInput.value.trim();
        if (url) {
            alert('¡Enlace agregado exitosamente! El video será revisado y publicado pronto.');
            linkInput.value = '';
            window.closeLinkModal();
        } else {
            linkInput.style.borderColor = '#ef4444';
            setTimeout(function () {
                linkInput.style.borderColor = '';
            }, 2000);
        }
    };

    // ============================================
    // LIKE BUTTON FUNCTIONALITY
    // ============================================
    window.toggleLike = function (likeElement, event) {
        if (event) event.stopPropagation();
        var isLiked = likeElement.getAttribute('data-liked') === 'true';
        var countSpan = likeElement.querySelector('.likes-count');
        var currentCount = parseInt(likeElement.getAttribute('data-count'));

        if (isLiked) {
            currentCount--;
            likeElement.setAttribute('data-liked', 'false');
            likeElement.style.color = '';
            var svgEl = likeElement.querySelector('svg');
            if (svgEl) svgEl.style.fill = 'none';
        } else {
            currentCount++;
            likeElement.setAttribute('data-liked', 'true');
            likeElement.style.color = '#ef4444';
            var svgEl2 = likeElement.querySelector('svg');
            if (svgEl2) svgEl2.style.fill = '#EF4444';
        }

        likeElement.setAttribute('data-count', currentCount);
        if (countSpan) countSpan.textContent = currentCount;
    };

    // Initialize existing like buttons
    document.querySelectorAll('.reaction-item.like').forEach(function (likeEl) {
        likeEl.addEventListener('click', function (e) {
            e.stopPropagation();
            window.toggleLike(likeEl, e);
        });
    });

    // ============================================
    // FILTER VIDEOS
    // ============================================
    window.filterVideos = function () {
        var searchInput = document.getElementById('searchInput');
        var categorySelect = document.getElementById('categorySelect');
        var sortSelect = document.getElementById('sortSelect');
        if (!searchInput || !categorySelect || !sortSelect) return;

        var searchTerm = searchInput.value.toLowerCase();
        var category = categorySelect.value;
        var sort = sortSelect.value;
        var cards = document.querySelectorAll('.video-card');

        cards.forEach(function (card) {
            var titleEl = card.querySelector('.video-title');
            var authorEl = card.querySelector('.author');
            var title = titleEl ? titleEl.textContent.toLowerCase() : '';
            var author = authorEl ? authorEl.textContent.toLowerCase() : '';
            var cardCategory = card.getAttribute('data-category');

            var matchesSearch = title.includes(searchTerm) || author.includes(searchTerm);
            var matchesCategory = category === 'all' || cardCategory === category;

            if (matchesSearch && matchesCategory) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });

        // Sort videos
        var grid = document.getElementById('videosGrid');
        if (!grid) return;
        var visibleCards = Array.from(cards).filter(function (c) {
            return c.style.display !== 'none';
        });

        visibleCards.sort(function (a, b) {
            if (sort === 'popular') {
                return parseInt(b.getAttribute('data-likes')) - parseInt(a.getAttribute('data-likes'));
            } else if (sort === 'oldest') {
                return new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date'));
            } else {
                return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
            }
        });

        visibleCards.forEach(function (card) {
            grid.appendChild(card);
        });
    };

    // ============================================
    // VIEW TOGGLE
    // ============================================
    window.setView = function (view) {
        var grid = document.getElementById('videosGrid');
        var gridBtn = document.getElementById('gridViewBtn');
        var listBtn = document.getElementById('listViewBtn');
        if (!grid || !gridBtn || !listBtn) return;

        if (view === 'grid') {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            grid.style.gridTemplateColumns = '1fr';
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        }
    };

    // ============================================
    // LOAD MORE VIDEOS
    // ============================================
    window.loadMoreVideos = function () {
        var btn = document.querySelector('.btn-load-more-videos');
        if (!btn) return;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Cargando...';
        btn.disabled = true;

        setTimeout(function () {
            var grid = document.getElementById('videosGrid');
            if (!grid) return;

            var newVideos = [
                {
                    title: 'Mi experiencia en BYU-Pathway',
                    author: 'Ana Torres',
                    date: '03 May 2024',
                    duration: '03:42',
                    likes: 52,
                    comments: 8,
                    category: 'speeches',
                    dateVal: '2024-05-03',
                    img: 'https://image.qwenlm.ai/public_source/c18da45d-c2ad-400f-a2dd-d8c3b6cd6c88/16f490748-6b90-4f02-922b-0d70431973b4.png'
                },
                {
                    title: 'Graduación de la Generación 2024',
                    author: 'BYU-Pathway Venezuela',
                    date: '02 May 2024',
                    duration: '05:15',
                    likes: 203,
                    comments: 45,
                    category: 'ceremony',
                    dateVal: '2024-05-02',
                    img: 'https://image.qwenlm.ai/public_source/c18da45d-c2ad-400f-a2dd-d8c3b6cd6c88/142a2f644-c727-4272-937f-ee052c325608.png'
                },
                {
                    title: 'Palabras de agradecimiento',
                    author: 'Pedro Sánchez',
                    date: '01 May 2024',
                    duration: '02:55',
                    likes: 78,
                    comments: 14,
                    category: 'speeches',
                    dateVal: '2024-05-01',
                    img: 'https://image.qwenlm.ai/public_source/c18da45d-c2ad-400f-a2dd-d8c3b6cd6c88/1b2f9e0e9-bdcd-4722-8ed4-11eeb42caa91.png'
                }
            ];

            newVideos.forEach(function (v) {
                var card = document.createElement('div');
                card.className = 'video-card';
                card.setAttribute('data-category', v.category);
                card.setAttribute('data-date', v.dateVal);
                card.setAttribute('data-likes', v.likes);
                card.innerHTML =
                    '<div class="video-thumbnail" onclick="openVideoModal(\'' + v.title.replace(/'/g, "\\'") + '\')">' +
                    '    <img src="' + v.img + '" alt="' + v.title + '">' +
                    '    <div class="video-play-overlay">' +
                    '        <div class="play-button">' +
                    '            <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                    '        </div>' +
                    '    </div>' +
                    '    <span class="video-duration">' + v.duration + '</span>' +
                    '</div>' +
                    '<div class="video-content">' +
                    '    <h3 class="video-title">' + v.title + '</h3>' +
                    '    <p class="video-meta">by <span class="author">' + v.author + '</span> · ' + v.date + '</p>' +
                    '    <div class="video-footer">' +
                    '        <div class="video-reactions">' +
                    '            <div class="reaction-item like" data-count="' + v.likes + '" data-liked="false">' +
                    '                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
                    '                <span class="likes-count">' + v.likes + '</span>' +
                    '            </div>' +
                    '            <div class="reaction-item comment">' +
                    '                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
                    '                <span>' + v.comments + '</span>' +
                    '            </div>' +
                    '        </div>' +
                    '        <button class="video-menu-btn">' +
                    '            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>' +
                    '        </button>' +
                    '    </div>' +
                    '</div>';
                grid.appendChild(card);

                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                requestAnimationFrame(function () {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });

                var likeBtn = card.querySelector('.reaction-item.like');
                if (likeBtn) {
                    likeBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        window.toggleLike(this, e);
                    });
                }
            });

            btn.innerHTML = 'No hay más videos';
            btn.style.opacity = '0.6';
            btn.style.cursor = 'default';
        }, 1500);
    };

    // ============================================
    // VIDEO UPLOAD HANDLER
    // ============================================
    window.handleVideoUpload = function (input) {
        if (input.files && input.files[0]) {
            var file = input.files[0];
            var maxSize = 20 * 1024 * 1024; // 20MB

            if (file.size > maxSize) {
                alert('El archivo es demasiado grande. El tamaño máximo es 20MB.');
                input.value = '';
                return;
            }

            var fileName = file.name;
            var grid = document.getElementById('videosGrid');
            if (!grid) return;

            var card = document.createElement('div');
            card.className = 'video-card';
            card.setAttribute('data-category', 'uploads');
            card.setAttribute('data-date', new Date().toISOString().split('T')[0]);
            card.setAttribute('data-likes', '0');

            var reader = new FileReader();
            reader.onload = function (e) {
                card.innerHTML =
                    '<div class="video-thumbnail" onclick="openVideoModal(\'' + fileName.replace(/'/g, "\\'") + '\')">' +
                    '    <img src="' + e.target.result + '" alt="' + fileName + '">' +
                    '    <div class="video-play-overlay">' +
                    '        <div class="play-button">' +
                    '            <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                    '        </div>' +
                    '    </div>' +
                    '    <span class="video-duration">00:00</span>' +
                    '</div>' +
                    '<div class="video-content">' +
                    '    <h3 class="video-title">' + fileName + '</h3>' +
                    '    <p class="video-meta">by <span class="author">Tú</span> · Ahora</p>' +
                    '    <div class="video-footer">' +
                    '        <div class="video-reactions">' +
                    '            <div class="reaction-item like" data-count="0" data-liked="false">' +
                    '                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
                    '                <span class="likes-count">0</span>' +
                    '            </div>' +
                    '            <div class="reaction-item comment">' +
                    '                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
                    '                <span>0</span>' +
                    '            </div>' +
                    '        </div>' +
                    '        <button class="video-menu-btn">' +
                    '            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>' +
                    '        </button>' +
                    '    </div>' +
                    '</div>';
                grid.insertBefore(card, grid.firstChild);

                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                requestAnimationFrame(function () {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });

                var likeBtn = card.querySelector('.reaction-item.like');
                if (likeBtn) {
                    likeBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        window.toggleLike(this, e);
                    });
                }

                alert('¡Video "' + fileName + '" agregado exitosamente!');
            };
            reader.readAsDataURL(file);
            input.value = '';
        }
    };

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            window.closeVideoModal();
            window.closeLinkModal();
        }
    });

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    function handleVideoScrollAnimations() {
        var elements = document.querySelectorAll('.video-card, .benefits-card-videos .benefit-item, .upload-card-videos');
        if (elements.length === 0) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(function (el, index) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease ' + (index % 6) * 0.1 + 's, transform 0.5s ease ' + (index % 6) * 0.1 + 's';
            observer.observe(el);
        });
    }

    // Initialize scroll animations
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleVideoScrollAnimations);
    } else {
        handleVideoScrollAnimations();
    }

})();
*/

function extractYoutubeId(url) {

    const regex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;

    const match =
        url.match(regex);

    return match
        ? match[1]
        : "";
}

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.readAsDataURL(file);

            reader.onload =
                () => resolve(reader.result);

            reader.onerror =
                error => reject(error);
        }
    );
}

function handleVideoFile(event) {

    const file =
        event.target.files[0];

    if(!file) return;

    selectedVideoFile = file;

    previewVideo.src =
        URL.createObjectURL(file);

    document
        .getElementById("videoTitle")
        .value =
            file.name.replace(/\.[^/.]+$/, "");

    uploadVideoModal.classList.add(
        "active"
    );
}

let selectedVideoFile = null;

const videoInput =
    document.getElementById("videoInput");

const uploadVideoModal =
    document.getElementById("uploadVideoModal");

const previewVideo =
    document.getElementById("previewVideo");

videoInput.addEventListener(
    "change",
    handleVideoFile
);

async function loadVideos() {

    try {

        const response =
            await fetch("/api/videos");

        const videos =
            await response.json();

        const grid =
            document.getElementById("videosGrid");

    grid.innerHTML =
        videos.map(video => {

            const thumbnail =
                video.type === "youtube"
                    ? `https://img.youtube.com/vi/${extractYoutubeId(video.videoUrl)}/hqdefault.jpg`
                    : (video.thumbnail || video.videoUrl);

            const date =
                new Date(video.createdAt)
                    .toLocaleDateString(
                        "es-ES",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

            return `

                <div
                    class="video-card"
                    data-category="${video.category || 'general'}"
                    data-date="${video.createdAt}"
                >

                    <div
                        class="video-thumbnail"
                        onclick='openVideoModal(${JSON.stringify(video)})'
                    >
                        ${
                            video.type === "youtube"

                            ?

                            `
                            <img
                                src="${thumbnail}"
                                alt="${video.title}"
                            >
                            `

                            :

                            `
                            <video
                                src="${video.videoUrl}"
                                muted
                            ></video>
                            `
                        }

                        <div class="video-play-overlay">

                            <div class="play-button">

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="white"
                                >
                                    <polygon
                                        points="5 3 19 12 5 21 5 3"
                                    />
                                </svg>

                            </div>

                        </div>
                    </div>

                    <div class="video-content">

                        <div class="photo-card-avatar">
                            <img src="${video.avatar}" alt="${video.uploader}">
                        </div>

                        <h3 class="video-title">
                            ${video.title}
                        </h3>

                        <p class="video-meta">

                            by

                            <span class="author">
                                ${video.uploader}
                            </span>

                            ·

                            ${date}

                        </p>

                    </div>

                </div>

            `;
        }).join("");

    } catch(error) {

        console.error(error);
    }
}

document
    .getElementById("videoForm")
    .addEventListener(
        "submit",
        submitVideo
    );

async function submitVideo(e) {

    e.preventDefault();

    try {

        const videoBase64 =
            await fileToBase64(
                selectedVideoFile
            );

        const response =
            await fetch(
                "/api/videos/uploadFile",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        videoBase64,
                        title:
                            document.getElementById(
                                "videoTitle"
                            ).value,
                        category:
                            document.getElementById(
                                "videoCategory"
                            ).value,
                        uploader:
                            document.getElementById(
                                "videoUploaderName"
                            ).value
                    })
                }
            );

        if(!response.ok) {

            throw new Error(
                "No se pudo subir el video"
            );
        }

        alert("Video enviado");

        uploadVideoModal.classList.remove(
            "active"
        );

        loadVideos();

    } catch(error) {

        console.error(error);

        alert(error.message);
    }
}

async function submitVideoLink() {

    try {

        const response =
            await fetch(
                "/api/videos/uploadLink",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        videoUrl:
                            document.getElementById(
                                "videoLink"
                            ).value,

                        category:
                        document.getElementById(
                                "linkVideoCategory"
                        ).value,

                        title:
                            document.getElementById(
                                "linkVideoTitle"
                            ).value,

                        uploader:
                            document.getElementById(
                                "linkUploader"
                            ).value
                    })
                }
            );

        if(!response.ok) {

            throw new Error(
                "No se pudo guardar"
            );
        }

        alert("Video agregado");

        closeLinkModal();

        loadVideos();

    } catch(error) {

        console.error(error);

        alert(error.message);
    }
}

function openVideoModal(video) {

    const modal =
        document.getElementById("videoModal");

    const content =
        document.getElementById(
            "modalVideoContent"
        );

    let videoPlayer = "";

    if(video.type === "youtube") {

        const videoId =
            extractYoutubeId(
                video.videoUrl
            );

        videoPlayer = `
            <iframe
                width="100%"
                height="500"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allowfullscreen>
            </iframe>
        `;

    } else {

        videoPlayer = `
            <video
                controls
                autoplay
                width="100%">
                <source
                    src="${video.videoUrl}"
                    type="video/mp4">
            </video>
        `;
    }

    const downloadButton =
        video.type !== "youtube"
            ?
            `
            <a
                href="${video.videoUrl}?download=true"
                download
                class="download-video-btn"
            >
                ⬇ Descargar video
            </a>
            `
            :
            "";

    content.innerHTML = `

        <div class="video-modal-header">

            <div class="video-modal-user">

                <img
                    src="${video.avatar}"
                    alt="${video.uploader}"
                    class="video-modal-avatar"
                >

                <div>

                    <h3 class="video-modal-title">
                        ${video.title}
                    </h3>

                    <p class="video-modal-meta">
                        ${video.uploader}
                    </p>

                    <span class="video-modal-category">
                        ${video.category || "General"}
                    </span>

                </div>

            </div>

        </div>

        <div class="video-modal-player">

            ${videoPlayer}

        </div>

        <div class="video-modal-actions">

            ${downloadButton}

        </div>

    `;

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}

function closeVideoModal() {

    const modal =
        document.getElementById(
            "videoModal"
        );

    const content =
        document.getElementById(
            "modalVideoContent"
        );

    content.innerHTML = "";

    modal.classList.remove("active");

    document.body.style.overflow =
        "auto";
}

function showLinkModal() {
    document
        .getElementById("linkModal")
        .classList.add("active");
}

function closeLinkModal() {
    document
        .getElementById("linkModal")
        .classList.remove("active");
}

document
    .getElementById("linkModal")
    .addEventListener("click", function(e) {

        if(e.target === this) {
            closeLinkModal();
        }
    });

function closeUploadVideoModal() {

    uploadVideoModal.classList.remove(
        "active"
    );

    previewVideo.src = "";

    selectedVideoFile = null;

    videoInput.value = "";
}

document
    .getElementById("closeUploadVideoModal")
    .addEventListener(
        "click",
        closeUploadVideoModal
    );

uploadVideoModal.addEventListener(
    "click",
    function(e) {

        if(e.target === uploadVideoModal) {

            closeUploadVideoModal();
        }
    }
);

document
    .getElementById("videoModal")
    .addEventListener(
        "click",
        function(e) {

            if(e.target === this) {

                closeVideoModal();
            }
        }
    );

loadVideos();
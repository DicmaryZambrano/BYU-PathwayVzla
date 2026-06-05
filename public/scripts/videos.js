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

let currentPage = 1;
let hasMore = true;

let currentSearch = "";
let currentCategory = "all";
let currentSort = "recent";

function extractYoutubeId(url) {

    const regex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;

    const match =
        url.match(regex);

    return match
        ? match[1]
        : "";
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

async function loadVideos(reset = false) {

    try {

        if (reset) {

            currentPage = 1;

            const grid =
                document.getElementById("videosGrid");

            grid.innerHTML = "";
        }

        const response =
            await fetch(
                `/api/videos?page=${currentPage}&limit=6&search=${encodeURIComponent(currentSearch)}&category=${currentCategory}&sort=${currentSort}`
            );

        const data =
            await response.json();

        hasMore =
            data.hasMore;

        renderVideos(
            data.videos,
            !reset
        );

        updateLoadMoreButton();

    } catch(error) {

        console.error(error);
    }
}

function renderVideos(
    videos,
    append = false
) {

    const grid =
        document.getElementById(
            "videosGrid"
        );

    if (!append) {
        grid.innerHTML = "";
    }

    videos.forEach(video => {

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

        grid.insertAdjacentHTML(
            "beforeend",
            `
            <div
                class="video-card"
                data-category="${video.category || "general"}"
            >

                <div
                    class="video-thumbnail"
                    onclick='openVideoModal(${JSON.stringify(video)})'
                >

                    <img
                        src="${video.thumbnailUrl}"
                        alt="${video.title}"
                    >

                    <div class="video-play-overlay">
                        <div class="play-button">
                            <svg viewBox="0 0 24 24" fill="white">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </div>
                    </div>

                </div>

                <div class="video-content">

                    <div class="photo-card-avatar">
                        <img src="${video.avatar}">
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
            `
        );
    });
}

function loadMoreVideos() {

    if (!hasMore) return;

    currentPage++;

    loadVideos(true === false);
}

function updateLoadMoreButton() {

    const button =
        document.querySelector(
            ".btn-load-more-videos"
        );

    if (!button) return;

    button.style.display =
        hasMore
            ? "flex"
            : "none";
}

function filterVideos() {

    currentSearch =
        document.getElementById(
            "searchInput"
        ).value;

    currentCategory =
        document.getElementById(
            "categorySelect"
        ).value;

    currentSort =
        document.getElementById(
            "sortSelect"
        ).value;

    loadVideos(true);
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
    return; // Deshabilitado temporalmente
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

loadVideos(true);
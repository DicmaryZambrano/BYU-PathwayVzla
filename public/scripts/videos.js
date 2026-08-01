async function downloadFile(url) {

    try {

        const response =
            await fetch(url);

        const blob =
            await response.blob();

        const blobUrl =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = blobUrl;
        link.download =
            url.split("/").pop().split("?")[0];

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);

    } catch (error) {

        console.error(error);

        window.open(url, "_blank");
    }
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

let loadedVideos = [];

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
        loadedVideos = [];
    }

    videos.forEach(video => {

        const videoIndex =
            loadedVideos.push(video) - 1;

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
                    data-video-index="${videoIndex}"
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

                    ${video.type !== "youtube" ? `
                    <a
                        href="${video.videoUrl}"
                        class="video-download-btn"
                        title="Descargar video"
                        aria-label="Descargar video"
                        onclick="event.stopPropagation(); event.preventDefault(); downloadFile('${video.videoUrl}')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </a>
                    ` : ""}

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

document
    .getElementById("videosGrid")
    .addEventListener("click", (e) => {

        const thumbnail =
            e.target.closest(".video-thumbnail");

        if (!thumbnail || !window.openVideoGalleryModal) return;

        const index =
            parseInt(thumbnail.dataset.videoIndex, 10);

        window.openVideoGalleryModal(loadedVideos, index);
    });

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

loadVideos(true);

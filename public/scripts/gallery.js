let currentPage = 1;
let hasMore = true;

let currentSearch = "";
let currentCategory = "all";
let currentSort = "recent";

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

async function loadPhotoStats() {

    try {

        const response =
            await fetch("/api/photos/stats");

        const stats =
            await response.json();

        const heroStatPhotos =
            document.getElementById("heroStatPhotos");

        const heroStatGraduates =
            document.getElementById("heroStatGraduates");

        if (heroStatPhotos) {
            heroStatPhotos.textContent = stats.totalPhotos;
        }

        if (heroStatGraduates) {
            heroStatGraduates.textContent = stats.totalUploaders;
        }

    } catch (error) {

        console.error(error);
    }
}

async function loadPhotos(
    reset = false
) {

    try {

        if (reset) {

            currentPage = 1;

            document.getElementById(
                "photosGrid"
            ).innerHTML = "";
        }

        const response =
            await fetch(
                `/api/photos?page=${currentPage}&limit=12&search=${encodeURIComponent(currentSearch)}&category=${currentCategory}&sort=${currentSort}`
            );

        const data =
            await response.json();

        hasMore =
            data.hasMore;

        renderPhotos(
            data.photos,
            !reset
        );

        updateLoadMoreButton();

    } catch(error) {

        console.error(error);
    }
}

let loadedPhotos = [];

function renderPhotos(
    photos,
    append = false
) {

    const grid =
        document.getElementById(
            "photosGrid"
        );

    if (!append) {
        grid.innerHTML = "";
        loadedPhotos = [];
    }

    photos.forEach(photo => {

        const photoIndex =
            loadedPhotos.push(photo) - 1;

        grid.insertAdjacentHTML(
            "beforeend",
            `
            <div class="photo-card fade-in visible">

                <div class="photo-card-image" data-photo-index="${photoIndex}">

                    <img
                        src="${photo.imageUrl}"
                        alt="${photo.title}"
                    >

                    <span class="photo-badge">
                        ${photo.category || "General"}
                    </span>

                    <a
                        href="${photo.imageUrl}"
                        class="photo-download-btn"
                        title="Descargar foto"
                        aria-label="Descargar foto"
                        onclick="event.preventDefault(); event.stopPropagation(); downloadFile('${photo.imageUrl}')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </a>

                </div>

                <div class="photo-card-content">

                    <h4 class="photo-card-title">
                        ${photo.title}
                    </h4>

                    <div class="photo-card-user">

                        <div class="photo-card-avatar">
                            <img
                                src="${photo.avatar}"
                                alt="${photo.uploader}"
                            >
                        </div>

                        <div class="photo-card-user-info">

                            <span class="photo-card-user-name">
                                ${photo.uploader}
                            </span>

                        </div>

                    </div>

                </div>

            </div>
            `
        );
    });
}

document
    .getElementById("photosGrid")
    .addEventListener("click", (e) => {

        const card =
            e.target.closest(".photo-card-image");

        if (!card || !window.openPhotoGalleryModal) return;

        const index =
            parseInt(card.dataset.photoIndex, 10);

        window.openPhotoGalleryModal(
            loadedPhotos.map(photo => ({
                src: photo.imageUrl,
                alt: photo.title
            })),
            index
        );
    });

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        filterPhotos
    );

document
    .getElementById("categorySelect")
    .addEventListener(
        "change",
        filterPhotos
    );

document
    .getElementById("sortSelect")
    .addEventListener(
        "change",
        filterPhotos
    );

function filterPhotos() {

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

    loadPhotos(true);
}

function loadMorePhotos() {

    if (!hasMore) return;

    currentPage++;

    loadPhotos();
}

function updateLoadMoreButton() {

    const button =
        document.querySelector(
            ".btn-load-more"
        );

    if (!button) return;

    button.style.display =
        hasMore
            ? "flex"
            : "none";
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPhotos(true);

        loadPhotoStats();
    }
);

let selectedFile = null;

const uploadBtn =
    document.querySelector(".btn-select-photos");

const photoInput =
    document.getElementById("photoInput");

uploadBtn.addEventListener("click", () => {

    photoInput.click();

});

photoInput.addEventListener("change", handleFile);

document
    .getElementById("closeUploadModal")
    .addEventListener("click", closeUploadModal);

document
    .getElementById("photoForm")
    .addEventListener("submit", submitPhoto);

function handleFile(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    openUploadModal(file);
}

function openUploadModal(file) {

    selectedFile = file;

    const modal =
        document.getElementById("uploadModal");

    const preview =
        document.getElementById("previewImage");

    const reader =
        new FileReader();

    reader.onload = (e) => {

        preview.src = e.target.result;

    };

    reader.readAsDataURL(file);

    document.getElementById("photoTitle").value =
        file.name.replace(/\.[^/.]+$/, "");

    document.getElementById("uploaderName").value =
        "";

    document.getElementById("photoCategory").value =
        "grupo";

    modal.classList.add("active");
}

function closeUploadModal() {

    document
        .getElementById("uploadModal")
        .classList.remove("active");

    selectedFile = null;

    photoInput.value = "";
}

document
    .getElementById("uploadModal")
    .addEventListener("click", (e) => {

        if (e.target.id === "uploadModal") {
            closeUploadModal();
        }

    });

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.readAsDataURL(file);

        reader.onload =
            () => resolve(reader.result);

        reader.onerror =
            error => reject(error);

    });
}

async function submitPhoto(event) {

    event.preventDefault();

    try {

        const imageBase64 =
            await fileToBase64(selectedFile);

        const response =
            await fetch("/api/photos/upload", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    imageBase64,

                    title:
                        document.getElementById("photoTitle").value,

                    category:
                        document.getElementById("photoCategory").value,

                    uploader:
                        document.getElementById("uploaderName").value
                })
            });

        if (!response.ok) {

            throw new Error(
                "Error al subir la foto"
            );
        }

        alert("Foto enviada correctamente");

        closeUploadModal();

        await loadPhotos();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}

loadPhotos();
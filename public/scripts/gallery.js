async function loadPhotos() {

    try {

        const response =
            await fetch("/api/photos");

        const photos =
            await response.json();

        const grid =
            document.getElementById("photosGrid");

        grid.innerHTML = photos.map(photo => `

            <div class="photo-card fade-in visible">

                <div class="photo-card-image">
                    <img src="${photo.imageUrl}" alt="${photo.title}">
                    <span class="photo-badge">
                        ${photo.category || "General"}
                    </span>
                </div>

                <div class="photo-card-content">

                    <h4 class="photo-card-title">
                        ${photo.title}
                    </h4>

                    <div class="photo-card-user">

                        <div class="photo-card-avatar">
                            <img src="${photo.avatar}" alt="${photo.uploader}">
                        </div>

                        <div class="photo-card-user-info">
                            <span class="photo-card-user-name">
                                ${photo.uploader}
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        `).join("");

    } catch (error) {

        console.error(error);

    }
}

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
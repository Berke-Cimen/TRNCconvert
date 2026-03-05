// =============================================
// ConvertBox v2.0 — App Logic
// =============================================

const formats = {
    document: ["pdf", "docx", "txt", "odt"],
    image: ["png", "jpg", "webp"],
    audio: ["mp3", "wav"],
    video: ["mp4", "avi", "mkv"]
};

// State
let currentCategory = "document";
let selectedFormat = formats.document[0];
let selectedQuality = "high";
let selectedFile = null;

// Elements
const categorySelect = document.getElementById("category");
const qualitySelect = document.getElementById("qualitySelect");
const qualityWrapper = document.getElementById("qualityWrapper");
const statusEl = document.getElementById("status");
const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const formatChips = document.getElementById("formatChips");
const dropzone = document.getElementById("dropzone");
const dropzoneFile = document.getElementById("dropzoneFile");
const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");

// ---- Category Tabs ----
document.querySelectorAll(".cat-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".cat-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.cat;
        categorySelect.value = currentCategory;
        updateFormats();
    });
});

// ---- Format Chips ----
function updateFormats() {
    const fmts = formats[currentCategory];
    selectedFormat = fmts[0];
    formatChips.textContent = "";

    fmts.forEach((f, i) => {
        const chip = document.createElement("button");
        chip.className = "format-chip" + (i === 0 ? " active" : "");
        chip.textContent = f.toUpperCase();
        chip.addEventListener("click", () => {
            document.querySelectorAll(".format-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            selectedFormat = f;
        });
        formatChips.appendChild(chip);
    });

    // Quality toggle visibility
    const isMedia = currentCategory === "audio" || currentCategory === "video";
    qualityWrapper.style.display = isMedia ? "block" : "none";
}

updateFormats();

// ---- Quality Toggle ----
document.querySelectorAll(".q-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".q-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedQuality = btn.dataset.q;
        qualitySelect.value = selectedQuality;
    });
});

// ---- Drag & Drop ----
["dragenter", "dragover"].forEach(evt => {
    dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.add("drag-over");
    });
});

["dragleave", "drop"].forEach(evt => {
    dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.remove("drag-over");
    });
});

dropzone.addEventListener("drop", e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        handleFileSelect(fileInput.files[0]);
    }
});

function handleFileSelect(file) {
    selectedFile = file;
    document.querySelector(".dropzone-content").style.display = "none";
    dropzoneFile.style.display = "flex";
    document.getElementById("fileName").textContent = file.name;
    document.getElementById("fileSize").textContent = formatFileSize(file.size);
    statusEl.textContent = "";
}

document.getElementById("fileRemove").addEventListener("click", e => {
    e.stopPropagation();
    clearFile();
});

function clearFile() {
    selectedFile = null;
    fileInput.value = "";
    document.querySelector(".dropzone-content").style.display = "flex";
    dropzoneFile.style.display = "none";
    statusEl.textContent = "";
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}

// ---- Status messages (safe DOM construction) ----
function showStatus(message, type, downloadUrl) {
    statusEl.textContent = "";
    const div = document.createElement("div");
    div.className = "status-msg " + type;

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-" + (type === "success" ? "check-circle" : "circle-exclamation");
    div.appendChild(icon);

    const span = document.createElement("span");
    span.textContent = message;
    div.appendChild(span);

    if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "";
        link.textContent = "Dosyayi Indir ";
        const dlIcon = document.createElement("i");
        dlIcon.className = "fa-solid fa-download";
        link.appendChild(dlIcon);
        div.appendChild(link);
    }

    statusEl.appendChild(div);
}

// ---- Convert ----
convertBtn.addEventListener("click", () => {
    if (!selectedFile) {
        showStatus("Lutfen bir dosya secin.", "error");
        return;
    }

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("format", selectedFormat);

    if (currentCategory === "audio" || currentCategory === "video") {
        fd.append("quality", selectedQuality);
    }

    setLoading(true);
    statusEl.textContent = "";
    progressTrack.style.display = "block";
    progressFill.style.width = "0%";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/" + currentCategory);

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            progressFill.style.width = pct + "%";
        }
    };

    xhr.onload = () => {
        setLoading(false);
        progressFill.style.width = "100%";
        setTimeout(() => { progressTrack.style.display = "none"; }, 500);

        let data;
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            data = { success: false, error: "Gecersiz sunucu yaniti" };
        }

        if (data.success) {
            showStatus("Basarili!", "success", data.downloadUrl);
        } else {
            showStatus("Hata: " + data.error, "error");
        }
    };

    xhr.onerror = () => {
        setLoading(false);
        progressTrack.style.display = "none";
        showStatus("Ag hatasi olustu.", "error");
    };

    xhr.send(fd);
});

function setLoading(loading) {
    convertBtn.disabled = loading;
    document.querySelector(".convert-btn-text").style.display = loading ? "none" : "flex";
    document.querySelector(".convert-btn-loading").style.display = loading ? "flex" : "none";
}


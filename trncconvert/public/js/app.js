// =============================================
// TRNCConvert v2.0 — Uygulama Mantığı (Kuyruk Sistemi)
// =============================================

const formats = {
    document: ["pdf", "docx", "txt", "odt"],
    image: ["png", "jpg", "webp"],
    audio: ["mp3", "wav"],
    video: ["mp4", "avi", "mkv"]
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_QUEUE_SIZE = 10;

// Durum
let currentCategory = "document";
let selectedFormat = formats.document[0];
let selectedQuality = "high";
let fileQueue = []; // { id, file }
let results = []; // { id, name, downloadUrl, error }

// Elemanlar
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

function createIcon(classes) {
    const i = document.createElement("i");
    classes.split(" ").forEach(c => i.classList.add(c));
    return i;
}

// ---- Kategori Sekmeleri ----
document.querySelectorAll(".cat-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".cat-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.cat;
        categorySelect.value = currentCategory;
        updateFormats();
        clearQueue();
    });
});

// ---- Format Seçenekleri ----
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

    const isMedia = currentCategory === "audio" || currentCategory === "video";
    qualityWrapper.style.display = isMedia ? "block" : "none";
}

updateFormats();

// ---- Kalite Seçimi ----
document.querySelectorAll(".q-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".q-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedQuality = btn.dataset.q;
        qualitySelect.value = selectedQuality;
    });
});

// ---- Sürükle & Bırak ----
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
    for (let i = 0; i < files.length; i++) {
        addToQueue(files[i]);
    }
});

fileInput.addEventListener("change", () => {
    for (let i = 0; i < fileInput.files.length; i++) {
        addToQueue(fileInput.files[i]);
    }
    fileInput.value = "";
});

// ---- Kuyruk Yönetimi ----
let nextId = 1;

function addToQueue(file) {
    if (fileQueue.length >= MAX_QUEUE_SIZE) {
        showStatus("Kuyruk dolu! Maksimum " + MAX_QUEUE_SIZE + " dosya ekleyebilirsiniz.", "error");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        showStatus(file.name + " dosyası 100MB limitini aşıyor.", "error");
        return;
    }

    fileQueue.push({ id: nextId++, file });
    renderQueue();
    statusEl.textContent = "";
}

function removeFromQueue(id) {
    fileQueue = fileQueue.filter(f => f.id !== id);
    renderQueue();
}

function clearQueue() {
    fileQueue = [];
    results = [];
    renderQueue();
    renderResults();
    statusEl.textContent = "";
}

function renderQueue() {
    const content = document.querySelector(".dropzone-content");
    dropzoneFile.style.display = "none";

    if (fileQueue.length === 0) {
        content.style.display = "flex";
        fileInput.style.pointerEvents = "";
        fileInput.style.zIndex = "";
        const existing = dropzone.querySelector(".queue-list");
        if (existing) existing.remove();
        return;
    }

    content.style.display = "none";
    fileInput.style.pointerEvents = "none";
    fileInput.style.zIndex = "-1";

    let list = dropzone.querySelector(".queue-list");
    if (!list) {
        list = document.createElement("div");
        list.className = "queue-list";
        dropzone.appendChild(list);
    }

    list.textContent = "";

    fileQueue.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "queue-item";

        const info = document.createElement("div");
        info.className = "file-info";

        const orderNum = document.createElement("span");
        orderNum.className = "queue-order";
        orderNum.textContent = (index + 1) + ".";

        const icon = document.createElement("div");
        icon.className = "file-icon";
        icon.appendChild(createIcon("fa-solid fa-file"));

        const details = document.createElement("div");
        details.className = "file-details";

        const nameEl = document.createElement("p");
        nameEl.className = "file-name";
        nameEl.textContent = item.file.name;

        const sizeEl = document.createElement("p");
        sizeEl.className = "file-size";
        sizeEl.textContent = formatFileSize(item.file.size);

        details.appendChild(nameEl);
        details.appendChild(sizeEl);

        info.appendChild(orderNum);
        info.appendChild(icon);
        info.appendChild(details);

        const removeBtn = document.createElement("button");
        removeBtn.className = "file-remove";
        removeBtn.title = "Kaldır";
        removeBtn.appendChild(createIcon("fa-solid fa-xmark"));
        removeBtn.addEventListener("click", e => {
            e.stopPropagation();
            removeFromQueue(item.id);
        });

        row.appendChild(info);
        row.appendChild(removeBtn);
        list.appendChild(row);
    });

    const bottomRow = document.createElement("div");
    bottomRow.className = "queue-bottom";

    const counter = document.createElement("span");
    counter.className = "queue-counter";
    counter.textContent = fileQueue.length + " / " + MAX_QUEUE_SIZE + " dosya";

    const addBtn = document.createElement("button");
    addBtn.className = "queue-add-btn";
    addBtn.appendChild(createIcon("fa-solid fa-plus"));
    const addText = document.createTextNode(" Dosya Ekle");
    addBtn.appendChild(addText);
    addBtn.addEventListener("click", e => {
        e.stopPropagation();
        const tempInput = document.createElement("input");
        tempInput.type = "file";
        tempInput.multiple = true;
        tempInput.addEventListener("change", () => {
            for (let i = 0; i < tempInput.files.length; i++) {
                addToQueue(tempInput.files[i]);
            }
        });
        tempInput.click();
    });

    bottomRow.appendChild(counter);
    bottomRow.appendChild(addBtn);
    list.appendChild(bottomRow);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}

// ---- Durum mesajları ----
function showStatus(message, type, downloadUrl) {
    statusEl.textContent = "";
    const div = document.createElement("div");
    div.className = "status-msg " + type;

    div.appendChild(createIcon("fa-solid fa-" + (type === "success" ? "check-circle" : "circle-exclamation")));

    const span = document.createElement("span");
    span.textContent = message;
    div.appendChild(span);

    if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "";
        link.textContent = "Dosyayı İndir ";
        link.appendChild(createIcon("fa-solid fa-download"));
        div.appendChild(link);
    }

    statusEl.appendChild(div);
}

// ---- Sonuçları Gösterme ----
function renderResults() {
    statusEl.textContent = "";
    if (results.length === 0) return;

    const container = document.createElement("div");
    container.className = "results-list";

    results.forEach((r, index) => {
        const row = document.createElement("div");
        row.className = "result-item " + (r.error ? "result-error" : "result-success");

        const info = document.createElement("span");
        info.className = "result-name";
        info.textContent = (index + 1) + ". " + r.name;
        row.appendChild(info);

        if (r.downloadUrl) {
            const link = document.createElement("a");
            link.href = r.downloadUrl;
            link.download = "";
            link.className = "result-download";
            link.appendChild(createIcon("fa-solid fa-download"));
            const linkText = document.createTextNode(" İndir");
            link.appendChild(linkText);
            row.appendChild(link);
        } else if (r.error) {
            const err = document.createElement("span");
            err.className = "result-error-text";
            err.textContent = r.error;
            row.appendChild(err);
        }

        container.appendChild(row);
    });

    // 2+ başarılı dosya varsa ZIP indirme butonu
    const successFiles = results.filter(r => r.downloadUrl);
    if (successFiles.length >= 2) {
        const zipBtn = document.createElement("button");
        zipBtn.className = "zip-download-btn";
        zipBtn.appendChild(createIcon("fa-solid fa-file-zipper"));
        const zipText = document.createTextNode(" Tümünü ZIP Olarak İndir");
        zipBtn.appendChild(zipText);
        zipBtn.addEventListener("click", () => downloadAsZip(successFiles, zipBtn));
        container.appendChild(zipBtn);
    }

    statusEl.appendChild(container);
}

async function downloadAsZip(files, zipBtn) {
    if (zipBtn) {
        zipBtn.disabled = true;
        zipBtn.textContent = "";
        const spinner = document.createElement("span");
        spinner.className = "spinner";
        zipBtn.appendChild(spinner);
        const loadText = document.createTextNode(" ZIP hazırlanıyor...");
        zipBtn.appendChild(loadText);
    }

    try {
        const res = await fetch("/api/download-zip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ files: files.map(f => f.downloadUrl) })
        });

        if (!res.ok) {
            let msg = "ZIP oluşturulamadı";
            try {
                const errData = await res.json();
                if (errData.error) msg = errData.error;
            } catch (_) {}
            throw new Error(msg);
        }

        const blob = await res.blob();
        if (blob.size === 0) throw new Error("Boş ZIP dosyası");

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "trncconvert-files.zip";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);

    } catch (e) {
        const errDiv = document.createElement("div");
        errDiv.className = "status-msg error";
        errDiv.appendChild(createIcon("fa-solid fa-circle-exclamation"));
        const errSpan = document.createElement("span");
        errSpan.textContent = "ZIP hatası: " + e.message;
        errDiv.appendChild(errSpan);
        statusEl.appendChild(errDiv);
    } finally {
        if (zipBtn) {
            zipBtn.disabled = false;
            zipBtn.textContent = "";
            zipBtn.appendChild(createIcon("fa-solid fa-file-zipper"));
            const resetText = document.createTextNode(" Tümünü ZIP Olarak İndir");
            zipBtn.appendChild(resetText);
        }
    }
}

// ---- Dönüştürme (Kuyruk İşleme) ----
convertBtn.addEventListener("click", async () => {
    if (fileQueue.length === 0) {
        showStatus("Lütfen en az bir dosya ekleyin.", "error");
        return;
    }

    setLoading(true);
    results = [];
    progressTrack.style.display = "block";
    progressFill.style.width = "0%";
    statusEl.textContent = "";

    const total = fileQueue.length;

    for (let i = 0; i < total; i++) {
        const item = fileQueue[i];
        progressFill.style.width = Math.round((i / total) * 100) + "%";

        try {
            const result = await convertFile(item.file);
            results.push({
                id: item.id,
                name: item.file.name,
                downloadUrl: result.downloadUrl || null,
                error: result.error || null
            });
        } catch (e) {
            results.push({
                id: item.id,
                name: item.file.name,
                downloadUrl: null,
                error: e.message || "Bilinmeyen hata"
            });
        }

        renderResults();
    }

    progressFill.style.width = "100%";
    setTimeout(() => { progressTrack.style.display = "none"; }, 500);

    fileQueue = [];
    renderQueue();
    setLoading(false);
});

function convertFile(file) {
    return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("format", selectedFormat);

        if (currentCategory === "audio" || currentCategory === "video") {
            fd.append("quality", selectedQuality);
        }

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/" + currentCategory);

        xhr.onload = () => {
            let data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (e) {
                reject(new Error("Geçersiz sunucu yanıtı"));
                return;
            }

            if (data.success) {
                resolve({ downloadUrl: data.downloadUrl });
            } else {
                resolve({ error: data.error });
            }
        };

        xhr.onerror = () => reject(new Error("Ağ hatası"));
        xhr.send(fd);
    });
}

function setLoading(loading) {
    convertBtn.disabled = loading;
    document.querySelector(".convert-btn-text").style.display = loading ? "none" : "flex";
    document.querySelector(".convert-btn-loading").style.display = loading ? "flex" : "none";
}

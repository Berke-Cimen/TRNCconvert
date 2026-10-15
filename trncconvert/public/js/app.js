(function () {
  "use strict";

  var catalogEl = document.getElementById("catalog");
  if (!catalogEl) return;
  var catalog = JSON.parse(catalogEl.textContent);

  var LOSSY_TARGETS = ["jpg", "webp", "avif", "mp3", "m4a", "ogg", "opus", "mp4", "mov", "mkv", "webm", "avi"];
  var POLL_MS = 1000;

  function $(root, sel) { return root.querySelector(sel); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function extOf(name) {
    var i = name.lastIndexOf(".");
    return i > 0 ? name.slice(i + 1).toLowerCase() : "";
  }
  function canon(ext) {
    return { jpeg: "jpg", tif: "tiff", aif: "aiff", heif: "heic" }[ext] || ext;
  }
  function categoryOf(ext) {
    for (var i = 0; i < catalog.categories.length; i++) {
      if (catalog.categories[i].inputs.indexOf(ext) >= 0) return catalog.categories[i].id;
    }
    return null;
  }
  function formatList(exts) {
    var seen = {};
    var out = [];
    exts.forEach(function (e) {
      var c = canon(e).toUpperCase();
      if (!seen[c]) { seen[c] = true; out.push(c); }
    });
    return out.join(", ");
  }
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1).replace(".", ",") + " MB";
  }
  function icon(name) {
    var paths = {
      file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
      check: '<path d="m5 12 5 5 9-10"/>',
      alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
      x: '<path d="M6 6l12 12M18 6 6 18"/>'
    };
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "icon");
    svg.innerHTML = paths[name];
    return svg;
  }

  function httpMessage(status, data) {
    if (data && data.message) return data.message;
    if (status === 413) return "Dosya 95 MB sınırını aşıyor.";
    if (status === 429) return "Kısa sürede çok fazla istek gönderildi. Lütfen biraz bekleyin.";
    if (status === 0) return "Bağlantı kesildi. İnternet bağlantınızı kontrol edip tekrar deneyin.";
    if (status >= 500) return "Sunucuya şu anda ulaşılamıyor. Lütfen biraz sonra tekrar deneyin.";
    return "İstek tamamlanamadı. Lütfen tekrar deneyin.";
  }

  function upload(url, formData, onProgress) {
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.timeout = 20 * 60 * 1000;
      xhr.responseType = "text";
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) onProgress(e.loaded / e.total);
        };
      }
      xhr.onload = function () {
        var data = null;
        try { data = JSON.parse(xhr.responseText); } catch (e) { data = null; }
        resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300 && data !== null, data: data });
      };
      xhr.onerror = function () { resolve({ status: 0, ok: false, data: null }); };
      xhr.ontimeout = function () { resolve({ status: 0, ok: false, data: { message: "Yükleme çok uzun sürdü ve durduruldu." } }); };
      xhr.send(formData);
    });
  }

  function getJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        return { status: res.status, ok: res.ok && data !== null, data: data };
      });
    }, function () { return { status: 0, ok: false, data: null }; });
  }

  function postJson(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        return { status: res.status, ok: res.ok && data !== null, data: data };
      });
    }, function () { return { status: 0, ok: false, data: null }; });
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function bindDrop(drop, input, onFiles) {
    drop.addEventListener("click", function () { input.click(); });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
    });
    ["dragenter", "dragover"].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-dragging"); });
    });
    ["dragleave", "dragend", "drop"].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-dragging"); });
    });
    drop.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) onFiles(e.dataTransfer.files);
    });
    input.addEventListener("change", function () {
      onFiles(input.files);
      input.value = "";
    });
  }

  function initConverter(root) {
    var drop = $(root, "[data-drop]");
    var input = $(root, "[data-file-input]");
    var hint = $(root, "[data-drop-hint]");
    var queueEl = $(root, "[data-queue]");
    var options = $(root, "[data-options]");
    var targetsEl = $(root, "[data-targets]");
    var qualityWrap = $(root, "[data-quality-wrap]");
    var qualityEl = $(root, "[data-quality]");
    var convertBtn = $(root, "[data-convert]");
    var zipBtn = $(root, "[data-zip]");
    var resetBtn = $(root, "[data-reset]");
    var statusEl = $(root, "[data-status]");
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[role=tab]"));

    var fixed = root.getAttribute("data-fixed") === "1";
    var category = root.getAttribute("data-category") || "document";
    var fromList = (root.getAttribute("data-from") || "").split(",").filter(Boolean);
    var preset = root.getAttribute("data-to") || "";
    var items = [];
    var target = "";
    var busy = false;
    var seq = 0;
    var batch = { target: "", quality: "normal" };

    function inputsOf(cat) {
      for (var i = 0; i < catalog.categories.length; i++) {
        if (catalog.categories[i].id === cat) return catalog.categories[i].inputs;
      }
      return [];
    }
    function allowedExts() {
      if (fromList.length) return fromList;
      if (fixed) return inputsOf(category);
      return Object.keys(catalog.targets);
    }
    function setStatus(text, isError) {
      statusEl.textContent = text || "";
      statusEl.classList.toggle("status-error", Boolean(isError));
    }

    function selectTab(cat, focus) {
      category = cat;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-category") === cat;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      hint.textContent = formatList(inputsOf(cat)) + ". Dosya başına en fazla 95 MB.";
      input.setAttribute("accept", inputsOf(cat).map(function (e) { return "." + e; }).join(","));
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        if (busy) return;
        if (items.length && t.getAttribute("data-category") !== category) clearItems();
        selectTab(t.getAttribute("data-category"), false);
      });
      t.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.click();
        next.focus();
      });
    });

    function pendingItems() { return items.filter(function (it) { return it.status === "pending"; }); }

    function commonTargets() {
      var list = pendingItems();
      if (!list.length) return [];
      var common = (catalog.targets[list[0].ext] || []).slice();
      list.slice(1).forEach(function (it) {
        var t = catalog.targets[it.ext] || [];
        common = common.filter(function (x) { return t.indexOf(x) >= 0; });
      });
      return common;
    }

    function renderTargets() {
      var list = commonTargets();
      targetsEl.textContent = "";
      if (!pendingItems().length) {
        options.hidden = true;
        convertBtn.disabled = true;
        return;
      }
      options.hidden = false;
      if (!list.length) {
        targetsEl.appendChild(el("p", "field-help", "Bu dosyalar için ortak bir hedef format yok. Aynı türdeki dosyaları birlikte ekleyin."));
        convertBtn.disabled = true;
        qualityWrap.hidden = true;
        return;
      }
      if (list.indexOf(target) < 0) target = list.indexOf(preset) >= 0 ? preset : list[0];
      seq++;
      list.forEach(function (fmt) {
        var label = el("label", "chip");
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "target-" + seq;
        radio.value = fmt;
        radio.checked = fmt === target;
        radio.addEventListener("change", function () {
          target = fmt;
          updateQuality();
        });
        var span = el("span", null, fmt.toUpperCase());
        span.title = catalog.labels[fmt] || fmt.toUpperCase();
        label.appendChild(radio);
        label.appendChild(span);
        targetsEl.appendChild(label);
      });
      updateQuality();
      convertBtn.disabled = busy;
    }

    function updateQuality() {
      qualityWrap.hidden = LOSSY_TARGETS.indexOf(target) < 0;
    }

    function rowFor(it) {
      var li = el("li", "q-item");
      var ic = el("span", "q-icon");
      ic.appendChild(icon("file"));
      var name = el("span", "q-name", it.file.name);
      name.title = it.file.name;
      var meta = el("span", "q-meta");
      var actions = el("span", "q-actions");
      var bar = el("div", "q-bar");
      bar.appendChild(el("span"));
      bar.hidden = true;
      li.appendChild(ic);
      li.appendChild(name);
      li.appendChild(actions);
      li.appendChild(meta);
      li.appendChild(bar);
      it.el = { li: li, icon: ic, meta: meta, actions: actions, bar: bar };
      return li;
    }

    function setBar(it, fraction) {
      var bar = it.el.bar;
      if (fraction === null) { bar.hidden = true; return; }
      bar.hidden = false;
      if (fraction === "indeterminate") {
        bar.classList.add("is-indeterminate");
        bar.firstChild.style.width = "";
        bar.setAttribute("aria-hidden", "true");
        return;
      }
      bar.classList.remove("is-indeterminate");
      bar.firstChild.style.width = Math.round(fraction * 100) + "%";
    }

    function renderItem(it) {
      var e = it.el;
      var size = formatSize(it.file.size);
      e.li.className = "q-item" + (it.status === "done" ? " is-done" : "") + (it.status === "error" ? " is-error" : "");
      e.actions.textContent = "";
      e.icon.textContent = "";
      e.icon.appendChild(icon(it.status === "done" ? "check" : it.status === "error" ? "alert" : "file"));

      if (it.status === "pending") {
        e.meta.textContent = size + ", " + canon(it.ext).toUpperCase();
        var rm = el("button", "q-remove");
        rm.type = "button";
        rm.setAttribute("aria-label", it.file.name + " dosyasını listeden kaldır");
        rm.appendChild(icon("x"));
        rm.addEventListener("click", function () { removeItem(it); });
        e.actions.appendChild(rm);
        setBar(it, null);
      } else if (it.status === "uploading") {
        e.meta.textContent = "Yükleniyor %" + Math.round(it.progress * 100);
        setBar(it, it.progress);
      } else if (it.status === "queued") {
        e.meta.textContent = it.position > 1 ? "Sırada, " + it.position + ". sırada bekliyor" : "Sırada";
        setBar(it, "indeterminate");
      } else if (it.status === "running") {
        e.meta.textContent = it.progress != null ? "Dönüştürülüyor %" + it.progress : "Dönüştürülüyor";
        setBar(it, it.progress != null ? it.progress / 100 : "indeterminate");
      } else if (it.status === "done") {
        e.meta.textContent = "Hazır, " + formatSize(it.download.size);
        var a = el("a", "btn btn-primary btn-small", "İndir");
        a.href = it.download.url;
        a.setAttribute("download", it.download.name);
        a.setAttribute("aria-label", it.download.name + " dosyasını indir");
        e.actions.appendChild(a);
        setBar(it, null);
      } else if (it.status === "error") {
        e.meta.textContent = it.error;
        setBar(it, null);
      }
    }

    function removeItem(it) {
      if (busy) return;
      items = items.filter(function (x) { return x !== it; });
      it.el.li.remove();
      afterChange();
    }

    function clearItems() {
      items = [];
      queueEl.textContent = "";
      afterChange();
      setStatus("");
    }

    function afterChange() {
      drop.classList.toggle("is-compact", items.length > 0);
      renderTargets();
      var finished = items.length > 0 && items.every(function (it) { return it.status === "done" || it.status === "error"; });
      var doneCount = items.filter(function (it) { return it.status === "done"; }).length;
      zipBtn.hidden = !(finished && doneCount >= 2);
      resetBtn.hidden = !(finished && !busy);
      convertBtn.hidden = finished;
    }

    function addFiles(fileList) {
      if (busy) return;
      var files = Array.prototype.slice.call(fileList || []);
      if (!files.length) return;
      if (items.length && items.every(function (it) { return it.status !== "pending"; })) clearItems();
      var allowed = allowedExts();
      var problems = [];
      files.forEach(function (file) {
        var ext = extOf(file.name);
        if (items.length >= catalog.maxFiles) {
          problems.push("En fazla " + catalog.maxFiles + " dosya eklenebilir.");
          return;
        }
        if (allowed.indexOf(ext) < 0 || !catalog.targets[ext]) {
          problems.push(file.name + ": bu dosya türü burada desteklenmiyor.");
          return;
        }
        if (file.size > catalog.maxBytes) {
          problems.push(file.name + ": dosya 95 MB sınırını aşıyor.");
          return;
        }
        if (file.size === 0) {
          problems.push(file.name + ": dosya boş.");
          return;
        }
        if (!fixed && tabs.length && !items.length) {
          var cat = categoryOf(ext);
          if (cat && cat !== category) selectTab(cat, false);
        }
        var it = { file: file, ext: ext, status: "pending", progress: 0 };
        items.push(it);
        queueEl.appendChild(rowFor(it));
        renderItem(it);
      });
      afterChange();
      var uniq = problems.filter(function (p, i) { return problems.indexOf(p) === i; });
      setStatus(uniq.join(" "), uniq.length > 0);
      if (!uniq.length && items.length) setStatus(items.length + " dosya eklendi.");
    }

    bindDrop(drop, input, addFiles);

    function pollJob(it) {
      return getJson("/api/jobs/" + it.jobId + "?t=" + encodeURIComponent(it.token)).then(function (r) {
        if (r.status === 404) {
          it.status = "error";
          it.error = "İşin süresi doldu. Lütfen dosyayı yeniden yükleyin.";
          renderItem(it);
          return;
        }
        if (!r.ok) {
          it.failures = (it.failures || 0) + 1;
          if (it.failures > 10) {
            it.status = "error";
            it.error = httpMessage(r.status, r.data);
            renderItem(it);
            return;
          }
          return wait(POLL_MS * 2).then(function () { return pollJob(it); });
        }
        it.failures = 0;
        var d = r.data;
        if (d.status === "done") {
          it.status = "done";
          it.download = d.download;
          renderItem(it);
          return;
        }
        if (d.status === "error") {
          it.status = "error";
          it.error = (d.error && d.error.message) || "Dönüştürme tamamlanamadı.";
          renderItem(it);
          return;
        }
        it.status = d.status;
        it.position = d.position;
        it.progress = d.progress != null ? d.progress : null;
        renderItem(it);
        return wait(POLL_MS).then(function () { return pollJob(it); });
      });
    }

    function sendItem(it) {
      var fd = new FormData();
      fd.append("name", it.file.name);
      fd.append("target", batch.target);
      fd.append("quality", batch.quality);
      fd.append("file", it.file, it.file.name);
      it.status = "uploading";
      it.progress = 0;
      renderItem(it);
      return upload("/api/convert", fd, function (p) {
        it.progress = p;
        renderItem(it);
      }).then(function (r) {
        if (!r.ok) {
          it.status = "error";
          it.error = httpMessage(r.status, r.data);
          renderItem(it);
          return null;
        }
        it.jobId = r.data.id;
        it.token = r.data.token;
        it.status = r.data.status;
        it.position = r.data.position;
        it.progress = null;
        renderItem(it);
        return pollJob(it);
      });
    }

    convertBtn.addEventListener("click", function () {
      var list = pendingItems();
      if (!list.length || !target || busy) return;
      busy = true;
      batch = { target: target, quality: qualityEl.value };
      list.forEach(function (it) { it.el.actions.textContent = ""; });
      convertBtn.disabled = true;
      convertBtn.textContent = "Dönüştürülüyor";
      options.hidden = true;
      drop.hidden = true;
      tabs.forEach(function (t) { t.disabled = true; });
      setStatus("Dosyalar yükleniyor ve dönüştürülüyor. Bu sayfayı açık tutun.");
      var polls = [];
      list.reduce(function (chain, it) {
        return chain.then(function () {
          var p = sendItem(it);
          polls.push(p);
          return p.then(null, function () {});
        }).then(null, function () {});
      }, Promise.resolve()).then(function () {
        return Promise.all(polls.map(function (p) { return p.then(null, function () {}); }));
      }).then(function () {
        busy = false;
        convertBtn.textContent = "Dönüştür";
        drop.hidden = false;
        tabs.forEach(function (t) { t.disabled = false; });
        var done = items.filter(function (it) { return it.status === "done"; }).length;
        var total = items.length;
        afterChange();
        if (done === total) {
          setStatus(total === 1 ? "Dosyanız hazır. İndirme bağlantısı 10 dakika geçerlidir." : total + " dosyanın hepsi hazır. İndirme bağlantıları 10 dakika geçerlidir.");
        } else {
          setStatus(total + " dosyadan " + done + " tanesi dönüştürüldü. Hata alan dosyaların açıklaması listede.", done === 0);
        }
      });
    });

    zipBtn.addEventListener("click", function () {
      var list = items.filter(function (it) { return it.status === "done"; }).map(function (it) {
        var parts = it.download.url.split("/");
        return { id: parts[2], token: parts[3] };
      });
      zipBtn.disabled = true;
      setStatus("ZIP dosyası hazırlanıyor.");
      fetch("/api/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: list })
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      }).then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "trncconvert-dosyalar.zip";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
        setStatus("ZIP dosyası indirildi.");
      }).catch(function () {
        setStatus("ZIP dosyası oluşturulamadı. Dosyaları tek tek indirebilirsiniz.", true);
      }).then(function () { zipBtn.disabled = false; });
    });

    resetBtn.addEventListener("click", function () {
      clearItems();
      drop.focus();
    });

    if (tabs.length) selectTab(category, false);
    afterChange();
  }

  function initUnlock(root) {
    var drop = $(root, "[data-drop]");
    var input = $(root, "[data-file-input]");
    var fileBox = $(root, "[data-unlock-file]");
    var fileName = $(root, "[data-file-name]");
    var fileState = $(root, "[data-file-state]");
    var form = $(root, "[data-unlock-form]");
    var pw = $(root, "[data-password]");
    var toggle = $(root, "[data-toggle-password]");
    var signedWarning = $(root, "[data-signed-warning]");
    var submit = $(root, "[data-unlock-submit]");
    var result = $(root, "[data-unlock-result]");
    var resultText = $(root, "[data-result-text]");
    var downloadLink = $(root, "[data-download]");
    var resetBtn = $(root, "[data-reset]");
    var statusEl = $(root, "[data-status]");
    var accepted = (input.getAttribute("accept") || "").split(",").map(function (s) { return s.replace(".", ""); });
    var jobId = null;
    var jobToken = null;
    var working = false;

    function setStatus(text, isError) {
      statusEl.textContent = text || "";
      statusEl.classList.toggle("status-error", Boolean(isError));
    }

    function reset() {
      jobId = null;
      jobToken = null;
      working = false;
      drop.hidden = false;
      fileBox.hidden = true;
      form.hidden = true;
      result.hidden = true;
      signedWarning.hidden = true;
      pw.value = "";
      pw.removeAttribute("aria-invalid");
      submit.disabled = false;
      setStatus("");
    }

    function showResult(view, restrictionsOnly) {
      form.hidden = true;
      result.hidden = false;
      fileState.textContent = "Şifre kaldırıldı";
      resultText.textContent = restrictionsOnly
        ? "Dosyada yalnızca yazdırma ve kopyalama kısıtlaması vardı; kısıtlamalar kaldırıldı."
        : "Şifre kaldırıldı. Dosya artık şifresiz açılır.";
      downloadLink.href = view.download.url;
      downloadLink.setAttribute("download", view.download.name);
      setStatus("İndirme bağlantısı 10 dakika geçerlidir.");
      downloadLink.focus();
    }

    function sendPassword(password, restrictionsOnly) {
      working = true;
      submit.disabled = true;
      setStatus("Şifre kaldırılıyor.");
      return postJson("/api/unlock/" + jobId, { password: password, token: jobToken }).then(function (r) {
        working = false;
        submit.disabled = false;
        if (r.ok && r.data.status === "done") {
          showResult(r.data, restrictionsOnly);
          return;
        }
        var d = r.data || {};
        if (r.status === 401) {
          pw.setAttribute("aria-invalid", "true");
          setStatus(d.message + " Kalan deneme: " + d.attemptsLeft + ".", true);
          pw.focus();
          pw.select();
          return;
        }
        form.hidden = true;
        fileState.textContent = "İşlem tamamlanamadı";
        jobId = null;
        result.hidden = false;
        resultText.textContent = httpMessage(r.status, d);
        resultText.className = "notice notice-error";
        downloadLink.hidden = true;
        setStatus("");
      });
    }

    function handleFiles(files) {
      if (working || !files || !files.length) return;
      var file = files[0];
      var ext = extOf(file.name);
      reset();
      if (accepted.indexOf(ext) < 0) {
        setStatus("Bu dosya türü desteklenmiyor. Desteklenenler: " + formatList(accepted) + ".", true);
        return;
      }
      if (file.size > catalog.maxBytes) {
        setStatus("Dosya 95 MB sınırını aşıyor.", true);
        return;
      }
      drop.hidden = true;
      fileBox.hidden = false;
      fileName.textContent = file.name;
      fileName.title = file.name;
      fileState.textContent = "Yükleniyor";
      working = true;
      var fd = new FormData();
      fd.append("name", file.name);
      fd.append("file", file, file.name);
      upload("/api/unlock/inspect", fd, function (p) {
        fileState.textContent = p < 1 ? "Yükleniyor %" + Math.round(p * 100) : "Kontrol ediliyor";
      }).then(function (r) {
        working = false;
        if (!r.ok) {
          fileState.textContent = "Yüklenemedi";
          setStatus(httpMessage(r.status, r.data), true);
          showRetry();
          return;
        }
        var d = r.data;
        if (d.state === "not_encrypted" || d.state === "unsupported") {
          fileState.textContent = d.state === "not_encrypted" ? "Şifre yok" : "Desteklenmiyor";
          setStatus(d.message, d.state === "unsupported");
          showRetry();
          return;
        }
        jobId = d.id;
        jobToken = d.token;
        signedWarning.hidden = !d.signed;
        if (d.state === "restrictions_only") {
          fileState.textContent = "Yalnızca kısıtlama şifresi var, şifre gerekmiyor";
          sendPassword("", true);
          return;
        }
        fileState.textContent = "Açılış şifresi gerekiyor";
        form.hidden = false;
        setStatus("");
        pw.focus();
      });
    }

    function showRetry() {
      result.hidden = false;
      resultText.textContent = "";
      resultText.className = "";
      downloadLink.hidden = true;
    }

    bindDrop(drop, input, handleFiles);

    toggle.addEventListener("click", function () {
      var show = pw.type === "password";
      pw.type = show ? "text" : "password";
      toggle.textContent = show ? "Gizle" : "Göster";
      toggle.setAttribute("aria-pressed", show ? "true" : "false");
      pw.focus();
    });

    pw.addEventListener("input", function () { pw.removeAttribute("aria-invalid"); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (working || !jobId) return;
      if (!pw.value) {
        setStatus("Dosyanın şifresini girin.", true);
        pw.focus();
        return;
      }
      sendPassword(pw.value, false);
    });

    resetBtn.addEventListener("click", function () {
      downloadLink.hidden = false;
      resultText.className = "notice notice-ok";
      reset();
      drop.focus();
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-tool="convert"]'), initConverter);
  Array.prototype.forEach.call(document.querySelectorAll('[data-tool="unlock"]'), initUnlock);
})();

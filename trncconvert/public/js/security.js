// Ön Yüz Güvenlik Modülü
(function() {
    // 1. Sağ tıklamayı engelle
    document.addEventListener('contextmenu', event => event.preventDefault());

    // 2. Klavye kısayollarını engelle (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I)
    document.addEventListener('keydown', function(event) {
        if (event.code === 'F12' || 
            (event.ctrlKey && event.shiftKey && event.key === 'I') || 
            (event.ctrlKey && event.key === 'u') || 
            (event.ctrlKey && event.key === 's')) {
            event.preventDefault();
            return false;
        }
    });

    // 3. Hata Ayıklayıcı Tuzağı
    // DevTools açıldığında bu döngü tarayıcıyı yavaşlatır/durdurur
    setInterval(function() {
        // Obfuscated way to say "debugger"
        (function() {}.constructor("debugger")());
    }, 1000); // 1 saniyede bir kontrol (aşırı kitlememesi için 1000ms, user isteği "donduran" dedi ama browser kilitlenirse sekme kapanmaz, 1000ms makul)

    console.log("%cGüvenlik Aktif", "color: red; font-size: 20px; font-weight: bold;");
})();

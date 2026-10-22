# TRNCConvert SEO planı

Hazırlanma tarihi: 15 Ekim 2026. Bu plan, Google ve Yandex'te dosya, ses ve video dönüştürme aramalarında görünür olmak için yapılacakları önem sırasıyla listeler.

## Başlangıç durumu

Yeni sürümden önce site hiçbir arama için sıralanamıyordu:

- Google'da `site:trncconvert.com` araması sonuç vermiyordu.
- Tek bir sayfa vardı. Başlığı yalnızca "TRNCConvert" idi ve meta açıklaması yoktu.
- Sayfada bağlantı yoktu; robots.txt ve sitemap.xml 404 dönüyordu.
- `www.trncconvert.com` 503 hatası veriyordu.
- HTTP'den HTTPS'e yönlendirme kalıcı (301) değil, geçiciydi (302).

## Bu dalda yapılanlar

- Her araç için ayrı, sunucuda üretilen bir Türkçe sayfa. Toplam 38 adres var: ana sayfa, 5 kategori sayfası, 4 şifre kaldırma sayfası, 25 dönüşüm sayfası ve 3 bilgi sayfası.
- Her sayfada benzersiz başlık, açıklama, tek H1, canonical bağlantı, içerik haritası (breadcrumb) ve ilgili araç bağlantıları var.
- Her sayfada elle yazılmış Türkçe metin var: iki paragraf, üç adımlık anlatım ve dört soru-cevap. Makine çevirisi ya da şablonla çoğaltılmış metin yok.
- JSON-LD: ana sayfada Organization ve WebSite, araç sayfalarında WebApplication ve BreadcrumbList. FAQ ve HowTo şeması bilerek eklenmedi; Google bu zengin sonuçları 2023 ve 2026'da kaldırdı.
- `robots.txt` ve `sitemap.xml` otomatik üretiliyor. 404 sayfası `noindex` taşıyor. Sondaki eğik çizgi 301 ile temizleniyor ve `www` 301 ile ana alan adına yönleniyor.
- Hız iyileştirmeleri: Font Awesome, parçacık animasyonu ve Google Fonts kaldırıldı. Fontlar kendi sunucumuzdan geliyor, sayfalar başlangıçta bir kez üretilip bellekten sunuluyor.
- Güven sayfaları eklendi: hakkında, gizlilik/KVKK ve kullanım şartları. Her aracın yanında "Dosyalar 10 dakika içinde silinir" bilgisi gösteriliyor.

## Yayından hemen sonra yapılacaklar (1-2 saat)

1. **Coolify'da `www` alan adını ekleyin.** Uygulamanın Domains alanına `https://trncconvert.com,https://www.trncconvert.com` yazın. Uygulama `www` ile gelen istekleri 301 ile yönlendirir; bugünkü 503 hatası bu ayar eksik olduğu için oluşuyor.
2. **Cloudflare'de şu ayarları kontrol edin:**
   - SSL/TLS modu **Full (strict)** olmalı. Flexible modda Cloudflare ile sunucu arasındaki trafik şifresiz gider; şifre kaldırma aracı için bu kabul edilemez.
   - "Always Use HTTPS" açık olmalı. HTTP yönlendirmesinin 301 olduğunu doğrulayın; Coolify'ın kendi yönlendirmesi 302 veriyorsa Cloudflare'inki öne geçer.
   - HSTS'i etkinleştirin. Başlangıçta 6 ay, alt alan adları dahil olmadan.
   - Ücretsiz planda yükleme sınırı 100 MB'tır. Uygulama zaten 95 MB ile sınırlı.
3. **Google Search Console:**
   - Alan adı mülkü (Domain property) ekleyin; doğrulama Cloudflare DNS'ine bir TXT kaydı eklenerek yapılır.
   - Site haritası olarak `https://trncconvert.com/sitemap.xml` gönderin.
   - URL Denetimi ile şu sayfalar için tek tek "Dizine eklenmesini iste" deyin: ana sayfa, `/pdf-sifre-kaldirma`, `/word-sifre-kaldirma`, `/excel-sifre-kaldirma`, `/powerpoint-sifre-kaldirma`, `/pdf-word-cevirme`, `/word-pdf-cevirme`, `/mp4-mp3-donusturucu`, `/heic-jpg-cevirme` ve `/jpg-pdf-cevirme`. Günlük bir sınır var; aynı sayfayı tekrar istemek işe yaramaz.
4. **Yandex Webmaster ve Bing Webmaster Tools:** Siteyi ekleyip site haritasını gönderin. Yandex, Türkiye'deki aramaların yaklaşık yüzde 10-25'ini alıyor.
5. **Ölçüm:** Cloudflare Web Analytics'i açın. Çerez kullanmadığı için onay bandı gerektirmez ve gizlilik metniyle çelişmez.

## İlk ay

- **Öncelikli hedef: şifre kaldırma sayfaları.** "word şifre kaldırma", "excel şifre kaldırma" ve "powerpoint şifre kaldırma" aramalarında ilk sayfada blog yazıları ve masaüstü programları var; çevrimiçi çalışan Türkçe bir araç sayfası yok. Bu, en zayıf rekabetin olduğu alan. "pdf şifre kaldırma" ise PDF24, Smallpdf ve iLovePDF'in Türkçe sayfalarıyla çekişmeli.
- **Bağlantı ve tanınırlık:**
  - GitHub depo açıklamasına ve README'ye site bağlantısını ekleyin.
  - AlternativeTo'da siteyi Convertio, CloudConvert, iLovePDF ve Smallpdf'e alternatif olarak listeleyin.
  - Product Hunt'a ve Indie Hackers'a ekleyin.
  - Tamindir gibi Türk listeleme sitelerine "web aracı" olarak başvurun.
  - KKTC'deki üniversite öğrenci toplulukları ve yerel teknoloji grupları doğal bir başlangıç kitlesi.
- **Google İşletme Profili uygun değil.** Fiziksel bir adresi olmayan çevrimiçi araçlar bu profile kabul edilmiyor.

## 2-4. ay

- Search Console'daki "Performans" raporundan gösterim alan ama tıklanmayan sorguları çıkarın. Bunlar için başlık ve açıklamayı iyileştirin. Desteklenen bir dönüşümün sayfası yoksa yeni sayfa ekleyin.
- Yeni sayfa ancak iki koşul birlikte sağlanırsa eklenir: backend o dönüşümü gerçekten yapabiliyor ve sayfaya o dönüşüme özgü metin yazılabiliyor. Google'ın "doorway" ve "scaled content" politikaları, birbirine benzeyen çok sayıda sayfayı cezalandırıyor. İlk altı ay toplam sayfa sayısını 150'nin altında tutun.
- Sayfa eklemek için `trncconvert/site/content.cjs` dosyasına yeni bir kayıt yeterli. Sayfa, site haritası ve bağlantılar otomatik oluşur.
- Destek yazıları ayda en fazla bir ya da iki tane olsun ve gerçek soruları yanıtlasın. Örnekler: "PDF şifremi unuttum, ne yapabilirim?" (dürüst yanıt: kurtarma yapılmıyor) ve "iPhone fotoğrafları neden HEIC, nasıl açılır?". Her yazı ilgili araca bağlanmalı.

## Beklenen zaman çizelgesi

- **Dizine girme:** site haritası gönderildikten sonra birkaç gün ile 4 hafta arası.
- **Türkçe uzun kuyruklu aramalar** ("word şifre kaldırma" gibi): 2-4 ay.
- **Genel aramalar** ("pdf word çevirme", "mp4 mp3 dönüştürücü"): bağlantı ve marka araması biriktikçe, genellikle 6 aydan uzun sürer. İngilizce genel aramalar (ör. "pdf to word") yeni bir site için gerçekçi bir hedef değil.

## İleride düşünülebilecekler

- İngilizce sürüm: `/en/` altında, hreflang ile.
- Office dosyalarında "düzenlemeyi kısıtla" korumasını kaldıran ayrı bir araç. Bu, "excel şifre kaldırma" aramalarının önemli bir kısmının asıl ihtiyacı.
- PDF birleştirme, bölme ve sıkıştırma araçları.

## 23 Ekim 2026 güncellemesi: favicon ve sıralama

**Durum:** Site indekslendi ve "trnc convert" aramasında ilk organik sonuç. Genel aramalarda ("pdf word çevirme", "mp4 mp3 dönüştürücü") ilk sayfada Smallpdf, PDF24, FreeConvert gibi yıllardır var olan ve binlerce bağlantısı olan siteler yer alıyor. Yeni bir site için bu aramalar aylar sürer; ilk kazanımlar "word şifre kaldırma", "excel şifre kaldırma" gibi uzun kuyruklu aramalardan gelecek.

**Dünya simgesinin nedeni:** Google SVG favicon kabul etmiyor (desteklenen biçimler: BMP, GIF, ICO, PNG, JPEG, PPM, TIFF). Sitenin tek simgesi SVG idi. Artık PNG ve ICO simgeler de var. Google'ın simgeyi güncellemesi birkaç gün ile birkaç hafta sürebilir.

**Deploy'dan sonra hemen yapılacaklar:**
1. Cloudflare'de önbelleği temizleyin (Caching, Purge Everything).
2. Search Console'da URL Denetimi ile ana sayfa için "Dizine eklenmesini iste" deyin. Bu, favicon'un güncellenmesini hızlandırır.
3. Coolify'da `www.trncconvert.com` alan adını ekleyin. Şu an 503 veriyor; bu Google'ın tarama bütçesini boşa harcar.
4. Cloudflare'de "Always Use HTTPS" açık olsun ve HTTP yönlendirmesi 301 olsun; şu an 302/307.
5. Bing Webmaster Tools'a Search Console'dan içe aktararak ekleyin.

**İlk bağlantılar için (1-6 ay):**
1. AlternativeTo'da siteyi Smallpdf, iLovePDF ve Convertio'ya alternatif olarak listeleyin.
2. Product Hunt'ta tanıtın.
3. Technopat, DonanımHaber ve Ekşi Sözlük'te gerçekten yardımcı olan cevaplarda, ilgili olduğunda bağlantı verin. Reklam gibi görünen paylaşımlardan kaçının.
4. KKTC üniversitelerinden (DAÜ, YDÜ, ODTÜ KKK, UKÜ) ve yerel bloglardan "öğrenci araçları" listelerine eklenmeyi isteyin. En değerli bağlantı kaynağı budur.

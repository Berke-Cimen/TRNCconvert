'use strict';

module.exports = {
  home: {
    title: "Ücretsiz Online Dosya Dönüştürücü | TRNCConvert",
    description: "PDF, Word, Excel, görsel, ses ve video dosyalarınızı hesap açmadan ücretsiz dönüştürün. Yüklenen dosyalar 10 dakika içinde otomatik olarak silinir.",
    h1: "Ücretsiz online dosya dönüştürücü",
    intro: "Dosyanızı yükleyin, hedef biçimi seçin ve dönüştürülmüş dosyayı tarayıcınızdan indirin.",
    body: [
      "TRNCConvert, belge, görsel, ses ve video dosyalarını tarayıcı üzerinden dönüştürmek için geliştirilmiş ücretsiz bir araçtır. Hesap açmanız ya da bir program kurmanız gerekmez; site telefonda ve bilgisayarda aynı şekilde çalışır. Dosya başına 95 MB'a kadar yükleme yapabilir, tek seferde 10 dosyayı birlikte dönüştürebilirsiniz. Birden fazla sonuç olduğunda hepsini tek bir ZIP dosyası olarak indirirsiniz. Ayrıca şifresini bildiğiniz PDF, Word, Excel ve PowerPoint dosyalarından şifreyi kaldıran araçlar da bulunur.",
      "Yüklediğiniz ve dönüştürülen dosyalar 10 dakika içinde sunucudan otomatik olarak silinir; hiçbir dosya saklanmaz veya üçüncü kişilerle paylaşılmaz. Bağlantı HTTPS ile şifrelenir. Belgeler LibreOffice, görseller sharp, ses ve video dosyaları FFmpeg ile işlenir. Proje KKTC'de geliştirilmiştir ve kaynak kodu GitHub'da herkese açık olarak yayımlanır; dosyalarınıza ne yapıldığını isteyen herkes inceleyebilir."
    ],
    faq: [
      { q: "TRNCConvert ücretli mi?", a: "Hayır, tüm dönüştürme ve şifre kaldırma araçları ücretsizdir. Hesap açmanız veya e-posta adresi vermeniz gerekmez." },
      { q: "Dosyalarım ne kadar süre saklanıyor?", a: "Yüklediğiniz ve dönüştürülen dosyalar 10 dakika içinde otomatik olarak silinir. Hiçbir dosya saklanmaz veya başkalarıyla paylaşılmaz." },
      { q: "Dosya boyutu ve sayısı için sınır var mı?", a: "Her dosya en fazla 95 MB olabilir ve tek seferde 10 dosya yükleyebilirsiniz. Birden fazla sonuç tek bir ZIP dosyası olarak indirilir." },
      { q: "Telefondan kullanabilir miyim?", a: "Evet. Site tarayıcıda çalışır; telefon, tablet veya bilgisayardan uygulama kurmadan kullanabilirsiniz." },
      { q: "Kaynak koduna nereden bakabilirim?", a: "TRNCConvert açık kaynaklıdır. Kaynak kodu github.com/Berke-Cimen/TRNCconvert adresinde herkese açıktır." }
    ]
  },

  pages: [
    {
      slug: 'belge-donusturucu',
      type: 'hub',
      category: 'document',
      from: ['docx', 'doc', 'odt', 'rtf', 'txt', 'xlsx', 'xls', 'ods', 'csv', 'pptx', 'ppt', 'odp', 'pdf'],
      title: "Belge Dönüştürücü: Word, Excel, PDF Çevirme | TRNCConvert",
      description: "Word, Excel, PowerPoint, CSV ve PDF dosyalarını hesap açmadan dönüştürün. Belgeler LibreOffice ile işlenir, dosyalar 10 dakika içinde silinir.",
      h1: "Belge dönüştürücü",
      intro: "Word, Excel, PowerPoint, OpenDocument, CSV ve PDF dosyalarını yükleyip istediğiniz belge biçimine çevirin.",
      body: [
        "Belge dönüştürücü; DOCX, DOC, ODT, RTF, TXT, XLSX, XLS, ODS, CSV, PPTX, PPT, ODP ve PDF dosyalarını kabul eder. Dönüştürme işi LibreOffice motoruyla yapılır; bu sayede Word belgelerindeki yazı tipleri, tablolar ve görseller PDF'ye geçerken yerinde kalır. Excel dosyalarında her sayfa, tanımlı yazdırma alanına ve sayfa ayarlarına göre basılır. PowerPoint sunumlarında ise her slayt PDF'de ayrı bir sayfa olur.",
        "PDF'yi düzenlenebilir Word belgesine çevirmek için ayrı bir motor kullanılır; paragraflar, tablolar ve görseller yeniden kurulur, ancak taranmış PDF'lerde metin tanıma yapılmaz. PDF sayfalarını JPG görsellere ayırabilir, UTF-8 kodlu CSV dosyalarını Excel tablosuna dönüştürebilirsiniz. Tek seferde 10 dosyaya kadar yükleme yapılabilir ve birden fazla sonuç ZIP olarak iner. Şifreli bir belgeyle çalışıyorsanız önce şifre kaldırma araçlarını kullanmanız gerekir."
      ],
      steps: ["Belge dosyanızı seçin veya sürükleyip bırakın.", "Listeden hedef biçimi seçin.", "Dönüştürme bitince dosyayı indirin."],
      faq: [
        { q: "Hangi belge biçimleri destekleniyor?", a: "Word (DOCX, DOC, ODT, RTF), düz metin (TXT), tablo (XLSX, XLS, ODS, CSV), sunum (PPTX, PPT, ODP) ve PDF dosyalarını yükleyebilirsiniz. Her dönüştürme sayfası bu biçimlerden kendisiyle ilgili olanları kabul eder." },
        { q: "Bilgisayarımda Office yüklü olmasa da kullanabilir miyim?", a: "Evet. Dönüştürme sunucuda LibreOffice ile yapılır; cihazınızda yalnızca bir tarayıcı olması yeterlidir." },
        { q: "Birden fazla belgeyi aynı anda çevirebilir miyim?", a: "Tek seferde 10 dosyaya kadar yükleyebilirsiniz. Her dosya en fazla 95 MB olabilir ve birden fazla sonuç tek bir ZIP dosyası olarak indirilir." },
        { q: "Şifreli bir Word veya PDF dosyasını dönüştürebilir miyim?", a: "Açılış şifresi olan dosyalar doğrudan dönüştürülemez. Şifreyi biliyorsanız önce ilgili şifre kaldırma aracıyla şifresiz bir kopya alın, ardından o kopyayı dönüştürün." }
      ],
      related: ['pdf-word-cevirme', 'word-pdf-cevirme', 'excel-pdf-cevirme', 'powerpoint-pdf-cevirme', 'pdf-jpg-cevirme', 'sifre-kaldirma']
    },
    {
      slug: 'gorsel-donusturucu',
      type: 'hub',
      category: 'image',
      from: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'bmp', 'heic', 'heif', 'svg'],
      title: "Görsel Dönüştürücü: JPG, PNG, WebP, HEIC | TRNCConvert",
      description: "JPG, PNG, WebP, AVIF, HEIC ve diğer görsel biçimlerini ücretsiz dönüştürün. Kalite ayarını siz seçersiniz, dosyalar 10 dakika içinde silinir.",
      h1: "Görsel dönüştürücü",
      intro: "Fotoğraf ve görsellerinizi JPG, PNG, WebP veya PDF gibi biçimlere çevirip indirin.",
      body: [
        "Görsel dönüştürücü JPG, JPEG, PNG, WebP, AVIF, GIF, TIFF, BMP, HEIC, HEIF ve SVG dosyalarını kabul eder. İşlem sharp kütüphanesiyle yapılır ve çıktı için kalite ayarı seçebilirsiniz. Yüksek kalite daha net ama daha büyük dosya, düşük kalite daha küçük dosya demektir. iPhone'dan gelen HEIC fotoğraflar çözülür ve EXIF yön bilgisine göre doğru şekilde döndürülür, böylece dikey çekilmiş bir fotoğraf yan yatmış görünmez.",
        "Biçim değiştirirken bazı özelliklerin korunamayacağını bilmek gerekir. JPG saydamlığı desteklemediği için PNG veya WebP'deki saydam alanlar beyazla doldurulur. Hareketli GIF ve WebP dosyaları JPG ya da PNG'ye çevrildiğinde yalnızca ilk kare alınır. Görselleri PDF'ye çevirdiğinizde her görsel kendi boyutunda tek sayfalık bir PDF olur. Tek seferde 10 görsel yükleyebilir, sonuçları tek bir ZIP dosyası olarak indirebilirsiniz."
      ],
      steps: ["Görsellerinizi seçin veya sürükleyin.", "Hedef biçimi ve kaliteyi belirleyin.", "Dönüştürülen görselleri indirin."],
      faq: [
        { q: "Saydam arka plan korunur mu?", a: "PNG ve WebP çıktılarında saydamlık korunur. JPG saydamlığı desteklemediği için saydam alanlar beyaz renkle doldurulur." },
        { q: "Hangi kalite ayarını seçmeliyim?", a: "Web sitesi veya mesajlaşma için orta düzey bir kalite genellikle yeterlidir. Baskı ya da arşiv için yüksek kaliteyi seçin; dosya boyutu buna göre büyür." },
        { q: "Hareketli GIF dönüştürünce ne olur?", a: "Hareketli GIF veya WebP dosyası JPG ya da PNG'ye çevrildiğinde yalnızca ilk kare kaydedilir. Animasyon bu biçimlerde saklanamaz." },
        { q: "Telefonumdan görsel yükleyebilir miyim?", a: "Evet, site telefon tarayıcısında da çalışır. iPhone'daki HEIC fotoğrafları doğrudan seçip JPG'ye çevirebilirsiniz." }
      ],
      related: ['heic-jpg-cevirme', 'webp-jpg-cevirme', 'png-jpg-cevirme', 'jpg-png-cevirme', 'jpg-webp-cevirme', 'jpg-pdf-cevirme']
    },
    {
      slug: 'ses-donusturucu',
      type: 'hub',
      category: 'audio',
      from: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'flac', 'wma', 'aiff'],
      title: "Ses Dönüştürücü: MP3, WAV, M4A, FLAC Çevirme | TRNCConvert",
      description: "MP3, WAV, M4A, FLAC, OGG ve WMA ses dosyalarını hesap açmadan dönüştürün. MP3 çıktısı için 128, 192 veya 320 kbps kalite seçebilirsiniz.",
      h1: "Ses dönüştürücü",
      intro: "Ses dosyalarınızı MP3 veya WAV biçimine çevirip tarayıcıdan indirin.",
      body: [
        "Ses dönüştürücü MP3, WAV, M4A, AAC, OGG, Opus, FLAC, WMA ve AIFF dosyalarını kabul eder. Dönüştürme FFmpeg ile yapılır. MP3 çıktısında üç kalite seçeneği vardır: düşük 128 kbps, normal 192 kbps ve yüksek 320 kbps. Konuşma kayıtları için düşük kalite çoğu zaman yeterlidir, müzik için normal ya da yüksek kalite daha uygundur. Parça adı ve sanatçı gibi etiket bilgileri yeni dosyaya kopyalanır.",
        "WAV çıktısı 16 bit PCM olarak üretilir; kayıpsızdır ama aynı süredeki MP3'ten çok daha fazla yer kaplar. Burada önemli bir sınır vardır: MP3 veya M4A gibi kayıplı bir dosyayı WAV ya da başka kayıpsız bir biçime çevirmek, sıkıştırmada kaybolmuş ayrıntıları geri getirmez. Bir videodaki sesi ayrı bir dosya olarak almak istiyorsanız video dönüştürücüdeki MP4'ten MP3'e aracını kullanabilirsiniz."
      ],
      steps: ["Ses dosyanızı yükleyin.", "MP3 veya WAV seçip kaliteyi belirleyin.", "Dönüştürülen dosyayı indirin."],
      faq: [
        { q: "Hangi MP3 kalitesini seçmeliyim?", a: "Konuşma, podcast veya ses notu için 128 kbps genellikle yeterlidir. Müzik için 192 kbps dengeli bir seçimdir; en yüksek ses kalitesi için 320 kbps'yi seçin." },
        { q: "Şarkı adı ve sanatçı bilgisi kaybolur mu?", a: "Hayır, başlık ve sanatçı gibi etiket bilgileri dönüştürülen dosyaya kopyalanır." },
        { q: "Hangi ses biçimlerini yükleyebilirim?", a: "MP3, WAV, M4A, AAC, OGG, Opus, FLAC, WMA ve AIFF dosyalarını yükleyebilirsiniz. Çıktı olarak MP3 veya WAV seçilebilir." },
        { q: "Birden fazla ses dosyasını birlikte çevirebilir miyim?", a: "Evet, tek seferde 10 dosyaya kadar yükleyebilirsiniz. Her dosya en fazla 95 MB olabilir ve sonuçlar ZIP olarak indirilir." }
      ],
      related: ['wav-mp3-cevirme', 'm4a-mp3-cevirme', 'flac-mp3-cevirme', 'ogg-mp3-cevirme', 'mp3-wav-cevirme', 'mp4-mp3-donusturucu']
    },
    {
      slug: 'video-donusturucu',
      type: 'hub',
      category: 'video',
      from: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'wmv', 'm4v', '3gp'],
      title: "Video Dönüştürücü: MP4, MOV, MKV, WebM | TRNCConvert",
      description: "MP4, MOV, MKV, WebM, AVI ve WMV videolarını MP4, MP3 veya GIF'e ücretsiz dönüştürün. Hesap gerekmez, dosyalar 10 dakika içinde silinir.",
      h1: "Video dönüştürücü",
      intro: "Videolarınızı telefonda ve tarayıcıda oynayan MP4'e, ses dosyasına ya da GIF'e çevirin.",
      body: [
        "Video dönüştürücü MP4, MOV, MKV, WebM, AVI, WMV, M4V ve 3GP dosyalarını kabul eder. İşlem FFmpeg ile yapılır. MP4, MOV ve MKV çıktıları H.264 görüntü ve AAC ses ile, web'de oynatmaya uygun ayarlarla hazırlanır; video telefonlarda açılır ve tamamı inmeden oynamaya başlayabilir. Düşük, normal ve yüksek kalite seçenekleri arasında tercih yaparak dosya boyutu ile görüntü netliği arasında denge kurabilirsiniz.",
        "Bir videonun yalnızca sesine ihtiyacınız varsa MP3 çıktısını seçebilirsiniz; bu durumda sadece ses kanalı alınır. Kısa bir sahneyi GIF yapmak da mümkündür: GIF en fazla ilk 30 saniyeden, en çok 480 piksel genişlikte ve saniyede 12 kareyle oluşturulur, ses içermez. Uzun veya yüksek çözünürlüklü videoların işlenmesi daha uzun sürer; sayfa ilerlemeyi gösterir, sekmeyi açık bırakmanız yeterlidir."
      ],
      steps: ["Video dosyanızı seçin.", "Hedef biçimi ve kaliteyi belirleyin.", "İşlem bitince dosyayı indirin."],
      faq: [
        { q: "Dönüştürme neden uzun sürüyor?", a: "Video dönüştürme, belge veya görsele göre daha fazla işlem gerektirir; süre videonun uzunluğuna ve çözünürlüğüne bağlıdır. Sayfa ilerlemeyi gösterir, işlem bitene kadar sekmeyi açık tutun." },
        { q: "Hangi kalite seçeneğini kullanmalıyım?", a: "Paylaşmak veya mesajla göndermek için düşük ya da normal kalite daha küçük dosya üretir. Görüntü netliği önemliyse yüksek kaliteyi seçin; dosya boyutu artar." },
        { q: "En büyük video boyutu ne kadar?", a: "Dosya başına sınır 95 MB'tır. Daha büyük videoları yüklemeden önce kırpmanız veya daha düşük çözünürlükte kaydetmeniz gerekir." },
        { q: "Videodan sadece sesi alabilir miyim?", a: "Evet, MP3 çıktısını seçtiğinizde yalnızca ses kanalı çıkarılır ve görüntü atılır." }
      ],
      related: ['mov-mp4-cevirme', 'mkv-mp4-cevirme', 'webm-mp4-cevirme', 'avi-mp4-cevirme', 'mp4-mp3-donusturucu', 'mp4-gif-cevirme']
    },
    {
      slug: 'sifre-kaldirma',
      type: 'hub',
      category: 'unlock',
      from: ['pdf', 'docx', 'xlsx', 'pptx'],
      title: "Şifre Kaldırma: PDF, Word, Excel, PowerPoint | TRNCConvert",
      description: "Bildiğiniz şifreyi PDF, Word, Excel ve PowerPoint dosyalarından kaldırın. Araç şifre kırmaz veya tahmin etmez; şifreniz hiçbir yerde saklanmaz.",
      h1: "Dosya şifresi kaldırma",
      intro: "Şifresini bildiğiniz PDF, DOCX, XLSX veya PPTX dosyasını yükleyin ve şifresiz bir kopyasını indirin.",
      body: [
        "Bu araçlar, şifresini zaten bildiğiniz dosyalardan şifreyi kaldırmak içindir. Unutulmuş bir şifreyi bulmaz, kırmaz ve hiçbir şekilde tahmin etmeye çalışmaz. PDF dosyalarında yalnızca yazdırma, kopyalama veya düzenlemeyi kısıtlayan bir izin şifresi varsa, bu kısıtlama şifre sorulmadan kaldırılır. Dosya açılış şifresiyle korunuyorsa şifreyi bir kez yazmanız istenir. Word, Excel ve PowerPoint dosyalarında ise dosyayı açmak için istenen şifre, yani şifreleme kaldırılır.",
        "Şifreler büyük ve küçük harfe duyarlıdır; Türkçe klavyede İ ile I farklı karakterlerdir. ş, ğ, ı, İ, ç, ö ve ü içeren şifreler desteklenir. Üç yanlış denemeden sonra yüklenen dosya silinir ve dosyayı yeniden yüklemeniz gerekir. Girdiğiniz şifre yalnızca bu işlem için kullanılır, saklanmaz ve kayda geçmez. Eski .doc, .xls ve .ppt dosyaları ile ODT, ODS ve ODP şifreleri desteklenmez. Dosyanın sahibi olmanız veya onu kullanma yetkinizin bulunması gerekir."
      ],
      steps: ["Şifreli dosyanızı yükleyin.", "İstenirse bildiğiniz şifreyi girin.", "Şifresiz kopyayı indirin."],
      faq: [
        { q: "Şifremi unuttum, araç bulabilir mi?", a: "Hayır. Araç şifre kırmaz, kurtarmaz ve tahmin etmez; yalnızca bildiğiniz şifreyi kullanarak korumayı kaldırır." },
        { q: "Hangi dosya türleri destekleniyor?", a: "PDF, DOCX, XLSX ve PPTX dosyaları desteklenir. Eski .doc, .xls ve .ppt dosyaları ile ODT, ODS ve ODP biçimlerindeki şifreler desteklenmez." },
        { q: "Yanlış şifre girersem ne olur?", a: "Şifreyi üç kez yanlış girerseniz yüklenen dosya silinir. Doğru şifreyle denemek için dosyayı yeniden yüklemeniz gerekir." },
        { q: "Girdiğim şifre saklanıyor mu?", a: "Hayır. Şifre yalnızca o dosyanın kilidini açmak için kullanılır, hiçbir yerde saklanmaz ve kayıtlara yazılmaz." }
      ],
      related: ['pdf-sifre-kaldirma', 'word-sifre-kaldirma', 'excel-sifre-kaldirma', 'powerpoint-sifre-kaldirma', 'belge-donusturucu']
    },

    {
      slug: 'pdf-sifre-kaldirma',
      type: 'unlock',
      category: 'unlock',
      from: ['pdf'],
      unlockKind: 'pdf',
      title: "PDF Şifre Kaldırma: Bildiğiniz Şifreyi Silin | TRNCConvert",
      description: "PDF dosyasındaki açılış şifresini veya yazdırma ve kopyalama kısıtlamasını kaldırın. Araç yalnızca bildiğiniz şifreyle çalışır, şifre kırmaz.",
      h1: "PDF şifresi kaldırma",
      intro: "Şifreli PDF'yi yükleyin; gerekiyorsa şifreyi bir kez girin ve şifresiz PDF'yi indirin.",
      body: [
        "PDF'lerde iki tür koruma bulunur. Birincisi, dosyayı açarken sorulan açılış şifresidir; bu durumda şifreyi bir kez girmeniz istenir ve ardından şifresiz bir kopya hazırlanır. İkincisi, dosya açılabildiği hâlde yazdırmayı, metin kopyalamayı veya düzenlemeyi engelleyen izin (sahip) şifresidir. Yalnızca bu kısıtlama varsa sizden şifre istenmeden kaldırılır. Araç bilinmeyen bir şifreyi kırmaz, kurtarmaz ve tahmin etmeye çalışmaz.",
        "Bu araca genellikle bankadan, okuldan veya bir kurumdan gelen şifreli PDF'leri her açılışta şifre yazmadan kullanmak, yazdırmak ya da PDF'den Word'e, PDF'den JPG'ye gibi başka bir dönüştürmeye hazırlamak için ihtiyaç duyulur. Dijital imzalı bir PDF'nin kilidi açıldığında imza geçerliliğini yitirir; sayfa bu konuda sizi uyarır. Üç yanlış denemeden sonra dosya silinir. Dosyanın sahibi olmanız veya onu kullanma yetkinizin bulunması gerekir."
      ],
      steps: ["Şifreli PDF dosyasını yükleyin.", "Açılış şifresi istenirse girin.", "Şifresiz PDF'yi indirin."],
      faq: [
        { q: "Şifresini bilmediğim bir PDF'yi açabilir miyim?", a: "Hayır. Araç şifre kırmaz ve tahmin etmez. Açılış şifresi olan bir PDF için doğru şifreyi sizin girmeniz gerekir." },
        { q: "Yazdırma ve kopyalama kısıtlaması nasıl kaldırılıyor?", a: "Dosyada yalnızca izin şifresi varsa PDF zaten açılabilir durumdadır. Bu kısıtlamalar şifre sorulmadan kaldırılır ve yeni dosyada yazdırma ile kopyalama serbest olur." },
        { q: "İmzalı PDF'nin imzası ne olur?", a: "Şifre kaldırıldığında dosya yeniden yazıldığı için dijital imza geçersiz hâle gelir. İmzanın geçerli kalması gerekiyorsa orijinal dosyayı saklayın." },
        { q: "Şifremde Türkçe karakter var, sorun olur mu?", a: "Hayır, ş, ğ, ı, İ, ç, ö ve ü desteklenir. Şifre büyük-küçük harfe duyarlıdır ve İ ile I farklı karakter sayılır." }
      ],
      related: ['sifre-kaldirma', 'word-sifre-kaldirma', 'excel-sifre-kaldirma', 'pdf-word-cevirme', 'pdf-jpg-cevirme']
    },
    {
      slug: 'word-sifre-kaldirma',
      type: 'unlock',
      category: 'unlock',
      from: ['docx'],
      unlockKind: 'docx',
      title: "Word Şifre Kaldırma: DOCX Açılış Şifresi | TRNCConvert",
      description: "Şifresini bildiğiniz Word (DOCX) belgesinden açılış şifresini kaldırın. Unutulan şifreleri kırmaz; girdiğiniz şifre saklanmaz ve kayda geçmez.",
      h1: "Word şifresi kaldırma",
      intro: "Açılış şifresi olan DOCX belgesini yükleyin, şifreyi girin ve şifresiz bir kopya indirin.",
      body: [
        "Word'de Dosya > Bilgi > Belgeyi Koru > Parola ile Şifrele yoluyla eklenen parola, belgeyi şifreler ve her açılışta sorulur. Bu araç, bu açılış şifresini kaldırır; belgeyi yükleyip şifreyi bir kez girdiğinizde içerik aynı kalır, yalnızca şifreleme kalkar. Şifreyi bilmiyorsanız araç size yardımcı olamaz: şifre kırma, kurtarma veya tahmin etme gibi bir işlem yapılmaz. Girdiğiniz şifre yalnızca bu işlem için kullanılır ve saklanmaz.",
        "Düzenlemeyi kısıtla seçeneğiyle eklenen koruma farklı bir şeydir: belge şifrelenmez, yalnızca değişiklik yapmak engellenir. Bu tür koruma şu an kaldırılmıyor. Eski .doc biçimindeki belgeler ve ODT dosyaları da desteklenmez. Şifreler büyük-küçük harfe duyarlıdır ve İ ile I farklı karakterlerdir. Üç yanlış denemeden sonra dosya silinir ve yeniden yüklemeniz gerekir. Belgenin sahibi olmanız ya da onu kullanma yetkinizin bulunması gerekir."
      ],
      steps: ["Şifreli DOCX dosyasını yükleyin.", "Belgenin açılış şifresini girin.", "Şifresiz Word belgesini indirin."],
      faq: [
        { q: "Word şifremi unuttum, kaldırabilir misiniz?", a: "Hayır. Araç yalnızca bildiğiniz şifreyle çalışır; unutulan şifreleri kırmaz, kurtarmaz ve tahmin etmez." },
        { q: "Düzenleme kısıtlaması da kalkıyor mu?", a: "Hayır. Düzenlemeyi kısıtla korumasında belge şifrelenmez ve bu koruma şu an desteklenmiyor. Araç yalnızca açılış şifresini kaldırır." },
        { q: "Eski .doc dosyamın şifresini kaldırabilir miyim?", a: "Hayır, eski .doc biçimi desteklenmez. Yalnızca DOCX dosyalarındaki açılış şifresi kaldırılabilir." },
        { q: "Belgenin içeriği veya biçimi değişir mi?", a: "Hayır. Yalnızca şifreleme kaldırılır; metin, tablolar, görseller ve biçimlendirme olduğu gibi kalır." }
      ],
      related: ['sifre-kaldirma', 'pdf-sifre-kaldirma', 'excel-sifre-kaldirma', 'powerpoint-sifre-kaldirma', 'word-pdf-cevirme']
    },
    {
      slug: 'excel-sifre-kaldirma',
      type: 'unlock',
      category: 'unlock',
      from: ['xlsx'],
      unlockKind: 'xlsx',
      title: "Excel Şifre Kaldırma: XLSX Açılış Şifresi | TRNCConvert",
      description: "Bildiğiniz şifreyle korunan Excel (XLSX) dosyasının açılış şifresini kaldırın. Araç şifre kırmaz veya tahmin etmez, girilen şifre saklanmaz.",
      h1: "Excel şifresi kaldırma",
      intro: "Açılış şifresi olan XLSX dosyasını yükleyin, şifreyi bir kez girin ve şifresiz çalışma kitabını indirin.",
      body: [
        "Excel'de Parola ile Şifrele seçeneği kullanıldığında çalışma kitabının tamamı şifrelenir ve açmak için parola gerekir. Bu araç, bu açılış şifresini kaldırır. Dosyayı yükleyip şifreyi girdiğinizde sayfalar, formüller ve veriler değişmeden kalır. Şifreyi bilmiyorsanız araç işe yaramaz; şifre kırma, kurtarma veya deneme yanılma yapılmaz. Ekipte paylaşılan bir bütçe ya da stok dosyasını her açılışta parola yazmadan kullanmak için sık başvurulan bir yoldur.",
        "Sayfa koruması veya çalışma kitabı yapısı koruması gibi, dosyayı şifrelemeden yalnızca düzenlemeyi kısıtlayan korumalar farklıdır ve şu an kaldırılmaz. Eski .xls dosyaları ile ODS biçimindeki şifreler de desteklenmez. Şifre büyük-küçük harfe duyarlıdır; ş, ğ, ı ve İ gibi Türkçe karakterler desteklenir. Üç yanlış denemeden sonra dosya silinir. Girdiğiniz şifre kaydedilmez. Dosyanın sahibi olmanız veya onu kullanma yetkinizin bulunması gerekir."
      ],
      steps: ["Şifreli XLSX dosyasını yükleyin.", "Çalışma kitabının şifresini girin.", "Şifresiz Excel dosyasını indirin."],
      faq: [
        { q: "Sayfa korumasını da kaldırıyor mu?", a: "Hayır. Sayfa koruması dosyayı şifrelemez, yalnızca düzenlemeyi kısıtlar ve şu an desteklenmiyor. Araç açılış şifresini kaldırır." },
        { q: "Formüller ve biçimlendirme korunur mu?", a: "Evet. Yalnızca şifreleme kaldırılır; sayfalar, formüller, biçimlendirme ve grafikler olduğu gibi kalır." },
        { q: "Şifreyi hatırlamıyorum, ne yapabilirim?", a: "Bu araç şifre kırmaz ve tahmin etmez, bu yüzden unutulan şifreyi bulamaz. Dosyayı size gönderen kişiden şifreyi istemeniz gerekir." },
        { q: "XLS dosyası destekleniyor mu?", a: "Hayır, eski .xls biçimindeki şifreli dosyalar desteklenmez. Yalnızca XLSX dosyalarının açılış şifresi kaldırılabilir." }
      ],
      related: ['sifre-kaldirma', 'word-sifre-kaldirma', 'powerpoint-sifre-kaldirma', 'pdf-sifre-kaldirma', 'excel-pdf-cevirme']
    },
    {
      slug: 'powerpoint-sifre-kaldirma',
      type: 'unlock',
      category: 'unlock',
      from: ['pptx'],
      unlockKind: 'pptx',
      title: "PowerPoint Şifre Kaldırma: PPTX Şifresi | TRNCConvert",
      description: "Şifresini bildiğiniz PowerPoint (PPTX) sunumunun açılış şifresini kaldırın. Unutulan şifreler kırılmaz; şifre yalnızca bu işlemde kullanılır.",
      h1: "PowerPoint şifresi kaldırma",
      intro: "Şifreli PPTX sunumunu yükleyin, açılış şifresini girin ve şifresiz sunumu indirin.",
      body: [
        "Sunumu bir toplantıda, sınıfta veya ortak bir bilgisayarda açacaksanız her seferinde parola yazmak zahmetli olabilir. Bu araç, PowerPoint'te Parola ile Şifrele seçeneğiyle eklenen açılış şifresini kaldırır. Şifreyi bir kez girdiğinizde slaytlar, notlar, animasyonlar ve medya içeriği aynen kalır, yalnızca şifreleme silinir. Şifreyi bilmiyorsanız araç yardımcı olamaz; şifre kırma, kurtarma veya tahmin yapılmaz.",
        "Değiştirmek için parola gibi, dosyayı şifrelemeden yalnızca düzenlemeyi kısıtlayan korumalar bu araçla henüz kaldırılmıyor. Eski .ppt sunumları ve ODP dosyaları da desteklenmez. Şifre büyük-küçük harfe duyarlıdır ve İ ile I ayrı karakterlerdir. Üç hatalı denemeden sonra dosya silinir, tekrar yüklemeniz gerekir. Sunumun sahibi olmanız veya kullanma yetkinizin bulunması gerekir. Şifresiz kopyayı aldıktan sonra isterseniz PowerPoint'ten PDF'ye aracıyla sunumu PDF olarak da kaydedebilirsiniz."
      ],
      steps: ["Şifreli PPTX dosyasını yükleyin.", "Sunumun açılış şifresini girin.", "Şifresiz sunumu indirin."],
      faq: [
        { q: "Bilmediğim bir sunum şifresini açabilir mi?", a: "Hayır. Araç şifre kırmaz, kurtarmaz ve tahmin etmez; yalnızca doğru şifreyi girdiğinizde korumayı kaldırır." },
        { q: "Animasyonlar ve notlar kaybolur mu?", a: "Hayır. Yalnızca şifreleme kaldırılır; slaytlar, konuşmacı notları, animasyonlar ve gömülü medya değişmez." },
        { q: "PPT dosyası destekleniyor mu?", a: "Hayır, eski .ppt biçimi ve ODP sunumları desteklenmez. Yalnızca PPTX dosyalarının açılış şifresi kaldırılabilir." },
        { q: "Şifreyi kaç kez deneyebilirim?", a: "Üç deneme hakkınız vardır. Üçüncü yanlış denemeden sonra dosya silinir ve yeniden yüklemeniz gerekir." }
      ],
      related: ['sifre-kaldirma', 'word-sifre-kaldirma', 'excel-sifre-kaldirma', 'pdf-sifre-kaldirma', 'powerpoint-pdf-cevirme']
    },

    {
      slug: 'pdf-word-cevirme',
      type: 'convert',
      category: 'document',
      from: ['pdf'],
      to: 'docx',
      title: "PDF'yi Word'e Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "PDF dosyanızı düzenlenebilir bir Word (DOCX) belgesine çevirin. Paragraflar, tablolar ve görseller yeniden kurulur; hesap açmanız gerekmez.",
      h1: "PDF'yi Word'e çevirme",
      intro: "PDF dosyanızı yükleyin; metni, tabloları ve görselleri düzenlenebilir bir DOCX belgesi olarak indirin.",
      body: [
        "PDF, belgeyi her cihazda aynı görünecek şekilde sabitler ama üzerinde değişiklik yapmayı zorlaştırır. Bir sözleşmeyi güncellemek, eski bir raporu yeniden kullanmak ya da bir formdaki metni düzeltmek için PDF'yi Word'e çevirmek gerekir. Bu dönüştürmede pdf2docx motoru kullanılır; sayfadaki paragraflar, tablolar ve görseller tek tek tanınır ve Word'de düzenlenebilir öğeler olarak yeniden oluşturulur.",
        "Sonuç, PDF'nin nasıl üretildiğine bağlıdır. Word veya benzeri bir programdan kaydedilmiş PDF'lerde metin doğrudan okunur. Tarayıcıdan geçirilmiş, yani yalnızca resimden oluşan PDF'lerde metin tanıma (OCR) yapılmaz; bu sayfalar Word içinde resim olarak gelir. Çok sütunlu dergi düzenleri veya iç içe kutular içeren sayfalarda küçük düzeltmeler gerekebilir. Şifreli PDF'leri önce PDF şifre kaldırma aracıyla açmanız gerekir."
      ],
      steps: ["PDF dosyanızı yükleyin.", "Word (DOCX) çıktısının seçili olduğundan emin olun.", "Düzenlenebilir Word belgesini indirin."],
      faq: [
        { q: "Taranmış PDF'yi Word'e çevirebilir miyim?", a: "Dönüştürme yapılır ama metin tanıma (OCR) olmadığı için taranmış sayfalar Word'de resim olarak yer alır. Bu sayfalardaki metni doğrudan düzenleyemezsiniz." },
        { q: "Tablolar Word'de tablo olarak mı gelir?", a: "Evet, PDF'deki tablolar Word tablosu olarak yeniden kurulur. Birleştirilmiş hücreler veya kenarlıksız tablolar içeren sayfalarda küçük düzeltmeler gerekebilir." },
        { q: "Çıktıyı hangi programlarda açabilirim?", a: "Çıktı DOCX biçimindedir; Microsoft Word, LibreOffice Writer ve DOCX destekleyen diğer kelime işlemcilerde açılır." },
        { q: "Şifreli PDF'yi neden çeviremiyorum?", a: "Açılış şifresi olan PDF'ler okunamadığı için doğrudan dönüştürülemez. Önce PDF şifre kaldırma aracıyla şifreyi kaldırın, sonra yeni dosyayı yükleyin." }
      ],
      related: ['word-pdf-cevirme', 'pdf-jpg-cevirme', 'pdf-sifre-kaldirma', 'belge-donusturucu', 'excel-pdf-cevirme']
    },
    {
      slug: 'word-pdf-cevirme',
      type: 'convert',
      category: 'document',
      from: ['docx', 'doc', 'odt', 'rtf'],
      to: 'pdf',
      title: "Word'ü PDF'ye Çevirme: DOCX, ODT, RTF | TRNCConvert",
      description: "Word, ODT ve RTF belgelerinizi PDF'ye çevirin. Sayfa düzeni, yazı tipleri, tablolar ve görseller korunur; kayıt olmanız veya program kurmanız gerekmez.",
      h1: "Word'ü PDF'ye çevirme",
      intro: "DOCX, DOC, ODT veya RTF belgenizi yükleyin ve aynı düzende bir PDF dosyası indirin.",
      body: [
        "Bir CV'yi, dilekçeyi, ödevi veya teklifi göndermeden önce PDF'ye çevirmek, belgenin karşı tarafta da sizin gördüğünüz gibi açılmasını sağlar. Word belgesi farklı bir bilgisayarda açıldığında yazı tipi eksikliği yüzünden satırlar kayabilir; PDF'de bu sorun yaşanmaz. Bu sayfa DOCX, eski DOC, OpenDocument ODT ve RTF dosyalarını kabul eder ve dönüştürmeyi LibreOffice motoruyla yapar.",
        "Dönüştürmede sayfa düzeni, yazı tipleri, tablolar ve görseller korunur; böylece PDF, belgenin yazdırılmış hâline yakın görünür. Ortaya çıkan PDF düzenlemek için tasarlanmamıştır; metinde değişiklik gerekirse asıl Word dosyası üzerinde çalışıp yeniden dönüştürmek en kolay yoldur. Şifreli bir Word belgesini çevirmek için önce Word şifre kaldırma aracıyla açılış şifresini kaldırın. Tek seferde 10 belge yükleyebilir, PDF'leri ZIP olarak indirebilirsiniz."
      ],
      steps: ["Word veya ODT belgenizi yükleyin.", "PDF çıktısını onaylayın.", "Hazırlanan PDF dosyasını indirin."],
      faq: [
        { q: "Belgemdeki yazı tipi PDF'de değişir mi?", a: "Hayır, belgede kullanılan yazı tipleri ve sayfa düzeni PDF'ye aktarılır. Bu sayede PDF, alıcının bilgisayarında hangi yazı tiplerinin yüklü olduğundan bağımsız olarak aynı görünür." },
        { q: "ODT veya RTF dosyalarını da çevirebilir miyim?", a: "Evet. DOCX ve DOC dışında OpenDocument (ODT) ve RTF belgeleri de aynı şekilde PDF'ye dönüştürülür." },
        { q: "PDF'yi sonradan düzenleyebilir miyim?", a: "PDF düzenleme için tasarlanmış bir biçim değildir. Değişiklik gerekirse Word dosyasını düzenleyip yeniden çevirin ya da PDF'yi Word'e çevirme aracını kullanın." },
        { q: "Telefonumdaki Word dosyasını çevirebilir miyim?", a: "Evet. Site telefon tarayıcısında çalışır; dosyayı telefonunuzdan seçip PDF'yi doğrudan indirebilirsiniz." }
      ],
      related: ['pdf-word-cevirme', 'excel-pdf-cevirme', 'powerpoint-pdf-cevirme', 'word-sifre-kaldirma', 'belge-donusturucu']
    },
    {
      slug: 'excel-pdf-cevirme',
      type: 'convert',
      category: 'document',
      from: ['xlsx', 'xls', 'ods'],
      to: 'pdf',
      title: "Excel'i PDF'ye Çevirme: XLSX, XLS, ODS | TRNCConvert",
      description: "Excel tablolarınızı ücretsiz olarak PDF'ye çevirin. Çalışma kitabındaki her sayfa, tanımlı yazdırma alanı ve sayfa ayarlarına göre PDF'ye aktarılır.",
      h1: "Excel'i PDF'ye çevirme",
      intro: "XLSX, XLS veya ODS dosyanızı yükleyin; tüm sayfaları içeren bir PDF indirin.",
      body: [
        "Fiyat listesi, fatura, bütçe tablosu veya not çizelgesi gibi Excel dosyalarını paylaşırken PDF tercih edilir; çünkü alıcı formülleri değiştiremez ve tablo her cihazda aynı görünür. Bu sayfa XLSX, XLS ve ODS dosyalarını kabul eder ve LibreOffice motoruyla dönüştürür. Çalışma kitabındaki her sayfa PDF'ye basılır; yani birden fazla sekmeniz varsa hepsi aynı PDF'de art arda yer alır.",
        "Sonucun nasıl görüneceğini Excel'deki yazdırma ayarları belirler. Bir yazdırma alanı tanımladıysanız yalnızca o alan basılır; kâğıt yönü, ölçek ve kenar boşlukları da sayfa düzeni ayarlarından alınır. Geniş bir tablo PDF'de birden fazla sayfaya bölünüyorsa, dönüştürmeden önce Excel'de yatay yönü veya sayfaya sığdır seçeneğini ayarlamak işe yarar. PDF'de formüller değil, hücrelerde görünen değerler yer alır."
      ],
      steps: ["Excel dosyanızı yükleyin.", "Çıktı olarak PDF'yi seçin.", "Tüm sayfaları içeren PDF'yi indirin."],
      faq: [
        { q: "Sadece bir sayfayı PDF yapabilir miyim?", a: "Dönüştürme çalışma kitabındaki her sayfayı basar. Yalnızca bir sayfa istiyorsanız diğerlerini silip dosyayı yeni bir kopya olarak kaydedin, sonra yükleyin." },
        { q: "Tablom PDF'de neden birden fazla sayfaya bölündü?", a: "PDF, Excel'deki sayfa ayarlarına göre oluşturulur. Excel'de yatay yönü seçmek veya sayfaya sığdır ölçeğini ayarlamak tabloyu daha az sayfaya sığdırır." },
        { q: "Yazdırma alanı dikkate alınıyor mu?", a: "Evet. Bir sayfada yazdırma alanı tanımlıysa PDF'ye yalnızca o alan aktarılır." },
        { q: "ODS dosyaları destekleniyor mu?", a: "Evet. XLSX ve XLS'nin yanı sıra LibreOffice Calc ile oluşturulan ODS dosyaları da PDF'ye dönüştürülür." }
      ],
      related: ['word-pdf-cevirme', 'powerpoint-pdf-cevirme', 'csv-excel-cevirme', 'excel-sifre-kaldirma', 'belge-donusturucu']
    },
    {
      slug: 'powerpoint-pdf-cevirme',
      type: 'convert',
      category: 'document',
      from: ['pptx', 'ppt', 'odp'],
      to: 'pdf',
      title: "PowerPoint'i PDF'ye Çevirme: PPTX, PPT | TRNCConvert",
      description: "PowerPoint sunumlarınızı PDF'ye çevirin. Her slayt ayrı bir sayfa olur ve gizli slaytlar atlanır. PPTX, PPT ve ODP dosyaları desteklenir.",
      h1: "PowerPoint'i PDF'ye çevirme",
      intro: "PPTX, PPT veya ODP sunumunuzu yükleyin; her slaydın bir sayfa olduğu PDF'yi indirin.",
      body: [
        "Sunumu e-postayla göndermek, ders notu olarak paylaşmak veya PowerPoint yüklü olmayan bir bilgisayarda göstermek için PDF en pratik biçimdir. Bu sayfa PPTX, eski PPT ve ODP dosyalarını kabul eder ve LibreOffice motoruyla dönüştürür. Her slayt PDF'de ayrı bir sayfa olur; slayttaki metinler, şekiller, görseller ve tasarım sayfaya yerleşir, böylece sunum her cihazda aynı görünür.",
        "PDF hareketsiz bir biçim olduğu için animasyonlar ve slayt geçişleri aktarılmaz; her slayt tek bir sabit sayfa olarak basılır. Gösteride gizlenmiş slaytlar PDF'ye alınmaz, bu yüzden yalnızca sunduğunuz slaytlar yer alır. Gizli bir slaydın da PDF'de görünmesini istiyorsanız dönüştürmeden önce PowerPoint'te gizlemeyi kaldırın. Şifreli bir sunum için önce PowerPoint şifre kaldırma aracını kullanmanız gerekir."
      ],
      steps: ["Sunum dosyanızı yükleyin.", "PDF çıktısını seçin.", "Slaytların yer aldığı PDF'yi indirin."],
      faq: [
        { q: "Animasyonlar PDF'de çalışır mı?", a: "Hayır. PDF'ye animasyonlar ve geçişler aktarılmaz; her slayt tek bir sabit sayfa olarak yer alır." },
        { q: "Gizli slaytlar PDF'ye eklenir mi?", a: "Hayır, gizli slaytlar atlanır. PDF'de görünmelerini istiyorsanız dönüştürmeden önce gizlemeyi kaldırın." },
        { q: "PDF'de kaç sayfa olur?", a: "Gizli olmayan her slayt ayrı bir sayfa olur. Örneğin gizli slaydı olmayan 20 slaytlık bir sunumdan 20 sayfalık bir PDF çıkar." },
        { q: "Video içeren büyük sunumları yükleyebilir miyim?", a: "Dosya başına sınır 95 MB'tır. Gömülü videolar PDF'de oynatılamayacağı için dosya çok büyükse videoları çıkarıp sunumu yeniden kaydetmek boyutu küçültür." }
      ],
      related: ['word-pdf-cevirme', 'excel-pdf-cevirme', 'powerpoint-sifre-kaldirma', 'pdf-jpg-cevirme', 'belge-donusturucu']
    },
    {
      slug: 'pdf-jpg-cevirme',
      type: 'convert',
      category: 'document',
      from: ['pdf'],
      to: 'jpg',
      title: "PDF'yi JPG'ye Çevirme: Her Sayfa Ayrı Görsel | TRNCConvert",
      description: "PDF sayfalarını 150 DPI çözünürlükte ayrı JPG görsellere çevirin. Çok sayfalı PDF'lerde tüm görseller tek bir ZIP dosyası olarak indirilir.",
      h1: "PDF'yi JPG'ye çevirme",
      intro: "PDF'nizi yükleyin; her sayfası ayrı bir JPG görsel olarak hazırlansın.",
      body: [
        "Bir PDF sayfasını sosyal medyada paylaşmak, telefonda kolayca göstermek, mesajlaşma uygulamasıyla göndermek, sunuma veya web sayfasına resim olarak eklemek istediğinizde JPG daha kullanışlıdır. Bu araç PDF'nin her sayfasını 150 DPI çözünürlükte ayrı bir JPG dosyasına dönüştürür. Bu çözünürlük ekranda okumak ve paylaşmak için yeterli netlik sağlarken dosya boyutunu da makul düzeyde tutar.",
        "Tek sayfalık bir PDF'den tek bir JPG elde edersiniz. Çok sayfalı PDF'lerde sayfalar ayrı görsellere dönüştürülür ve hepsi tek bir ZIP dosyası olarak indirilir. JPG bir resim biçimi olduğundan görsellerdeki metin seçilemez veya düzenlenemez; metni değiştirmeniz gerekiyorsa PDF'yi Word'e çevirme aracı daha uygundur. Şifreli PDF'leri önce PDF şifre kaldırma aracıyla açmanız gerekir, aksi hâlde sayfalar okunamaz."
      ],
      steps: ["PDF dosyanızı yükleyin.", "JPG çıktısını seçin.", "Görselleri veya ZIP dosyasını indirin."],
      faq: [
        { q: "Görseller hangi çözünürlükte oluşturuluyor?", a: "Her sayfa 150 DPI çözünürlükte JPG olarak kaydedilir. Bu, ekranda görüntüleme ve paylaşım için uygun bir netliktir." },
        { q: "30 sayfalık bir PDF'yi nasıl indiririm?", a: "Çok sayfalı PDF'lerde her sayfa ayrı bir JPG olur ve hepsi tek bir ZIP dosyasında toplanır. ZIP'i açtığınızda her sayfanın görselini ayrı bir dosya olarak bulursunuz." },
        { q: "Şifreli PDF neden dönüştürülmüyor?", a: "Şifreli PDF'ler önce açılmalıdır. Şifreyi biliyorsanız PDF şifre kaldırma aracıyla şifresiz bir kopya alıp onu yükleyin." },
        { q: "JPG'deki yazıları düzenleyebilir miyim?", a: "Hayır, JPG bir resimdir ve içindeki metin düzenlenemez. Düzenlenebilir metin için PDF'yi Word'e çevirme aracını kullanın." }
      ],
      related: ['pdf-word-cevirme', 'jpg-pdf-cevirme', 'pdf-sifre-kaldirma', 'gorsel-donusturucu', 'belge-donusturucu']
    },
    {
      slug: 'csv-excel-cevirme',
      type: 'convert',
      category: 'document',
      from: ['csv'],
      to: 'xlsx',
      title: "CSV'yi Excel'e Çevirme: CSV'den XLSX'e | TRNCConvert",
      description: "UTF-8 kodlu, virgülle ayrılmış CSV dosyalarını Excel (XLSX) tablosuna çevirin. Dosya UTF-8 ise Türkçe karakterler bozulmadan aktarılır.",
      h1: "CSV'yi Excel'e çevirme",
      intro: "CSV dosyanızı yükleyin; verileriniz sütunlara ayrılmış bir XLSX çalışma kitabı olarak insin.",
      body: [
        "Bankalar, e-ticaret panelleri ve birçok yazılım verileri CSV olarak dışa aktarır. CSV düz bir metin dosyası olduğu için Excel'de çift tıklayarak açıldığında Türkçe karakterler bozulabilir veya tüm veriler tek sütunda görünebilir. Bu araç CSV dosyasını UTF-8 olarak okur, virgülleri sütun ayırıcı kabul eder ve sonucu XLSX çalışma kitabı olarak kaydeder. İlk satır olduğu gibi aktarılır; başlık satırınız varsa tablonun ilk satırı olur.",
        "Doğru sonuç için dosyanın UTF-8 kodlamasında olması gerekir; bu durumda ş, ğ, ı, İ, ç, ö ve ü gibi karakterler bozulmadan kalır. Türkçe bölge ayarlarıyla çalışan Excel, CSV dosyalarını çoğu zaman noktalı virgülle kaydeder. Noktalı virgülle ayrılmış dosyalar bu araçta tek bir sütuna düşebilir. Böyle bir dosyanız varsa ayırıcıyı virgül yapıp UTF-8 olarak yeniden kaydetmek sorunu çözer."
      ],
      steps: ["CSV dosyanızı yükleyin.", "Çıktı olarak Excel (XLSX) seçin.", "Çalışma kitabını indirip açın."],
      faq: [
        { q: "Türkçe karakterler neden bozuk görünüyor?", a: "Bu genellikle CSV dosyasının UTF-8 dışında bir kodlamayla kaydedilmesinden kaynaklanır. Dosyayı UTF-8 olarak yeniden kaydedip yüklediğinizde karakterler doğru aktarılır." },
        { q: "Tüm verilerim neden tek sütunda?", a: "Araç virgülü ayırıcı olarak kullanır. Dosyanız noktalı virgülle ayrılmışsa satırlar bölünmeden tek sütuna yazılabilir; ayırıcıyı virgül yapıp tekrar deneyin." },
        { q: "Başlık satırına ne oluyor?", a: "İlk satır değiştirilmeden aktarılır. Başlık satırınız varsa Excel'de tablonun ilk satırı olarak görünür." },
        { q: "Çıktı hangi biçimde?", a: "Sonuç XLSX biçiminde bir Excel çalışma kitabıdır; Excel, LibreOffice Calc ve XLSX destekleyen diğer tablo programlarında açılır." }
      ],
      related: ['excel-pdf-cevirme', 'belge-donusturucu', 'excel-sifre-kaldirma', 'word-pdf-cevirme']
    },

    {
      slug: 'jpg-pdf-cevirme',
      type: 'convert',
      category: 'image',
      from: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      to: 'pdf',
      title: "JPG'yi PDF'ye Çevirme: Fotoğraftan PDF | TRNCConvert",
      description: "JPG, PNG, WebP ve HEIC görsellerini PDF'ye çevirin. Her görsel kendi boyutunda tek sayfalık bir PDF olur; birden çok sonuç ZIP olarak iner.",
      h1: "JPG'yi PDF'ye çevirme",
      intro: "Fotoğraf veya görsellerinizi yükleyin; her biri kendi boyutunda tek sayfalık bir PDF'ye dönüşsün.",
      body: [
        "Bir kurum, okul veya iş başvurusu belgeleri yalnızca PDF olarak kabul ettiğinde, telefonla çektiğiniz kimlik, diploma ya da fatura fotoğrafını PDF'ye çevirmeniz gerekir. Bu sayfa JPG, JPEG, PNG, WebP ve iPhone'un HEIC fotoğraflarını kabul eder. Her görsel, sayfa boyutu görselin kendi boyutuna göre ayarlanmış tek sayfalık bir PDF olur; böylece kenarlarda fazladan boşluk kalmaz ve görsel kırpılmaz.",
        "HEIC fotoğraflar EXIF yön bilgisine göre döndürülür, bu yüzden dikey çekilmiş bir belge PDF'de yan yatmış görünmez. Birden fazla görsel yüklediğinizde her biri ayrı bir PDF olarak hazırlanır ve sonuçlar tek bir ZIP dosyasında iner; görseller tek bir PDF'de birleştirilmez. PDF'nin netliği yüklediğiniz görselin çözünürlüğüne bağlıdır, bu nedenle belgeyi iyi ışıkta ve düz bir açıyla çekmek okunabilirliği artırır."
      ],
      steps: ["Görsel veya fotoğraflarınızı yükleyin.", "Çıktı olarak PDF'yi seçin.", "PDF dosyalarını veya ZIP'i indirin."],
      faq: [
        { q: "Birden fazla fotoğrafı tek PDF yapabilir miyim?", a: "Hayır, her görsel ayrı bir tek sayfalık PDF olur. Birden fazla görsel yüklediğinizde PDF'ler tek bir ZIP dosyası olarak indirilir." },
        { q: "PDF'nin sayfa boyutu A4 mü?", a: "Hayır, sayfa boyutu görselin kendi boyutuna göre belirlenir. Bu sayede görsel kırpılmaz ve etrafında boşluk kalmaz." },
        { q: "iPhone fotoğraflarım yan dönmüş çıkar mı?", a: "Hayır. HEIC fotoğraflardaki EXIF yön bilgisi okunur ve görsel doğru yöne döndürülerek PDF'ye yerleştirilir." },
        { q: "Hangi görsel biçimlerini yükleyebilirim?", a: "JPG, JPEG, PNG, WebP ve HEIC dosyalarını yükleyebilirsiniz. Her dosya en fazla 95 MB olabilir." }
      ],
      related: ['pdf-jpg-cevirme', 'heic-jpg-cevirme', 'png-jpg-cevirme', 'gorsel-donusturucu', 'word-pdf-cevirme']
    },
    {
      slug: 'heic-jpg-cevirme',
      type: 'convert',
      category: 'image',
      from: ['heic', 'heif'],
      to: 'jpg',
      title: "HEIC'i JPG'ye Çevirme: iPhone Fotoğrafları | TRNCConvert",
      description: "iPhone'da çekilen HEIC ve HEIF fotoğrafları JPG'ye çevirin. Görseller EXIF yön bilgisine göre döndürülür, Windows ve Android'de de açılır.",
      h1: "HEIC'i JPG'ye çevirme",
      intro: "iPhone fotoğraflarınızı yükleyin; her cihazda açılan JPG dosyaları olarak indirin.",
      body: [
        "iPhone ve iPad, fotoğrafları varsayılan olarak HEIC (HEIF) biçiminde kaydeder. Bu biçim yer tasarrufu sağlar ama Windows bilgisayarlarda, bazı Android telefonlarda ve birçok web formunda açılmayabilir. Bir fotoğrafı e-postayla göndermek, bir başvuru sitesine yüklemek veya bilgisayarda düzenlemek için JPG'ye çevirmek en kolay çözümdür. Bu araç HEIC ve HEIF dosyalarını çözer ve her birini JPG olarak kaydeder.",
        "Telefon fotoğrafları yön bilgisini çoğu zaman EXIF etiketinde tutar. Dönüştürme sırasında bu bilgi okunur ve görsel doğru yöne döndürülür; dikey çektiğiniz fotoğraf yan yatmış görünmez. Kalite ayarıyla dosya boyutunu belirleyebilirsiniz. Telefonunuzdan doğrudan fotoğraf seçebilir, tek seferde 10 fotoğraf yükleyip sonuçları ZIP olarak indirebilirsiniz. Bunun için hesap açmanız veya telefona bir uygulama yüklemeniz gerekmez."
      ],
      steps: ["HEIC fotoğraflarınızı seçin.", "JPG kalitesini belirleyin.", "JPG dosyalarını indirin."],
      faq: [
        { q: "HEIC nedir, neden açılmıyor?", a: "HEIC, Apple cihazlarının fotoğraflar için kullandığı yer tasarruflu bir biçimdir. Her işletim sistemi ve program bu biçimi desteklemediği için JPG'ye çevirmek uyumluluk sorununu çözer." },
        { q: "Fotoğraflarım yan dönmüş çıkar mı?", a: "Hayır. EXIF yön bilgisi okunur ve fotoğraf doğru yöne döndürülerek JPG'ye kaydedilir." },
        { q: "iPhone'dan doğrudan yükleyebilir miyim?", a: "Evet, site iPhone tarayıcısında çalışır. Fotoğraflar uygulamasından tek seferde en fazla 10 fotoğraf seçip dönüştürebilirsiniz." },
        { q: "JPG'ye çevirince kalite düşer mi?", a: "JPG kayıplı bir biçimdir, ancak yüksek kalite ayarında fark çoğu zaman gözle seçilmez. Dosya boyutunu küçültmek istiyorsanız daha düşük bir kalite seçebilirsiniz." }
      ],
      related: ['jpg-pdf-cevirme', 'png-jpg-cevirme', 'webp-jpg-cevirme', 'avif-jpg-cevirme', 'gorsel-donusturucu']
    },
    {
      slug: 'webp-jpg-cevirme',
      type: 'convert',
      category: 'image',
      from: ['webp'],
      to: 'jpg',
      title: "WebP'yi JPG'ye Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "Web sitelerinden kaydettiğiniz WebP görsellerini JPG'ye çevirin. Saydam alanlar beyazla doldurulur, hareketli WebP'lerde ilk kare alınır.",
      h1: "WebP'yi JPG'ye çevirme",
      intro: "WebP görselinizi yükleyin ve hemen her programda açılan bir JPG dosyası olarak indirin.",
      body: [
        "Birçok web sitesi görselleri daha hızlı yüklenmesi için WebP biçiminde sunar. Bu görselleri bilgisayara kaydettiğinizde bazı fotoğraf görüntüleyiciler, eski düzenleme programları veya belge şablonları dosyayı açamayabilir. JPG ise neredeyse her yerde desteklenir. Bu araç WebP dosyasını sharp ile çözer ve seçtiğiniz kalite ayarıyla JPG olarak kaydeder; böylece görseli belgeye ekleyebilir, yazdırabilir veya istediğiniz programda düzenleyebilirsiniz.",
        "JPG saydamlığı desteklemediği için saydam arka planlı WebP görsellerde bu alanlar beyazla doldurulur. Logo veya ikon gibi saydamlığın önemli olduğu görseller için WebP'den PNG'ye çevirme daha uygun olur. Hareketli WebP dosyalarında ise yalnızca ilk kare JPG'ye aktarılır. Kalite ayarını yükselttikçe ayrıntı artar ama dosya da büyür; web'de paylaşım için orta bir kalite genellikle yeterlidir."
      ],
      steps: ["WebP dosyanızı yükleyin.", "JPG kalitesini seçin.", "JPG görseli indirin."],
      faq: [
        { q: "WebP dosyası neden açılmıyor?", a: "WebP görece yeni bir biçimdir ve bazı eski programlar tarafından desteklenmez. JPG'ye çevirdiğinizde dosya hemen her görüntüleyici ve düzenleyicide açılır." },
        { q: "Saydam arka planlı WebP'ye ne olur?", a: "JPG saydamlığı desteklemediği için saydam alanlar beyazla doldurulur. Saydamlığı korumak için WebP'den PNG'ye çevirme aracını kullanın." },
        { q: "Hareketli WebP'yi JPG yapabilir miyim?", a: "Yapabilirsiniz, ancak JPG hareket saklayamadığı için yalnızca ilk kare kaydedilir." },
        { q: "Kaç görseli aynı anda çevirebilirim?", a: "Tek seferde 10 görsel yükleyebilirsiniz. Birden fazla sonuç tek bir ZIP dosyası olarak indirilir." }
      ],
      related: ['webp-png-cevirme', 'png-jpg-cevirme', 'avif-jpg-cevirme', 'jpg-webp-cevirme', 'gorsel-donusturucu']
    },
    {
      slug: 'webp-png-cevirme',
      type: 'convert',
      category: 'image',
      from: ['webp'],
      to: 'png',
      title: "WebP'yi PNG'ye Çevirme: Saydamlık Korunur | TRNCConvert",
      description: "WebP görsellerini PNG'ye çevirin. Saydam arka planlar korunur; logo, ikon ve çizimler düzenleme programlarında kullanılmaya hazır hâle gelir.",
      h1: "WebP'yi PNG'ye çevirme",
      intro: "WebP dosyanızı yükleyin; saydamlığı korunmuş bir PNG olarak indirin.",
      body: [
        "Bir web sitesinden kaydettiğiniz logo, ikon, ekran görüntüsü veya çizim WebP biçimindeyse ve saydam arka planı korumak istiyorsanız PNG doğru seçimdir. PNG, JPG'den farklı olarak saydamlığı destekler ve kayıpsız sıkıştırma kullanır; keskin kenarlı metinler ve düz renkli alanlar bulanıklaşmaz. Bu araç WebP dosyasını sharp ile çözer ve PNG olarak kaydeder, böylece görseli tasarım ve sunum programlarında rahatça kullanabilirsiniz.",
        "PNG kayıpsız olduğu için ortaya çıkan dosya çoğu zaman WebP'den büyüktür; özellikle fotoğraflarda bu fark belirgin olabilir. Fotoğraf içeren bir WebP için dosya boyutu önemliyse JPG'ye çevirmek daha küçük sonuç verir. Hareketli WebP dosyalarında yalnızca ilk kare PNG'ye aktarılır, animasyon korunmaz. Tek seferde 10 görsel yükleyebilir, sonuçları tek bir ZIP dosyası olarak indirebilirsiniz."
      ],
      steps: ["WebP görselinizi yükleyin.", "Çıktı olarak PNG'yi seçin.", "PNG dosyasını indirin."],
      faq: [
        { q: "Logomun saydam arka planı kaybolur mu?", a: "Hayır. PNG saydamlığı desteklediği için WebP'deki saydam alanlar aynen korunur." },
        { q: "PNG dosyası neden daha büyük?", a: "PNG kayıpsız sıkıştırma kullanır ve hiçbir ayrıntıyı atmaz. Bu nedenle özellikle fotoğraflarda dosya WebP'ye göre daha büyük olur." },
        { q: "Ne zaman PNG yerine JPG seçmeliyim?", a: "Saydamlık gerekmeyen fotoğraflarda JPG çok daha küçük dosya üretir. Logo, ikon, çizim ve ekran görüntüsü gibi görsellerde PNG daha net sonuç verir." },
        { q: "Hareketli WebP'ler ne olur?", a: "PNG çıktısında yalnızca ilk kare kaydedilir. Hareketin korunması gerekiyorsa dosyayı WebP olarak kullanmaya devam edin." }
      ],
      related: ['webp-jpg-cevirme', 'jpg-png-cevirme', 'png-jpg-cevirme', 'jpg-webp-cevirme', 'gorsel-donusturucu']
    },
    {
      slug: 'png-jpg-cevirme',
      type: 'convert',
      category: 'image',
      from: ['png'],
      to: 'jpg',
      title: "PNG'yi JPG'ye Çevirme: Dosya Boyutunu Küçültün | TRNCConvert",
      description: "PNG görsellerini daha küçük JPG dosyalarına çevirin. Kalite ayarını siz seçersiniz; saydam alanlar beyazla doldurulur. Hesap açmanız gerekmez.",
      h1: "PNG'yi JPG'ye çevirme",
      intro: "PNG dosyanızı yükleyin, kaliteyi seçin ve daha az yer kaplayan bir JPG indirin.",
      body: [
        "Ekran görüntüleri ve tasarım programlarından dışa aktarılan görseller çoğu zaman PNG olarak kaydedilir. PNG kayıpsız olduğu için fotoğraf içeren dosyalar büyük olur; bu da e-posta ekleri, form yüklemeleri ve web sayfaları için sorun çıkarabilir. JPG'ye çevirdiğinizde fotoğraflarda dosya boyutu genellikle belirgin şekilde küçülür. Bu araçta kalite ayarını seçerek boyut ile netlik arasındaki dengeyi kendiniz belirlersiniz.",
        "JPG saydamlığı desteklemez. PNG'nizde saydam bir arka plan varsa bu alanlar beyazla doldurulur; farklı renkli zeminlerde kullanılacak logo veya ikonlar için bu istenmeyen bir sonuç olabilir. Ayrıca metin ağırlıklı ekran görüntülerinde JPG sıkıştırması harflerin kenarlarında hafif bulanıklık yaratabilir; böyle görsellerde yüksek kalite seçmek iyi olur. Tek seferde 10 PNG dosyası yükleyebilir, hepsini ZIP olarak indirebilirsiniz."
      ],
      steps: ["PNG dosyanızı yükleyin.", "JPG kalitesini ayarlayın.", "Küçülen JPG dosyasını indirin."],
      faq: [
        { q: "PNG'yi JPG'ye çevirince dosya ne kadar küçülür?", a: "Bu, görselin içeriğine bağlıdır. Fotoğraflarda genellikle belirgin bir küçülme olur; düz renkli çizimlerde fark daha az olabilir." },
        { q: "Saydam PNG'yi JPG yapınca ne olur?", a: "JPG saydamlık taşıyamadığı için saydam alanlar beyaz renkle doldurulur." },
        { q: "Ekran görüntülerinde yazılar bulanıklaşır mı?", a: "Düşük kalitede harf kenarlarında hafif bozulma görülebilir. Metin içeren görsellerde yüksek kalite ayarını seçin." },
        { q: "Çevirdiğim dosyalar ne kadar süre tutuluyor?", a: "Hiçbir dosya kalıcı olarak saklanmaz. Yüklediğiniz PNG ve oluşan JPG 10 dakika içinde sunucudan otomatik olarak silinir." }
      ],
      related: ['jpg-png-cevirme', 'webp-jpg-cevirme', 'jpg-webp-cevirme', 'heic-jpg-cevirme', 'gorsel-donusturucu']
    },
    {
      slug: 'jpg-png-cevirme',
      type: 'convert',
      category: 'image',
      from: ['jpg', 'jpeg'],
      to: 'png',
      title: "JPG'yi PNG'ye Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "JPG ve JPEG fotoğraflarını PNG biçimine çevirin. PNG kayıpsız kaydedildiği için görseli sonradan düzenleyip kaydettiğinizde ek kalite kaybı oluşmaz.",
      h1: "JPG'yi PNG'ye çevirme",
      intro: "JPG veya JPEG görselinizi yükleyin ve kayıpsız bir PNG dosyası olarak indirin.",
      body: [
        "JPG her kaydedildiğinde yeniden sıkıştırılır ve bu tekrarlandıkça görselde bozulmalar birikebilir. Bir görseli birkaç kez düzenleyip kaydetmeyi planlıyorsanız PNG'ye çevirip o şekilde çalışmak, sonraki kayıtlarda ek kalite kaybını önler. Bazı web siteleri, baskı hizmetleri veya tasarım şablonları da yükleme için PNG ister. Bu araç JPG ve JPEG dosyalarını sharp ile okuyup PNG olarak kaydeder.",
        "PNG'ye çevirmek, JPG'de zaten kaybolmuş ayrıntıları geri getirmez; görsel olduğu gibi kayıpsız biçimde saklanır. Bu yüzden ortaya çıkan PNG çoğu zaman JPG'den daha büyük olur. Ayrıca JPG'de saydamlık olmadığı için PNG'ye çevirmek arka planı kendiliğinden saydam yapmaz; arka planı kaldırmak ayrı bir düzenleme işlemidir. Tek seferde 10 görsel yükleyip sonuçları ZIP olarak indirebilirsiniz."
      ],
      steps: ["JPG görselinizi yükleyin.", "Çıktı olarak PNG'yi seçin.", "PNG dosyasını indirin."],
      faq: [
        { q: "JPG'yi PNG yapınca arka plan saydam olur mu?", a: "Hayır. JPG'de saydam alan bulunmadığı için PNG çıktısının arka planı da dolu kalır. Arka planı kaldırmak için bir görsel düzenleme programı gerekir." },
        { q: "PNG'ye çevirmek kaliteyi artırır mı?", a: "Hayır. Kalite JPG'deki hâliyle kalır; PNG yalnızca bundan sonraki kayıtlarda ek kayıp oluşmasını önler." },
        { q: "Dosya boyutu neden arttı?", a: "PNG kayıpsız sıkıştırma kullandığı için fotoğraflar JPG'ye göre daha fazla yer kaplar. Bu, dönüştürmenin beklenen bir sonucudur." },
        { q: "JPEG uzantılı dosyalar da kabul ediliyor mu?", a: "Evet. JPG ve JPEG aynı biçimin iki farklı uzantısıdır; ikisi de yüklenebilir." }
      ],
      related: ['png-jpg-cevirme', 'webp-png-cevirme', 'jpg-webp-cevirme', 'jpg-pdf-cevirme', 'gorsel-donusturucu']
    },
    {
      slug: 'jpg-webp-cevirme',
      type: 'convert',
      category: 'image',
      from: ['jpg', 'jpeg', 'png'],
      to: 'webp',
      title: "JPG'yi WebP'ye Çevirme: Web İçin Küçük Görsel | TRNCConvert",
      description: "JPG ve PNG görsellerini WebP'ye çevirerek web siteniz için daha küçük dosyalar elde edin. Kalite ayarlanabilir, PNG'deki saydamlık korunur.",
      h1: "JPG'yi WebP'ye çevirme",
      intro: "JPG, JPEG veya PNG görsellerinizi yükleyin ve web'e uygun WebP dosyaları olarak indirin.",
      body: [
        "Web sitesi, blog veya e-ticaret mağazası yönetiyorsanız sayfadaki görsellerin boyutu açılış hızını doğrudan etkiler. WebP, benzer görüntü kalitesinde genellikle JPG ve PNG'den daha küçük dosyalar üretir ve güncel tarayıcılar tarafından desteklenir. Bu araç JPG, JPEG ve PNG dosyalarını sharp ile WebP'ye dönüştürür; kalite ayarıyla dosya boyutu ve netlik arasında seçim yapabilirsiniz.",
        "PNG'deki saydam arka planlar WebP'de de korunur, bu nedenle logo ve ikonlar için de kullanılabilir. Ürün fotoğraflarında orta düzey bir kalite çoğu zaman yeterli netliği daha küçük bir dosyayla sağlar; ayrıntının önemli olduğu görsellerde kaliteyi yükseltebilirsiniz. WebP'yi bazı eski masaüstü programları açamayabilir, bu yüzden orijinal dosyalarınızı saklamanız iyi olur. Tek seferde 10 görsel yükleyip ZIP olarak indirebilirsiniz."
      ],
      steps: ["JPG veya PNG görsellerinizi yükleyin.", "WebP kalitesini seçin.", "WebP dosyalarını indirin."],
      faq: [
        { q: "WebP her tarayıcıda açılır mı?", a: "Güncel Chrome, Firefox, Safari ve Edge sürümleri WebP'yi destekler. Bazı eski masaüstü programları ise bu dosyaları açamayabilir." },
        { q: "PNG'nin saydamlığı WebP'de kalır mı?", a: "Evet, WebP saydamlığı destekler ve PNG'deki saydam alanlar korunur." },
        { q: "Web sitem için hangi kaliteyi seçmeliyim?", a: "Çoğu sayfa görseli için orta düzey kalite yeterlidir ve dosyayı küçük tutar. Büyük kapak görselleri veya ayrıntılı ürün fotoğraflarında daha yüksek kaliteyi deneyin." },
        { q: "Orijinal JPG dosyama bir şey olur mu?", a: "Cihazınızdaki dosyaya dokunulmaz; yalnızca bir kopyası yüklenir. Sunucuya yüklenen kopya ve oluşan WebP 10 dakika içinde otomatik olarak silinir." }
      ],
      related: ['webp-jpg-cevirme', 'webp-png-cevirme', 'png-jpg-cevirme', 'avif-jpg-cevirme', 'gorsel-donusturucu']
    },
    {
      slug: 'avif-jpg-cevirme',
      type: 'convert',
      category: 'image',
      from: ['avif'],
      to: 'jpg',
      title: "AVIF'i JPG'ye Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "AVIF görsellerini her programda açılan JPG dosyalarına çevirin. Kalite ayarı seçilebilir, saydam alanlar beyazla doldurulur, hesap gerekmez.",
      h1: "AVIF'i JPG'ye çevirme",
      intro: "AVIF dosyanızı yükleyin ve uyumluluk sorunu yaşamadan kullanabileceğiniz bir JPG indirin.",
      body: [
        "AVIF, web sitelerinde giderek daha sık karşılaşılan ve yüksek sıkıştırma sağlayan yeni bir görsel biçimidir. Tarayıcılar bu dosyaları gösterebilse de bilgisayara kaydettiğinizde birçok fotoğraf görüntüleyici, ofis programı veya baskı hizmeti AVIF'i tanımayabilir. Bu araç AVIF dosyasını sharp ile çözer ve seçtiğiniz kalite ayarıyla JPG olarak kaydeder; böylece görseli belgelere ekleyebilir, paylaşabilir veya yazdırabilirsiniz.",
        "AVIF dosyaları çok küçük olduğu için JPG'ye çevrildiğinde dosya boyutu büyüyebilir. Bu normaldir, çünkü JPG daha eski ve daha az verimli bir sıkıştırma yöntemi kullanır. AVIF'te saydam alanlar varsa JPG'de beyazla doldurulur. Kaliteyi düşürmek dosyayı küçültür ama ayrıntı kaybını artırır. Tek seferde 10 AVIF dosyası yükleyebilir, sonuçları tek bir ZIP dosyası olarak indirebilirsiniz."
      ],
      steps: ["AVIF dosyanızı yükleyin.", "JPG kalitesini belirleyin.", "JPG görseli indirin."],
      faq: [
        { q: "AVIF nedir?", a: "AVIF, web'de görselleri küçük boyutta sunmak için geliştirilmiş yeni bir görsel biçimidir. Her program desteklemediği için JPG'ye çevirmek gerekebilir." },
        { q: "JPG dosyası neden AVIF'ten büyük?", a: "AVIF daha verimli bir sıkıştırma kullanır. Aynı görseli JPG olarak saklamak genellikle daha fazla yer gerektirir." },
        { q: "Saydam AVIF görseller ne olur?", a: "JPG saydamlığı desteklemediği için saydam alanlar beyazla doldurulur." },
        { q: "Dosyalarım nerede işleniyor?", a: "Dosyalar HTTPS üzerinden sunucuya yüklenir, orada dönüştürülür ve 10 dakika içinde otomatik olarak silinir. Hiçbir dosya saklanmaz veya paylaşılmaz." }
      ],
      related: ['webp-jpg-cevirme', 'heic-jpg-cevirme', 'png-jpg-cevirme', 'jpg-webp-cevirme', 'gorsel-donusturucu']
    },

    {
      slug: 'wav-mp3-cevirme',
      type: 'convert',
      category: 'audio',
      from: ['wav'],
      to: 'mp3',
      title: "WAV'ı MP3'e Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "Büyük WAV ses dosyalarını 128, 192 veya 320 kbps MP3'e çevirin. Parça adı ve sanatçı bilgisi korunur; hesap açmanız veya program kurmanız gerekmez.",
      h1: "WAV'ı MP3'e çevirme",
      intro: "WAV dosyanızı yükleyin, MP3 kalitesini seçin ve çok daha küçük bir ses dosyası indirin.",
      body: [
        "WAV, ses kayıt cihazları, ses kartları ve müzik programlarının sıkça kullandığı sıkıştırılmamış bir biçimdir. Kalitesi yüksektir ama birkaç dakikalık bir kayıt bile çok yer kaplar; bu da e-postayla göndermeyi, mesajlaşma uygulamalarında paylaşmayı veya telefonda saklamayı zorlaştırır. MP3'e çevirdiğinizde dosya boyutu belirgin şekilde küçülür ve dosya hemen her cihazda çalınabilir. Dönüştürme FFmpeg ile yapılır.",
        "Üç kalite seçeneği vardır: düşük 128 kbps, normal 192 kbps ve yüksek 320 kbps. Röportaj, ders veya toplantı kaydı gibi konuşma ağırlıklı kayıtlarda 128 kbps çoğu zaman yeterlidir. Kendi müzik kayıtlarınızı paylaşacaksanız 320 kbps ayrıntıyı daha iyi korur. MP3 kayıplı bir biçim olduğundan asıl WAV dosyanızı arşivde tutmanız önerilir. Dosyada başlık ve sanatçı bilgisi varsa MP3'e kopyalanır."
      ],
      steps: ["WAV dosyanızı yükleyin.", "MP3 kalitesini seçin.", "MP3 dosyasını indirin."],
      faq: [
        { q: "WAV'dan MP3'e geçince kalite düşer mi?", a: "MP3 kayıplı bir biçim olduğu için bir miktar ayrıntı atılır. 320 kbps seçtiğinizde bu fark çoğu dinleme koşulunda zor fark edilir." },
        { q: "Konuşma kaydı için hangi kalite yeterli?", a: "Konuşma ağırlıklı kayıtlarda 128 kbps genellikle yeterlidir ve en küçük dosyayı verir." },
        { q: "95 MB'tan büyük WAV dosyamı yükleyebilir miyim?", a: "Hayır, dosya başına sınır 95 MB'tır. Uzun kayıtları bir ses programında bölüp parça parça dönüştürebilirsiniz." },
        { q: "Etiket bilgileri korunuyor mu?", a: "Evet. WAV dosyasında başlık ve sanatçı gibi bilgiler varsa MP3 dosyasına kopyalanır." }
      ],
      related: ['mp3-wav-cevirme', 'flac-mp3-cevirme', 'm4a-mp3-cevirme', 'ogg-mp3-cevirme', 'ses-donusturucu']
    },
    {
      slug: 'm4a-mp3-cevirme',
      type: 'convert',
      category: 'audio',
      from: ['m4a', 'aac'],
      to: 'mp3',
      title: "M4A'yı MP3'e Çevirme: M4A ve AAC Dosyaları | TRNCConvert",
      description: "iPhone ses kayıtlarını ve diğer M4A veya AAC dosyalarını MP3'e çevirin. 128, 192 veya 320 kbps seçin; dosya her cihazda çalınabilir olsun.",
      h1: "M4A'yı MP3'e çevirme",
      intro: "M4A veya AAC ses dosyanızı yükleyin ve her cihazda çalan bir MP3 olarak indirin.",
      body: [
        "iPhone'daki Ses Kayıtları uygulaması ve birçok müzik kaynağı M4A ya da AAC biçimini kullanır. Bu dosyalar bazı araç radyolarında, eski MP3 çalarlarda, sunum programlarında veya web formlarında çalışmayabilir. Bir ders kaydını, röportajı ya da sesli notu paylaşmadan önce MP3'e çevirmek bu uyumluluk sorununu ortadan kaldırır. Dönüştürme FFmpeg ile yapılır ve MP3 için 128, 192 veya 320 kbps kalite seçebilirsiniz.",
        "M4A ve AAC zaten kayıplı biçimlerdir; MP3'e çevirmek, kayıplı bir dosyayı yeniden kayıplı bir biçime dönüştürmek anlamına gelir. Bu yüzden kaynağın kalitesinden daha yüksek bir sonuç elde edilemez. Kaliteyi korumak için müzikte 192 veya 320 kbps seçmek mantıklıdır; konuşma kayıtlarında ise 128 kbps yeterli olur. Parça adı ve sanatçı bilgisi MP3'e kopyalanır, böylece dosyalarınız çalarda doğru adla görünür."
      ],
      steps: ["M4A veya AAC dosyanızı yükleyin.", "MP3 bit hızını seçin.", "MP3 dosyasını indirin."],
      faq: [
        { q: "iPhone ses kaydımı MP3 yapabilir miyim?", a: "Evet. Ses Kayıtları uygulamasından paylaştığınız M4A dosyasını yükleyip MP3 olarak indirebilirsiniz." },
        { q: "AAC dosyaları da kabul ediliyor mu?", a: "Evet, M4A'nın yanı sıra AAC uzantılı dosyalar da MP3'e dönüştürülür." },
        { q: "Hangi bit hızını seçmeliyim?", a: "Konuşma kayıtları için 128 kbps yeterlidir. Müzikte 192 veya 320 kbps seçmek kaynaktaki ayrıntıyı daha iyi korur." },
        { q: "320 kbps seçince kalite artar mı?", a: "Hayır. Kaynak M4A dosyasında olmayan ayrıntı geri gelmez; yüksek bit hızı yalnızca mevcut kalitenin daha az kayıpla korunmasını sağlar." }
      ],
      related: ['wav-mp3-cevirme', 'ogg-mp3-cevirme', 'flac-mp3-cevirme', 'mp4-mp3-donusturucu', 'ses-donusturucu']
    },
    {
      slug: 'flac-mp3-cevirme',
      type: 'convert',
      category: 'audio',
      from: ['flac'],
      to: 'mp3',
      title: "FLAC'ı MP3'e Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "Kayıpsız FLAC müzik dosyalarını telefon ve araç için MP3'e çevirin. 320 kbps'ye kadar kalite seçin; parça adı ve sanatçı bilgisi korunur.",
      h1: "FLAC'ı MP3'e çevirme",
      intro: "FLAC dosyalarınızı yükleyin ve daha az yer kaplayan MP3 dosyaları olarak indirin.",
      body: [
        "FLAC, CD kalitesindeki müziği hiçbir ayrıntı kaybetmeden sıkıştıran kayıpsız bir biçimdir. Arşiv için idealdir ama dosyalar büyük olduğundan telefonda depolama alanını hızla doldurur. Ayrıca bazı araç ses sistemleri, eski çalarlar ve bazı uygulamalar FLAC'ı çalamaz. MP3'e çevirdiğinizde dosyalar küçülür ve neredeyse her cihazda çalınabilir hâle gelir. Dönüştürme FFmpeg ile yapılır.",
        "Müzik dinlemek için 320 kbps seçmeniz önerilir; bu, sitedeki en yüksek MP3 ayarıdır ve ayrıntıyı en az kayıpla saklar. Yer kazanmak daha önemliyse 192 kbps de dengeli bir seçimdir. Parça adı ve sanatçı gibi etiketler MP3'e kopyalanır, böylece müzik çalarınızda şarkılar doğru adla görünür. MP3 kayıplı olduğu için asıl FLAC arşivinizi silmeyin; daha sonra farklı bir biçime ihtiyaç duyarsanız yine kaynaktan dönüştürebilirsiniz."
      ],
      steps: ["FLAC dosyalarınızı yükleyin.", "MP3 kalitesini seçin.", "MP3 dosyalarını indirin."],
      faq: [
        { q: "FLAC'tan MP3'e geçince ne kaybolur?", a: "MP3 kayıplı bir biçim olduğu için bazı ayrıntılar atılır. 320 kbps'de bu kayıp en aza iner ve günlük dinlemede çoğu zaman fark edilmez." },
        { q: "Şarkı adları korunur mu?", a: "Evet, parça adı ve sanatçı bilgisi MP3'e kopyalanır." },
        { q: "Bütün albümü tek seferde çevirebilir miyim?", a: "Tek seferde 10 dosya yükleyebilirsiniz. Daha uzun albümleri birkaç parti hâlinde dönüştürüp her partiyi ZIP olarak indirebilirsiniz." },
        { q: "Dönüştürdükten sonra FLAC dosyamı silmeli miyim?", a: "Önerilmez. FLAC kayıpsız ana kopyanızdır; MP3'ten tekrar FLAC kalitesine dönmek mümkün değildir." }
      ],
      related: ['wav-mp3-cevirme', 'm4a-mp3-cevirme', 'ogg-mp3-cevirme', 'mp3-wav-cevirme', 'ses-donusturucu']
    },
    {
      slug: 'ogg-mp3-cevirme',
      type: 'convert',
      category: 'audio',
      from: ['ogg', 'opus'],
      to: 'mp3',
      title: "OGG'yi MP3'e Çevirme: OGG ve Opus Dosyaları | TRNCConvert",
      description: "Sesli mesajlar gibi OGG ve Opus ses dosyalarını her cihazda çalan MP3'e çevirin. MP3 için 128, 192 veya 320 kbps kalite seçebilirsiniz.",
      h1: "OGG'yi MP3'e çevirme",
      intro: "OGG veya Opus ses dosyanızı yükleyin ve MP3 olarak indirin.",
      body: [
        "OGG ve Opus, açık kaynaklı ve verimli ses biçimleridir. Bazı mesajlaşma uygulamalarının sesli mesajları, oyun ses dosyaları ve bazı kayıt programlarının çıktıları bu biçimlerde olabilir. Ancak birçok müzik çalar, video düzenleme programı ve web formu bu dosyaları kabul etmez. Bir sesli mesajı arşivlemek, bir videoya eklemek veya başka bir cihazda dinlemek için MP3'e çevirmek pratik bir çözümdür. Dönüştürme FFmpeg ile yapılır.",
        "Sesli mesaj ve konuşma kayıtları için 128 kbps fazlasıyla yeterlidir. Opus zaten düşük bit hızlarında konuşmayı iyi saklayan bir biçimdir, bu yüzden daha yüksek bir ayar dosyayı gereksiz yere büyütür. Müzik içeren OGG dosyalarında 192 veya 320 kbps seçebilirsiniz. Her iki biçim de kayıplı olduğu için dönüştürme kaynaktaki kaliteyi artırmaz. Parça adı ve sanatçı bilgisi varsa MP3'e kopyalanır."
      ],
      steps: ["OGG veya Opus dosyanızı yükleyin.", "MP3 kalitesini seçin.", "MP3 dosyasını indirin."],
      faq: [
        { q: "Sesli mesajları MP3 yapabilir miyim?", a: "Evet. Mesajlaşma uygulamasından dışa aktardığınız OGG veya Opus dosyasını yükleyip MP3 olarak indirebilirsiniz." },
        { q: "Opus dosyası nedir?", a: "Opus, özellikle konuşma ve internet üzerinden ses iletimi için geliştirilmiş kayıplı bir ses biçimidir. Genellikle .opus veya .ogg uzantısıyla karşınıza çıkar." },
        { q: "Neden 320 kbps seçmemeliyim?", a: "Seçebilirsiniz, ancak sesli mesajlarda kaynak kalite zaten sınırlı olduğundan sonuç iyileşmez, yalnızca dosya büyür. Konuşma için 128 kbps yeterlidir." },
        { q: "Dosyam neden kabul edilmiyor?", a: "Bu sayfa yalnızca .ogg ve .opus uzantılı dosyaları kabul eder ve dosya başına sınır 95 MB'tır. Farklı bir ses biçimi için ses dönüştürücü sayfasını kullanın." }
      ],
      related: ['m4a-mp3-cevirme', 'wav-mp3-cevirme', 'flac-mp3-cevirme', 'mp3-wav-cevirme', 'ses-donusturucu']
    },
    {
      slug: 'mp3-wav-cevirme',
      type: 'convert',
      category: 'audio',
      from: ['mp3'],
      to: 'wav',
      title: "MP3'ü WAV'a Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "MP3 dosyalarını 16 bit PCM WAV biçimine çevirin. Ses düzenleme programları, video projeleri ve yalnızca WAV kabul eden cihazlar için kullanışlıdır.",
      h1: "MP3'ü WAV'a çevirme",
      intro: "MP3 dosyanızı yükleyin ve 16 bit PCM WAV olarak indirin.",
      body: [
        "Bazı ses düzenleme programları, video kurgu projeleri, santral anons sistemleri ve örnekleme tabanlı müzik cihazları yalnızca WAV dosyası kabul eder. Elinizde sadece MP3 varsa bu araçla dosyayı 16 bit PCM WAV biçimine çevirebilirsiniz. Bu, en yaygın desteklenen WAV türüdür. Dönüştürme FFmpeg ile yapılır; parça adı ve sanatçı bilgisi varsa yeni dosyaya kopyalanır.",
        "Burada bilinmesi gereken önemli bir nokta var: WAV kayıpsız bir biçimdir ama MP3 sıkıştırması sırasında atılmış ayrıntılar geri gelmez. Yani ortaya çıkan WAV, MP3 ile aynı ses kalitesindedir; yalnızca sıkıştırılmadan saklanır. Bu nedenle dosya boyutu MP3'e göre çok daha büyük olur. Dönüştürmenin amacı kaliteyi artırmak değil, WAV isteyen bir program veya cihazla uyumluluk sağlamaktır."
      ],
      steps: ["MP3 dosyanızı yükleyin.", "Çıktı olarak WAV'ı seçin.", "WAV dosyasını indirin."],
      faq: [
        { q: "MP3'ü WAV yapmak ses kalitesini artırır mı?", a: "Hayır. MP3'te kaybolmuş ayrıntılar geri gelmez; WAV yalnızca mevcut sesi sıkıştırmadan saklar." },
        { q: "WAV dosyası neden bu kadar büyük?", a: "WAV sıkıştırılmamış 16 bit PCM ses içerir. Aynı süre için MP3'e göre çok daha fazla yer kaplaması normaldir." },
        { q: "Hangi WAV türü oluşturuluyor?", a: "Çıktı 16 bit PCM WAV'dır. Bu tür, ses ve video düzenleme programlarının büyük çoğunluğunda açılır." },
        { q: "Birden fazla MP3'ü aynı anda çevirebilir miyim?", a: "Evet, en fazla 10 dosya yükleyebilirsiniz ve WAV'lar tek bir ZIP olarak iner. WAV dosyaları büyük olduğu için ZIP'in boyutu da büyük olabilir." }
      ],
      related: ['wav-mp3-cevirme', 'flac-mp3-cevirme', 'm4a-mp3-cevirme', 'ogg-mp3-cevirme', 'ses-donusturucu']
    },

    {
      slug: 'mp4-mp3-donusturucu',
      type: 'convert',
      category: 'video',
      from: ['mp4', 'mov', 'mkv', 'webm', 'avi'],
      to: 'mp3',
      title: "MP4'ten MP3'e Dönüştürücü: Videodan Ses Alma | TRNCConvert",
      description: "MP4, MOV, MKV, WebM ve AVI videolarının sesini MP3 olarak kaydedin. Yalnızca ses kanalı alınır; 128, 192 veya 320 kbps kalite seçebilirsiniz.",
      h1: "MP4'ten MP3'e dönüştürücü",
      intro: "Video dosyanızı yükleyin; görüntü atılsın, yalnızca ses MP3 olarak insin.",
      body: [
        "Bir konferans kaydını yolda dinlemek, bir dersin sesini not almak için saklamak ya da kendi çektiğiniz bir videonun müziğini ayrı kullanmak istediğinizde videonun yalnızca sesine ihtiyaç duyarsınız. Bu araç MP4, MOV, MKV, WebM ve AVI dosyalarındaki ses kanalını FFmpeg ile çıkarır ve MP3 olarak kaydeder. Görüntü kullanılmadığı için ortaya çıkan dosya videodan çok daha küçüktür.",
        "MP3 için düşük 128 kbps, normal 192 kbps ve yüksek 320 kbps seçenekleri vardır. Konuşma ağırlıklı videolarda 128 kbps yeterlidir; müzik içeren videolarda daha yüksek bir ayar seçebilirsiniz. Video dosyası 95 MB'tan büyük olamaz; uzun ve yüksek çözünürlüklü kayıtlarda bu sınıra çabuk ulaşılır. Dönüştürme süresi videonun uzunluğuna bağlıdır ve sayfa ilerlemeyi gösterir. Yalnızca hakkına sahip olduğunuz veya kullanma izniniz bulunan içerikleri dönüştürün."
      ],
      steps: ["Video dosyanızı yükleyin.", "MP3 kalitesini seçin.", "Ses dosyasını indirin."],
      faq: [
        { q: "Görüntü tamamen atılıyor mu?", a: "Evet. Yalnızca ses kanalı MP3'e aktarılır; görüntü dosyaya dahil edilmez." },
        { q: "MOV veya MKV videoların sesini de alabilir miyim?", a: "Evet. MP4'ün yanı sıra MOV, MKV, WebM ve AVI dosyaları da kabul edilir." },
        { q: "Ders kaydı için hangi kalite yeterli?", a: "Konuşma ağırlıklı kayıtlar için 128 kbps yeterlidir ve en küçük dosyayı verir. Müzik varsa 192 veya 320 kbps seçin." },
        { q: "Dönüştürme ne kadar sürer?", a: "Süre videonun uzunluğuna bağlıdır. Sayfa ilerlemeyi gösterir; işlem bitene kadar sekmeyi açık tutmanız yeterlidir." }
      ],
      related: ['video-donusturucu', 'ses-donusturucu', 'mov-mp4-cevirme', 'm4a-mp3-cevirme', 'mp4-gif-cevirme']
    },
    {
      slug: 'mov-mp4-cevirme',
      type: 'convert',
      category: 'video',
      from: ['mov'],
      to: 'mp4',
      title: "MOV'u MP4'e Çevirme: iPhone Videoları | TRNCConvert",
      description: "iPhone ve kameralardan gelen MOV videolarını H.264 ve AAC ile MP4'e çevirin. Video telefonlarda, bilgisayarlarda ve tarayıcılarda oynatılır.",
      h1: "MOV'u MP4'e çevirme",
      intro: "MOV videonuzu yükleyin ve telefonlarda, bilgisayarlarda ve web'de oynayan bir MP4 olarak indirin.",
      body: [
        "iPhone, Mac ekran kayıtları ve birçok fotoğraf makinesi videoları MOV biçiminde kaydeder. MOV dosyaları Windows bilgisayarlarda, Android telefonlarda, bazı akıllı televizyonlarda veya video yükleme formlarında sorun çıkarabilir. MP4 ise neredeyse her yerde oynatılır. Bu araç MOV dosyasını FFmpeg ile H.264 görüntü ve AAC sesten oluşan bir MP4'e dönüştürür, böylece videoyu paylaşırken karşı tarafın hangi cihazı kullandığını düşünmeniz gerekmez.",
        "Çıktı web dostu ayarlarla hazırlanır; bu sayede video telefonlarda açılır ve bir web sayfasına eklendiğinde tamamı inmeden oynamaya başlayabilir. Düşük, normal ve yüksek kalite seçenekleriyle dosya boyutu ile görüntü netliği arasında tercih yapabilirsiniz. Yüksek çözünürlüklü iPhone videoları daha uzun sürede işlenir ve 95 MB sınırına hızla ulaşabilir; bu araç özellikle kısa klipler için uygundur."
      ],
      steps: ["MOV videonuzu yükleyin.", "Kalite seviyesini seçin.", "MP4 videoyu indirin."],
      faq: [
        { q: "iPhone videom neden Windows'ta açılmıyor?", a: "iPhone videoları MOV biçiminde ve çoğu zaman HEVC ile kaydedilir; bazı Windows sistemleri ek eklenti olmadan bunları oynatamaz. H.264 kodlu bir MP4'e çevirmek bu sorunu çözer." },
        { q: "Kalite seçenekleri ne anlama geliyor?", a: "Düşük kalite daha küçük dosya, yüksek kalite daha net görüntü üretir. Paylaşım için normal kalite çoğu zaman dengeli bir seçimdir." },
        { q: "Videonun sesi de korunuyor mu?", a: "Evet, ses AAC olarak MP4'e eklenir." },
        { q: "Video çok büyükse ne yapmalıyım?", a: "Dosya başına sınır 95 MB'tır. Daha büyük videoları telefonunuzda kırparak veya daha düşük çözünürlükte kaydederek bu sınırın altına indirebilirsiniz." }
      ],
      related: ['mkv-mp4-cevirme', 'webm-mp4-cevirme', 'avi-mp4-cevirme', 'mp4-gif-cevirme', 'video-donusturucu']
    },
    {
      slug: 'mkv-mp4-cevirme',
      type: 'convert',
      category: 'video',
      from: ['mkv'],
      to: 'mp4',
      title: "MKV'yi MP4'e Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "MKV videolarını telefon, tablet ve akıllı TV'de oynayan MP4'e çevirin. Çıktı H.264 görüntü ve AAC ses ile web dostu ayarlarla hazırlanır.",
      h1: "MKV'yi MP4'e çevirme",
      intro: "MKV dosyanızı yükleyin ve daha geniş cihaz desteğine sahip bir MP4 olarak indirin.",
      body: [
        "MKV, birden fazla ses ve altyazı kanalını tek dosyada taşıyabilen esnek bir kapsayıcı biçimdir. Bilgisayardaki medya oynatıcılarda sorunsuz çalışsa da telefonlar, tabletler, bazı akıllı televizyonlar ve video düzenleme programları MKV'yi her zaman açamaz. Bu araç MKV dosyasını FFmpeg ile H.264 görüntü ve AAC ses içeren bir MP4'e dönüştürür, böylece video çok daha fazla cihazda oynatılabilir.",
        "MP4 çıktısı web dostu ayarlarla oluşturulur; video bir web sayfasında tamamı inmeden oynamaya başlayabilir. Düşük, normal ve yüksek kalite seçenekleri dosya boyutunu ve görüntü netliğini belirler. MKV dosyaları çoğu zaman uzun ve yüksek çözünürlüklü olduğu için dönüştürme zaman alabilir; sayfa ilerlemeyi gösterir. Dosya başına 95 MB sınırı bulunduğundan bu araç kısa kayıtlar ve klipler için daha uygundur."
      ],
      steps: ["MKV dosyanızı yükleyin.", "Kalite seviyesini belirleyin.", "MP4 videoyu indirin."],
      faq: [
        { q: "MKV ile MP4 arasındaki fark nedir?", a: "İkisi de görüntü ve sesi bir arada tutan kapsayıcı biçimlerdir. MP4 cihazlar ve programlar arasında çok daha yaygın desteklenir; MKV ise daha esnek ama daha az uyumludur." },
        { q: "Telefonumda MKV açılmıyor, bu araç çözer mi?", a: "Evet. H.264 ve AAC içeren MP4 dosyaları güncel telefonların yerleşik oynatıcısıyla açılır." },
        { q: "İşlem sırasında sayfayı kapatabilir miyim?", a: "Hayır, işlem bitene kadar sekmeyi açık tutun. Sayfa ilerlemeyi gösterir ve dönüştürme tamamlanınca dosyayı indirebilirsiniz." },
        { q: "Dosya boyutu sınırı nedir?", a: "Her dosya en fazla 95 MB olabilir. Bu sınırı aşan MKV dosyaları yüklenemez." }
      ],
      related: ['mov-mp4-cevirme', 'webm-mp4-cevirme', 'avi-mp4-cevirme', 'mp4-mp3-donusturucu', 'video-donusturucu']
    },
    {
      slug: 'webm-mp4-cevirme',
      type: 'convert',
      category: 'video',
      from: ['webm'],
      to: 'mp4',
      title: "WebM'i MP4'e Çevirme: Ücretsiz ve Online | TRNCConvert",
      description: "WebM videolarını ve tarayıcı ekran kayıtlarını H.264 ve AAC ile MP4'e çevirin. Dosya iPhone'da, sunumlarda ve düzenleme programlarında açılır.",
      h1: "WebM'i MP4'e çevirme",
      intro: "WebM videonuzu yükleyin ve hemen her cihazda açılan bir MP4 olarak indirin.",
      body: [
        "WebM, tarayıcıların ve web tabanlı ekran kayıt araçlarının sıkça kullandığı bir video biçimidir. Bir toplantıyı, eğitimi veya hata bildirimini tarayıcıda kaydettiğinizde dosya çoğu zaman WebM olarak iner. Bu dosyalar bazı telefonlarda, sunum programlarında ve video düzenleyicilerde açılmayabilir. Bu araç WebM videoyu FFmpeg ile H.264 görüntü ve AAC sesten oluşan bir MP4'e çevirir.",
        "MP4 çıktısı web dostu ayarlarla hazırlanır; telefonlarda oynatılır ve tamamı inmeden başlayabilir. Ekran kayıtlarında yazıların okunaklı kalması için normal veya yüksek kalite seçmek iyi olur; düşük kalite daha küçük dosya verir ama ince metinler bulanıklaşabilir. Kaydın sesi de AAC olarak MP4'e aktarılır. Kısa bir bölümü hareketli görsel olarak paylaşmak isterseniz MP4'ten GIF'e aracına da göz atabilirsiniz."
      ],
      steps: ["WebM dosyanızı yükleyin.", "Kalite seviyesini seçin.", "MP4 videoyu indirin."],
      faq: [
        { q: "Ekran kaydım neden WebM olarak indi?", a: "Tarayıcı tabanlı kayıt araçlarının çoğu videoyu WebM olarak kaydeder. MP4'e çevirdiğinizde dosyayı daha fazla program ve cihazda kullanabilirsiniz." },
        { q: "Ekran kaydındaki yazılar bulanık olur mu?", a: "Düşük kalitede ince metinler bulanıklaşabilir. Okunaklılık önemliyse normal veya yüksek kaliteyi seçin." },
        { q: "Kaydın sesi de aktarılıyor mu?", a: "Evet, WebM dosyasındaki ses AAC olarak MP4'e eklenir." },
        { q: "MP4 dosyası iPhone'da açılır mı?", a: "Evet. H.264 ve AAC içeren MP4 dosyaları iPhone'un yerleşik oynatıcısında açılır." }
      ],
      related: ['mov-mp4-cevirme', 'mkv-mp4-cevirme', 'avi-mp4-cevirme', 'mp4-gif-cevirme', 'video-donusturucu']
    },
    {
      slug: 'avi-mp4-cevirme',
      type: 'convert',
      category: 'video',
      from: ['avi', 'wmv'],
      to: 'mp4',
      title: "AVI'yi MP4'e Çevirme: AVI ve WMV Videolar | TRNCConvert",
      description: "Eski AVI ve WMV videolarınızı günümüz cihazlarında oynayan MP4'e çevirin. Çıktı H.264 ve AAC kullanır, kalite düzeyini siz seçersiniz.",
      h1: "AVI'yi MP4'e çevirme",
      intro: "AVI veya WMV videonuzu yükleyin ve telefonda, tablette ve tarayıcıda oynayan bir MP4 olarak indirin.",
      body: [
        "Eski dijital kameralardan, Windows Movie Maker projelerinden veya yıllar önce kaydedilmiş arşivlerden kalan videolar çoğu zaman AVI ya da WMV biçimindedir. Bu biçimler telefonlarda, Mac bilgisayarlarda ve web sitelerinde genellikle oynatılmaz. Aile videolarını paylaşmak veya buluta yüklemek için MP4'e çevirmek en uygun yoldur. Bu araç dosyayı FFmpeg ile H.264 görüntü ve AAC sese dönüştürür.",
        "MP4 çıktısı web dostu ayarlarla oluşturulur; video telefonlarda açılır ve internette tamamı inmeden oynamaya başlayabilir. Düşük, normal ve yüksek kalite seçenekleri arasında tercih yapabilirsiniz. Eski videolar zaten düşük çözünürlükte olduğundan yüksek kalite seçmek görüntüyü iyileştirmez, yalnızca kaynaktaki kalitenin korunmasına yardımcı olur. Dosya başına sınır 95 MB'tır ve tek seferde 10 video yüklenebilir."
      ],
      steps: ["AVI veya WMV videonuzu yükleyin.", "Kalite seviyesini seçin.", "MP4 videoyu indirin."],
      faq: [
        { q: "WMV dosyaları da kabul ediliyor mu?", a: "Evet, bu sayfa AVI'nin yanı sıra WMV videolarını da MP4'e çevirir." },
        { q: "Eski videomun görüntüsü iyileşir mi?", a: "Hayır. Dönüştürme biçimi değiştirir ama kaynakta olmayan çözünürlük veya netliği eklemez." },
        { q: "Neden MP4'e çevirmeliyim?", a: "MP4, telefonlar, tabletler, akıllı televizyonlar ve tarayıcılar tarafından en yaygın desteklenen video biçimidir. AVI ve WMV ise birçok yeni cihazda açılmaz." },
        { q: "Videoları tek tek mi yüklemeliyim?", a: "Hayır, tek seferde 10 videoya kadar yükleyebilirsiniz. Birden fazla sonuç tek bir ZIP dosyası olarak indirilir." }
      ],
      related: ['mov-mp4-cevirme', 'mkv-mp4-cevirme', 'webm-mp4-cevirme', 'mp4-mp3-donusturucu', 'video-donusturucu']
    },
    {
      slug: 'mp4-gif-cevirme',
      type: 'convert',
      category: 'video',
      from: ['mp4', 'mov', 'webm'],
      to: 'gif',
      title: "MP4'ü GIF'e Çevirme: Videodan Hareketli GIF | TRNCConvert",
      description: "MP4, MOV ve WebM videolarının ilk 30 saniyesini hareketli GIF'e çevirin. GIF en fazla 480 piksel genişlikte, saniyede 12 kare ve sessizdir.",
      h1: "MP4'ü GIF'e çevirme",
      intro: "Kısa bir video yükleyin; ilk 30 saniyesi sessiz, hareketli bir GIF'e dönüşsün.",
      body: [
        "GIF, ses gerektirmeyen kısa hareketli görüntüleri paylaşmak için yaygın olarak kullanılan bir biçimdir. Bir uygulamanın nasıl kullanıldığını gösteren kısa bir ekran kaydını, bir ürünün dönen görüntüsünü veya komik bir anı e-postaya, belgeye, sohbete ya da forum gönderisine eklemek için tercih edilir. Bu araç MP4, MOV ve WebM videolarını FFmpeg ile GIF'e çevirir; video oynatıcı gerektirmeden çoğu yerde doğrudan görüntülenir.",
        "GIF biçimi büyük dosyalar üretme eğiliminde olduğu için bazı sınırlar uygulanır: videonun en fazla ilk 30 saniyesi alınır, görüntü en çok 480 piksel genişliğe küçültülür ve saniyede 12 kare kullanılır. GIF ses taşıyamadığı için sonuç sessizdir. Daha derli toplu bir sonuç için videoyu önceden yalnızca göstermek istediğiniz bölüm kalacak şekilde kırpın. Ses de gerekiyorsa videoyu MP4 olarak paylaşmak daha doğru olur."
      ],
      steps: ["Kısa videonuzu yükleyin.", "Çıktı olarak GIF'i seçin.", "Hareketli GIF'i indirin."],
      faq: [
        { q: "GIF ne kadar uzun olabilir?", a: "Videonun en fazla ilk 30 saniyesi GIF'e dönüştürülür. Başka bir bölümü kullanmak istiyorsanız videoyu önce o kısmı içerecek şekilde kırpın." },
        { q: "GIF'te ses olur mu?", a: "Hayır, GIF biçimi ses desteklemez. Sesli bir klip için MP4 kullanmanız gerekir." },
        { q: "GIF'in boyutu ve akıcılığı nasıl?", a: "GIF en fazla 480 piksel genişliğinde ve saniyede 12 kareyle oluşturulur. Bu ayarlar dosya boyutunu paylaşılabilir düzeyde tutmak içindir." },
        { q: "Hangi video biçimlerini GIF yapabilirim?", a: "MP4, MOV ve WebM videoları kabul edilir. AVI veya MKV videonuz varsa önce MP4'e çevirebilirsiniz." }
      ],
      related: ['mp4-mp3-donusturucu', 'mov-mp4-cevirme', 'webm-mp4-cevirme', 'video-donusturucu', 'gorsel-donusturucu']
    }
  ]
};

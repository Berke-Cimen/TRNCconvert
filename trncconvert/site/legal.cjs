"use strict";

const REPO = "https://github.com/Berke-Cimen/TRNCconvert";

module.exports = {
  REPO,
  pages: [
    {
      slug: "hakkinda",
      title: "Hakkında: TRNCConvert Nasıl Çalışır | TRNCConvert",
      description: "TRNCConvert'in kim tarafından, hangi açık kaynak araçlarla geliştirildiğini ve dosyalarınızı nasıl işlediğini öğrenin.",
      h1: "TRNCConvert hakkında",
      sections: [
        { p: [
          "TRNCConvert, KKTC'de geliştirilen ücretsiz bir dosya dönüştürme sitesidir. Belge, görsel, ses ve video dosyalarını tarayıcıdan dönüştürmeyi ve şifresini bildiğiniz dosyalardan şifreyi kaldırmayı sağlar. Hesap, abonelik ya da reklam yoktur.",
          "Sitenin kaynak kodu GitHub'da herkese açıktır. Dosyalarınıza ne yapıldığını merak eden herkes kodu inceleyebilir, hata bildirebilir ya da öneride bulunabilir.",
        ] },
        { h: "Kullanılan açık kaynak araçlar", list: [
          "Belgeler: LibreOffice",
          "PDF'den Word'e dönüşüm: pdf2docx ve PyMuPDF",
          "Görseller: sharp (libvips) ve Pillow",
          "Ses ve video: FFmpeg",
          "PDF şifre kaldırma: pikepdf (qpdf)",
          "Word, Excel ve PowerPoint şifre kaldırma: msoffcrypto-tool",
        ] },
        { h: "Dosyalarınız nasıl işlenir", p: [
          "Yüklediğiniz dosya sunucumuzda geçici bir klasöre kaydedilir, seçtiğiniz araçla dönüştürülür ve sonuç size indirme bağlantısıyla sunulur. Yüklenen ve dönüştürülen dosyalar en geç 10 dakika içinde otomatik olarak silinir. Dosyalar başka hiçbir amaçla kullanılmaz, incelenmez ve paylaşılmaz.",
        ] },
        { h: "İletişim", p: [
          "Hata bildirimleri ve öneriler için GitHub üzerindeki proje sayfasında bir kayıt (issue) açabilirsiniz.",
        ] },
      ],
    },
    {
      slug: "gizlilik",
      title: "Gizlilik Politikası ve KVKK Aydınlatma Metni | TRNCConvert",
      description: "TRNCConvert'in hangi verileri işlediği, dosyaların ne zaman silindiği ve şifrelerin nasıl korunduğu hakkında gizlilik ve KVKK aydınlatma metni.",
      h1: "Gizlilik politikası",
      sections: [
        { p: [
          "Bu metin, TRNCConvert'i kullanırken hangi verilerin işlendiğini açıklar. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), KKTC 89/2007 sayılı Kişisel Verilerin Korunması Yasası ve AB Genel Veri Koruma Tüzüğü (GDPR) kapsamındaki aydınlatma yükümlülüğü için hazırlanmıştır.",
        ] },
        { h: "Yüklediğiniz dosyalar", list: [
          "Dosyalar yalnızca istediğiniz dönüşümü ya da şifre kaldırma işlemini yapmak için kullanılır.",
          "Yüklenen ve üretilen dosyalar en geç 10 dakika içinde sunucudan otomatik olarak silinir.",
          "Dosyaların içeriği incelenmez, kopyalanmaz, yedeklenmez ve üçüncü kişilerle paylaşılmaz.",
          "İndirme bağlantıları rastgele ve tahmin edilemez anahtarlar içerir; yalnızca size gösterilir.",
        ] },
        { h: "Şifreler", list: [
          "Şifre kaldırma araçlarına girdiğiniz şifre yalnızca o işlem sırasında bellekte kullanılır.",
          "Şifreler diske yazılmaz, kayıtlara (log) geçmez ve işlem bitince saklanmaz.",
          "Araç şifre kırmaz ya da tahmin etmez; yalnızca girdiğiniz şifreyi dener.",
        ] },
        { h: "Teknik kayıtlar", p: [
          "Kötüye kullanımı önlemek için IP adresiniz, kısa süreli istek sınırlaması amacıyla yalnızca bellekte en fazla 10 dakika tutulur. Uygulamanın kendi kayıtlarında işin türü (ör. PDF'den Word'e), süresi ve sonucu yer alır; dosya adı, dosya içeriği, IP adresi ve şifre yer almaz.",
          "Site çerez kullanmaz. Açık ya da koyu tema tercihiniz yalnızca tarayıcınızın yerel depolamasında saklanır ve sunucuya gönderilmez. Analiz, reklam ya da takip aracı kullanılmaz. Yazı tipleri sitenin kendi sunucusundan yüklenir; Google gibi üçüncü taraflara istek yapılmaz.",
        ] },
        { h: "Altyapı", p: [
          "Site Cloudflare üzerinden yayınlanır. Cloudflare, bağlantıyı HTTPS ile şifreler ve saldırılara karşı koruma sağlar; bu sırada teknik bağlantı verilerini kendi politikasına göre işleyebilir.",
        ] },
        { h: "Haklarınız", p: [
          "KVKK'nın 11. maddesi ve ilgili mevzuat kapsamındaki taleplerinizi GitHub proje sayfası üzerinden iletebilirsiniz. Dosyalar en geç 10 dakika içinde silindiğinden, bu süreden sonra sizinle ilişkilendirilebilecek bir dosya ya da kayıt bulunmaz.",
        ] },
      ],
    },
    {
      slug: "kullanim-sartlari",
      title: "Kullanım Şartları | TRNCConvert",
      description: "TRNCConvert dönüştürme ve şifre kaldırma araçlarının kullanım şartları: dosya hakları, sınırlar ve sorumluluk.",
      h1: "Kullanım şartları",
      sections: [
        { p: [
          "TRNCConvert'i kullanarak aşağıdaki şartları kabul etmiş olursunuz.",
        ] },
        { h: "Dosyalar ve haklar", list: [
          "Yalnızca sahibi olduğunuz ya da kullanma yetkiniz bulunan dosyaları yükleyin.",
          "Şifre kaldırma araçları yalnızca bildiğiniz şifreyle çalışır. Başkasına ait korumalı dosyalara izinsiz erişmek için kullanılamaz.",
          "Yasalara aykırı içerik yüklemek yasaktır.",
        ] },
        { h: "Sınırlar", list: [
          "Dosya başına en fazla 95 MB ve tek seferde en fazla 10 dosya yüklenebilir.",
          "Kötüye kullanımı önlemek için IP başına istek sınırı uygulanır.",
          "Şifre kaldırmada üç yanlış denemeden sonra dosya silinir.",
        ] },
        { h: "Sorumluluk", p: [
          "Hizmet ücretsizdir ve olduğu gibi sunulur. Dönüşüm sonuçlarının her zaman kusursuz olacağı garanti edilmez; önemli dosyaların orijinalini saklamanızı öneririz. Dosyalar 10 dakika içinde silindiği için sonuçları zamanında indirmeniz gerekir.",
        ] },
      ],
    },
  ],
};

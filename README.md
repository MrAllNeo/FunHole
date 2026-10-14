# FunHole 🕳️

Uzayda bir kara deliksin. Senden küçük olan her şeyi yut, büyü, **SIZE UP** al ve sonunda galaksileri yutup evrenin sonu ol!

Kurulum gerektirmez: saf HTML + Canvas + JavaScript, harici kütüphane veya görsel dosyası yok.

## Oynamak

- `index.html` dosyasını tarayıcıda aç, ya da bir statik sunucuyla servis et:
  ```bash
  python3 -m http.server 8000
  # http://localhost:8000
  ```
- GitHub Pages ile de doğrudan yayınlanabilir (kök dizindeki `index.html`).

## Kontroller

| Platform | Kontrol |
|----------|---------|
| Masaüstü | Fare imlecine doğru gider (WASD / ok tuşları da çalışır) |
| Mobil    | Ekranın herhangi bir yerine dokunup sürükle (sanal joystick) |

## Seviyeler

| # | İsim | Yiyebileceklerin |
|---|------|------------------|
| 1 | Mikro Kara Delik | Toz, çakıl, vida, çorap, konserve, eldiven… |
| 2 | Çöp Süpürgesi | Astronotlar, uydular, roket parçaları |
| 3 | Uydu Avcısı | Asteroitler, roketler, UFO'lar |
| 4 | İstasyon Yutucu | Uzay istasyonları, dev lazer uydular |
| 5 | Ay Öğütücü | Kuyruklu yıldızlar, aylar |
| 6 | Gezegen Yiyen | Kayalık gezegenler |
| 7 | Dev Avcısı | Halkalı gaz devleri |
| 8 | Yıldız Yutan | Yıldızlar |
| 9 | Galaksi Canavarı | Kırmızı devler, galaksiler |
| 10 | Evrenin Sonu | Her şey 🌌 |

Kırmızı kesikli halkayla işaretlenen cisimler senden büyüktür; çarparsan seni iter.
Art arda hızlı yemek **kombo** çarpanı verir.

## Rakip kara delikler

Her rakibin bir adı ve kendi renkli diski var (Vakum, Kara Kurt, Obur, Girdap…).

- **Kim kimi yer:** yarıçapı diğerinin %90'ından küçük olan, büyüğün merkezine girerse yutulur. Bu kural sen, rakipler ve cisimler için aynıdır. Benzer boydakiler birbirini iter.
- **Davranış:** senden büyükse seni avlar (gideceğin yeri tahmin eder ama senden biraz yavaştır, bir süre sonra pes eder), senden küçükse kaçar, yoksa yem toplayıp büyür. Rakipler birbirini de yer.
- Büyük bir rakibin yakınındaysan seni kendine çeker. Yutulursan oyun biter.
- İsim rengi ve ekran kenarındaki oklar: **kırmızı** tehlikeli, **yeşil** yenebilir.
- 1. seviyedeki rakip asla senden büyük olamaz; sayıları ve saldırganlıkları seviyeyle artar.

## Tehlikeler

| Tehlike | Ne yapar | Nasıl başa çıkılır |
|---------|----------|--------------------|
| Lazer uydu (2. seviyeden itibaren) | Kırmızı kesikli çizgiyle nişan alır, sonra ateş eder; vurursa %15 küçülürsün | Çizgiden çekil; büyüyünce yut (bonus puan) |
| Süpernova (3. seviyeden itibaren) | Geri sayar, patlama dalgası seni küçültür ve savurur | Halkanın dışına çık ya da patlamadan önce yut |
| Hawking ışıması | 3 saniye bir şey yemezsen buharlaşıp küçülürsün | Durmadan ye |

Küçülme bir alt sınırda durur ve seviye hiçbir zaman düşmez.

## Dosyalar

- `index.html` – sayfa ve menüler
- `style.css` – HUD ve arayüz
- `js/game.js` – oyun döngüsü, çizim, girdi, ses (WebAudio ile sentez)

Geliştirme için `index.html?debug` açılırsa konsolda `FunHole.grow(50)` ile anında büyüyebilir, `FunHole.rival(1.5, 0.6)`, `FunHole.turret(0.5)`, `FunHole.nova()` ile rakip ve tehlike çağırabilirsin.

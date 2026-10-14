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
| Masaüstü | Fare imlecine doğru gider (WASD / ok tuşları da çalışır). **Tıkla** ya da **Space**: atıl |
| Mobil    | Ekranın herhangi bir yerine dokunup sürükle (sanal joystick). **⚡ ATIL** butonu ya da ikinci parmak: atıl |

Atılma kısa süreli büyük bir hız patlamasıdır; 5 saniyede bir dolar. Rakipten kaçmak, kaçan rakibi ya da altın cismi yakalamak için kullan.

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
| Hawking ışıması | 6 saniye bir şey yemezsen buharlaşıp küçülürsün | Durmadan ye |

Küçülme bir alt sınırda durur ve seviye hiçbir zaman düşmez.

## Tempo

Cisimler seyrek ve aralarında mesafe var (agar.io gibi); büyümek zaman alır, oyun uzun soluklu.

## Altın cisimler ve uzay olayları

- **Altın cisimler** (Uzay Kedisi, Kayıp Tesla, Voyager Sondası, Lastik Ördek…): ara sıra belirir, senden kaçar ve 22 saniye sonra kaybolur. Yakalarsan normalin 4 katı kütle ve 25 kat puan. Ekran kenarında altın okla gösterilir.
- **Meteor yağmuru:** 10 saniye boyunca ekrana yem yağar.
- **Kara madde bulutu:** içinde %60 yavaşlarsın (rakipler de), ama içi yem doludur.
- **Solucan deliği:** içine girersen uzayın uzak bir köşesine ışınlanırsın; rakipler geride kalır, çıkışta yem bulursun.

## Görevler, görünümler ve ansiklopedi

- Ana menüde sıradaki 3 görev görünür (toplam 12). Bazı görevler yeni **kara delik görünümü** açar: Mor Girdap, Altın, Kızıl Lazer, Buz, Zehir, Gökkuşağı.
- **Uzay Ansiklopedisi:** yuttuğun her cisim tipi koleksiyona eklenir (33 kayıt, nadirler dahil).
- İlerleme tarayıcıda (localStorage) saklanır.

## Müzik

Arkada WebAudio ile üretilen bir uzay müziği çalar; seviye yükseldikçe temposu ve yoğunluğu artar. 🎵 düğmesiyle müziği, 🔊 ile tüm sesi kapatabilirsin.

## Dosyalar

- `index.html` – sayfa ve menüler
- `style.css` – HUD ve arayüz
- `js/game.js` – oyun döngüsü, çizim, girdi, ses (WebAudio ile sentez)

Geliştirme için `index.html?debug` açılırsa konsolda `FunHole.grow(50)` ile anında büyüyebilir, `FunHole.rival(1.5, 0.6)`, `FunHole.turret(0.5)`, `FunHole.nova()`, `FunHole.rare()`, `FunHole.event('meteor' | 'cloud' | 'worm')` ile rakip, tehlike ve olay çağırabilirsin.

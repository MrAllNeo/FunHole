'use strict';

(() => {
  // =====================================================================
  //  Ayarlar
  // =====================================================================
  const TAU = Math.PI * 2;
  const EAT_RATIO = 0.9;     // deliğin yarıçapının bu oranından küçükler yenebilir
  const GROW = 0.35;         // yutulan alanın ne kadarı deliğe eklenir
  const HAWKING_DELAY = 6;   // bu kadar saniye bir şey yemezsen buharlaşmaya başlarsın
  const HAWKING_RATE = 0.02; // buharlaşırken saniyede yarıçap kaybı oranı
  const COMBO_TIME = 1.4;    // kombo zinciri için saniye
  const JOY_R = 60;          // dokunmatik joystick yarıçapı (px)
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

  // Seviyeler: deliğin yarıçapı bu değere ulaşınca SIZE UP
  const LEVELS = [
    { r: 1,    name: 'Mikro Kara Delik', desc: 'Toz, çakıl ve uzay çöpleri' },
    { r: 2.5,  name: 'Çöp Süpürgesi',    desc: 'Astronotlar, uydular, roket parçaları' },
    { r: 6,    name: 'Uydu Avcısı',      desc: 'Asteroitler, roketler ve UFO\'lar' },
    { r: 15,   name: 'İstasyon Yutucu',  desc: 'Uzay istasyonları ve dev lazer uydular' },
    { r: 40,   name: 'Ay Öğütücü',       desc: 'Kuyruklu yıldızlar ve aylar' },
    { r: 100,  name: 'Gezegen Yiyen',    desc: 'Kayalık gezegenler' },
    { r: 260,  name: 'Dev Avcısı',       desc: 'Halkalı gaz devleri' },
    { r: 650,  name: 'Yıldız Yutan',     desc: 'Yıldızlar!' },
    { r: 1600, name: 'Galaksi Canavarı', desc: 'Kırmızı devler ve galaksiler' },
    { r: 4000, name: 'Evrenin Sonu',     desc: 'Her şey senin' },
  ];

  // Cisimler: min/max = dünya birimi cinsinden yarıçap aralığı
  const TYPES = [
    { id: 'dust',     kind: 'dust',    name: 'Kozmik Toz',      min: 0.08, max: 0.35, w: 1.4, spin: 0,    col: '#ffd8a8', variants: 4 },
    { id: 'pebble',   kind: 'rock',    name: 'Çakıl Taşı',      min: 0.2,  max: 1.0,  w: 1.2, spin: 1.2,  col: '#b9a690' },
    { id: 'bolt',     emoji: '🔩',     name: 'Vida',            min: 0.25, max: 0.5,  w: 0.5, spin: 1.5,  col: '#d6dde6' },
    { id: 'sock',     emoji: '🧦',     name: 'Kayıp Çorap',     min: 0.3,  max: 0.6,  w: 0.4, spin: 1.2,  col: '#ff9ab0' },
    { id: 'can',      emoji: '🥫',     name: 'Konserve',        min: 0.3,  max: 0.7,  w: 0.4, spin: 1.2,  col: '#ff7b6b' },
    { id: 'wrench',   emoji: '🔧',     name: 'İngiliz Anahtarı',min: 0.35, max: 0.8,  w: 0.5, spin: 1.4,  col: '#c6d0db' },
    { id: 'glove',    emoji: '🧤',     name: 'Eldiven',         min: 0.35, max: 0.8,  w: 0.4, spin: 1,    col: '#a6e07a' },
    { id: 'camera',   emoji: '📷',     name: 'Kamera',          min: 0.4,  max: 0.9,  w: 0.4, spin: 1,    col: '#c6d0db' },
    { id: 'astro',    emoji: '🧑‍🚀',  name: 'Astronot',        min: 0.7,  max: 1.6,  w: 1,   spin: 0.6,  col: '#ffffff' },
    { id: 'sat',      emoji: '🛰️',     name: 'Uydu',            min: 1.2,  max: 3.2,  w: 1,   spin: 0.4,  col: '#9cc9ff' },
    { id: 'asteroid', kind: 'rock',    name: 'Asteroit',        min: 1,    max: 9,    w: 1.2, spin: 0.5,  col: '#b9a690' },
    { id: 'rocket',   emoji: '🚀',     name: 'Roket',           min: 2,    max: 5,    w: 0.8, spin: 0.5,  col: '#ffb070' },
    { id: 'ufo',      emoji: '🛸',     name: 'Uzaylı Aracı',    min: 3,    max: 12,   w: 0.8, spin: 0.6,  col: '#a8ffb0' },
    { id: 'station',  kind: 'station', name: 'Uzay İstasyonu',  min: 5,    max: 18,   w: 1,   spin: 0.2,  col: '#cfe0ff' },
    { id: 'laser',    kind: 'laser',   name: 'Dev Lazer Uydu',  min: 6,    max: 16,   w: 0,   spin: 0.25, col: '#ff5a5a' },
    { id: 'bigrock',  kind: 'rock',    name: 'Dev Asteroit',    min: 8,    max: 30,   w: 1,   spin: 0.2,  col: '#b9a690' },
    { id: 'comet',    kind: 'comet',   name: 'Kuyruklu Yıldız', min: 10,   max: 35,   w: 0.6, spin: 0,    col: '#bfe4ff' },
    { id: 'moon',     kind: 'moon',    name: 'Ay',              min: 20,   max: 60,   w: 1,   spin: 0.1,  col: '#dddddd' },
    { id: 'planet',   kind: 'planet',  name: 'Gezegen',         min: 45,   max: 160,  w: 1,   spin: 0.08, col: '#8fc8ff' },
    { id: 'giant',    kind: 'giant',   name: 'Gaz Devi',        min: 120,  max: 380,  w: 1,   spin: 0.03, col: '#ffd9a0' },
    { id: 'star',     kind: 'star',    name: 'Yıldız',          min: 300,  max: 900,  w: 1,   spin: 0.05, col: '#fff2c0' },
    { id: 'redgiant', kind: 'redgiant',name: 'Kırmızı Dev',     min: 800,  max: 2400, w: 1,   spin: 0.04, col: '#ff8a5a' },
    { id: 'galaxy',   kind: 'galaxy',  name: 'Galaksi',         min: 2000, max: 1e7,  w: 1,   spin: 0.12, col: '#d8b8ff' },
  ];

  // =====================================================================
  //  Yardımcılar
  // =====================================================================
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const $ = (id) => document.getElementById(id);

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  function fmtTime(s) {
    s = Math.floor(s);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  const fmtNum = (n) => Math.round(n).toLocaleString('tr-TR');

  // =====================================================================
  //  Canvas
  // =====================================================================
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let bgCanvas = null;
  let starLayers = [];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    buildBackground();
  }

  function buildBackground() {
    bgCanvas = document.createElement('canvas');
    bgCanvas.width = Math.max(1, Math.round(W * DPR));
    bgCanvas.height = Math.max(1, Math.round(H * DPR));
    const g = bgCanvas.getContext('2d');
    g.scale(DPR, DPR);
    g.fillStyle = '#05060f';
    g.fillRect(0, 0, W, H);
    const blobs = [
      [W * 0.2, H * 0.3, 'rgba(90,40,160,0.22)'],
      [W * 0.85, H * 0.75, 'rgba(30,90,170,0.18)'],
      [W * 0.6, H * 0.15, 'rgba(160,40,90,0.12)'],
    ];
    for (const [x, y, c] of blobs) {
      const r = Math.max(W, H) * 0.6;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, c);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
    }
    starLayers = [0.08, 0.2, 0.45].map((par, li) => {
      const n = Math.round((W * H) / (li === 2 ? 9000 : 4500));
      const stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, s: rnd(0.4, 1.1) * (1 + li * 0.5), a: rnd(0.3, 1), tw: rnd(1, 4), ph: rnd(0, TAU) });
      }
      return { par, stars, ox: 0, oy: 0 };
    });
  }

  // =====================================================================
  //  Sprite üreticileri (her cisim bir kere çizilip önbelleğe alınır)
  // =====================================================================
  function mk(S) {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    return { c, g: c.getContext('2d') };
  }

  function shade(g, cx, cy, R, strength) {
    const gr = g.createRadialGradient(cx - R * 0.4, cy - R * 0.4, R * 0.05, cx, cy, R);
    gr.addColorStop(0, 'rgba(255,255,255,0.28)');
    gr.addColorStop(0.45, 'rgba(255,255,255,0)');
    gr.addColorStop(1, `rgba(0,0,0,${strength})`);
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cy, R, 0, TAU);
    g.fill();
  }

  function solarPanel(g, x, y, w, h) {
    g.fillStyle = '#1d3f8f';
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#7fa8ff';
    g.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      g.beginPath();
      g.moveTo(x + (w * i) / 4, y);
      g.lineTo(x + (w * i) / 4, y + h);
      g.stroke();
    }
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  // Her üretici { img, scale } döner; scale = sprite boyu / (2 * cismin yarıçapı)
  const GEN = {
    emoji(t) {
      const S = 96, { c, g } = mk(S);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `${Math.round(S * 0.8)}px ${EMOJI_FONT}`;
      g.fillText(t.emoji, S / 2, S / 2 + S * 0.05);
      return { img: c, scale: 1.2 };
    },

    dust() {
      const S = 32, { c, g } = mk(S);
      const hue = pick([30, 45, 200, 280]);
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, `hsla(${hue},80%,92%,1)`);
      gr.addColorStop(0.3, `hsla(${hue},70%,70%,0.8)`);
      gr.addColorStop(1, `hsla(${hue},70%,50%,0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      return { img: c, scale: 2 };
    },

    rock() {
      const S = 128, { c, g } = mk(S), cx = S / 2, R = S * 0.42;
      const n = 10 + ((Math.random() * 6) | 0);
      const hue = rnd(15, 40), sat = rnd(5, 25), lig = rnd(32, 48);
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU, rr = R * rnd(0.75, 1);
        const x = cx + Math.cos(a) * rr, y = cx + Math.sin(a) * rr;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.closePath();
      g.fillStyle = `hsl(${hue},${sat}%,${lig}%)`;
      g.fill();
      g.save();
      g.clip();
      for (let i = 0; i < 5; i++) {
        const x = cx + rnd(-R, R) * 0.6, y = cx + rnd(-R, R) * 0.6, cr = R * rnd(0.08, 0.22);
        g.fillStyle = `hsla(${hue},${sat}%,${lig - 12}%,0.9)`;
        g.beginPath(); g.arc(x, y, cr, 0, TAU); g.fill();
        g.strokeStyle = `hsla(${hue},${sat}%,${lig + 14}%,0.5)`;
        g.lineWidth = 2;
        g.beginPath(); g.arc(x + 1, y + 1, cr, Math.PI * 0.8, Math.PI * 1.8); g.stroke();
      }
      shade(g, cx, cx, R, 0.65);
      g.restore();
      return { img: c, scale: S / (2 * R * 0.92) };
    },

    moon() {
      const S = 160, { c, g } = mk(S), cx = S / 2, R = S * 0.46;
      const l = rnd(55, 75), hue = rnd(0, 40), sat = rnd(0, 12);
      g.fillStyle = `hsl(${hue},${sat}%,${l}%)`;
      g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.fill();
      g.save();
      g.clip();
      for (let i = 0; i < 14; i++) {
        const a = rnd(0, TAU), d = Math.sqrt(Math.random()) * R;
        const x = cx + Math.cos(a) * d, y = cx + Math.sin(a) * d, cr = R * rnd(0.05, 0.2);
        g.fillStyle = `hsla(${hue},${sat}%,${l - 15}%,0.8)`;
        g.beginPath(); g.arc(x, y, cr, 0, TAU); g.fill();
        g.strokeStyle = `hsla(${hue},${sat}%,${l + 15}%,0.6)`;
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(x, y, cr, Math.PI * 0.75, Math.PI * 1.75); g.stroke();
      }
      shade(g, cx, cx, R, 0.75);
      g.restore();
      return { img: c, scale: S / (2 * R) };
    },

    planet() {
      const S = 200, { c, g } = mk(S), cx = S / 2, R = S * 0.4;
      const earthy = Math.random() < 0.35;
      const hue = earthy ? 210 : rnd(0, 360);
      const ag = g.createRadialGradient(cx, cx, R * 0.9, cx, cx, R * 1.22);
      ag.addColorStop(0, `hsla(${earthy ? 200 : hue},80%,70%,0.55)`);
      ag.addColorStop(1, `hsla(${hue},80%,70%,0)`);
      g.fillStyle = ag;
      g.fillRect(0, 0, S, S);
      g.fillStyle = earthy ? '#2a63c9' : `hsl(${hue},${rnd(35, 65)}%,${rnd(35, 55)}%)`;
      g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.fill();
      g.save();
      g.clip();
      for (let i = 0; i < (earthy ? 9 : 14); i++) {
        g.fillStyle = earthy
          ? `hsl(${rnd(80, 130)},45%,${rnd(30, 45)}%)`
          : `hsla(${hue + rnd(-25, 25)},${rnd(30, 70)}%,${rnd(30, 65)}%,0.55)`;
        g.beginPath();
        g.ellipse(cx + rnd(-R, R), cx + rnd(-R, R), R * rnd(0.15, 0.45), R * rnd(0.1, 0.3), rnd(0, TAU), 0, TAU);
        g.fill();
      }
      if (earthy) {
        g.fillStyle = 'rgba(255,255,255,0.55)';
        for (let i = 0; i < 8; i++) {
          g.beginPath();
          g.ellipse(cx + rnd(-R, R), cx + rnd(-R, R), R * rnd(0.15, 0.4), R * rnd(0.04, 0.09), rnd(-0.3, 0.3), 0, TAU);
          g.fill();
        }
      }
      shade(g, cx, cx, R, 0.8);
      g.restore();
      return { img: c, scale: S / (2 * R) };
    },

    giant() {
      const S = 256, { c, g } = mk(S), cx = S / 2, R = S * 0.24;
      const hue = pick([25, 35, 45, 190, 200, 15]);
      const ringed = Math.random() < 0.75;
      const rings = [];
      for (let i = 0; i < 5; i++) {
        rings.push({
          col: `hsla(${hue + 10},30%,${rnd(55, 80)}%,${rnd(0.25, 0.6)})`,
          w: R * rnd(0.06, 0.14),
          r: R * (1.35 + i * 0.13),
        });
      }
      const drawRings = (front) => {
        for (const rg of rings) {
          g.strokeStyle = rg.col;
          g.lineWidth = rg.w;
          g.beginPath();
          g.ellipse(0, 0, rg.r, rg.r * 0.28, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
          g.stroke();
        }
      };
      g.translate(cx, cx);
      g.rotate(rnd(-0.5, 0.5));
      if (ringed) drawRings(false);
      g.save();
      g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip();
      for (let y = -R; y < R; y += R * 0.12) {
        g.fillStyle = `hsl(${hue + rnd(-8, 8)},${rnd(40, 55)}%,${rnd(48, 66)}%)`;
        g.fillRect(-R, y, 2 * R, R * 0.13);
      }
      if (Math.random() < 0.6) {
        g.fillStyle = `hsla(${hue - 15},70%,42%,0.85)`;
        g.beginPath();
        g.ellipse(R * rnd(-0.4, 0.4), R * rnd(-0.5, 0.5), R * 0.2, R * 0.1, 0, 0, TAU);
        g.fill();
      }
      shade(g, 0, 0, R, 0.8);
      g.restore();
      if (ringed) drawRings(true);
      return { img: c, scale: S / (2 * R) };
    },

    star() {
      const S = 192, { c, g } = mk(S), cx = S / 2, R = S * 0.16, half = S / 2;
      const col = pick([[255, 244, 214], [255, 220, 140], [190, 215, 255], [255, 190, 120]]);
      const gr = g.createRadialGradient(cx, cx, 0, cx, cx, half);
      gr.addColorStop(0, '#fff');
      gr.addColorStop((R / half) * 0.9, `rgb(${col})`);
      gr.addColorStop((R / half) * 1.3, `rgba(${col},0.45)`);
      gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      g.globalCompositeOperation = 'lighter';
      for (const a of [0.3, 0.3 + Math.PI / 2]) {
        g.save();
        g.translate(cx, cx);
        g.rotate(a);
        const lg = g.createLinearGradient(-half, 0, half, 0);
        lg.addColorStop(0, `rgba(${col},0)`);
        lg.addColorStop(0.5, 'rgba(255,255,255,0.7)');
        lg.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = lg;
        g.fillRect(-half, -1.5, S, 3);
        g.restore();
      }
      return { img: c, scale: S / (2 * R) };
    },

    redgiant() {
      const S = 192, { c, g } = mk(S), cx = S / 2, R = S * 0.3, half = S / 2;
      const glow = g.createRadialGradient(cx, cx, R * 0.9, cx, cx, half);
      glow.addColorStop(0, 'rgba(255,90,40,0.6)');
      glow.addColorStop(1, 'rgba(255,60,30,0)');
      g.fillStyle = glow;
      g.fillRect(0, 0, S, S);
      const body = g.createRadialGradient(cx, cx, 0, cx, cx, R);
      body.addColorStop(0, '#ffe0a0');
      body.addColorStop(0.5, '#ff7a32');
      body.addColorStop(1, '#c8321e');
      g.fillStyle = body;
      g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.fill();
      g.save();
      g.clip();
      for (let i = 0; i < 18; i++) {
        g.fillStyle = `rgba(255,${rnd(160, 230) | 0},120,${rnd(0.08, 0.2)})`;
        g.beginPath(); g.arc(cx + rnd(-R, R), cx + rnd(-R, R), R * rnd(0.1, 0.3), 0, TAU); g.fill();
      }
      g.restore();
      return { img: c, scale: S / (2 * R) };
    },

    galaxy() {
      const S = 256, { c, g } = mk(S), cx = S / 2, R = S * 0.45;
      const arms = pick([2, 3, 4]);
      const hue = rnd(190, 320);
      g.globalCompositeOperation = 'lighter';
      for (let a = 0; a < arms; a++) {
        for (let i = 0; i < 260; i++) {
          const t = Math.random();
          const ang = (a * TAU) / arms + t * 5 + rnd(-0.25, 0.25);
          const d = t * R;
          const j = 4 * (1 + t);
          g.fillStyle = `hsla(${hue + rnd(-30, 30)},80%,${rnd(60, 90)}%,${rnd(0.2, 0.7) * (1 - t * 0.6)})`;
          g.beginPath();
          g.arc(cx + Math.cos(ang) * d + rnd(-j, j), cx + Math.sin(ang) * d + rnd(-j, j), rnd(0.5, 2.2), 0, TAU);
          g.fill();
        }
      }
      const core = g.createRadialGradient(cx, cx, 0, cx, cx, R * 0.35);
      core.addColorStop(0, 'rgba(255,245,220,1)');
      core.addColorStop(1, 'rgba(255,200,150,0)');
      g.fillStyle = core;
      g.fillRect(0, 0, S, S);
      return { img: c, scale: S / (2 * R * 0.85) };
    },

    station() {
      const S = 128, { c, g } = mk(S);
      g.translate(S / 2, S / 2);
      g.fillStyle = '#9aa3ad';
      g.fillRect(-56, -3, 112, 6);
      solarPanel(g, -56, -24, 22, 18);
      solarPanel(g, -56, 6, 22, 18);
      solarPanel(g, 34, -24, 22, 18);
      solarPanel(g, 34, 6, 22, 18);
      g.strokeStyle = '#8b949e';
      g.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i * TAU) / 4 + Math.PI / 4;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); g.stroke();
      }
      g.strokeStyle = '#d5dce4';
      g.lineWidth = 6;
      g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.stroke();
      g.fillStyle = '#c9cfd8';
      g.fillRect(-6, -34, 12, 68);
      g.fillStyle = '#eef1f5';
      g.fillRect(-11, -13, 22, 26);
      g.fillStyle = '#ffcf5a';
      for (const [x, y] of [[-3, -30], [-3, 26], [-8, -9], [5, 5]]) g.fillRect(x, y, 4, 3);
      return { img: c, scale: S / (2 * 56) };
    },

    laser() {
      const S = 128, { c, g } = mk(S);
      g.translate(S / 2, S / 2);
      const gl = g.createRadialGradient(42, 0, 0, 42, 0, 30);
      gl.addColorStop(0, 'rgba(255,60,60,0.9)');
      gl.addColorStop(1, 'rgba(255,0,0,0)');
      g.fillStyle = gl;
      g.fillRect(-64, -64, 128, 128);
      solarPanel(g, -58, -32, 26, 24);
      solarPanel(g, -58, 8, 26, 24);
      g.fillStyle = '#596270';
      g.fillRect(-34, -4, 14, 8);
      g.fillStyle = '#3b4250';
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6;
        g.lineTo(Math.cos(a) * 24, Math.sin(a) * 24);
      }
      g.closePath();
      g.fill();
      g.strokeStyle = '#d33';
      g.lineWidth = 3;
      g.stroke();
      g.fillStyle = '#7a828f';
      g.fillRect(14, -8, 28, 16);
      g.fillStyle = '#d33';
      g.fillRect(20, -8, 3, 16);
      g.fillStyle = '#ff3b3b';
      g.beginPath(); g.arc(44, 0, 8, 0, TAU); g.fill();
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(44, 0, 3.5, 0, TAU); g.fill();
      return { img: c, scale: S / (2 * 58) };
    },

    comet() {
      const S = 256, { c, g } = mk(S), cx = S / 2, R = S * 0.07;
      // Kuyruk -x yönüne bakar; cisim +x yönünde hareket eder
      g.globalCompositeOperation = 'lighter';
      for (let i = 60; i >= 0; i--) {
        const t = i / 60;
        const x = cx - t * cx * 0.95;
        const r = R * (0.8 + t * 2.2);
        const gr = g.createRadialGradient(x, cx, 0, x, cx, r);
        gr.addColorStop(0, `rgba(150,200,255,${0.06 * (1 - t)})`);
        gr.addColorStop(1, 'rgba(120,180,255,0)');
        g.fillStyle = gr;
        g.beginPath(); g.arc(x, cx, r, 0, TAU); g.fill();
      }
      const cg = g.createRadialGradient(cx, cx, 0, cx, cx, R * 1.5);
      cg.addColorStop(0, 'rgba(255,255,255,1)');
      cg.addColorStop(0.45, 'rgba(200,235,255,0.8)');
      cg.addColorStop(1, 'rgba(120,180,255,0)');
      g.fillStyle = cg;
      g.beginPath(); g.arc(cx, cx, R * 1.5, 0, TAU); g.fill();
      return { img: c, scale: S / (2 * R) };
    },
  };

  const spriteCache = new Map();
  function getSprite(t) {
    let arr = spriteCache.get(t.id);
    if (!arr) { arr = []; spriteCache.set(t.id, arr); }
    const max = t.emoji ? 1 : t.variants || 5;
    if (arr.length < max && (arr.length === 0 || Math.random() < 0.5)) {
      const sp = t.emoji ? GEN.emoji(t) : GEN[t.kind](t);
      arr.push(sp);
      return sp;
    }
    return pick(arr);
  }

  // =====================================================================
  //  Ses (WebAudio ile sentezlenmiş, dosya yok)
  // =====================================================================
  let actx = null, master = null, musicGain = null;
  let muted = !!store('funhole.muted');
  let lastGulp = 0, lastBump = 0;

  function initAudio() {
    if (!actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        master = actx.createGain();
        master.connect(actx.destination);
        musicGain = actx.createGain();
        musicGain.gain.value = 0;
        musicGain.connect(master);
      } catch (e) { actx = null; }
    }
    syncMusicGain();
    if (actx && actx.state === 'suspended') actx.resume();
  }

  function tone(type, f0, f1, dur, vol, delay = 0) {
    if (muted || !actx) return;
    const t = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function gulpSound(rel) {
    if (time - lastGulp < 0.04) return;
    lastGulp = time;
    const f = 900 - 650 * clamp(rel, 0, 1) + rnd(-40, 40);
    tone('sine', f, f * 0.3, 0.12 + rel * 0.15, 0.12 + rel * 0.1);
  }

  function bumpSound() {
    if (time - lastBump < 0.3) return;
    lastBump = time;
    tone('triangle', 110, 50, 0.18, 0.15);
  }

  function levelUpSound() {
    [392, 523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.25, 0.12, i * 0.08));
  }

  function hurtSound() { tone('sawtooth', 420, 70, 0.4, 0.12); }
  function laserChargeSound() { tone('sine', 300, 1100, 1.1, 0.035); }
  function laserFireSound() { tone('square', 900, 120, 0.3, 0.05); }
  function boomSound() {
    tone('triangle', 90, 25, 0.9, 0.3);
    tone('sawtooth', 200, 40, 0.5, 0.07);
  }
  function rivalEatSound() {
    tone('sine', 300, 60, 0.45, 0.25);
    [523, 659, 784].forEach((f, i) => tone('triangle', f, f, 0.18, 0.08, 0.1 + i * 0.07));
  }
  function deathSound() { tone('sawtooth', 500, 40, 1.2, 0.18); }
  function dashSound() { tone('sawtooth', 180, 900, 0.2, 0.05); tone('sine', 600, 200, 0.25, 0.06); }
  function sparkleSound() { [1319, 1568, 2093].forEach((f, i) => tone('sine', f, f, 0.2, 0.05, i * 0.07)); }
  function chimeSound() { [784, 1175].forEach((f, i) => tone('triangle', f, f, 0.35, 0.08, i * 0.12)); }
  function eventSound() { tone('sine', 110, 220, 1.2, 0.12); tone('triangle', 330, 165, 1.0, 0.05, 0.2); }
  function teleportSound() { tone('sine', 200, 1800, 0.6, 0.1); tone('triangle', 1800, 300, 0.5, 0.05, 0.4); }

  function vibrate(p) {
    if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { /* yok say */ } }
  }

  // =====================================================================
  //  Oyun durumu
  // =====================================================================
  let state = 'menu';           // menu | play | dead | won
  let time = 0;                 // toplam geçen süre (animasyon)
  let playTime = 0;
  let hole, cam, zoom, level, score, objs, eaten, particles, popups, waves, combo, eatenCount, endless;
  let rivals, turrets, novas, spawnT, shake, deathBy;
  let shakeX = 0, shakeY = 0;

  const baseScreenR = () => Math.min(W, H) * 0.042;
  const zoomTarget = () => baseScreenR() / LEVELS[level].r;
  const targetCount = () => Math.round(clamp((W * H) / 11000, 55, 90)); // seyrek: cisimler arası mesafe büyük
  const baseSpeed = () => (Math.min(W, H) * 0.45) / zoom;  // oyuncunun azami hızı (dünya birimi/sn)
  const minHoleR = () => LEVELS[level].r * 0.6;           // küçülmenin alt sınırı (seviye asla düşmez)

  function reset() {
    hole = { x: 0, y: 0, r: 1, dr: 1, vx: 0, vy: 0, kx: 0, ky: 0, pulse: 0, inv: 0, hurt: 0, idle: 0, dead: false, dash: 0, dashCd: 0, dashX: 0, dashY: 0, face: 0 };
    cam = { x: 0, y: 0 };
    level = 0;
    zoom = zoomTarget();
    score = 0;
    playTime = 0;
    eatenCount = 0;
    endless = false;
    objs = [];
    eaten = [];
    particles = [];
    popups = [];
    waves = [];
    rivals = [];
    turrets = [];
    novas = [];
    spawnT = { rival: 2.5, turret: 5, nova: 10 };
    shake = 0;
    deathBy = '';
    combo = { n: 0, t: 0 };
    run = { rivals: 0, turrets: 0, novas: 0, rares: 0, hits: 0, worms: 0, dashes: 0 };
    ev = null;
    evT = rnd(30, 45);
    rareT = rnd(18, 28);
    flash = 0;
    trails = [];
    const hd = halfDiag(zoom);
    for (let i = 0; i < targetCount() * 1.5 && objs.length < targetCount(); i++) spawnObject(hd * 0.15, hd * 1.4);
    updateHud(true);
  }

  // Ekranın yarı köşegeni, dünya biriminde
  const halfDiag = (z) => Math.hypot(W, H) / 2 / z;

  function onScreen(o, margin = 0) {
    const p = w2s(o.x, o.y), m = o.r * zoom + margin;
    return p.x > -m && p.x < W + m && p.y > -m && p.y < H + m;
  }

  function pickSize() {
    const r = hole.r;
    if (Math.random() < 0.8) return r * (0.1 + 0.7 * Math.pow(Math.random(), 1.5)); // yenebilir
    return r * rnd(0.95, 2.3);                                                       // senden büyük
  }

  function pickType(s) {
    const cands = TYPES.filter((t) => s >= t.min && s <= t.max);
    if (cands.length) {
      let sum = 0;
      for (const t of cands) sum += t.w;
      let x = Math.random() * sum;
      for (const t of cands) { x -= t.w; if (x <= 0) return t; }
      return cands[cands.length - 1];
    }
    let best = TYPES[0], bd = Infinity;
    for (const t of TYPES) {
      const d = s < t.min ? t.min / s : s / t.max;
      if (d < bd) { bd = d; best = t; }
    }
    return best;
  }

  function spawnObject(minD, maxD) {
    const s = pickSize();
    const t = pickType(s);
    const r = clamp(s, t.min, t.max);
    const a = rnd(0, TAU), d = rnd(minD, maxD);
    const x = cam.x + Math.cos(a) * d, y = cam.y + Math.sin(a) * d;
    if (Math.hypot(x - hole.x, y - hole.y) < hole.r * 3 + r) return;
    const comet = t.kind === 'comet';
    const speed = r * rnd(0.05, 0.3) * (comet ? 6 : 1);
    const va = rnd(0, TAU);
    objs.push({
      t, x, y, r,
      vx: Math.cos(va) * speed,
      vy: Math.sin(va) * speed,
      rot: comet ? va : rnd(0, TAU),
      vr: comet ? 0 : rnd(-1, 1) * t.spin,
      sp: getSprite(t),
      fade: 0,
      bump: 0,
      gone: false,
    });
  }

  function comboMult() {
    return Math.min(5, 1 + Math.floor(combo.n / 5) * 0.5);
  }

  // Küçük cismi kendine doğru çeker
  function attract(o, host, dt, strength) {
    const dx = host.x - o.x, dy = host.y - o.y, d = Math.hypot(dx, dy) || 1e-6;
    const pullR = host.r * 2.8;
    if (d >= pullR) return d;
    const f = 1 - d / pullR;
    const acc = host.r * (strength * f * f + 1.5 * f);
    o.vx += (dx / d) * acc * dt;
    o.vy += (dy / d) * acc * dt;
    const damp = 1 - Math.min(1, dt * 2 * f);
    o.vx *= damp;
    o.vy *= damp;
    return d;
  }

  // Oyuncu büyük bir cisme çarparsa geri itilir
  function pushHoleFrom(o, playing) {
    const dx = hole.x - o.x, dy = hole.y - o.y, d = Math.hypot(dx, dy) || 1e-6;
    const minD = hole.r + o.r * 0.85;
    if (d >= minD) return;
    const nx = dx / d, ny = dy / d;
    hole.x += nx * (minD - d);
    hole.y += ny * (minD - d);
    const vn = hole.vx * nx + hole.vy * ny;
    if (vn < 0) {
      hole.vx -= nx * vn * 1.3;
      hole.vy -= ny * vn * 1.3;
    }
    o.bump = 0.5;
    if (playing) bumpSound();
  }

  function swallowAnim(o, host, durMul = 1) {
    const dx = o.x - host.x, dy = o.y - host.y;
    eaten.push({ o, host, p: 0, dur: (0.35 + clamp(o.r / host.r, 0, 1) * 0.5) * durMul, ang: Math.atan2(dy, dx), d: Math.hypot(dx, dy) });
  }

  // Oyuncu bir şey yuttu (cisim, rakip, lazer uydu, süpernova)
  function eat(o, bonus = 1, label = '', massMul = 1) {
    o.gone = true;
    const rel = o.r / hole.r;
    hole.r = Math.sqrt(hole.r * hole.r + o.r * o.r * GROW * massMul);
    discover(o.cid || o.t.id, o.cname || o.t.name);
    hole.idle = 0;
    hole.pulse = Math.min(1, hole.pulse + 0.15 + rel * 0.8);
    combo.n++;
    combo.t = COMBO_TIME;
    const pts = Math.max(1, Math.round(o.r * o.r * 10 * bonus * comboMult()));
    score += pts;
    eatenCount++;
    swallowAnim(o, hole);

    const dx = o.x - hole.x, dy = o.y - hole.y;
    const nP = 3 + Math.round(clamp(rel, 0, 1) * 8);
    for (let i = 0; i < nP; i++) {
      particles.push({ ang: Math.atan2(dy, dx) + rnd(-0.6, 0.6), d: Math.hypot(dx, dy) + o.r * rnd(0, 1.2), life: rnd(0.4, 0.8), t: 0, col: o.t.col });
    }
    if (label) {
      popups.push({ x: o.x, y: o.y, text: `${label} +${fmtNum(pts)}`, t: 0, big: true, col: '#7dffa0' });
      waves.push({ t: 0 });
      rivalEatSound();
    } else {
      if (popups.length < 25 && (rel > 0.25 || Math.random() < 0.35)) {
        popups.push({ x: o.x, y: o.y, text: '+' + fmtNum(pts), t: 0, big: rel > 0.6 });
      }
      gulpSound(rel);
    }

    while (level < LEVELS.length - 1 && hole.r >= LEVELS[level + 1].r) {
      level++;
      levelUp();
    }
  }

  // Oyuncu küçülür (lazer, süpernova)
  function hurtPlayer(f, label) {
    if (state !== 'play' || hole.inv > 0) return;
    const before = hole.r;
    hole.r = Math.max(minHoleR(), hole.r * f);
    hole.inv = 1.2;
    hole.hurt = 1;
    run.hits++;
    shake = Math.max(shake, 0.5);
    combo.n = 0;
    for (let i = 0; i < 16; i++) {
      particles.push({ ang: rnd(0, TAU), d: hole.r * 1.05, life: rnd(0.5, 0.9), t: 0, col: '#ff6a4a', out: true });
    }
    const lost = Math.round((1 - hole.r / before) * 100);
    popups.push({ x: hole.x, y: hole.y - hole.r * 1.5, text: lost > 0 ? `${label} -%${lost}` : label, t: 0, big: true, col: '#ff6b6b' });
    hurtSound();
    vibrate(120);
  }

  function levelUp() {
    const L = LEVELS[level];
    showBanner('SIZE UP!', L.name, level === LEVELS.length - 1 ? L.desc : 'Artık yiyebilirsin: ' + L.desc);
    waves.push({ t: 0 });
    levelUpSound();
    vibrate(60);
    if (level === LEVELS.length - 1 && !endless) setTimeout(win, 1600);
  }

  function hideHud() {
    $('hud').classList.add('hidden');
    $('combo').classList.remove('show');
    $('warn').classList.remove('show');
    delete hudCache.combo;
    delete hudCache.warn;
  }

  function saveBest(finished) {
    const best = store('funhole.best') || {};
    const newTime = finished && (!best.time || playTime < best.time);
    const newScore = score > (best.score || 0);
    if (newTime) best.time = playTime;
    if (newScore) best.score = score;
    store('funhole.best', best);
    return { newTime, newScore };
  }

  function win() {
    if (state !== 'play') return;
    state = 'won';
    const { newTime } = saveBest(true);
    $('winStats').textContent =
      `Süre: ${fmtTime(playTime)}${newTime ? '  🏆 Yeni rekor!' : ''}\n` +
      `Puan: ${fmtNum(score)}\nYutulan cisim: ${fmtNum(eatenCount)}`;
    $('win').classList.add('show');
    hideHud();
  }

  function die(rv) {
    state = 'dead';
    hole.dead = true;
    deathBy = rv.name;
    swallowAnim({ x: hole.x, y: hole.y, r: hole.r, rot: 0, vr: 3, sp: rivalSprite(currentSkin().col || [255, 150, 60]), t: { col: '#ffb070' } }, rv, 2.5);
    rivalGrow(rv, hole.r);
    shake = 1;
    deathSound();
    vibrate([80, 40, 220]);
    hideHud();
    setTimeout(showDead, 1500);
  }

  function showDead() {
    if (state !== 'dead') return;
    const { newScore } = saveBest(false);
    $('deadBy').textContent = `${deathBy} seni yuttu.`;
    $('deadStats').textContent =
      `Ulaştığın seviye: ${level + 1} · ${LEVELS[level].name}\n` +
      `Puan: ${fmtNum(score)}${newScore ? '  🏆 Yeni rekor!' : ''}\nSüre: ${fmtTime(playTime)}`;
    $('dead').classList.add('show');
  }

  // =====================================================================
  //  Rakip kara delikler (yapay zekâ)
  // =====================================================================
  //  Kural: yarıçapı diğerinin %90'ından küçük olan, büyüğün merkezine
  //  girerse yutulur (oyuncu dahil). Benzer boydakiler birbirini iter.
  //  Davranış: senden büyükse avlanır, küçükse kaçar, yoksa yem toplar.
  const RIVAL_NAMES = ['Vakum', 'Kara Kurt', 'Obur', 'Girdap', 'Hiçlik', 'Kuyu', 'Açgözlü', 'Kaos', 'Gölge', 'Zifir'];
  const RIVAL_COLS = [[160, 100, 255], [70, 200, 255], [90, 255, 170], [255, 90, 170], [255, 230, 100]];
  // Seviyeye göre aynı anda en fazla kaç rakip / lazer uydu olabilir
  const MAX_RIVALS = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4];
  const MAX_TURRETS = [0, 1, 1, 2, 2, 2, 3, 3, 3, 3];
  const NOVA_FROM_LEVEL = 2;

  const rivalSprites = new Map();
  function rivalSprite(col) {
    const key = col.join();
    if (rivalSprites.has(key)) return rivalSprites.get(key);
    const S = 96, { c, g } = mk(S), cx = S / 2, R = S * 0.28;
    const gr = g.createRadialGradient(cx, cx, R * 0.9, cx, cx, S / 2);
    gr.addColorStop(0, `rgba(${col},0.95)`);
    gr.addColorStop(0.3, `rgba(${col},0.35)`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
    g.fillStyle = '#000';
    g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.fill();
    const sp = { img: c, scale: S / (2 * R) };
    rivalSprites.set(key, sp);
    return sp;
  }

  function rivalPalette(col) {
    const light = col.map((v) => Math.round(v + (255 - v) * 0.6)).join();
    return {
      c1: light,
      c2: col.join(),
      c3: col.map((v) => Math.round(v * 0.55)).join(),
      c4: '40,20,80',
      arc: (i) => `rgba(${col},${0.5 - i * 0.055})`,
      ring: light,
    };
  }

  function spawnRival(rel, distMul) {
    const hd = halfDiag(zoom);
    const a = rnd(0, TAU), d = hd * (distMul || rnd(1.15, 1.4));
    if (!rel) {
      const bigChance = level === 0 ? 0 : Math.min(0.5, 0.3 + level * 0.025);
      rel = Math.random() < bigChance ? rnd(1.15, 1.6) : rnd(0.45, 0.8);
    }
    const used = new Set(rivals.map((r) => r.name));
    const names = RIVAL_NAMES.filter((n) => !used.has(n));
    const col = pick(RIVAL_COLS);
    const r = hole.r * rel;
    rivals.push({
      x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, r, dr: r, vx: 0, vy: 0,
      name: names.length ? pick(names) : pick(RIVAL_NAMES),
      col, pal: rivalPalette(col), sp: rivalSprite(col), t: { col: `rgb(${col})` },
      rot: 0, vr: 3, spin: rnd(0, TAU), fade: 0, gone: false, cid: 'rival', cname: 'Rakip Kara Delik',
      mode: 'roam', think: 0, huntT: 0, cd: 0, target: null, wander: rnd(0, TAU),
    });
  }

  // Rakipler oyuncudan yavaş büyür ve belli bir oranı geçemez
  // (1. seviyede rakip hiç senden büyük olamaz: önce yemeyi öğren)
  const RIVAL_GROW = 0.22;
  function rivalGrow(rv, r) {
    const cap = hole.r * (level === 0 ? 0.85 : 1.7);
    rv.r = Math.max(rv.r, Math.min(Math.sqrt(rv.r * rv.r + r * r * RIVAL_GROW), cap));
  }

  function rivalThink(rv, hd, playing) {
    const dP = Math.hypot(hole.x - rv.x, hole.y - rv.y);
    const sense = hd * 1.1;
    const canEatPlayer = hole.r < rv.r * EAT_RATIO;
    const playerCanEat = rv.r < hole.r * EAT_RATIO;
    if (playing && canEatPlayer && dP < sense && rv.cd <= 0) {
      if (rv.mode !== 'hunt') { rv.mode = 'hunt'; rv.huntT = 0; }
      return;
    }
    if (playing && playerCanEat && dP < sense * 0.75) {
      rv.mode = 'flee';
      return;
    }
    rv.mode = 'roam';
    // En iyi yemi seç: büyük ve yakın olan
    let best = null, bs = 0;
    for (const o of objs) {
      if (o.r >= rv.r * EAT_RATIO) continue;
      const d = Math.hypot(o.x - rv.x, o.y - rv.y);
      if (d > hd * 1.2) continue;
      const s = (o.r * o.r) / (d + rv.r * 3);
      if (s > bs) { bs = s; best = o; }
    }
    for (const o of rivals) {
      if (o === rv || o.r >= rv.r * EAT_RATIO) continue;
      const d = Math.hypot(o.x - rv.x, o.y - rv.y);
      const s = (o.r * o.r * 2) / (d + rv.r * 3);
      if (s > bs) { bs = s; best = o; }
    }
    rv.target = best;
  }

  function updateRivals(dt, hd, playing) {
    const spd = baseSpeed();
    for (const rv of rivals) {
      rv.fade = Math.min(1, rv.fade + dt * 1.5);
      rv.spin += dt;
      rv.cd = Math.max(0, rv.cd - dt);
      rv.think -= dt;
      if (rv.think <= 0) {
        rv.think = rnd(0.2, 0.35);
        rivalThink(rv, hd, playing);
      }
      let dirx = 0, diry = 0, s = 0;
      const dx = hole.x - rv.x, dy = hole.y - rv.y, d = Math.hypot(dx, dy) || 1e-6;
      if (rv.mode === 'hunt') {
        // Oyuncunun gideceği yeri tahmin et
        const lead = clamp(d / spd, 0, 0.7);
        const tx = hole.x + hole.vx * lead - rv.x, ty = hole.y + hole.vy * lead - rv.y;
        const td = Math.hypot(tx, ty) || 1e-6;
        dirx = tx / td; diry = ty / td;
        s = Math.min(0.9, 0.74 + level * 0.016);
        rv.huntT += dt;
        if (rv.huntT > 4 + level * 0.35) { rv.mode = 'roam'; rv.cd = rnd(3, 5); rv.target = null; }
      } else if (rv.mode === 'flee') {
        dirx = -dx / d; diry = -dy / d;
        s = 0.82;
      } else if (rv.target && !rv.target.gone) {
        const tx = rv.target.x - rv.x, ty = rv.target.y - rv.y, td = Math.hypot(tx, ty) || 1e-6;
        dirx = tx / td; diry = ty / td;
        s = 0.55;
      } else {
        rv.wander += rnd(-2, 2) * dt;
        dirx = Math.cos(rv.wander); diry = Math.sin(rv.wander);
        s = 0.3;
      }
      const k = Math.min(1, dt * 3.5), cm = cloudMul(rv.x, rv.y);
      rv.vx += (dirx * s * spd * cm - rv.vx) * k;
      rv.vy += (diry * s * spd * cm - rv.vy) * k;
      rv.x += rv.vx * dt;
      rv.y += rv.vy * dt;
      rv.dr += (rv.r - rv.dr) * Math.min(1, dt * 6);
    }
  }

  function rivalInteractions(dt, hd, playing) {
    for (let i = rivals.length - 1; i >= 0; i--) {
      const rv = rivals[i];
      if (rv.gone) continue;
      const dx = hole.x - rv.x, dy = hole.y - rv.y, d = Math.hypot(dx, dy) || 1e-6;
      if (playing) {
        if (rv.r < hole.r * EAT_RATIO) {
          if (d < hole.r * 0.85) { run.rivals++; eat(rv, 6, `${rv.name} yutuldu!`); continue; }
        } else if (hole.r < rv.r * EAT_RATIO) {
          if (d < rv.r * 0.85) { die(rv); return; }
          // Büyük rakip oyuncuyu kendine çeker
          const pr = rv.r * 3;
          if (d < pr) {
            const f = 1 - d / pr, ps = baseSpeed() * 0.35 * f * f;
            hole.x -= (dx / d) * ps * dt;
            hole.y -= (dy / d) * ps * dt;
          }
        } else {
          const minD = (hole.r + rv.r) * 0.9;
          if (d < minD) {
            const m = (minD - d) / 2;
            hole.x += (dx / d) * m; hole.y += (dy / d) * m;
            rv.x -= (dx / d) * m; rv.y -= (dy / d) * m;
            bumpSound();
          }
        }
      }
      // Rakipler birbirini de yiyebilir
      for (let j = i - 1; j >= 0; j--) {
        const b = rivals[j];
        if (b.gone) continue;
        const ex = b.x - rv.x, ey = b.y - rv.y, e = Math.hypot(ex, ey) || 1e-6;
        const big = rv.r >= b.r ? rv : b, small = big === rv ? b : rv;
        if (small.r < big.r * EAT_RATIO && e < big.r * 0.85) {
          small.gone = true;
          rivalGrow(big, small.r);
          swallowAnim(small, big);
          if (onScreen(big)) popups.push({ x: big.x, y: big.y - big.r * 2, text: `${big.name} yuttu: ${small.name}`, t: 0, big: true, col: '#ffb3b3' });
          if (small === rv) break;
        } else {
          const minD = (rv.r + b.r) * 0.9;
          if (e < minD) {
            const m = (minD - e) / 2;
            rv.x -= (ex / e) * m; rv.y -= (ey / e) * m;
            b.x += (ex / e) * m; b.y += (ey / e) * m;
          }
        }
      }
    }
    for (let i = rivals.length - 1; i >= 0; i--) {
      const rv = rivals[i];
      const far = Math.hypot(rv.x - cam.x, rv.y - cam.y) > hd * 2.6;
      if (rv.gone || far || rv.r < hole.r * 0.12) {
        rv.gone = true;
        rivals.splice(i, 1);
      }
    }
  }

  // =====================================================================
  //  Tehlikeler: lazer uydular ve süpernovalar
  // =====================================================================
  const LASER_T = TYPES.find((t) => t.id === 'laser');
  const STAR_T = TYPES.find((t) => t.id === 'star');
  const CHARGE_TIME = 1.15, FIRE_TIME = 0.35, BLAST_TIME = 0.7;

  function turnTo(a, b, k) {
    const d = ((((b - a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    return a + d * k;
  }

  function segDist(sx, sy, ex, ey, px, py) {
    const dx = ex - sx, dy = ey - sy, L2 = dx * dx + dy * dy || 1e-9;
    const u = clamp(((px - sx) * dx + (py - sy) * dy) / L2, 0, 1);
    return Math.hypot(px - (sx + dx * u), py - (sy + dy * u));
  }

  function spawnTurret(distMul) {
    const hd = halfDiag(zoom);
    const a = rnd(0, TAU), d = hd * (distMul || rnd(1.1, 1.35));
    const va = rnd(0, TAU), r = hole.r * rnd(1.1, 1.6);
    turrets.push({
      t: LASER_T, x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, r,
      vx: Math.cos(va) * r * 0.1, vy: Math.sin(va) * r * 0.1,
      aim: a + Math.PI, rot: a + Math.PI, vr: 0,
      st: 'idle', tt: 0, cd: rnd(0.5, 1.5), hitRivals: null,
      sp: getSprite(LASER_T), fade: 0, bump: 0, gone: false,
    });
  }

  function beamOf(tu) {
    const len = halfDiag(zoom) * 1.6;
    const cx = Math.cos(tu.aim), cy = Math.sin(tu.aim);
    const sx = tu.x + cx * tu.r * 0.75, sy = tu.y + cy * tu.r * 0.75;
    return { sx, sy, ex: sx + cx * len, ey: sy + cy * len, w: Math.max(tu.r * 0.14, 2 / zoom) };
  }

  function updateTurrets(dt, hd, playing) {
    const range = halfDiag(zoom) * 0.95;
    for (let i = turrets.length - 1; i >= 0; i--) {
      const tu = turrets[i];
      tu.fade = Math.min(1, tu.fade + dt * 1.5);
      if (tu.bump > 0) tu.bump -= dt;
      tu.x += tu.vx * dt;
      tu.y += tu.vy * dt;
      const dx = hole.x - tu.x, dy = hole.y - tu.y, d = Math.hypot(dx, dy) || 1e-6;
      const want = Math.atan2(dy, dx);
      if (tu.st === 'idle') {
        tu.aim = turnTo(tu.aim, want, Math.min(1, dt * 1.5));
        tu.cd -= dt;
        if (playing && tu.cd <= 0 && d < range) {
          tu.st = 'charge';
          tu.tt = 0;
          if (onScreen(tu)) laserChargeSound();
        }
      } else if (tu.st === 'charge') {
        tu.tt += dt;
        // Son anda nişan kilitlenir: kaçmak için kısa bir fırsat
        if (tu.tt < CHARGE_TIME - 0.45) tu.aim = turnTo(tu.aim, want, Math.min(1, dt * 7));
        if (tu.tt >= CHARGE_TIME) {
          tu.st = 'fire';
          tu.tt = 0;
          tu.hitRivals = new Set();
          if (onScreen(tu)) laserFireSound();
        }
      } else {
        tu.tt += dt;
        const b = beamOf(tu);
        if (playing && segDist(b.sx, b.sy, b.ex, b.ey, hole.x, hole.y) < hole.r * 0.75 + b.w) hurtPlayer(0.85, 'Lazer!');
        for (const rv of rivals) {
          if (!tu.hitRivals.has(rv) && segDist(b.sx, b.sy, b.ex, b.ey, rv.x, rv.y) < rv.r * 0.75 + b.w) {
            tu.hitRivals.add(rv);
            rv.r *= 0.85;
          }
        }
        if (tu.tt >= FIRE_TIME) {
          tu.st = 'idle';
          tu.cd = Math.max(1.4, rnd(2.6, 4) - level * 0.12);
        }
      }
      tu.rot = tu.aim;

      if (playing) {
        if (tu.r < hole.r * EAT_RATIO) {
          const dd = attract(tu, hole, dt, 10);
          if (dd < hole.r * 0.9) {
            turrets.splice(i, 1);
            run.turrets++;
            eat(tu, 3, 'Lazer uydu yutuldu!');
            continue;
          }
        } else {
          pushHoleFrom(tu, playing);
        }
      }
      if (tu.r < hole.r * 0.3 || Math.hypot(tu.x - cam.x, tu.y - cam.y) > hd * 2.2) {
        tu.gone = true;
        turrets.splice(i, 1);
      }
    }
  }

  function spawnNova() {
    const r = hole.r * rnd(0.75, 1.3);
    const blast = hole.r * 7;
    const a = rnd(0, TAU), d = rnd(blast * 0.45, blast * 0.85);
    novas.push({
      t: STAR_T, x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, r,
      vx: 0, vy: 0, rot: rnd(0, TAU), vr: 0.3, sp: getSprite(STAR_T),
      fuse: rnd(3.5, 4.5), age: 0, blast, st: 'fuse', bt: 0, hit: false, fade: 0, bump: 0, gone: false, cid: 'nova', cname: 'Süpernova',
    });
  }

  function explode(n) {
    const near = onScreen(n, n.blast * zoom);
    shake = Math.max(shake, near ? 0.6 : 0.2);
    if (near) { boomSound(); vibrate(80); }
    for (const o of objs) {
      const ex = o.x - n.x, ey = o.y - n.y, e = Math.hypot(ex, ey);
      if (e > 0 && e < n.blast) {
        const f = (1 - e / n.blast) * n.blast * 0.6;
        o.vx += (ex / e) * f;
        o.vy += (ey / e) * f;
      }
    }
    for (const rv of rivals) {
      if (Math.hypot(rv.x - n.x, rv.y - n.y) < n.blast) rv.r *= 0.85;
    }
  }

  function updateNovas(dt, hd, playing) {
    for (let i = novas.length - 1; i >= 0; i--) {
      const n = novas[i];
      n.fade = Math.min(1, n.fade + dt * 2);
      n.rot += n.vr * dt;
      const dx = hole.x - n.x, dy = hole.y - n.y, d = Math.hypot(dx, dy) || 1e-6;
      if (n.st === 'fuse') {
        n.age += dt;
        if (playing) {
          if (n.r < hole.r * EAT_RATIO) {
            if (d < hole.r * 0.9) {
              novas.splice(i, 1);
              run.novas++;
              eat(n, 4, 'Süpernova etkisiz!');
              continue;
            }
          } else {
            pushHoleFrom(n, playing);
          }
        }
        if (n.age >= n.fuse) {
          n.st = 'boom';
          n.bt = 0;
          explode(n);
        }
      } else {
        n.bt += dt;
        const rad = n.blast * (1 - Math.pow(1 - Math.min(1, n.bt / BLAST_TIME), 3));
        if (playing && !n.hit && d - hole.r < rad && d < n.blast + hole.r) {
          n.hit = true;
          hurtPlayer(0.85, 'Süpernova!');
          const kick = baseSpeed() * 1.6;
          hole.kx += (dx / d) * kick;
          hole.ky += (dy / d) * kick;
        }
        if (n.bt > 1) {
          n.gone = true;
          novas.splice(i, 1);
          continue;
        }
      }
      if (Math.hypot(n.x - cam.x, n.y - cam.y) > hd * 2.5) {
        n.gone = true;
        novas.splice(i, 1);
      }
    }
  }

  // =====================================================================
  //  Kalıcı ilerleme: görevler, ansiklopedi, görünümler
  // =====================================================================
  const meta = Object.assign({ done: {}, seen: {}, skin: 'classic' }, store('funhole.meta') || {});
  const saveMeta = () => store('funhole.meta', meta);
  let run = null; // bu oyunun istatistikleri

  // Nadir (altın) cisimler: kaçarlar, yakalanırsa büyük bonus
  const RARES = [
    ['cat', '🐱', 'Uzay Kedisi'],
    ['tesla', '🚗', 'Kayıp Tesla'],
    ['voyager', '📡', 'Voyager Sondası'],
    ['duck', '🦆', 'Lastik Ördek'],
    ['pizza', '🍕', 'Uzay Pizzası'],
    ['alien', '👽', 'Kayıp Uzaylı'],
    ['guitar', '🎸', 'Elektro Gitar'],
    ['trophy', '🏆', 'Kozmik Kupa'],
  ].map(([id, emoji, name]) => ({ id: 'rare_' + id, emoji, name, col: '#ffd36b', spin: 0.8 }));

  const SKINS = [
    { id: 'classic', name: 'Klasik' },
    { id: 'violet', name: 'Mor Girdap', col: [170, 90, 255], mission: 'rival1' },
    { id: 'gold', name: 'Altın', col: [255, 200, 60], mission: 'rare1' },
    { id: 'crimson', name: 'Kızıl Lazer', col: [255, 60, 60], mission: 'laser2' },
    { id: 'ice', name: 'Buz', col: [120, 215, 255], mission: 'nohit' },
    { id: 'toxic', name: 'Zehir', col: [120, 255, 90], mission: 'rivals3' },
    { id: 'rainbow', name: 'Gökkuşağı', rainbow: true, mission: 'win' },
  ];
  const skinUnlocked = (s) => !s.mission || !!meta.done[s.mission];

  const MISSIONS = [
    { id: 'rival1', text: 'Bir rakip kara deliği yut', ok: () => run.rivals >= 1 },
    { id: 'level5', text: '5. seviyeye ulaş', ok: () => level >= 4 },
    { id: 'rare1', text: 'Bir altın cisim yakala', ok: () => run.rares >= 1 },
    { id: 'combo3', text: 'x3 komboya ulaş', ok: () => comboMult() >= 3 },
    { id: 'laser2', text: 'Bir oyunda 2 lazer uyduyu yut', ok: () => run.turrets >= 2 },
    { id: 'nova1', text: 'Bir süpernovayı patlamadan yut', ok: () => run.novas >= 1 },
    { id: 'worm', text: 'Bir solucan deliğinden geç', ok: () => run.worms >= 1 },
    { id: 'nohit', text: 'Hiç vurulmadan 6. seviyeye çık', ok: () => level >= 5 && run.hits === 0 },
    { id: 'rivals3', text: 'Bir oyunda 3 rakip yut', ok: () => run.rivals >= 3 },
    { id: 'rare3', text: 'Bir oyunda 3 altın cisim yakala', ok: () => run.rares >= 3 },
    { id: 'win', text: 'Evrenin sonuna ulaş', ok: () => level >= LEVELS.length - 1 },
    { id: 'fast', text: 'Evrenin sonuna 15 dakikadan kısa sürede ulaş', ok: () => level >= LEVELS.length - 1 && playTime < 900 },
  ];

  function hslRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
  }

  const skinPalCache = {};
  function currentSkin() {
    return SKINS.find((k) => k.id === meta.skin && skinUnlocked(k)) || SKINS[0];
  }
  function playerPalette() {
    const s = currentSkin();
    if (s.rainbow) return rivalPalette(hslRgb((time * 60) % 360, 90, 62));
    if (!s.col) return PLAYER_PAL;
    return skinPalCache[s.id] || (skinPalCache[s.id] = rivalPalette(s.col));
  }

  function checkMissions() {
    for (const m of MISSIONS) {
      if (meta.done[m.id] || !m.ok()) continue;
      meta.done[m.id] = true;
      saveMeta();
      const skin = SKINS.find((s) => s.mission === m.id);
      toast(`✅ Görev tamamlandı: ${m.text}${skin ? `\n🎨 Yeni görünüm açıldı: ${skin.name}` : ''}`, 'good');
      chimeSound();
    }
  }

  function discover(id, name) {
    if (!id || meta.seen[id]) return;
    meta.seen[id] = true;
    saveMeta();
    toast(`📖 Yeni keşif: ${name}`);
  }

  // Sırayla gösterilen kısa bildirimler
  const toastQ = [];
  let toastBusy = false;
  function toast(text, cls = '') {
    if (toastQ.length > 4) toastQ.shift();
    toastQ.push([text, cls]);
    if (!toastBusy) nextToast();
  }
  function nextToast() {
    const el = $('toast');
    const item = toastQ.shift();
    if (!item) {
      toastBusy = false;
      return;
    }
    toastBusy = true;
    el.textContent = item[0];
    el.className = 'show ' + item[1];
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(nextToast, 250);
    }, 2200);
  }

  function codexEntries() {
    const list = TYPES.map((t) => ({ id: t.id, name: t.name, t }));
    list.push({ id: 'rival', name: 'Rakip Kara Delik', rival: true });
    list.push({ id: 'nova', name: 'Süpernova', t: STAR_T });
    for (const r of RARES) list.push({ id: r.id, name: r.name, t: r, rare: true });
    return list;
  }

  function openCodex() {
    const grid = $('codexGrid');
    grid.textContent = '';
    const list = codexEntries();
    let n = 0;
    for (const e of list) {
      const known = !!meta.seen[e.id];
      if (known) n++;
      const cell = document.createElement('div');
      cell.className = 'cx' + (known ? '' : ' locked') + (e.rare ? ' rare' : '');
      const S = 52, c = document.createElement('canvas');
      c.width = c.height = S * 2;
      const g = c.getContext('2d');
      const sp = e.rival ? rivalSprite([160, 100, 255]) : getSprite(e.t);
      const size = S * 2 * 0.62 * Math.min(sp.scale, 2.2);
      g.drawImage(sp.img, S - size / 2, S - size / 2, size, size);
      const label = document.createElement('span');
      label.textContent = known ? e.name : '???';
      cell.append(c, label);
      grid.append(cell);
    }
    $('codexCount').textContent = `${n} / ${list.length} keşfedildi`;
    $('codex').classList.add('show');
  }

  function renderMenu() {
    showBest();
    $('howBox').open = !store('funhole.best');
    const sk = $('skins');
    sk.textContent = '';
    for (const s of SKINS) {
      const open = skinUnlocked(s);
      const b = document.createElement('button');
      b.className = 'skin' + (currentSkin() === s ? ' on' : '') + (open ? '' : ' locked');
      b.style.setProperty('--c', s.rainbow
        ? 'conic-gradient(#ff4d4d,#ffb84d,#fff04d,#5dff6a,#4de8ff,#6a5dff,#ff4dd8,#ff4d4d)'
        : `rgb(${s.col || [255, 140, 50]})`);
      const i = document.createElement('i');
      const span = document.createElement('span');
      span.textContent = open ? s.name : '🔒';
      b.append(i, span);
      const m = MISSIONS.find((x) => x.id === s.mission);
      b.title = open ? s.name : `Kilidi açmak için: ${m.text}`;
      b.addEventListener('click', () => {
        if (!open) { toast(`🔒 ${s.name}: ${m.text}`); return; }
        meta.skin = s.id;
        saveMeta();
        renderMenu();
      });
      sk.append(b);
    }
    const ml = $('missions');
    ml.textContent = '';
    const todo = MISSIONS.filter((m) => !meta.done[m.id]).slice(0, 3);
    for (const m of todo) {
      const li = document.createElement('li');
      li.textContent = m.text;
      const skin = SKINS.find((s) => s.mission === m.id);
      if (skin) {
        const em = document.createElement('em');
        em.textContent = ` → ${skin.name}`;
        li.append(em);
      }
      ml.append(li);
    }
    if (!todo.length) {
      const li = document.createElement('li');
      li.textContent = 'Tüm görevler tamam! 🏆';
      ml.append(li);
    }
    $('missionCount').textContent = `${MISSIONS.filter((m) => meta.done[m.id]).length}/${MISSIONS.length}`;
  }

  // =====================================================================
  //  Atılma, nadir cisimler ve uzay olayları
  // =====================================================================
  const DASH_TIME = 0.3, DASH_CD = 5, DASH_MUL = 2.8;
  let ev = null, evT = 0, rareT = 0, flash = 0, trails = [], missionT = 0;

  function tryDash() {
    if (state !== 'play' || hole.dead || hole.dashCd > 0) return;
    let [ix, iy] = readInput();
    let m = Math.hypot(ix, iy);
    if (m < 0.2) { ix = hole.vx; iy = hole.vy; m = Math.hypot(ix, iy); }
    if (m < 1e-6) { ix = Math.cos(hole.face); iy = Math.sin(hole.face); m = 1; }
    hole.dashX = ix / m;
    hole.dashY = iy / m;
    hole.dash = DASH_TIME;
    hole.dashCd = DASH_CD;
    run.dashes++;
    dashSound();
  }

  function showBanner(big, name, desc, cls = '') {
    const b = $('banner');
    b.querySelector('.big').textContent = big;
    b.querySelector('.name').textContent = name;
    b.querySelector('.desc').textContent = desc;
    b.className = cls;
    void b.offsetWidth; // animasyonu yeniden başlat
    b.className = (cls + ' show').trim();
  }

  function spawnRare() {
    const hd = halfDiag(zoom);
    const t = pick(RARES);
    const a = rnd(0, TAU), d = hd * rnd(0.75, 1.05);
    objs.push({
      t, x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, r: hole.r * rnd(0.4, 0.55),
      vx: 0, vy: 0, rot: 0, vr: 0.8, sp: getSprite(t), fade: 0, bump: 0, gone: false,
      rare: true, life: 22, wander: rnd(0, TAU),
    });
    toast(`✨ Nadir cisim: ${t.name}! Kaçmadan yakala`, 'gold');
    sparkleSound();
  }

  // Bir noktanın çevresine yenebilir cisimler serpiştir
  function spawnFoodAt(cx, cy, minD, maxD, n) {
    for (let i = 0; i < n; i++) {
      const s = hole.r * (0.15 + 0.55 * Math.pow(Math.random(), 1.3));
      const t = pickType(s), r = clamp(s, t.min, t.max);
      const a = rnd(0, TAU), d = minD + Math.sqrt(Math.random()) * (maxD - minD);
      objs.push({
        t, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r, vx: 0, vy: 0,
        rot: rnd(0, TAU), vr: rnd(-1, 1) * t.spin, sp: getSprite(t), fade: 0, bump: 0, gone: false,
      });
    }
  }

  function spawnMeteor(hd) {
    const dir = ev.dir + rnd(-0.12, 0.12);
    const px = -Math.sin(ev.dir), py = Math.cos(ev.dir), off = rnd(-1, 1) * hd * 0.9;
    const s = hole.r * (0.15 + 0.5 * Math.pow(Math.random(), 1.4));
    const t = pickType(s), r = clamp(s, t.min, t.max);
    const sp = baseSpeed() * rnd(0.7, 1);
    objs.push({
      t, r,
      x: hole.x - Math.cos(dir) * hd * 1.15 + px * off,
      y: hole.y - Math.sin(dir) * hd * 1.15 + py * off,
      vx: Math.cos(dir) * sp, vy: Math.sin(dir) * sp,
      rot: rnd(0, TAU), vr: rnd(-2, 2), sp: getSprite(t), fade: 0.4, bump: 0, gone: false, meteor: true,
    });
  }

  function startEvent(kind) {
    const hd = halfDiag(zoom);
    kind = kind || pick(['meteor', 'meteor', 'cloud', 'worm']);
    const a = rnd(0, TAU);
    if (kind === 'meteor') {
      ev = { kind, t: 0, dur: 10, dir: a, acc: 0 };
      showBanner('METEOR YAĞMURU', '☄️ Gökten yem yağıyor!', 'Fırsatı kaçırma, topla hepsini', 'event');
    } else if (kind === 'cloud') {
      const d = hd * rnd(0.5, 0.8), r = hd * rnd(0.45, 0.6);
      ev = {
        kind, t: 0, dur: 18, x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, r,
        blobs: Array.from({ length: 9 }, () => ({ a: rnd(0, TAU), d: Math.sqrt(Math.random()) * 0.7, s: rnd(0.35, 0.6), w: rnd(-0.3, 0.3) })),
      };
      spawnFoodAt(ev.x, ev.y, 0, r * 0.85, 12);
      showBanner('KARA MADDE', '🐌 İçinde çok yavaşlarsın', 'Ama içi yem dolu: risk al ya da uzak dur', 'event');
    } else {
      const d = hd * rnd(0.45, 0.7);
      ev = { kind, t: 0, dur: 18, x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, r: hole.r * 1.4 };
      showBanner('SOLUCAN DELİĞİ', '🌀 Uzayın başka bir köşesine açılıyor', 'Gir, rakiplerden kurtul, yeni bölgeye fırla', 'event');
    }
    eventSound();
  }

  const evAlpha = () => (ev ? clamp(Math.min(ev.t / 1.5, (ev.dur - ev.t) / 1.5), 0, 1) : 0);

  // Kara madde bulutunun içindeysen yavaşlarsın
  function cloudMul(x, y) {
    if (!ev || ev.kind !== 'cloud' || evAlpha() < 0.3) return 1;
    return Math.hypot(x - ev.x, y - ev.y) < ev.r ? 0.4 : 1;
  }

  function teleport(hd) {
    const a = rnd(0, TAU), d = hd * 6;
    const ox = Math.cos(a) * d, oy = Math.sin(a) * d;
    hole.x += ox; hole.y += oy;
    cam.x += ox; cam.y += oy;
    trails.length = 0;
    flash = 1;
    run.worms++;
    // Geride kalan rakipler ve tehlikeler uzakta kaldığı için kaybolur
    spawnFoodAt(hole.x, hole.y, hole.r * 3, hd * 0.8, 14);
    popups.push({ x: hole.x, y: hole.y - hole.r * 2, text: 'Yeni bölge!', t: 0, big: true, col: '#8fe8ff' });
    teleportSound();
  }

  function updateEvents(dt, hd) {
    if (state !== 'play') return;
    if (!ev) {
      if ((evT -= dt) <= 0) {
        startEvent();
        evT = rnd(40, 65);
      }
    } else {
      ev.t += dt;
      if (ev.kind === 'meteor' && ev.t < ev.dur) {
        ev.acc += dt;
        while (ev.acc > 0.16) {
          ev.acc -= 0.16;
          spawnMeteor(hd);
        }
      } else if (ev.kind === 'worm' && ev.t > 0.5 && ev.t < ev.dur - 0.5) {
        if (Math.hypot(hole.x - ev.x, hole.y - ev.y) < ev.r * 0.8 + hole.r * 0.2) {
          ev = null;
          teleport(hd);
          return;
        }
      }
      if (ev.t >= ev.dur) ev = null;
    }
    if (!objs.some((o) => o.rare) && (rareT -= dt) <= 0) {
      spawnRare();
      rareT = rnd(25, 40);
    }
  }

  // Nadir cisim oyuncudan kaçar; ömrü dolunca kaybolur
  function updateRare(o, dt, hd) {
    o.life -= dt;
    if (o.life < 2) o.fade = Math.max(0, o.life / 2);
    const ex = o.x - hole.x, ey = o.y - hole.y, e = Math.hypot(ex, ey) || 1e-6;
    let dx, dy, s;
    if (e < hd * 0.9) {
      o.wander += rnd(-3, 3) * dt;
      dx = ex / e + Math.cos(o.wander) * 0.6;
      dy = ey / e + Math.sin(o.wander) * 0.6;
      s = 0.7;
    } else {
      o.wander += rnd(-1, 1) * dt;
      dx = Math.cos(o.wander);
      dy = Math.sin(o.wander);
      s = 0.25;
    }
    const m = Math.hypot(dx, dy) || 1, v = baseSpeed() * s * cloudMul(o.x, o.y), k = Math.min(1, dt * 3);
    o.vx += ((dx / m) * v - o.vx) * k;
    o.vy += ((dy / m) * v - o.vy) * k;
    return o.life > 0;
  }

  // =====================================================================
  //  Müzik (WebAudio ile üretilen, seviyeyle yoğunlaşan uzay müziği)
  // =====================================================================
  let musicOn = store('funhole.music') !== false;
  const music = { pad: null, filter: null, next: 0, step: 0, chord: 0 };
  const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Lam Fa Do Sol
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function syncMusicGain() {
    if (!musicGain) return;
    musicGain.gain.setTargetAtTime(musicOn && !muted ? 1 : 0, actx.currentTime, 0.3);
  }

  function startPad() {
    music.filter = actx.createBiquadFilter();
    music.filter.type = 'lowpass';
    music.filter.frequency.value = 500;
    const g = actx.createGain();
    g.gain.value = 0.03;
    music.filter.connect(g).connect(musicGain);
    music.pad = PROG[0].map((n, i) => {
      const o = actx.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sawtooth';
      o.frequency.value = midi(n - 12);
      o.detune.value = rnd(-8, 8);
      o.connect(music.filter);
      o.start();
      return o;
    });
    music.next = actx.currentTime + 0.1;
  }

  function pluck(f, t, vol, dur, type = 'triangle') {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(musicGain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function musicTick() {
    if (!actx || !musicGain || !musicOn || muted || actx.state !== 'running') return;
    if (!music.pad) startPad();
    const now = actx.currentTime;
    const lv = state === 'play' ? level : 0;
    music.filter.frequency.setTargetAtTime(450 + lv * 140, now, 1.5);
    if (music.next < now) music.next = now;
    while (music.next < now + 0.25) {
      const t = music.next;
      if (music.step % 16 === 0) {
        music.chord = (music.chord + 1) % PROG.length;
        PROG[music.chord].forEach((n, i) => music.pad[i].frequency.setTargetAtTime(midi(n - 12), t, 0.5));
      }
      const ch = PROG[music.chord];
      if (Math.random() < (state === 'play' ? 0.3 + lv * 0.05 : 0.18)) {
        pluck(midi(pick(ch) + 12 * pick([1, 1, 2])), t, 0.045, 0.7);
      }
      if (state === 'play' && music.step % 8 === 0) pluck(midi(ch[0] - 24), t, 0.09, 0.9, 'sine');
      if (state === 'play' && lv >= 5 && music.step % 4 === 2) pluck(midi(ch[0] - 12), t, 0.04, 0.25, 'square');
      music.step++;
      music.next = t + (0.3 - Math.min(lv, 9) * 0.01);
    }
  }

  // =====================================================================
  //  Girdi: fare / dokunmatik joystick / klavye
  // =====================================================================
  const input = { mode: 'none', active: false, mx: 0, my: 0, touchId: null, jx0: 0, jy0: 0, jx: 0, jy: 0 };
  const keys = new Set();

  canvas.addEventListener('pointerdown', (e) => {
    initAudio();
    if (e.pointerType === 'mouse') {
      input.mode = 'mouse';
      input.active = true;
      input.mx = e.clientX;
      input.my = e.clientY;
      tryDash(); // tıklama = atılma
      return;
    }
    if (input.touchId !== null) {
      tryDash(); // ikinci parmak = atılma
      return;
    }
    input.mode = 'touch';
    input.touchId = e.pointerId;
    input.active = true;
    input.jx0 = input.jx = e.clientX;
    input.jy0 = input.jy = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* yok say */ }
    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') {
      input.mode = 'mouse';
      input.active = true;
      input.mx = e.clientX;
      input.my = e.clientY;
    } else if (e.pointerId === input.touchId) {
      input.jx = e.clientX;
      input.jy = e.clientY;
      // Joystick'in merkezi parmağı takip eder (yön değiştirmek kolay olsun)
      const dx = input.jx - input.jx0, dy = input.jy - input.jy0, d = Math.hypot(dx, dy);
      if (d > JOY_R) {
        input.jx0 = input.jx - (dx / d) * JOY_R;
        input.jy0 = input.jy - (dy / d) * JOY_R;
      }
    }
  });

  const endTouch = (e) => {
    if (e.pointerId === input.touchId) {
      input.touchId = null;
      input.active = false;
    }
  };
  window.addEventListener('pointerup', endTouch);
  window.addEventListener('pointercancel', endTouch);
  document.documentElement.addEventListener('mouseleave', () => {
    if (input.mode === 'mouse') input.active = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase());
    if (e.key === 'Enter' && state === 'menu') startGame();
    if (e.key === ' ') {
      e.preventDefault();
      tryDash();
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  function readInput() {
    let ix = 0, iy = 0;
    if (keys.has('arrowleft') || keys.has('a')) ix -= 1;
    if (keys.has('arrowright') || keys.has('d')) ix += 1;
    if (keys.has('arrowup') || keys.has('w')) iy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) iy += 1;
    if (ix || iy) {
      const d = Math.hypot(ix, iy);
      return [ix / d, iy / d];
    }
    if (!input.active) return [0, 0];
    if (input.mode === 'mouse') {
      const hs = w2s(hole.x, hole.y);
      const dx = input.mx - hs.x, dy = input.my - hs.y, d = Math.hypot(dx, dy);
      const dead = hole.dr * zoom * 0.25;
      if (d <= dead) return [0, 0];
      const m = Math.min(1, (d - dead) / 140);
      return [(dx / d) * m, (dy / d) * m];
    }
    if (input.mode === 'touch') {
      const dx = input.jx - input.jx0, dy = input.jy - input.jy0, d = Math.hypot(dx, dy);
      if (d < 6) return [0, 0];
      const m = Math.min(1, d / JOY_R);
      return [(dx / d) * m, (dy / d) * m];
    }
    return [0, 0];
  }

  // =====================================================================
  //  Güncelleme
  // =====================================================================
  function w2s(x, y) {
    return { x: (x - cam.x) * zoom + W / 2 + shakeX, y: (y - cam.y) * zoom + H / 2 + shakeY };
  }

  function update(dt) {
    time += dt;
    const playing = state === 'play';
    if (playing) playTime += dt;
    const zt = zoomTarget();
    const hd = halfDiag(Math.min(zoom, zt));

    // Delik hareketi
    if (!hole.dead) {
      const [ix, iy] = playing ? readInput() : [0, 0];
      const spd = baseSpeed() * cloudMul(hole.x, hole.y);
      if (hole.dash > 0) {
        hole.dash -= dt;
        hole.vx = hole.dashX * spd * DASH_MUL;
        hole.vy = hole.dashY * spd * DASH_MUL;
        if (Math.random() < dt * 45) trails.push({ x: hole.x, y: hole.y, r: hole.r, t: 0 });
      } else {
        const k = Math.min(1, dt * 7);
        hole.vx += (ix * spd - hole.vx) * k;
        hole.vy += (iy * spd - hole.vy) * k;
      }
      if (Math.hypot(hole.vx, hole.vy) > spd * 0.1) hole.face = Math.atan2(hole.vy, hole.vx);
      hole.x += (hole.vx + hole.kx) * dt;
      hole.y += (hole.vy + hole.ky) * dt;
      const kd = Math.exp(-dt * 3);
      hole.kx *= kd;
      hole.ky *= kd;
    }
    hole.dr += (hole.r - hole.dr) * Math.min(1, dt * 8);
    hole.pulse = Math.max(0, hole.pulse - dt * 2.5);
    hole.inv = Math.max(0, hole.inv - dt);
    hole.hurt = Math.max(0, hole.hurt - dt * 2);
    hole.dashCd = Math.max(0, hole.dashCd - dt);
    shake = Math.max(0, shake - dt * 1.5);
    flash = Math.max(0, flash - dt * 1.5);
    for (let i = trails.length - 1; i >= 0; i--) {
      trails[i].t += dt * 3;
      if (trails[i].t >= 1) trails.splice(i, 1);
    }

    // Hawking ışıması: uzun süre yemezsen buharlaşırsın
    if (playing) {
      hole.idle += dt;
      if (hole.idle > HAWKING_DELAY && hole.r > minHoleR()) {
        hole.r = Math.max(minHoleR(), hole.r * (1 - HAWKING_RATE * dt));
        if (Math.random() < dt * 14) {
          particles.push({ ang: rnd(0, TAU), d: hole.r * 1.05, life: rnd(0.5, 0.9), t: 0, col: '#b8e1ff', out: true });
        }
      }
    }

    // Kamera ve zoom
    cam.x += (hole.x - cam.x) * Math.min(1, dt * 6);
    cam.y += (hole.y - cam.y) * Math.min(1, dt * 6);
    zoom = Math.exp(Math.log(zoom) + (Math.log(zt) - Math.log(zoom)) * Math.min(1, dt * 2.2));

    // Yıldız paralaksı (ekran pikseli cinsinden)
    for (const L of starLayers) {
      L.ox += hole.vx * zoom * L.par * dt;
      L.oy += hole.vy * zoom * L.par * dt;
    }

    updateRivals(dt, hd, playing);

    // Cisimler
    const R = hole.r;
    const despawnD = hd * 1.9;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      if (o.fade < 1) o.fade = Math.min(1, o.fade + dt * 1.8);
      if (o.bump > 0) o.bump -= dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.rot += o.vr * dt;
      if (o.rare && !updateRare(o, dt, hd)) {
        o.gone = true;
        objs.splice(i, 1);
        if (onScreen(o)) popups.push({ x: o.x, y: o.y, text: `${o.t.name} kaçtı!`, t: 0, big: true, col: '#ffd36b' });
        continue;
      }

      if (o.r < R * EAT_RATIO) {
        const d = attract(o, hole, dt, 14);
        if (d < R * 0.9 && playing) {
          objs.splice(i, 1);
          if (o.rare) {
            run.rares++;
            eat(o, 25, `✨ ${o.t.name}`, 4);
            sparkleSound();
          } else {
            eat(o);
          }
          continue;
        }
      } else {
        pushHoleFrom(o, playing);
      }

      // Rakipler de yer
      let taken = false;
      for (const rv of rivals) {
        if (o.r < rv.r * EAT_RATIO) {
          const rd = attract(o, rv, dt, 10);
          if (rd < rv.r * 0.9) {
            objs.splice(i, 1);
            o.gone = true;
            rivalGrow(rv, o.r);
            swallowAnim(o, rv);
            taken = true;
            break;
          }
        } else {
          const rx = rv.x - o.x, ry = rv.y - o.y, rd = Math.hypot(rx, ry) || 1e-6;
          const minD = rv.r + o.r * 0.85;
          if (rd < minD) {
            rv.x += (rx / rd) * (minD - rd);
            rv.y += (ry / rd) * (minD - rd);
          }
        }
      }
      if (taken) continue;

      if (o.r < R * 0.05 || Math.hypot(o.x - cam.x, o.y - cam.y) > (o.rare ? hd * 2.6 : despawnD)) {
        o.gone = true;
        objs.splice(i, 1);
      }
    }

    rivalInteractions(dt, hd, state === 'play');
    updateTurrets(dt, hd, state === 'play');
    updateNovas(dt, hd, state === 'play');
    updateEvents(dt, hd);
    if (state === 'play' && (missionT -= dt) <= 0) {
      missionT = 0.5;
      checkMissions();
    }

    // Eksik cisimleri tamamla
    const N = targetCount();
    let tries = 0;
    while (objs.length < N && tries++ < 8) {
      if (N - objs.length > N * 0.35) spawnObject(hd * 0.4, hd * 1.45);
      else spawnObject(hd * 1.05, hd * 1.45);
    }

    // Rakip ve tehlike doğurma
    if (state === 'play') {
      if (rivals.length < MAX_RIVALS[level] && (spawnT.rival -= dt) <= 0) {
        spawnRival();
        spawnT.rival = rnd(4, 8);
      }
      if (turrets.length < MAX_TURRETS[level] && (spawnT.turret -= dt) <= 0) {
        spawnTurret();
        spawnT.turret = rnd(5, 9);
      }
      if (level >= NOVA_FROM_LEVEL && novas.length === 0 && (spawnT.nova -= dt) <= 0) {
        spawnNova();
        spawnT.nova = Math.max(6, rnd(10, 16) - level * 0.5);
      }
    }

    // Yutulma animasyonları
    for (let i = eaten.length - 1; i >= 0; i--) {
      const e = eaten[i];
      e.p += dt / e.dur;
      e.o.rot += e.o.vr * dt * 3;
      if (e.p >= 1) eaten.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += dt;
      if (p.out) {
        p.d *= 1 + dt * 2.5;
        p.ang += dt * 1.5;
      } else {
        p.ang += dt * 5;
        p.d *= 1 - Math.min(1, dt * 3.5);
      }
      if (p.t >= p.life) particles.splice(i, 1);
    }

    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].t += dt / (popups[i].col ? 1.6 : 1);
      if (popups[i].t > 1) popups.splice(i, 1);
    }

    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].t += dt;
      if (waves[i].t > 1) waves.splice(i, 1);
    }

    if (combo.t > 0) {
      combo.t -= dt;
      if (combo.t <= 0) combo.n = 0;
    }

    if (state === 'play') updateHud(false);
  }

  // =====================================================================
  //  HUD
  // =====================================================================
  const hudCache = {};
  function setText(id, txt) {
    if (hudCache[id] !== txt) {
      hudCache[id] = txt;
      $(id).textContent = txt;
    }
  }

  function setFlash(id, txt) {
    if (hudCache[id] !== txt) {
      hudCache[id] = txt;
      const el = $(id);
      if (txt) el.textContent = txt;
      el.classList.toggle('show', !!txt);
    }
  }

  function updateHud(force) {
    if (force) for (const k in hudCache) delete hudCache[k];
    setText('lvlName', `Seviye ${level + 1} · ${LEVELS[level].name}`);
    let prog = 1;
    if (level < LEVELS.length - 1) {
      const a = LEVELS[level].r, b = LEVELS[level + 1].r;
      prog = clamp((hole.r - a) / (b - a), 0, 1);
    }
    const w = (prog * 100).toFixed(1) + '%';
    if (hudCache.bar !== w) { hudCache.bar = w; $('barFill').style.width = w; }
    setText('score', fmtNum(score));
    setText('timer', '⏱ ' + fmtTime(playTime));
    const m = comboMult();
    setFlash('combo', m > 1 ? `KOMBO x${m}` : '');

    let warn = '';
    const cd = (hole.dashCd / DASH_CD).toFixed(2);
    if (hudCache.dash !== cd) {
      hudCache.dash = cd;
      const b = $('dashBtn');
      b.style.setProperty('--cd', cd);
      b.classList.toggle('ready', hole.dashCd <= 0);
    }
    if (hole.idle > HAWKING_DELAY) warn = '☢️ Aç kaldın, buharlaşıyorsun!';
    if (cloudMul(hole.x, hole.y) < 1) warn = '🐌 Kara maddedesin, yavaşladın!';
    const hunter = rivals.find((rv) => rv.mode === 'hunt' && hole.r < rv.r * EAT_RATIO);
    if (hunter) warn = `⚠️ ${hunter.name} seni kovalıyor!`;
    setFlash('warn', warn);
  }

  // =====================================================================
  //  Çizim
  // =====================================================================
  function drawBackground() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#fff';
    for (const L of starLayers) {
      const ox = ((L.ox % W) + W) % W, oy = ((L.oy % H) + H) % H;
      for (const s of L.stars) {
        let x = s.x - ox, y = s.y - oy;
        if (x < 0) x += W;
        if (y < 0) y += H;
        ctx.globalAlpha = s.a * (0.65 + 0.35 * Math.sin(time * s.tw + s.ph));
        ctx.fillRect(x, y, s.s, s.s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawObject(o, alpha, mul = 1) {
    const p = w2s(o.x, o.y);
    const size = 2 * o.r * zoom * o.sp.scale * mul;
    if (size < 0.8) return;
    if (p.x + size < 0 || p.x - size > W || p.y + size < 0 || p.y - size > H) return;
    const c = Math.cos(o.rot) * DPR, s = Math.sin(o.rot) * DPR;
    ctx.setTransform(c, s, -s, c, p.x * DPR, p.y * DPR);
    ctx.globalAlpha = alpha;
    ctx.drawImage(o.sp.img, -size / 2, -size / 2, size, size);
  }

  function resetCtx() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([]);
  }

  // Senden büyük olan her şeyin etrafına kırmızı kesikli halka
  function drawDangerRings() {
    const R = hole.r;
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    const ring = (o, extra) => {
      if (o.r < R * EAT_RATIO) return;
      const gap = Math.hypot(o.x - hole.x, o.y - hole.y) - o.r - R;
      const range = R * 3;
      if (gap > range) return;
      const a = clamp(0.65 * (1 - gap / range), 0, 0.65) + (o.bump > 0 ? 0.35 : 0);
      const p = w2s(o.x, o.y);
      ctx.strokeStyle = `rgba(255,70,70,${a * (o.fade ?? 1)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, o.r * zoom * extra + 3, 0, TAU);
      ctx.stroke();
    };
    for (const o of objs) ring(o, 1.08);
    for (const o of turrets) ring(o, 1.08);
    for (const o of novas) if (o.st === 'fuse') ring(o, 1.08);
    for (const o of rivals) ring(o, 1.15);
    ctx.setLineDash([]);
  }

  const PLAYER_PAL = {
    c1: '255,214,150', c2: '255,140,50', c3: '200,60,110', c4: '90,30,140',
    arc: (i) => `rgba(255,${170 - i * 12},${90 + i * 10},${0.45 - i * 0.05})`,
    ring: '255,236,210',
  };

  function drawBlackHole(x, y, R, pal, spin) {
    const g = ctx.createRadialGradient(x, y, R * 0.95, x, y, R * 2.6);
    g.addColorStop(0, `rgba(${pal.c1},0.95)`);
    g.addColorStop(0.08, `rgba(${pal.c2},0.75)`);
    g.addColorStop(0.3, `rgba(${pal.c3},0.3)`);
    g.addColorStop(0.65, `rgba(${pal.c4},0.12)`);
    g.addColorStop(1, `rgba(${pal.c4},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R * 2.6, 0, TAU);
    ctx.fill();

    // Dönen yığılma diski
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, R * 0.05);
    for (let i = 0; i < 7; i++) {
      const rr = R * (1.08 + i * 0.12);
      const a = spin * (2.6 - i * 0.22) + i * 1.7;
      ctx.strokeStyle = pal.arc(i);
      ctx.beginPath(); ctx.arc(x, y, rr, a, a + 1.2 + i * 0.15); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, rr, a + Math.PI, a + Math.PI + 0.8); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = `rgba(${pal.ring},0.9)`;
    ctx.lineWidth = Math.max(1.2, R * 0.04);
    ctx.beginPath();
    ctx.arc(x, y, R * 1.01, 0, TAU);
    ctx.stroke();
  }

  function drawHole() {
    if (hole.dead) return;
    const p = w2s(hole.x, hole.y);
    const R = hole.dr * zoom * (1 + hole.pulse * 0.08);
    ctx.globalAlpha = hole.inv > 0 && Math.sin(time * 40) > 0 ? 0.45 : 1;
    drawBlackHole(p.x, p.y, R, playerPalette(), time);
    // Buharlaşırken mavi bir titreşim
    if (state === 'play' && hole.idle > HAWKING_DELAY) {
      ctx.strokeStyle = `rgba(170,215,255,${0.35 + 0.3 * Math.sin(time * 10)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * 1.25, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawRivals() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const rv of rivals) {
      const p = w2s(rv.x, rv.y), R = rv.dr * zoom;
      if (p.x + R * 3 < 0 || p.x - R * 3 > W || p.y + R * 3 < 0 || p.y - R * 3 > H) continue;
      ctx.globalAlpha = rv.fade;
      drawBlackHole(p.x, p.y, R, rv.pal, rv.spin);
      const danger = hole.r < rv.r * EAT_RATIO, food = rv.r < hole.r * EAT_RATIO;
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.fillStyle = danger ? '#ff6b6b' : food ? '#7dffa0' : '#ffffff';
      const label = rv.name + (danger && rv.mode === 'hunt' ? ' 😈' : '');
      const ly = p.y - R * 1.6 - 10;
      ctx.strokeText(label, p.x, ly);
      ctx.fillText(label, p.x, ly);
    }
    ctx.globalAlpha = 1;
  }

  function drawNovaBodies() {
    for (const n of novas) {
      if (n.st !== 'fuse') continue;
      const k = n.age / n.fuse;
      const pulse = 1 + 0.12 * Math.sin(n.age * (6 + k * 18));
      const p = w2s(n.x, n.y);
      resetCtx();
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, n.r * zoom * 2.6 * pulse);
      gr.addColorStop(0, `rgba(255,120,60,${0.25 + 0.45 * k})`);
      gr.addColorStop(1, 'rgba(255,60,30,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(p.x, p.y, n.r * zoom * 2.6 * pulse, 0, TAU);
      ctx.fill();
      drawObject(n, n.fade, pulse);
    }
    resetCtx();
  }

  function drawNovaEffects() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const n of novas) {
      const p = w2s(n.x, n.y);
      if (n.st === 'fuse') {
        const k = n.age / n.fuse;
        ctx.setLineDash([10, 8]);
        ctx.lineDashOffset = -time * 30;
        ctx.strokeStyle = `rgba(255,150,60,${0.15 + 0.5 * k})`;
        ctx.lineWidth = 2 + k * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.blast * zoom, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        const left = Math.ceil(n.fuse - n.age);
        ctx.font = '900 22px system-ui, sans-serif';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.fillStyle = '#ffb36b';
        const ty = p.y - n.r * zoom * 1.8 - 14;
        ctx.strokeText(left, p.x, ty);
        ctx.fillText(left, p.x, ty);
      } else {
        const a = Math.max(0, 1 - n.bt);
        const rad = n.blast * zoom * (1 - Math.pow(1 - Math.min(1, n.bt / BLAST_TIME), 3));
        if (rad < 1) continue;
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        gr.addColorStop(0, `rgba(255,255,230,${0.8 * a})`);
        gr.addColorStop(0.6, `rgba(255,150,70,${0.35 * a})`);
        gr.addColorStop(1, 'rgba(255,90,40,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,220,160,${a})`;
        ctx.lineWidth = 6 * a + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, TAU);
        ctx.stroke();
      }
    }
  }

  function drawBeams() {
    for (const tu of turrets) {
      if (tu.st === 'idle') continue;
      const b = beamOf(tu);
      const s = w2s(b.sx, b.sy), e = w2s(b.ex, b.ey);
      if (tu.st === 'charge') {
        const k = tu.tt / CHARGE_TIME;
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -time * 60;
        ctx.strokeStyle = `rgba(255,60,60,${0.25 + 0.55 * k})`;
        ctx.lineWidth = 1 + k * 1.5;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,90,90,${0.7 * k})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2 + k * Math.max(6, b.w * zoom * 2), 0, TAU); ctx.fill();
      } else {
        const w = Math.max(3, b.w * zoom * 2) * (1 - (tu.tt / FIRE_TIME) * 0.5);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (const [col, lw] of [['rgba(255,40,40,0.55)', w * 2.2], ['rgba(255,170,170,0.95)', w], ['#ffffff', w * 0.35]]) {
          ctx.strokeStyle = col;
          ctx.lineWidth = lw;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  function drawEaten() {
    for (const e of eaten) {
      const p = e.p;
      const ang = e.ang + p * p * 5;
      const d = e.d * Math.pow(1 - p, 1.2);
      const o = e.o;
      const sp = w2s(e.host.x + Math.cos(ang) * d, e.host.y + Math.sin(ang) * d);
      const size = 2 * o.r * zoom * o.sp.scale * Math.pow(1 - p, 0.7);
      if (size < 0.5) continue;
      // Spagettileşme: merkeze doğru uzayıp incelir
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.translate(sp.x, sp.y);
      ctx.rotate(ang);
      ctx.scale(1 + p * 1.4, 1 - p * 0.6);
      ctx.rotate(o.rot - ang);
      ctx.globalAlpha = 1 - p * p;
      ctx.drawImage(o.sp.img, -size / 2, -size / 2, size, size);
    }
    resetCtx();
  }

  function drawParticles() {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const s = w2s(hole.x + Math.cos(p.ang) * p.d, hole.y + Math.sin(p.ang) * p.d);
      const k = 1 - p.t / p.life;
      ctx.globalAlpha = k;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1 + 2 * k, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawWaves() {
    const p = w2s(hole.x, hole.y);
    const R = hole.dr * zoom;
    for (const w of waves) {
      ctx.strokeStyle = `rgba(255,200,120,${(1 - w.t) * 0.8})`;
      ctx.lineWidth = 4 * (1 - w.t) + 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * (1.2 + w.t * 8), 0, TAU);
      ctx.stroke();
    }
  }

  function drawPopups() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    for (const pp of popups) {
      const s = w2s(pp.x, pp.y);
      const x = clamp(s.x, 90, W - 90);
      ctx.globalAlpha = 1 - pp.t * pp.t;
      ctx.font = `800 ${pp.col ? 16 : pp.big ? 18 : 13}px system-ui, sans-serif`;
      ctx.fillStyle = pp.col || (pp.big ? '#ffd36b' : '#ffffff');
      if (pp.col) ctx.strokeText(pp.text, x, s.y - pp.t * 40);
      ctx.fillText(pp.text, x, s.y - pp.t * 40);
    }
    ctx.globalAlpha = 1;
  }

  // Ekran dışındaki rakip ve süpernovaları kenarda okla göster
  function drawArrows() {
    if (state !== 'play') return;
    const hd = halfDiag(zoom);
    const items = [];
    for (const rv of rivals) {
      const col = hole.r < rv.r * EAT_RATIO ? '255,80,80' : rv.r < hole.r * EAT_RATIO ? '110,255,150' : '255,255,255';
      items.push([rv, col]);
    }
    for (const n of novas) if (n.st === 'fuse') items.push([n, '255,160,60']);
    for (const o of objs) if (o.rare) items.push([o, '255,210,80']);
    if (ev && ev.kind === 'worm') items.push([ev, '90,220,255']);
    for (const [o, col] of items) {
      if (onScreen(o)) continue;
      const dist = Math.hypot(o.x - hole.x, o.y - hole.y);
      if (dist > hd * 2.5) continue;
      const p = w2s(o.x, o.y);
      const cx = W / 2, cy = H / 2, dx = p.x - cx, dy = p.y - cy;
      const lim = Math.min(
        (W / 2 - 22) / Math.max(Math.abs(dx), 1e-6),
        (dy < 0 ? H / 2 - 84 : H / 2 - 30) / Math.max(Math.abs(dy), 1e-6),
      );
      const x = cx + dx * lim, y = cy + dy * lim;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.fillStyle = `rgba(${col},${clamp(1.3 - dist / (hd * 2.5), 0.35, 1)})`;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-7, -10);
      ctx.lineTo(-7, 10);
      ctx.closePath();
      ctx.fill();
    }
    resetCtx();
  }

  function drawHurt() {
    if (hole.hurt <= 0) return;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) / 2);
    g.addColorStop(0, 'rgba(255,0,0,0)');
    g.addColorStop(1, `rgba(255,30,30,${0.5 * hole.hurt})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawJoystick() {
    if (state !== 'play' || input.mode !== 'touch' || !input.active) return;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(input.jx0, input.jy0, JOY_R, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.arc(input.jx, input.jy, 22, 0, TAU);
    ctx.fill();
  }

  function drawRareGlow(o) {
    const p = w2s(o.x, o.y), R = o.r * zoom;
    if (p.x + R * 3 < 0 || p.x - R * 3 > W || p.y + R * 3 < 0 || p.y - R * 3 > H) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = o.fade;
    const pul = 1 + 0.15 * Math.sin(time * 6);
    const g = ctx.createRadialGradient(p.x, p.y, R * 0.3, p.x, p.y, R * 2.2 * pul);
    g.addColorStop(0, 'rgba(255,220,120,0.8)');
    g.addColorStop(1, 'rgba(255,180,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * 2.2 * pul, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff6c8';
    for (let i = 0; i < 4; i++) {
      const a = time * 2 + (i * TAU) / 4, s = Math.max(2, R * 0.14) * (0.6 + 0.4 * Math.sin(time * 8 + i));
      ctx.fillRect(p.x + Math.cos(a) * R * 1.6 - s / 2, p.y + Math.sin(a) * R * 1.6 - s / 2, s, s);
    }
  }

  function drawMeteorTrail(o) {
    const p = w2s(o.x, o.y), v = Math.hypot(o.vx, o.vy) || 1;
    const L = Math.min(170, v * zoom * 0.35);
    const ex = p.x - (o.vx / v) * L, ey = p.y - (o.vy / v) * L;
    if (Math.max(p.x, ex) < 0 || Math.min(p.x, ex) > W || Math.max(p.y, ey) < 0 || Math.min(p.y, ey) > H) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = o.fade;
    const g = ctx.createLinearGradient(p.x, p.y, ex, ey);
    g.addColorStop(0, 'rgba(255,200,140,0.6)');
    g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = Math.max(2, o.r * zoom * 1.2);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Atılırken arkada kalan iz
  function drawTrails() {
    const pal = playerPalette();
    for (const tr of trails) {
      const p = w2s(tr.x, tr.y);
      ctx.fillStyle = `rgba(${pal.c2},${0.3 * (1 - tr.t)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, tr.r * zoom * (1 - tr.t * 0.3), 0, TAU);
      ctx.fill();
    }
  }

  function drawCloud() {
    if (!ev || ev.kind !== 'cloud') return;
    const a = evAlpha();
    if (a <= 0) return;
    const p = w2s(ev.x, ev.y), R = ev.r * zoom;
    for (const b of ev.blobs) {
      const ang = b.a + time * b.w;
      const x = p.x + Math.cos(ang) * b.d * R, y = p.y + Math.sin(ang) * b.d * R, r = b.s * R;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(120,60,210,${0.32 * a})`);
      g.addColorStop(0.6, `rgba(80,35,160,${0.22 * a})`);
      g.addColorStop(1, 'rgba(60,20,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    ctx.setLineDash([4, 10]);
    ctx.lineDashOffset = -time * 10;
    ctx.strokeStyle = `rgba(190,140,255,${0.7 * a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawPortal() {
    if (!ev || ev.kind !== 'worm') return;
    const p = w2s(ev.x, ev.y), R = ev.r * zoom * (1 + 0.05 * Math.sin(time * 4));
    if (p.x + R * 2 < 0 || p.x - R * 2 > W || p.y + R * 2 < 0 || p.y - R * 2 > H) return;
    ctx.globalAlpha = evAlpha();
    const g = ctx.createRadialGradient(p.x, p.y, R * 0.2, p.x, p.y, R * 1.8);
    g.addColorStop(0, 'rgba(5,10,25,1)');
    g.addColorStop(0.45, 'rgba(60,200,255,0.55)');
    g.addColorStop(0.7, 'rgba(140,90,255,0.25)');
    g.addColorStop(1, 'rgba(60,40,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * 1.8, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = Math.max(1.5, R * 0.06);
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const rr = R * (0.3 + i * 0.13), st = -time * (3 - i * 0.3) + i;
      ctx.strokeStyle = `rgba(${i % 2 ? '140,200,255' : '190,140,255'},${0.8 - i * 0.1})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, st, st + 2.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, st + Math.PI, st + Math.PI + 1.4); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.fillStyle = '#8fe8ff';
    ctx.strokeText('Solucan Deliği', p.x, p.y - R * 1.4 - 8);
    ctx.fillText('Solucan Deliği', p.x, p.y - R * 1.4 - 8);
    ctx.globalAlpha = 1;
  }

  function drawFlash() {
    if (flash <= 0) return;
    ctx.fillStyle = `rgba(220,245,255,${flash * 0.85})`;
    ctx.fillRect(0, 0, W, H);
  }

  function render() {
    shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 16 : 0;
    shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 16 : 0;
    drawBackground();
    objs.sort((a, b) => b.r - a.r); // büyükler arkada
    for (const o of objs) {
      if (o.rare) drawRareGlow(o);
      else if (o.meteor) drawMeteorTrail(o);
      drawObject(o, o.fade);
    }
    for (const tu of turrets) drawObject(tu, tu.fade);
    resetCtx();
    drawCloud();
    drawPortal();
    drawNovaBodies();
    if (state === 'play') drawDangerRings();
    drawRivals();
    drawTrails();
    drawHole();
    drawEaten();
    drawParticles();
    drawBeams();
    drawNovaEffects();
    drawWaves();
    drawPopups();
    drawArrows();
    drawJoystick();
    drawHurt();
    drawFlash();
  }

  // =====================================================================
  //  Döngü ve menüler
  // =====================================================================
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state !== 'won') update(dt);
    render();
    musicTick();
    requestAnimationFrame(frame);
  }

  function showBest() {
    const b = store('funhole.best');
    $('best').textContent = b
      ? `En iyi: ${b.time ? '⏱ ' + fmtTime(b.time) + ' · ' : ''}${fmtNum(b.score || 0)} puan`
      : '';
  }

  function startGame() {
    initAudio();
    reset();
    state = 'play';
    for (const id of ['menu', 'win', 'dead', 'codex']) $(id).classList.remove('show');
    $('hud').classList.remove('hidden');
    showBanner('BAŞLA!', LEVELS[0].name, 'Yiyebileceklerin: ' + LEVELS[0].desc);
  }

  function showMenu() {
    reset();
    state = 'menu';
    for (const id of ['win', 'dead']) $(id).classList.remove('show');
    hideHud();
    renderMenu();
    $('menu').classList.add('show');
  }

  $('startBtn').addEventListener('click', startGame);
  $('againBtn').addEventListener('click', startGame);
  $('retryBtn').addEventListener('click', startGame);
  $('winMenuBtn').addEventListener('click', showMenu);
  $('deadMenuBtn').addEventListener('click', showMenu);
  $('codexBtn').addEventListener('click', openCodex);
  $('codexClose').addEventListener('click', () => $('codex').classList.remove('show'));
  $('dashBtn').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    initAudio();
    tryDash();
  });
  $('continueBtn').addEventListener('click', () => {
    endless = true;
    state = 'play';
    $('win').classList.remove('show');
    $('hud').classList.remove('hidden');
  });

  const muteBtn = $('muteBtn');
  const syncMute = () => {
    muteBtn.textContent = muted ? '🔇' : '🔊';
    syncMusicGain();
  };
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    store('funhole.muted', muted);
    syncMute();
    initAudio();
  });
  syncMute();

  const musicBtn = $('musicBtn');
  const syncMusicBtn = () => musicBtn.classList.toggle('off', !musicOn);
  musicBtn.addEventListener('click', () => {
    musicOn = !musicOn;
    store('funhole.music', musicOn);
    initAudio();
    syncMusicGain();
    syncMusicBtn();
  });
  syncMusicBtn();

  document.addEventListener('visibilitychange', () => {
    if (!actx) return;
    if (document.hidden) actx.suspend();
    else actx.resume();
  });

  window.addEventListener('resize', resize);
  resize();
  reset();
  renderMenu();
  requestAnimationFrame(frame);

  // Test/ayıklama için: ?debug ile konsoldan FunHole.grow(50) vb.
  if (/[?&]debug\b/.test(location.search)) {
    window.FunHole = {
      grow(r) {
        hole.r = r;
        hole.dr = r;
        while (level < LEVELS.length - 1 && hole.r >= LEVELS[level + 1].r) level++;
        zoom = zoomTarget();
        objs.length = 0;
        rivals.length = 0;
        turrets.length = 0;
        novas.length = 0;
      },
      rival(rel, dist) { spawnRival(rel, dist); },
      turret(dist) { spawnTurret(dist); turrets[turrets.length - 1].cd = 0; },
      nova() { spawnNova(); },
      starve() { hole.idle = 10; },
      event(kind) { ev = null; startEvent(kind); },
      rare() { spawnRare(); },
      dash() { tryDash(); },
      get run() { return { run, ev: ev && ev.kind, dashCd: hole.dashCd, meta }; },
      get state() {
        return {
          state, level, r: hole.r, score, objs: objs.length,
          rivals: rivals.map((r) => `${r.name}:${r.mode}:${(r.r / hole.r).toFixed(2)}`),
          turrets: turrets.map((t) => t.st), novas: novas.map((n) => n.st),
        };
      },
    };
  }
})();

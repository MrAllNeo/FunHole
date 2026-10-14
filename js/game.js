'use strict';

(() => {
  // =====================================================================
  //  Ayarlar
  // =====================================================================
  const TAU = Math.PI * 2;
  const EAT_RATIO = 0.9;     // deliğin yarıçapının bu oranından küçükler yenebilir
  const GROW = 0.6;          // yutulan alanın ne kadarı deliğe eklenir
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
    { id: 'laser',    kind: 'laser',   name: 'Dev Lazer Uydu',  min: 6,    max: 16,   w: 0.7, spin: 0.25, col: '#ff5a5a' },
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
  let actx = null;
  let muted = !!store('funhole.muted');
  let lastGulp = 0, lastBump = 0;

  function initAudio() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
    }
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
    o.connect(g).connect(actx.destination);
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

  // =====================================================================
  //  Oyun durumu
  // =====================================================================
  let state = 'menu';           // menu | play | won
  let time = 0;                 // toplam geçen süre (animasyon)
  let playTime = 0;
  let hole, cam, zoom, level, score, objs, eaten, particles, popups, waves, combo, eatenCount, endless;

  const baseScreenR = () => Math.min(W, H) * 0.05;
  const zoomTarget = () => baseScreenR() / LEVELS[level].r;
  const targetCount = () => Math.round(clamp((W * H) / 5000, 110, 180));

  function reset() {
    hole = { x: 0, y: 0, r: 1, dr: 1, vx: 0, vy: 0, pulse: 0 };
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
    combo = { n: 0, t: 0 };
    const hd = halfDiag(zoom);
    for (let i = 0; i < targetCount() * 1.5 && objs.length < targetCount(); i++) spawnObject(hd * 0.15, hd * 1.4);
    updateHud(true);
  }

  // Ekranın yarı köşegeni, dünya biriminde
  const halfDiag = (z) => Math.hypot(W, H) / 2 / z;

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
    });
  }

  function comboMult() {
    return Math.min(5, 1 + Math.floor(combo.n / 5) * 0.5);
  }

  function eat(o) {
    const rel = o.r / hole.r;
    hole.r = Math.sqrt(hole.r * hole.r + o.r * o.r * GROW);
    hole.pulse = Math.min(1, hole.pulse + 0.15 + rel * 0.8);
    combo.n++;
    combo.t = COMBO_TIME;
    const pts = Math.max(1, Math.round(o.r * o.r * 10 * comboMult()));
    score += pts;
    eatenCount++;

    const dx = o.x - hole.x, dy = o.y - hole.y;
    eaten.push({ o, p: 0, dur: 0.35 + rel * 0.5, ang: Math.atan2(dy, dx), d: Math.hypot(dx, dy) });

    const nP = 3 + Math.round(rel * 8);
    for (let i = 0; i < nP; i++) {
      particles.push({ ang: Math.atan2(dy, dx) + rnd(-0.6, 0.6), d: Math.hypot(dx, dy) + o.r * rnd(0, 1.2), life: rnd(0.4, 0.8), t: 0, col: o.t.col });
    }
    if (popups.length < 25 && (rel > 0.25 || Math.random() < 0.35)) {
      popups.push({ x: o.x, y: o.y, text: '+' + fmtNum(pts), t: 0, big: rel > 0.6 });
    }
    gulpSound(rel);

    while (level < LEVELS.length - 1 && hole.r >= LEVELS[level + 1].r) {
      level++;
      levelUp();
    }
  }

  function levelUp() {
    const L = LEVELS[level];
    const banner = $('banner');
    banner.querySelector('.name').textContent = L.name;
    banner.querySelector('.desc').textContent = level === LEVELS.length - 1 ? L.desc : 'Artık yiyebilirsin: ' + L.desc;
    banner.classList.remove('show');
    void banner.offsetWidth; // animasyonu yeniden başlat
    banner.classList.add('show');
    waves.push({ t: 0 });
    levelUpSound();
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* yok say */ } }
    if (level === LEVELS.length - 1 && !endless) setTimeout(win, 1600);
  }

  function win() {
    if (state !== 'play') return;
    state = 'won';
    const best = store('funhole.best') || {};
    const newTime = !best.time || playTime < best.time;
    if (newTime) best.time = playTime;
    best.score = Math.max(best.score || 0, score);
    store('funhole.best', best);
    $('winStats').textContent =
      `Süre: ${fmtTime(playTime)}${newTime ? '  🏆 Yeni rekor!' : ''}\n` +
      `Puan: ${fmtNum(score)}\nYutulan cisim: ${fmtNum(eatenCount)}`;
    $('win').classList.add('show');
    $('hud').classList.add('hidden');
    $('combo').classList.remove('show');
    delete hudCache.combo;
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
      return;
    }
    if (input.touchId !== null) return;
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
    return { x: (x - cam.x) * zoom + W / 2, y: (y - cam.y) * zoom + H / 2 };
  }

  function update(dt) {
    time += dt;
    const playing = state === 'play';
    if (playing) playTime += dt;

    // Delik hareketi
    const [ix, iy] = playing ? readInput() : [0, 0];
    const maxSpeed = (Math.min(W, H) * 0.6) / zoom;
    const k = Math.min(1, dt * 7);
    hole.vx += (ix * maxSpeed - hole.vx) * k;
    hole.vy += (iy * maxSpeed - hole.vy) * k;
    hole.x += hole.vx * dt;
    hole.y += hole.vy * dt;
    hole.dr += (hole.r - hole.dr) * Math.min(1, dt * 8);
    hole.pulse = Math.max(0, hole.pulse - dt * 2.5);

    // Kamera ve zoom
    cam.x += (hole.x - cam.x) * Math.min(1, dt * 6);
    cam.y += (hole.y - cam.y) * Math.min(1, dt * 6);
    const zt = zoomTarget();
    zoom = Math.exp(Math.log(zoom) + (Math.log(zt) - Math.log(zoom)) * Math.min(1, dt * 2.2));

    // Yıldız paralaksı (ekran pikseli cinsinden)
    for (const L of starLayers) {
      L.ox += hole.vx * zoom * L.par * dt;
      L.oy += hole.vy * zoom * L.par * dt;
    }

    // Cisimler
    const R = hole.r, pullR = R * 2.8;
    const hd = halfDiag(Math.min(zoom, zt));
    const despawnD = hd * 1.9;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      if (o.fade < 1) o.fade = Math.min(1, o.fade + dt * 1.8);
      if (o.bump > 0) o.bump -= dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.rot += o.vr * dt;

      const dx = hole.x - o.x, dy = hole.y - o.y, d = Math.hypot(dx, dy) || 1e-6;
      if (o.r < R * EAT_RATIO) {
        if (d < pullR) {
          const f = 1 - d / pullR;
          const acc = R * (14 * f * f + 1.5 * f);
          o.vx += (dx / d) * acc * dt;
          o.vy += (dy / d) * acc * dt;
          const damp = 1 - Math.min(1, dt * 2 * f);
          o.vx *= damp;
          o.vy *= damp;
        }
        if (d < R * 0.9 && playing) {
          objs.splice(i, 1);
          eat(o);
          continue;
        }
      } else {
        const minD = R + o.r * 0.85;
        if (d < minD) {
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
      }

      if (o.r < R * 0.05 || Math.hypot(o.x - cam.x, o.y - cam.y) > despawnD) objs.splice(i, 1);
    }

    // Eksik cisimleri tamamla
    const N = targetCount();
    let tries = 0;
    while (objs.length < N && tries++ < 8) {
      if (N - objs.length > N * 0.35) spawnObject(hd * 0.4, hd * 1.45);
      else spawnObject(hd * 1.05, hd * 1.45);
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
      p.ang += dt * 5;
      p.d *= 1 - Math.min(1, dt * 3.5);
      if (p.t >= p.life) particles.splice(i, 1);
    }

    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].t += dt;
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

    if (playing) updateHud(false);
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
    const comboTxt = m > 1 ? `KOMBO x${m}` : '';
    if (hudCache.combo !== comboTxt) {
      hudCache.combo = comboTxt;
      const el = $('combo');
      if (comboTxt) el.textContent = comboTxt;
      el.classList.toggle('show', !!comboTxt);
    }
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

  function drawObject(o, alpha) {
    const p = w2s(o.x, o.y);
    const size = 2 * o.r * zoom * o.sp.scale;
    if (size < 0.8) return;
    if (p.x + size < 0 || p.x - size > W || p.y + size < 0 || p.y - size > H) return;
    const c = Math.cos(o.rot) * DPR, s = Math.sin(o.rot) * DPR;
    ctx.setTransform(c, s, -s, c, p.x * DPR, p.y * DPR);
    ctx.globalAlpha = alpha;
    ctx.drawImage(o.sp.img, -size / 2, -size / 2, size, size);
  }

  function drawDangerRings() {
    const R = hole.r;
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    for (const o of objs) {
      if (o.r < R * EAT_RATIO) continue;
      const gap = Math.hypot(o.x - hole.x, o.y - hole.y) - o.r - R;
      const range = R * 3;
      if (gap > range) continue;
      const a = clamp(0.65 * (1 - gap / range), 0, 0.65) + (o.bump > 0 ? 0.35 : 0);
      const p = w2s(o.x, o.y);
      ctx.strokeStyle = `rgba(255,70,70,${a * o.fade})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, o.r * zoom * 1.08 + 3, 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawHole() {
    const p = w2s(hole.x, hole.y);
    const R = hole.dr * zoom * (1 + hole.pulse * 0.08);

    const g = ctx.createRadialGradient(p.x, p.y, R * 0.95, p.x, p.y, R * 2.6);
    g.addColorStop(0, 'rgba(255,214,150,0.95)');
    g.addColorStop(0.08, 'rgba(255,140,50,0.75)');
    g.addColorStop(0.3, 'rgba(200,60,110,0.3)');
    g.addColorStop(0.65, 'rgba(90,30,140,0.12)');
    g.addColorStop(1, 'rgba(40,0,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * 2.6, 0, TAU);
    ctx.fill();

    // Dönen yığılma diski
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, R * 0.05);
    for (let i = 0; i < 7; i++) {
      const rr = R * (1.08 + i * 0.12);
      const a = time * (2.6 - i * 0.22) + i * 1.7;
      ctx.strokeStyle = `rgba(255,${170 - i * 12},${90 + i * 10},${0.45 - i * 0.05})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, a, a + 1.2 + i * 0.15); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, a + Math.PI, a + Math.PI + 0.8); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,236,210,0.9)';
    ctx.lineWidth = Math.max(1.2, R * 0.04);
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * 1.01, 0, TAU);
    ctx.stroke();
  }

  function drawEaten() {
    for (const e of eaten) {
      const p = e.p;
      const ang = e.ang + p * p * 5;
      const d = e.d * Math.pow(1 - p, 1.2);
      const o = e.o;
      const sp = w2s(hole.x + Math.cos(ang) * d, hole.y + Math.sin(ang) * d);
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
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
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
    for (const pp of popups) {
      const s = w2s(pp.x, pp.y);
      ctx.globalAlpha = 1 - pp.t;
      ctx.font = `800 ${pp.big ? 18 : 13}px system-ui, sans-serif`;
      ctx.fillStyle = pp.big ? '#ffd36b' : '#ffffff';
      ctx.fillText(pp.text, s.x, s.y - pp.t * 40);
    }
    ctx.globalAlpha = 1;
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

  function render() {
    drawBackground();
    objs.sort((a, b) => b.r - a.r); // büyükler arkada
    for (const o of objs) drawObject(o, o.fade);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
    if (state === 'play') drawDangerRings();
    drawHole();
    drawEaten();
    drawParticles();
    drawWaves();
    drawPopups();
    drawJoystick();
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
    $('menu').classList.remove('show');
    $('win').classList.remove('show');
    $('hud').classList.remove('hidden');
    const banner = $('banner');
    banner.querySelector('.name').textContent = LEVELS[0].name;
    banner.querySelector('.desc').textContent = 'Yiyebileceklerin: ' + LEVELS[0].desc;
    banner.querySelector('.big').textContent = 'BAŞLA!';
    banner.classList.remove('show');
    void banner.offsetWidth;
    banner.classList.add('show');
    setTimeout(() => { banner.querySelector('.big').textContent = 'SIZE UP!'; }, 2700);
  }

  $('startBtn').addEventListener('click', startGame);
  $('againBtn').addEventListener('click', startGame);
  $('continueBtn').addEventListener('click', () => {
    endless = true;
    state = 'play';
    $('win').classList.remove('show');
    $('hud').classList.remove('hidden');
  });

  const muteBtn = $('muteBtn');
  const syncMute = () => { muteBtn.textContent = muted ? '🔇' : '🔊'; };
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    store('funhole.muted', muted);
    syncMute();
    initAudio();
  });
  syncMute();

  window.addEventListener('resize', resize);
  resize();
  reset();
  showBest();
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
      },
      get state() { return { state, level, r: hole.r, score, objs: objs.length }; },
    };
  }
})();

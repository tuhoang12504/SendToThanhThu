function nextScene() {
    const scenes = document.querySelectorAll('.scene');
    const current = document.querySelector('.scene.active');
    const nextIndex = Array.from(scenes).indexOf(current) + 1;

    if (current) current.classList.remove('active');

    if (nextIndex < scenes.length) {
        const next = scenes[nextIndex];
        next.classList.add('active');
    }
    if (nextIndex == 2) initNoPos();

    document.querySelector('.background')?.remove();
}
window.nextScene = nextScene;



const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');
const canvasFront = document.getElementById('petalCanvasFront');
const ctxF = canvasFront.getContext('2d');
let W, H;

function resize() {
    W = canvas.width = canvasFront.width = window.innerWidth;
    H = canvas.height = canvasFront.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PETAL_COLORS = [
    ['#ffd6e8', '#f9a8d4'],
    ['#fce7f3', '#f472b6'],
    ['#ffe4e6', '#fda4af'],
    ['#fff0f5', '#f0abcc'],
    ['#fbbdd4', '#e879a0'],
    ['#fde8f2', '#f9c4dc'],
    ['#fff5f9', '#fbb6cf'],
];

class Petal {
    constructor(isFront = false) {
        this.isFront = isFront;
        this.reset(true);
    }
    reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H * 1.2 - H : -(10 + Math.random() * 40);
        // Front petals are bigger and more visible
        const sizeBoost = this.isFront ? 1.6 : 1;
        this.r = (5 + Math.random() * 11) * sizeBoost;
        this.wr = (3 + Math.random() * 5) * sizeBoost;
        this.vx = (Math.random() - 0.5) * 1.1;
        this.vy = (0.7 + Math.random() * 1.8) * (this.isFront ? 1.1 : 0.9);
        this.angle = Math.random() * Math.PI * 2;
        this.angleV = (Math.random() - 0.5) * 0.04;
        this.swing = Math.random() * Math.PI * 2;
        this.swingSpd = 0.016 + Math.random() * 0.026;
        this.swingAmp = 0.5 + Math.random() * 1.1;
        this.opacity = this.isFront
            ? 0.55 + Math.random() * 0.40   // front: more visible
            : 0.50 + Math.random() * 0.40;
        // Occasional glowing petal
        this.glow = Math.random() < 0.18;
        const c = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
        this.color1 = c[0]; this.color2 = c[1];
        this.type = Math.floor(Math.random() * 3);
    }
    update() {
        this.swing += this.swingSpd;
        this.x += this.vx + Math.sin(this.swing) * this.swingAmp;
        this.y += this.vy;
        this.angle += this.angleV;
        if (this.y > H + 40) this.reset();
    }
    draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.globalAlpha = this.opacity;

        // Glow for special petals
        if (this.glow) {
            c.shadowColor = this.color2;
            c.shadowBlur = 14;
        }

        const g = c.createRadialGradient(0, -this.r * 0.3, 0, 0, 0, this.r * 1.3);
        g.addColorStop(0, this.color1);
        g.addColorStop(0.6, this.color2);
        g.addColorStop(1, this.color2 + 'aa');
        c.fillStyle = g;

        c.beginPath();
        if (this.type === 0) {
            c.ellipse(0, 0, this.wr, this.r, 0, 0, Math.PI * 2);
        } else if (this.type === 1) {
            c.moveTo(0, -this.r);
            c.bezierCurveTo(this.wr, -this.r * 0.4, this.wr * 0.9, this.r * 0.5, 0, this.r);
            c.bezierCurveTo(-this.wr * 0.9, this.r * 0.5, -this.wr, -this.r * 0.4, 0, -this.r);
        } else {
            c.moveTo(0, -this.r);
            c.bezierCurveTo(this.wr * 1.1, 0, this.wr * 0.6, this.r, 0, this.r);
            c.bezierCurveTo(-this.wr * 0.6, this.r, -this.wr * 1.1, 0, 0, -this.r);
        }
        c.closePath();
        c.fill();

        // Vein highlight
        c.shadowBlur = 0;
        c.strokeStyle = 'rgba(255,255,255,0.38)';
        c.lineWidth = 0.6;
        c.beginPath();
        c.moveTo(0, -this.r * 0.75);
        c.lineTo(0, this.r * 0.65);
        c.stroke();

        c.restore();
    }
}

class Sparkle {
    constructor() { this.reset(true); }
    reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : -10;
        this.size = 1.5 + Math.random() * 3;
        this.vy = 0.3 + Math.random() * 0.7;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.life = 0;
        this.maxLife = 80 + Math.random() * 120;
        this.color = `hsl(${330 + Math.random()*30|0}, 90%, ${75 + Math.random()*15|0}%)`;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.maxLife || this.y > H + 10) this.reset();
    }
    draw(c) {
        const t = this.life / this.maxLife;
        const alpha = t < 0.2 ? t/0.2 : t > 0.75 ? (1-t)/0.25 : 1;
        c.save();
        c.globalAlpha = alpha * 0.7;
        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 6;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }
}

// 110 back petals, 40 front petals, 55 sparkles
const petalsBack = Array.from({length: 110}, () => new Petal(false));
const petalsFront = Array.from({length: 40}, () => new Petal(true));
const sparkles = Array.from({length: 55}, () => new Sparkle());

function loop() {
    ctx.clearRect(0, 0, W, H);
    ctxF.clearRect(0, 0, W, H);

    for (const p of petalsBack) { p.update(); p.draw(ctx); }
    for (const s of sparkles) { s.update(); s.draw(ctx); }
    for (const p of petalsFront) { p.update(); p.draw(ctxF); }

    requestAnimationFrame(loop);
}
loop();

// ── Floating hearts ───────────────────────────────────────────
const heartsEl = document.getElementById('hearts');
const heartChars = ['♡','♡','✿','❀','✾'];

function spawnHeart() {
const el = document.createElement('span');
el.className = 'heart';
el.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
const size = 9 + Math.random() * 14;
el.style.cssText = `
	left:${5 + Math.random() * 90}%;
	bottom:${Math.random() * 30}%;
	font-size:${size}px;
	color:rgba(${200 + Math.random()*40|0},${100+Math.random()*60|0},${140+Math.random()*60|0},0.7);
	animation-duration:${3.5 + Math.random() * 4}s;
	animation-delay:${Math.random() * 2}s;
`;
heartsEl.appendChild(el);
setTimeout(() => el.remove(), 8000);
}
setInterval(spawnHeart, 700);


// Fill-bar
const progressBar = document.querySelector('.progress-fill')
const progressPct = document.querySelector('.progress-pct')
const readyBtn = document.querySelector('.ready')
const dots = document.querySelector('.dots')
const subtitle = document.querySelector('.subtitle')
const audio = document.getElementById('audio');
let i = 0;
const interval = setInterval(() => {
	if (i > 100) {
		audio.play();
		setInterval(() => {
			dots.style.display = 'none'
			readyBtn.classList.add('toggle')
			subtitle.classList.add('hide')
			clearInterval(interval);
		}, 1000)
		return;
	}
	progressBar.style.width = i + '%';
	progressPct.textContent = i + '%';
	i++;
}, 70)
readyBtn.addEventListener('click', function() {
	nextScene()
})

// Scene 2 =============================================================================================================
const letterText = {
	date: 'Hà Nội, ngày 3 tháng 5 năm 2026',
	greeting: 'Gửi em,',
	line1: 'Mặc dù chúng ta chỉ mới quen nhau và cũng chưa có cơ hội gặp nhau nhiều, nhưng mỗi khi trò chuyện với em đều khiến anh thấy rất vui.',
	line2: 'Ngay từ giây phút gặp em, tim anh như lỡ mất một nhịp, anh nghĩ anh đã gặp đúng người.',
	line3: 'Không biết em có sẵn lòng cho anh một cơ hội để hiểu em nhiều hơn không?',
	line4: 'Anh hy vọng câu trả lời của em sẽ là một khởi đầu thật đẹp cho cả hai chúng ta.'
}
const napPhongBi = document.querySelector('.nap') 
const thu = document.querySelector('.thu')
const thuContent = document.querySelector('.thu-content')
const date = document.createElement('div')
date.classList.add('letter-date')
date.textContent = letterText.date
thuContent.appendChild(date)
const greeting = document.createElement('div')
greeting.classList.add('letter-greeting')
greeting.textContent = letterText.greeting
thuContent.appendChild(greeting)
for (let i = 0; i < 4; i++) {
	const para = document.createElement('p')
	para.textContent = letterText[`line${i+1}`]
	thuContent.appendChild(para)
}

napPhongBi.addEventListener('click', function() {
	this.classList.toggle('open')
	thu.classList.toggle('open')
})
function autoResize() {
	const thuParagraphs = thuContent.querySelectorAll('p');
	let fontSize = parseInt(window.getComputedStyle(thuParagraphs[0]).fontSize.match(/\d+/)[0]);
	while (thuContent.scrollHeight > thuContent.clientHeight && fontSize > 10) {
		fontSize--;
		thuParagraphs.forEach((paragraph) => {
			paragraph.style.fontSize = fontSize.toString() + 'px'
		})
	}
}


let isLetterClick = false
thu.addEventListener('click', function() {
	if (!isLetterClick) {
	const background = document.createElement('div')
		background.classList.add('background')
		document.body.appendChild(background)
		requestAnimationFrame(() => {
			background.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
		})
		background.appendChild(thu)
		thuContent.classList.add('full')
		isLetterClick = true
	}
})
// Scene 3===================================================================

// ── Position btn-no initially in arena ──────────────────
const noLabels = [
  'Không...',
  'Không phải nút này',
  'Nhấn nút kia đi mà',
  'Buồn rồi đó',
  'Lần cuối nha',
];
let noCount = 0;
const MAX_NO = noLabels.length;

const arena   = document.getElementById('btn-arena');
const noBtn   = document.getElementById('btn-no');

// Place btn-no at top-center initially
function initNoPos() {
  const aw = arena.offsetWidth;
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;
  noBtn.style.left = ((aw - bw) / 2) + 'px';
  noBtn.style.top  = '14px';
}


function handleNo() {
  noCount++;

  // Update button label
  if(noCount < MAX_NO) {
    noBtn.textContent = noLabels[noCount];
  }

  if(noCount >= MAX_NO) {
    // Shake then vanish
    let s = 0;
    noBtn.style.transition = 'none';
    const iv = setInterval(() => {
      const cur = parseFloat(noBtn.style.left) || 0;
      noBtn.style.left = (cur + (s % 2 === 0 ? -7 : 7)) + 'px';
      s++;
      if(s > 7) {
        clearInterval(iv);
        noBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        noBtn.style.opacity = '0';
        noBtn.style.transform = 'scale(0)';
        setTimeout(() => { noBtn.style.display = 'none'; }, 420);
      }
    }, 55);
    return;
  }

  // Escape within arena bounds
  escapeInArena();
}
window.handleNo = handleNo

function escapeInArena() {
  const aw = arena.offsetWidth;
  const ah = arena.offsetHeight;
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  const pad = 6;
  const curL = parseFloat(noBtn.style.left) || (aw - bw) / 2;
  const curT = parseFloat(noBtn.style.top)  || 14;

  // Generate a position far from current
  let newL, newT, attempts = 0;
  do {
    newL = pad + Math.random() * (aw - bw - pad * 2);
    newT = pad + Math.random() * (ah - bh - pad * 2);
    attempts++;
  } while(attempts < 20 && Math.abs(newL - curL) < 40 && Math.abs(newT - curT) < 20);

  noBtn.style.left = newL + 'px';
  noBtn.style.top  = newT + 'px';
}

// ── Yes button logic ────────────────────────────────────
function handleYes() {
  for(let i=0; i<18; i++) setTimeout(spawnBurst, i * 70);
  const s3 = document.getElementById('scene3');
  s3.classList.add('fade-out');
  setTimeout(() => {
    nextScene()
    
  }, 500);
}
window.handleYes = handleYes;


function spawnBurst() {
  const emojis = ['💗','💕','🌸','✨','💖','🌷','💓','💞'];
  const el = document.createElement('div');
  el.className = 'burst';
  el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
  el.style.left = (20 + Math.random() * 60) + 'vw';
  el.style.top  = (30 + Math.random() * 40) + 'vh';
  el.style.animationDelay = Math.random() * 0.3 + 's';
  el.style.fontSize = (1.2 + Math.random()) + 'rem';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

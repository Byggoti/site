// --- CONFIG DISCORD ---
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1465253919813800110/M8-Dhlc7NUa0cL0FIj05iSkXKdSQ8Zs71OTTaq229lMUE7_rmFrx5T4J_Wm_ZXfh7dhY";

function sendDiscordNotification(message) {
    if(!DISCORD_WEBHOOK_URL) return;
    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, username: "Site Iubita" })
    }).catch(err => console.error(err));
}

window.onload = function() {
    sendDiscordNotification("🔔 Cineva a deschis site-ul (Ecran Login)!");
    // Initializam audio dupa un scurt delay
    setTimeout(initGlobalSounds, 500);
};

// --- AUDIO SYNTHESIZER ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Deblocare audio (policy browser)
document.addEventListener('click', function() {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
}, { once: true });

// 1. CLICK UI (Scurt si placut)
function playClickSound() {
    if(audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine'; // Sunet rotund
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
}

// 2. CAMERA SHUTTER (Pt poze)
function playShutterSound() {
    if(audioCtx.state === 'suspended') return;
    const bufferSize = audioCtx.sampleRate * 0.1; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    noise.connect(gain); gain.connect(audioCtx.destination); noise.start();
}

// 3. MAGIC (Theme Change)
function playMagicSound() {
    if(audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(200, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

// 4. SUCCESS / STAMPILA
function playSuccessSound() {
    if(audioCtx.state === 'suspended') return;
    const freqs = [523.25, 659.25, 783.99]; 
    freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.value = f;
        const now = audioCtx.currentTime + (i * 0.1);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.3);
    });
}

// 5. ERROR
function playErrorSound() {
    if(audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); 
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}

// --- GESTIONARE SUNETE GLOBALA ---
function initGlobalSounds() {
    // Selectam elementele care trebuie sa faca "Click"
    // EXCLUDEM butoanele de navigare foto pentru ca ele au sunet specific de Shutter
    const clickElements = document.querySelectorAll('.sticky, .cipher-card, .btn-cipher, .btn-main, .play-btn, .track-btn, .quiz-btn');
    
    clickElements.forEach(el => {
        // Folosim onmousedown pentru a nu se suprapune cu onclick-urile din HTML
        el.onmousedown = (e) => {
            // Daca dam click pe un input text, nu vrem sunet
            if(e.target.tagName === 'INPUT') return;
            e.stopPropagation(); 
            playClickSound();
        };
    });

    // Sunet specific pentru poze (Shutter)
    const photoNavs = document.querySelectorAll('.nav-btn, .lb-nav, .polaroid img');
    photoNavs.forEach(el => {
        el.onmousedown = (e) => {
            e.stopPropagation();
            playShutterSound();
        }
    });
}

// --- GALLERIES ---
const galleries = {
    'main': [ { src: 'res/1.jpg', caption: 'Inceputul' }, { src: 'res/1b.jpg', caption: 'O amintire frumoasa' }, { src: 'res/1c.jpg', caption: 'Noi doi' } ],
    'smile': [ { src: 'res/2.jpg', caption: 'Zambetul taaaau🫠' } ],
    'love': [ { src: 'res/3.jpg', caption: 'Te iubesc!' } ]
};

let activeGalleryId = null;
let activePhotoIndex = 0;

function openGallery(galleryId, e) {
    if(e) e.stopPropagation();
    if (!galleries[galleryId]) return;
    
    // NU mai apelam playClickSound() aici, se ocupa initGlobalSounds
    
    activeGalleryId = galleryId;
    activePhotoIndex = 0;
    
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');
    
    lbImg.src = galleries[activeGalleryId][0].src;
    lb.style.display = "flex";
    
    if (galleries[activeGalleryId].length > 1) { 
        lbPrev.classList.remove('hidden'); lbNext.classList.remove('hidden'); 
    } else { 
        lbPrev.classList.add('hidden'); lbNext.classList.add('hidden'); 
    }
}

function closeLightbox() { 
    document.getElementById('lightbox').style.display = "none"; 
    activeGalleryId = null; 
}

function changeLightboxPhoto(direction, e) {
    if(e) e.stopPropagation();
    if (!activeGalleryId) return;
    
    // NU mai apelam sunet aici, se ocupa initGlobalSounds (onmousedown pe .lb-nav)
    
    const currentAlbum = galleries[activeGalleryId];
    activePhotoIndex += direction;
    
    if(activePhotoIndex < 0) activePhotoIndex = currentAlbum.length - 1;
    if(activePhotoIndex >= currentAlbum.length) activePhotoIndex = 0;
    
    const img = document.getElementById('lightbox-img');
    img.style.opacity = 0;
    setTimeout(() => { img.src = currentAlbum[activePhotoIndex].src; img.style.opacity = 1; }, 150);
}

let miniIndex = 0;
function changeMiniPhoto(direction, e) {
    if(e) e.stopPropagation();
    // Sunetul e gestionat de initGlobalSounds
    
    const album = galleries['main'];
    miniIndex += direction;
    if(miniIndex < 0) miniIndex = album.length - 1;
    if(miniIndex >= album.length) miniIndex = 0;
    
    document.getElementById('gallery-img').src = album[miniIndex].src;
    document.getElementById('gallery-caption').innerText = album[miniIndex].caption;
}

// --- CIPHER LOGIC ---
function checkCipher() {
    const input = document.getElementById('cipher-input');
    // NU apelam playClickSound aici
    
    if(input.value === "0609") {
        playSuccessSound();
        fireConfetti(50);
        document.getElementById('cipher-interface').style.display = 'none';
        document.getElementById('secret-letter').style.display = 'block';
        sendDiscordNotification("🔐 A spart Cifrul Emotiilor!");
    } else {
        playErrorSound();
        input.classList.add('error-shake');
        setTimeout(() => input.classList.remove('error-shake'), 400);
    }
}

function resetCipher() {
    document.getElementById('secret-letter').style.display = 'none';
    document.getElementById('cipher-interface').style.display = 'block';
    document.getElementById('cipher-input').value = '';
}

// --- THEME ---
document.addEventListener('dblclick', function(e) {
    if(e.target.closest('.scrap-item') || e.target.closest('.invite-content') || e.target.closest('.login-card') || e.target.closest('.lightbox')) return;
    document.body.classList.toggle('dark-mode');
    playMagicSound();
    if(document.body.classList.contains('dark-mode')) { fireConfetti(30); }
});

// --- LOGIN ---
function tryLogin() {
    const pass = document.getElementById('pass').value;
    if (pass.trim() === "27.08.2025") {
        playSuccessSound();
        sendDiscordNotification("✅ A intrat pe site (Parola corecta)!");
        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'flex';
            initGlobalSounds(); initAnimations(); loadQuiz(); fireConfetti(50);
        }, 600);
    } else { 
        playErrorSound(); 
        document.getElementById('err').style.display = 'block'; 
    }
}

// --- MUSIC ---
const playlist = [ { title: "La Nesfarsit", artist: "The Motans", src: "res/1.mp3" }, { title: "Doar Noi", artist: "Mark Stam", src: "res/2.mp3" }, { title: "Tot ce am mai bun", artist: "Noua Unspe", src: "res/3.mp3" } ];
let currentTrackIndex = 0;
const audio = document.getElementById('main-audio');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const playIcon = document.getElementById('play-icon');
const seekBar = document.getElementById('seek-bar');
const currTime = document.getElementById('curr-time');
const durTime = document.getElementById('dur-time');
const vinyl = document.querySelector('.vinyl-art');

loadTrack(currentTrackIndex);
function loadTrack(index) { audio.src = playlist[index].src; trackTitle.innerText = playlist[index].title; trackArtist.innerText = playlist[index].artist; audio.load(); }

function togglePlay(e) {
    if(e) e.stopPropagation();
    // Sunet gestionat global
    if (audio.paused) { audio.play().then(_ => { playIcon.className = "fas fa-pause"; vinyl.parentElement.classList.add('playing'); }).catch(err => console.log(err)); } 
    else { audio.pause(); playIcon.className = "fas fa-play"; vinyl.parentElement.classList.remove('playing'); }
}

function changeTrack(direction, e) {
    if(e) e.stopPropagation();
    currentTrackIndex += direction;
    if(currentTrackIndex < 0) currentTrackIndex = playlist.length - 1;
    if(currentTrackIndex >= playlist.length) currentTrackIndex = 0;
    loadTrack(currentTrackIndex);
    setTimeout(() => { if(playIcon.className.includes("fa-pause")) audio.play(); }, 100); 
}
audio.ontimeupdate = function() { if(audio.duration) { seekBar.value = (audio.currentTime / audio.duration) * 100; currTime.innerText = formatTime(audio.currentTime); durTime.innerText = formatTime(audio.duration); } };
audio.onended = function() { changeTrack(1); };
function seek(el, e) { if(e) e.stopPropagation(); if(audio.duration) audio.currentTime = audio.duration * (el.value / 100); }
function formatTime(s) { if(isNaN(s)) return "0:00"; let m = Math.floor(s / 60); let sec = Math.floor(s % 60); return m + ":" + (sec < 10 ? "0" : "") + sec; }

// --- QUIZ ---
const quizData = [ { q: "Care e culoarea mea preferata?", a: ["Roz", "Negru", "Albastru"], c: 0 }, { q: "Cine gateste mai bine?", a: ["Eu", "Tu", "Glovo"], c: 1 }, { q: "Unde ne simtim cel mai bine?", a: ["Afara", "Acasa", "In pat"], c: 2 } ];
let currentQ = 0;
function loadQuiz() {
    if(currentQ >= quizData.length) { document.querySelector('.quiz-card').innerHTML = `<div class='tape'></div><h3>Bravo iubire! ❤️</h3><p>Ai castigat un pupic!</p>`; fireConfetti(50); sendDiscordNotification("🧠 A terminat quizul!"); return; }
    const data = quizData[currentQ]; document.getElementById('quiz-q').innerText = data.q;
    const opts = document.getElementById('quiz-opts'); opts.innerHTML = '';
    data.a.forEach((opt, idx) => { let btn = document.createElement('button'); btn.className = 'quiz-btn'; btn.innerText = opt; btn.onclick = () => checkAnswer(btn, idx, data.c); opts.appendChild(btn); });
    // Re-atasam sunete pt butoanele noi
    setTimeout(initGlobalSounds, 100);
}
function checkAnswer(btn, idx, correctIdx) { if(idx === correctIdx) { btn.classList.add('correct'); setTimeout(() => { currentQ++; loadQuiz(); }, 600); } else { playErrorSound(); btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 500); } }

// --- UTILS ---
function popEffect(el) { el.style.transform = `scale(1.1) rotate(0deg)`; setTimeout(() => { el.style.transform = `scale(1) rotate(var(--rot))`; }, 300); }
function reveal(el) { const b = el.querySelector('.answer-box'); b.style.display = (b.style.display==='block')?'none':'block'; }
function showInvite() { playSuccessSound(); document.getElementById('modal-overlay').style.display='flex'; }
function acceptInvite() { document.getElementById('btnReject').style.display = 'none'; playSuccessSound(); const s = document.getElementById('stamp'); s.classList.add('visible'); sendDiscordNotification("💖 A ACCEPTAT INVITATIA! 💖"); fireConfetti(150); setTimeout(() => { document.getElementById('modal-overlay').style.display='none'; }, 3500); }
function moveReject() { const btn = document.getElementById('btnReject'); const x = Math.random() * (window.innerWidth - 100); const y = Math.random() * (window.innerHeight - 50); btn.style.position = 'fixed'; btn.style.left = x + 'px'; btn.style.top = y + 'px'; btn.style.zIndex = 4000; }
window.onscroll = function() { const btn = document.getElementById('back-to-top'); if(document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { btn.style.display = 'flex'; } else { btn.style.display = 'none'; } };
function scrollToTop() { window.scrollTo({top: 0, behavior: 'smooth'}); }
function initAnimations() { const bg = document.getElementById('bg-animation'); const icons = ['❤️', '⭐', '🦋', '💌', '♾️']; for(let i=0; i<15; i++){ let el = document.createElement('div'); el.className = 'float-item'; el.innerText = icons[Math.floor(Math.random()*icons.length)]; el.style.left = Math.random()*100 + 'vw'; el.style.animationDuration = (Math.random()*5 + 5) + 's'; el.style.fontSize = (Math.random()*20 + 20) + 'px'; bg.appendChild(el); } const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('show'); observer.unobserve(entry.target); } }); }, {threshold:0.1}); document.querySelectorAll('.scrap-item').forEach(el => observer.observe(el)); }
function fireConfetti(c) { const cols = ['#d63384','#ff8fa3','#ffd700','#4caf50']; for(let i=0; i<c; i++){ let d = document.createElement('div'); d.className='confetti'; d.style.background=cols[Math.floor(Math.random()*cols.length)]; d.style.left=Math.random()*100+'vw'; d.style.top='-10px'; d.style.animationDuration=(Math.random()*3+2)+'s'; document.body.appendChild(d); setTimeout(()=>d.remove(), 5000); } }
// --- CONFIGURARE DISCORD ---
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1465253919813800110/M8-Dhlc7NUa0cL0FIj05iSkXKdSQ8Zs71OTTaq229lMUE7_rmFrx5T4J_Wm_ZXfh7dhY";

function sendDiscordNotification(message) {
    if(!DISCORD_WEBHOOK_URL) return;
    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, username: "Site Iubita" })
    }).catch(err => console.error(err));
}

// Notificare la încărcare
window.onload = function() {
    sendDiscordNotification("🔔 Cineva a deschis site-ul (Ecran Login)!");
    initGlobalSounds(); // Activam sunetele pe elemente
};

// --- SISTEM AUDIO AVANSAT (GENERATOR DE SUNETE) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Funcție pentru a debloca sunetul la prima interacțiune (Browserele blochează sunetul automat)
document.addEventListener('click', function() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });

// 1. Sunet de Click/Pop (Scurt și plăcut)
function playPop() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// 2. Sunet de Hover (Foarte subtil, ca un ticăit)
function playHoverSound() {
    if(audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // Volum foarte mic
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// 3. Sunet de Ștampilă / Succes (Impact puternic)
function playStampSound() {
     if(audioCtx.state === 'suspended') audioCtx.resume();
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     
     osc.type = 'square';
     osc.frequency.setValueAtTime(150, audioCtx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
     
     gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
     
     osc.connect(gain);
     gain.connect(audioCtx.destination);
     osc.start();
     osc.stop(audioCtx.currentTime + 0.15);
}

// 4. Sunet de Eroare (Bâzâit scurt)
function playWrong() {
     if(audioCtx.state === 'suspended') audioCtx.resume();
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     
     osc.type = 'sawtooth';
     osc.frequency.setValueAtTime(150, audioCtx.currentTime);
     osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
     
     gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
     gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
     
     osc.connect(gain);
     gain.connect(audioCtx.destination);
     osc.start();
     osc.stop(audioCtx.currentTime + 0.2);
}

// --- INITIALIZARE SUNETE AUTOMATE PE ELEMENTE ---
function initGlobalSounds() {
    // Adaugam sunet de click si hover pe TOATE butoanele, input-urile si cartonasele
    const interactiveElements = document.querySelectorAll('button, input, .polaroid, .sticky, .music-card, .quiz-card');
    
    interactiveElements.forEach(el => {
        // Sunet la Hover
        el.addEventListener('mouseenter', () => playHoverSound());
        
        // Sunet la Click (daca nu are deja onclick definit inline care face sunet)
        el.addEventListener('mousedown', () => playPop());
    });
}

// --- PLAYLIST MUZICAL (Asigura-te ca fisierele sunt in folderul res/) ---
const playlist = [
    { title: "La Nesfarsit", artist: "The Motans", src: "res/1.mp3" },
    { title: "Doar Noi", artist: "Mark Stam", src: "res/2.mp3" },
    { title: "Tot ce am mai bun", artist: "Noua Unspe", src: "res/3.mp3" }
];

let currentTrackIndex = 0;
const mainAudio = document.getElementById('main-audio'); // Elementul audio unic
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const playIcon = document.getElementById('play-icon');
const seekBar = document.getElementById('seek-bar');
const currTime = document.getElementById('curr-time');
const durTime = document.getElementById('dur-time');
const vinyl = document.querySelector('.vinyl-art');

// Incarca prima piesa la start
loadTrack(currentTrackIndex);

function loadTrack(index) {
    mainAudio.src = playlist[index].src;
    trackTitle.innerText = playlist[index].title;
    trackArtist.innerText = playlist[index].artist;
    mainAudio.load();
}

function togglePlay() {
    // playPop() este deja apelat de event listener-ul global, nu il mai punem aici ca sa nu se auda dublu
    if (mainAudio.paused) {
        let playPromise = mainAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                playIcon.className = "fas fa-pause";
                vinyl.parentElement.classList.add('playing');
                // sendDiscordNotification("🎵 Play: " + playlist[currentTrackIndex].title);
            })
            .catch(error => {
                console.log("Audio Error:", error);
            });
        }
    } else {
        mainAudio.pause();
        playIcon.className = "fas fa-play";
        vinyl.parentElement.classList.remove('playing');
    }
}

function changeTrack(direction) {
    currentTrackIndex += direction;
    if(currentTrackIndex < 0) currentTrackIndex = playlist.length - 1;
    if(currentTrackIndex >= playlist.length) currentTrackIndex = 0;
    
    loadTrack(currentTrackIndex);
    // Mic delay pentru a permite incarcarea
    setTimeout(() => {
        if(playIcon.className.includes("fa-pause")) togglePlay(); // Daca era play, continua play
        else togglePlay(); // Daca era pauza, porneste
    }, 100); 
}

// Update bara progres
mainAudio.ontimeupdate = function() {
    if(mainAudio.duration) {
        const pct = (mainAudio.currentTime / mainAudio.duration) * 100;
        seekBar.value = pct;
        currTime.innerText = formatTime(mainAudio.currentTime);
        durTime.innerText = formatTime(mainAudio.duration);
    }
};

// Cand se termina piesa, treci la urmatoarea
mainAudio.onended = function() {
    changeTrack(1);
};

function seek(el) {
    if(mainAudio.duration) {
        mainAudio.currentTime = mainAudio.duration * (el.value / 100);
    }
}

function formatTime(s) {
    if(isNaN(s)) return "0:00";
    let m = Math.floor(s / 60);
    let sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
}

// --- GALERIE FOTO (POLAROID 1) ---
const polaroidPhotos = [
    { src: "res/1.jpg", caption: "inceputuul" },
    { src: "res/1.jpg", caption: "a fost minunaat" }, /* Asigura-te ca ai poza res/1b.jpg */
    { src: "res/1.jpg", caption: "prima noastra poza <3" } /* Asigura-te ca ai poza res/1c.jpg */
];
let currentPhotoIndex = 0;

function changePhoto(direction) {
    // Oprirea propagarii pentru a nu declansa "popEffect" de pe parinte cand dai click pe sageti
    if(window.event) window.event.stopPropagation();
    
    currentPhotoIndex += direction;
    if(currentPhotoIndex < 0) currentPhotoIndex = polaroidPhotos.length - 1;
    if(currentPhotoIndex >= polaroidPhotos.length) currentPhotoIndex = 0;

    document.getElementById('gallery-img').src = polaroidPhotos[currentPhotoIndex].src;
    document.getElementById('gallery-caption').innerText = polaroidPhotos[currentPhotoIndex].caption;
    
    playPop(); // Sunet specific pentru schimbare poza
}

// --- LOGIN ---
function tryLogin() {
    const pass = document.getElementById('pass').value;
    if (pass.trim() === "27.08.2025") {
        playStampSound(); // Sunet de succes
        sendDiscordNotification("✅ A intrat pe site (Parola corecta)!");
        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'flex'; // Afisam grid-ul
            
            // Reinitializam sunetele pentru elementele nou aparute
            setTimeout(initGlobalSounds, 500); 
            initAnimations(); loadQuiz(); fireConfetti(50);
        }, 600);
    } else { 
        playWrong(); // Sunet de eroare
        document.getElementById('err').style.display = 'block'; 
    }
}

// --- ANIMATII SI EFECTE ---
function initAnimations() {
    const bg = document.getElementById('bg-animation');
    const icons = ['❤️', '⭐', '🌸', '💌'];
    for(let i=0; i<15; i++){
        let el = document.createElement('div');
        el.className = 'float-item';
        el.innerText = icons[Math.floor(Math.random()*icons.length)];
        el.style.left = Math.random()*100 + 'vw';
        el.style.animationDuration = (Math.random()*5 + 5) + 's';
        el.style.fontSize = (Math.random()*20 + 20) + 'px';
        bg.appendChild(el);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){ entry.target.classList.add('show'); observer.unobserve(entry.target); }
        });
    }, {threshold:0.1});
    document.querySelectorAll('.scrap-item').forEach(el => observer.observe(el));
}

// --- QUIZ ---
const quizData = [
    { q: "Care e culoarea mea preferata?", a: ["Roz", "Negru", "Albastru"], c: 0 },
    { q: "Cine gateste mai bine?", a: ["Eu", "Tu", "Glovo"], c: 1 },
    { q: "Unde ne simtim cel mai bine?", a: ["Afara", "Acasa", "In pat"], c: 2 }
];
let currentQ = 0;

function loadQuiz() {
    if(currentQ >= quizData.length) {
        document.querySelector('.quiz-card').innerHTML = `<div class='tape'></div><h3>Bravo iubire! ❤️</h3><p>Ai castigat un pupic!</p>`;
        fireConfetti(50);
        sendDiscordNotification("🧠 A terminat quizul!");
        return;
    }
    const data = quizData[currentQ];
    document.getElementById('quiz-q').innerText = data.q;
    const opts = document.getElementById('quiz-opts');
    opts.innerHTML = '';
    data.a.forEach((opt, idx) => {
        let btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, idx, data.c);
        opts.appendChild(btn);
    });
    // Adaugam sunete pe noile butoane de quiz
    initGlobalSounds();
}

function checkAnswer(btn, idx, correctIdx) {
    if(idx === correctIdx) {
        btn.classList.add('correct'); 
        playPop();
        setTimeout(() => { currentQ++; loadQuiz(); }, 600);
    } else {
        playWrong();
        btn.classList.add('wrong'); 
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
}

// --- INTERACTIUNI DIVERSE ---
function popEffect(el) { 
    el.style.transform = `scale(1.1) rotate(0deg)`; 
    setTimeout(() => { el.style.transform = `scale(1) rotate(var(--rot))`; }, 300); 
}

function reveal(el) { 
    const b = el.querySelector('.answer-box'); 
    b.style.display = (b.style.display==='block')?'none':'block'; 
}

function showInvite() { 
    document.getElementById('modal-overlay').style.display='flex'; 
}

function acceptInvite() {
    document.getElementById('btnReject').style.display = 'none';
    playStampSound();
    const s = document.getElementById('stamp');
    s.classList.add('visible');
    sendDiscordNotification("💖 A ACCEPTAT INVITATIA! 💖");
    fireConfetti(150);
    setTimeout(() => { document.getElementById('modal-overlay').style.display='none'; }, 3500);
}

function moveReject() {
    const btn = document.getElementById('btnReject');
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 50);
    btn.style.position = 'fixed'; 
    btn.style.left = x + 'px'; 
    btn.style.top = y + 'px'; 
    btn.style.zIndex = 4000;
    playPop();
}

window.onscroll = function() {
    const btn = document.getElementById('back-to-top');
    if(document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { btn.style.display = 'flex'; } 
    else { btn.style.display = 'none'; }
};
function scrollToTop() { window.scrollTo({top: 0, behavior: 'smooth'}); }

function fireConfetti(c) {
    const cols = ['#d63384','#ff8fa3','#ffd700','#4caf50'];
    for(let i=0; i<c; i++){
        let d = document.createElement('div');
        d.className='confetti';
        d.style.background=cols[Math.floor(Math.random()*cols.length)];
        d.style.left=Math.random()*100+'vw';
        d.style.top='-10px';
        d.style.animationDuration=(Math.random()*3+2)+'s';
        document.body.appendChild(d);
        setTimeout(()=>d.remove(), 5000);
    }
}
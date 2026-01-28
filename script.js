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
    sendDiscordNotification("🔔 Cineva a deschis site-ul (login)!");
    // Initializam audio dupa un scurt delay
    setTimeout(initGlobalSounds, 500);
};

// --- AUDIO ENGINE OPTIMIZED ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer = null;
let successBuffer = null;
let errorBuffer = null;
let swipeBuffer = null;
let activeSource = null;

// 1. Initializare + Trezire
generateBuffers();

const resumeAudio = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.removeEventListener('click', resumeAudio);
    document.removeEventListener('touchstart', resumeAudio);
    document.removeEventListener('keydown', resumeAudio);
};
document.addEventListener('click', resumeAudio);
document.addEventListener('touchstart', resumeAudio);
document.addEventListener('keydown', resumeAudio);

function generateBuffers() {
    const sr = audioCtx.sampleRate;
    
    // 1. Click: "Bubble Pop" (Cute & High)
    clickBuffer = audioCtx.createBuffer(1, sr * 0.1, sr);
    const cd = clickBuffer.getChannelData(0);
    for(let i=0; i<cd.length; i++) {
        const t = i / sr;
        // Frequency sweep down slightly for a "water drop" effect
        const freq = 1200 - (t * 4000); 
        if(freq < 100) break;
        const sine = Math.sin(2 * Math.PI * freq * t);
        cd[i] = sine * 0.15 * Math.exp(-35 * t);
    }

    // 2. Success: "Sparkle" (High Arpeggio)
    successBuffer = audioCtx.createBuffer(1, sr * 0.4, sr);
    const sd = successBuffer.getChannelData(0);
    for(let i=0; i<sd.length; i++) {
        const t = i / sr;
        // Two distinct notes blending
        const note1 = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-10 * t); // High A
        const note2 = Math.sin(2 * Math.PI * 1108 * t) * Math.exp(-10 * (t - 0.1)) * (t > 0.1 ? 1 : 0); // High C#
        sd[i] = (note1 + note2) * 0.1; 
    }

    // 3. Error: "Soft Bonk" (Not harsh)
    errorBuffer = audioCtx.createBuffer(1, sr * 0.2, sr);
    const ed = errorBuffer.getChannelData(0);
    for(let i=0; i<ed.length; i++) {
        const t = i / sr;
        // Low sine descending
        const freq = 200 - (t * 300);
        const sine = Math.sin(2 * Math.PI * freq * t);
        ed[i] = sine * 0.2 * Math.exp(-20 * t);
    }

    // 4. Swipe: "Light Tick"
    swipeBuffer = audioCtx.createBuffer(1, sr * 0.05, sr);
    const swd = swipeBuffer.getChannelData(0);
    for(let i=0; i<swd.length; i++) {
        const t = i / sr;
        const sine = Math.sin(2 * Math.PI * 2000 * t); // High freq tick
        swd[i] = sine * 0.08 * Math.exp(-80 * t);
    }
}

function playSoundFromBuffer(buffer) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    if(!buffer) return; 
    
    // Stop sunet anterior
    if(activeSource) {
        try { activeSource.stop(); } catch(e) {}
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
    activeSource = source;
}

// Wrapper Functions
function playClickSound() { playSoundFromBuffer(clickBuffer); }
function playSuccessSound() { playSoundFromBuffer(successBuffer); }
function playErrorSound() { playSoundFromBuffer(errorBuffer); }
function playSwipeSound() { playSoundFromBuffer(swipeBuffer); }

// Eliminam complet vechile functii cu oscilatoare
function playShutterSound() { playSwipeSound(); } // Fallback
function playMagicSound() { playSuccessSound(); } // Fallback

// --- GESTIONARE SUNETE GLOBALA ---
function initGlobalSounds() {
    // 1. Elemente Click Standard
    const clickElements = document.querySelectorAll('.sticky, .cipher-card, .btn-cipher, .btn-main, .play-btn, .track-btn, .quiz-btn, .emoji-btn, .btn-clear');
    
    clickElements.forEach(el => {
        // Stergem vechile listener-e (prin clonare e cel mai sigur hack rapid, sau doar suprascriem)
        el.onmousedown = (e) => {
            if(e.target.tagName === 'INPUT') return;
            e.stopPropagation(); 
            playClickSound();
        };
    });

    // 2. Elemente Swipe (Navigare Poze) - EXCLUDEM .nav-btn pentru ca au sunet in onClick (changePolaroidPhoto)
    const photoNavs = document.querySelectorAll('.lb-nav'); // Doar pentru lightbox
    photoNavs.forEach(el => {
        el.onmousedown = (e) => {
            e.stopPropagation();
            playSwipeSound();
        }
    });
}


// --- GALLERIES ---
const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23888'%3EAici vine poza ta%3C/text%3E%3C/svg%3E";

const galleries = {
    'main': [ 
        { src: 'res/1.jpg', caption: 'inceputuul' }, 
        { src: 'res/1.1.jpg', caption: 'prima pozaaaa' }, 
        { src: 'res/1.2.jpg', caption: 'de aci m ai facut tu🤨' } 
    ],
    'smile': [ 
        { src: 'res/2.jpg', caption: 'Zambetul taaaau🫠' },
        { src: 'res/2.1.jpg', caption: 'Preferatul meeeeeu🫠🫠' }
    ],
    'love': [ 
        { src: 'res/3.jpg', caption: 'Ceeea mai' },
        { src: 'res/3.1.jpg', caption: 'superbaaa🫠🫠' }
    ]
};

let activeGalleryId = null;
let activePhotoIndex = 0;

// Tinem evidenta indexului curent pentru fiecare polaroid mic (pe pagina)
const miniIndices = {
    'main': 0,
    'smile': 0,
    'love': 0
};

function openGallery(galleryId, e) {
    if(e) e.stopPropagation();
    if (!galleries[galleryId]) return;
    
    // NU mai apelam playClickSound() aici, se ocupa initGlobalSounds
    
    activeGalleryId = galleryId;
    activePhotoIndex = 0; // Resetam la prima poza cand deschidem lightbox-ul mare
    
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
    
    const currentAlbum = galleries[activeGalleryId];
    activePhotoIndex += direction;
    
    if(activePhotoIndex < 0) activePhotoIndex = currentAlbum.length - 1;
    if(activePhotoIndex >= currentAlbum.length) activePhotoIndex = 0;
    
    const img = document.getElementById('lightbox-img');
    img.style.opacity = 0;
    setTimeout(() => { img.src = currentAlbum[activePhotoIndex].src; img.style.opacity = 1; }, 150);
}

function changePolaroidPhoto(galleryId, direction, imgId, captionId, e) {
    if(e) e.stopPropagation();
    playSwipeSound(); // Sunet nou de "foaie"
    
    const album = galleries[galleryId];
    if(!album) return;

    miniIndices[galleryId] += direction;
    
    if(miniIndices[galleryId] < 0) miniIndices[galleryId] = album.length - 1;
    if(miniIndices[galleryId] >= album.length) miniIndices[galleryId] = 0;
    
    const currentIdx = miniIndices[galleryId];
    
    const imgEl = document.getElementById(imgId);
    const capEl = document.getElementById(captionId);
    
    // Mic efect de fade
    imgEl.style.opacity = 0.5;
    setTimeout(() => {
        imgEl.src = album[currentIdx].src;
        capEl.innerText = album[currentIdx].caption;
        imgEl.style.opacity = 1;
    }, 150);
}

// --- CIPHER LOGIC ---
function checkCipher() {
    const input = document.getElementById('cipher-input');
    // NU apelam playClickSound aici
    
    if(input.value === "0509") {
        playSuccessSound();
        fireConfetti(50);
        document.getElementById('cipher-interface').style.display = 'none';
        document.getElementById('secret-letter').style.display = 'block';
        sendDiscordNotification("🔐 A spart Cifrul!");
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

// --- WORD GAME ---
function checkWords() {
    const w1 = document.getElementById('word1').value.toLowerCase().trim();
    const w2 = document.getElementById('word2').value.toLowerCase().trim();
    
    // Acceptam si variatii fara diacritice sau cu ele daca e cazul, dar aici e simplu
    if ((w1 === "ochii" || w1 === "ochisori") && (w2 === "artificii" || w2 === "artifici")) {
        playSuccessSound();
        const screen = document.getElementById('word-game-screen');
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.style.display = 'none';
            // Afisam ecranul de emoji login
            const login = document.getElementById('login-screen');
            login.style.display = 'flex';
            login.style.opacity = '0';
            setTimeout(() => { login.style.opacity = '1'; }, 50);
            
            sendDiscordNotification("📝 A completat versurile corect!");
        }, 600);
    } else {
        playErrorSound();
        document.getElementById('word-err').style.display = 'block';
        const inputs = document.querySelectorAll('.input-blank');
        inputs.forEach(i => {
            i.classList.add('error-shake');
            setTimeout(() => i.classList.remove('error-shake'), 400);
        });
    }
}

// --- ACTIVITY RANDOMIZER ---
const activityOptions = ["Plimbare", "Gatim", "18+ 😈", "Film", "Jocuri", "Masaj", "Shopping", "Somn 😴", "Surpriza!"];
let isShuffling = false;

function openWheel() {
    document.getElementById('wheel-modal').style.display = 'flex';
    playSwipeSound();
    // Reset display
    document.getElementById('randomizer-display').innerText = "?";
    document.getElementById('randomizer-display').style.transform = "scale(1)";
}

function closeWheel(e) {
    if(e) e.stopPropagation();
    document.getElementById('wheel-modal').style.display = 'none';
}

function startRandomizer() {
    if(isShuffling) return;
    isShuffling = true;
    
    const display = document.getElementById('randomizer-display');
    const btn = document.querySelector('#wheel-modal .btn-main');
    
    // Animatie de "gandire"
    let counter = 0;
    const maxIterations = 30; // Cate schimbari face
    let speed = 50; // Viteza initiala (ms)
    
    // Functie recursiva pentru a incetini treptat
    const shuffle = () => {
        // Alegem random pentru efect vizual
        const item = activityOptions[Math.floor(Math.random() * activityOptions.length)];
        display.innerText = item;
        playClickSound(); // Sunetul de "tick"
        
        // Efect vizual
        display.style.transform = "scale(1.1)";
        setTimeout(() => display.style.transform = "scale(1)", 50);

        counter++;
        
        if (counter < maxIterations) {
            // Incetinim treptat
            if (counter > maxIterations - 10) speed += 30;
            if (counter > maxIterations - 5) speed += 50;
            setTimeout(shuffle, speed);
        } else {
            // STOP - Final (Logica Ponderata)
            let winner;
            const rand = Math.random();
            
            // 40% Sansa pentru 18+
            if (rand < 0.4) {
                winner = "18+ 😈";
            } else {
                // 60% Sansa pentru restul (excludem 18+ ca sa nu dublam sansa)
                const otherOptions = activityOptions.filter(opt => !opt.includes("18+"));
                winner = otherOptions[Math.floor(Math.random() * otherOptions.length)];
            }
            
            display.innerText = winner;
            finalizeChoice(winner);
        }
    };
    
    shuffle();
}

function finalizeChoice(winner) {
    const display = document.getElementById('randomizer-display');
    
    playSuccessSound();
    fireConfetti(40);
    isShuffling = false;
    
    // Highlight final
    display.style.transform = "scale(1.3)";
    display.style.color = "var(--accent-pink)";
    
    if(winner.includes("18+")) {
        sendDiscordNotification("😈 A picat 18+ la randomizer!");
    } else {
        sendDiscordNotification(`🎲 A picat: ${winner}`);
    }
}

function openWheel() {
    document.getElementById('wheel-modal').style.display = 'flex';
    playSwipeSound(); // Sunet de bilet/hartie
}

function closeWheel(e) {
    if(e) e.stopPropagation();
    document.getElementById('wheel-modal').style.display = 'none';
}

function spinWheel() {
    if(isSpinning) return;
    isSpinning = true;
    
    const resultDiv = document.getElementById('wheel-result');
    resultDiv.innerText = "...";
    
    const randomSpin = Math.floor(Math.random() * 360);
    const totalSpin = 1800 + randomSpin;
    
    currentRotation += totalSpin;
    
    const wheel = document.getElementById('wheel');
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    
    playClickSound(); 
    
    setTimeout(() => {
        const actualDeg = currentRotation % 360;
        const pointerDeg = (360 - actualDeg) % 360;
        const segmentSize = 360 / wheelOptions.length;
        const winningIndex = Math.floor(pointerDeg / segmentSize);
        
        const winner = wheelOptions[winningIndex];
        
        resultDiv.innerText = `✨ ${winner} ✨`;
        playSuccessSound();
        fireConfetti(30);
        
        if(winner.includes("18+")) {
            sendDiscordNotification("😈 A picat 18+ la roata!");
        } else {
            sendDiscordNotification(`🎡 A picat: ${winner}`);
        }
        
        isSpinning = false;
    }, 4000); 
}

// --- HAMSTER HUNT GAME ---
let foundHamsters = 0;
const totalHamsters = 3;

function initHamsterHunt() {
    const container = document.getElementById('main-content');
    if(!container) return;

    // Curatam eventualii hamsteri vechi
    document.querySelectorAll('.hidden-hamster').forEach(el => el.remove());
    foundHamsters = 0;

    for(let i=0; i<totalHamsters; i++) {
        const hamster = document.createElement('div');
        hamster.className = 'hidden-hamster';
        hamster.innerText = '🐹';
        
        // Pozitionare random, dar "safe" (sa nu iasa din ecran prea tare)
        // Folosim procente pentru a fi responsiv
        const left = Math.random() * 90 + 5; // intre 5% si 95%
        const top = Math.random() * 90 + 5;  // intre 5% si 95% din inaltimea containerului
        
        hamster.style.left = left + '%';
        hamster.style.top = top + '%';
        
        // Rotatie random
        hamster.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;

        hamster.onclick = (e) => {
            e.stopPropagation(); // Sa nu declanseze alte click-uri
            collectHamster(hamster);
        };

        container.appendChild(hamster);
    }
}

function collectHamster(el) {
    playSuccessSound(); // Sunet satisfacator
    
    // Animatie de disparitie
    el.style.transition = "0.3s";
    el.style.transform = "scale(2) rotate(360deg)";
    el.style.opacity = "0";
    
    setTimeout(() => el.remove(), 300);
    
    foundHamsters++;
    
    // Notificare progres
    if(foundHamsters < totalHamsters) {
        showToast(`Ai gasit ${foundHamsters}/${totalHamsters} hamsteri! 🐹`);
    } else {
        // VICTORIE!
        showToast(`🎉 I ai gasit pe toti! INVAZIE! 🐹`);
        triggerHamsterRain();
        sendDiscordNotification("🕵️‍♀️ A gasit toti hamsterii!");
    }
}

function showGameStatus() {
    if(foundHamsters === totalHamsters) {
        showToast("I-ai gasit deja pe toti! Bravo! 🏆");
        triggerHamsterRain(); // Mai ploua o data de fun
    } else {
        showToast(`Status: 🐹 ${foundHamsters} / ${totalHamsters} gasiti. Mai cauta! 👀`);
    }
}

function showToast(msg) {
    // Creem sau refolosim elementul toast
    let toast = document.querySelector('.game-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.className = 'game-toast';
        document.body.appendChild(toast);
    }
    
    toast.innerText = msg;
    toast.classList.add('show');
    playClickSound();

    // Dispare singur
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function triggerHamsterRain() {
    const count = 50; // Numar de hamsteri in ploaie
    for(let i=0; i<count; i++) {
        let h = document.createElement('div');
        h.className = 'hamster-drop';
        h.innerText = '🐹';
        h.style.left = Math.random() * 100 + 'vw';
        h.style.animationDuration = (Math.random() * 3 + 2) + 's';
        h.style.fontSize = (Math.random() * 2 + 1) + 'rem';
        document.body.appendChild(h);
        
        // Curatenie dupa animatie
        setTimeout(() => h.remove(), 5000);
    }
    playSuccessSound();
}

// --- CHEAT CODE (wa) ---
let lastKey = '';
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Verificam secventa "w" apoi "a"
    if (lastKey === 'w' && key === 'a') {
        activateCheatMode();
    }
    
    lastKey = key;
});

function activateCheatMode() {
    // Verificam daca suntem deja logati ca sa nu dam reset aiurea
    if(document.getElementById('main-content').style.display === 'flex') return;

    playMagicSound();
    
    // Ascundem ecranele de login
    const wordScreen = document.getElementById('word-game-screen');
    const loginScreen = document.getElementById('login-screen');
    
    if(wordScreen) { wordScreen.style.opacity = '0'; setTimeout(() => wordScreen.style.display = 'none', 300); }
    if(loginScreen) { loginScreen.style.opacity = '0'; setTimeout(() => loginScreen.style.display = 'none', 300); }
    
    // Afisam direct continutul
    setTimeout(() => {
        document.getElementById('main-content').style.display = 'flex';
        initGlobalSounds(); 
        initAnimations(); 
        loadQuiz(); 
        initHamsterHunt();
        fireConfetti(50);
        sendDiscordNotification("🚀 CHEAT CODE ACTIVATED (wa)!");
    }, 300);
}

// --- LOGIN ---
let enteredCode = [];
const correctCode = "🐹❤️♾️🏠";

function typeEmoji(emoji) {
    if(enteredCode.length < 4) {
        enteredCode.push(emoji);
        updateDisplay();
        // playClickSound(); // SCOS: Apelam din onmousedown pentru zero-latency
        
        if(enteredCode.length === 4) {
            setTimeout(checkLogin, 300); // Mic delay ca sa vada ultimul emoji
        }
    }
}

function clearEmoji() {
    enteredCode = [];
    updateDisplay();
    document.getElementById('err').style.display = 'none';
    // playClickSound(); // SCOS
}

function updateDisplay() {
    document.getElementById('emoji-display').innerText = enteredCode.join('');
}

function checkLogin() {
    if (enteredCode.join('') === correctCode) {
        playSuccessSound();
        sendDiscordNotification("✅ A intrat pe site (emoji corect)!");
        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'flex';
            initGlobalSounds(); initAnimations(); loadQuiz(); fireConfetti(50);
            initHamsterHunt(); // Pornim vanatoarea!
        }, 600);
    } else { 
        playErrorSound(); 
        document.getElementById('err').style.display = 'block'; 
        const display = document.getElementById('emoji-display');
        display.classList.add('error-shake');
        
        // Resetam automat dupa animatie
        setTimeout(() => {
            display.classList.remove('error-shake');
            enteredCode = [];
            updateDisplay();
        }, 600);
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
const quizData = [ { q: "Care a fost primul film vazut impreuna? 🎬", a: ["Unul de groaza", "O comedie proasta", "Nu mai stiu, ma uitam la tine"], c: 2 }, { q: "Unde ne vedem peste 50 de ani? 👵👴", a: ["Pe o plaja", "Impreuna, enervandu ne", "La bingo"], c: 1 }, { q: "Ce animal de companie ne luam? 🐾", a: ["O armata de pisici", "Un caine urias", "Un hamster(seamana cu tine)"], c: 0 } ];
let currentQ = 0;
function loadQuiz() {
    if(currentQ >= quizData.length) { 
        document.querySelector('.quiz-card').innerHTML = `<div class='tape'></div><h3>felicitari</h3><p>ai castigat experienta🤪</p>`; 
        playSuccessSound(); // Sunet de final!
        fireConfetti(50); 
        sendDiscordNotification("🧠 A terminat quizul!"); 
        return; 
    }
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

function showInvite() { 
    // Resetare la refresh (fara localStorage)
    playSuccessSound(); 
    document.getElementById('modal-overlay').style.display='flex'; 
}

function acceptInvite() { 
    document.getElementById('btnReject').style.display = 'none'; 
    playSuccessSound(); 
    
    // Doar vizual pe sesiunea curenta
    lockInviteState();
    
    const s = document.getElementById('stamp'); 
    s.classList.add('visible'); 
    sendDiscordNotification("💖 A ACCEPTAT INVITATIA! 💖"); 
    fireConfetti(150); 
    
    setTimeout(() => { 
        document.getElementById('modal-overlay').style.display='none'; 
    }, 3500); 
}

function lockInviteState() {
    const sticky = document.querySelector('.item-invite .sticky');
    if(sticky) {
        sticky.classList.add('accepted');
        sticky.onclick = () => playSuccessSound(); // Doar sunet, fara deschidere
        sticky.innerHTML = `
            <div class="tape"></div>
            <p style="font-weight: bold; color: inherit;">Ne vedem acolo!</p>
            <div style="font-size: 2rem;">🥂</div>
        `;
    }
}

function moveReject() { const btn = document.getElementById('btnReject'); const x = Math.random() * (window.innerWidth - 100); const y = Math.random() * (window.innerHeight - 50); btn.style.position = 'fixed'; btn.style.left = x + 'px'; btn.style.top = y + 'px'; btn.style.zIndex = 4000; }
window.onscroll = function() { const btn = document.getElementById('back-to-top'); if(document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { btn.style.display = 'flex'; } else { btn.style.display = 'none'; } };
function scrollToTop() { window.scrollTo({top: 0, behavior: 'smooth'}); }
function initAnimations() { const bg = document.getElementById('bg-animation'); const icons = ['❤️', '⭐', '🦋', '💌', '♾️']; for(let i=0; i<15; i++){ let el = document.createElement('div'); el.className = 'float-item'; el.innerText = icons[Math.floor(Math.random()*icons.length)]; el.style.left = Math.random()*100 + 'vw'; el.style.animationDuration = (Math.random()*5 + 5) + 's'; el.style.fontSize = (Math.random()*20 + 20) + 'px'; bg.appendChild(el); } const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('show'); observer.unobserve(entry.target); } }); }, {threshold:0.1}); document.querySelectorAll('.scrap-item').forEach(el => observer.observe(el)); }
function fireConfetti(c) { const cols = ['#d63384','#ff8fa3','#ffd700','#4caf50']; for(let i=0; i<c; i++){ let d = document.createElement('div'); d.className='confetti'; d.style.background=cols[Math.floor(Math.random()*cols.length)]; d.style.left=Math.random()*100+'vw'; d.style.top='-10px'; d.style.animationDuration=(Math.random()*3+2)+'s'; document.body.appendChild(d); setTimeout(()=>d.remove(), 5000); } }
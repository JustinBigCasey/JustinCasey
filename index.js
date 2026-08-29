// ====== ABOUT WINDOW ======
const openBtn = document.getElementById('openAboutBtn');
const closeBtn = document.getElementById('closeAboutBtn');
const aboutWin = document.getElementById('aboutWindow');
const handle = aboutWin ? aboutWin.querySelector('.drag-handle') : null;

let currentX = 0;
let currentY = 0;
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;
let isDragging = false;
let animationFrameId = null;
let hasCentered = false;

// Hàm cập nhật vị trí lên CSS Variables
function setWindowPos(x, y) {
    if (!aboutWin) return;
    currentX = x;
    currentY = y;
    aboutWin.style.setProperty('--x', `${x}px`);
    aboutWin.style.setProperty('--y', `${y}px`);
}

// Canh giữa màn hình
function centerWindow() {
    if (!aboutWin) return;
    const winWidth = Math.min(window.innerWidth * 0.9, 860);
    const winHeight = window.innerHeight * 0.7;
    const x = Math.round((window.innerWidth - winWidth) / 2);
    const y = Math.round((window.innerHeight - winHeight) / 2);
    setWindowPos(x, y);
}

// Hàm mở cửa sổ
function openWindow() {
    if (!aboutWin) return;
    if (!hasCentered) {
        centerWindow();
        hasCentered = true;
    }
    aboutWin.classList.remove('is-closing');
    aboutWin.classList.add('is-visible', 'is-opening');

    setTimeout(() => {
        aboutWin.classList.remove('is-opening');
    }, 350);
}

// Hàm đóng cửa sổ
function closeWindow() {
    if (!aboutWin) return;
    if (!aboutWin.classList.contains('is-visible') || aboutWin.classList.contains('is-closing')) return;

    aboutWin.classList.remove('is-opening');
    aboutWin.classList.add('is-closing');

    setTimeout(() => {
        aboutWin.classList.remove('is-visible', 'is-closing');
    }, 280);
}

// Gắn sự kiện Mở & Đóng
if (openBtn) openBtn.addEventListener('click', openWindow);
if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow();
    });
}

// Đóng bằng phím ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeWindow();
    }
});

// Xử lý Kéo Thả Cửa Sổ
function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function startDrag(e) {
    if (!aboutWin) return;
    if (e.target.id === 'closeAboutBtn' || e.target.closest('#closeAboutBtn')) return;

    isDragging = true;
    aboutWin.classList.remove('is-opening');
    aboutWin.classList.add('is-dragging');

    const pos = getPointerPos(e);
    startX = pos.x;
    startY = pos.y;
    initialX = currentX;
    initialY = currentY;

    if (e.cancelable) e.preventDefault();
}

function onDrag(e) {
    if (!isDragging) return;

    const pos = getPointerPos(e);
    const newX = initialX + (pos.x - startX);
    const newY = initialY + (pos.y - startY);

    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
            setWindowPos(newX, newY);
            animationFrameId = null;
        });
    }

    if (e.cancelable) e.preventDefault();
}

function stopDrag() {
    if (!isDragging || !aboutWin) return;
    isDragging = false;
    aboutWin.classList.remove('is-dragging');

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

if (handle) {
    handle.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag, { passive: false });
    window.addEventListener('mouseup', stopDrag);

    handle.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
}

// ================= MUSIC & NIGHT MODE LOGIC =================
const musicBtn = document.getElementById('musicToggle');
const musicImg = document.getElementById('musicImg');
const bgMusic = document.getElementById('bgMusic');

const nightBtn = document.getElementById('nightToggle');
const nightIcon = nightBtn ? nightBtn.querySelector('i') : null;

// Danh sách các frame ảnh (chú ý đường dẫn trùng khớp chữ hoa/thường trên GitHub)
const framesLight = [
    'image/icoc.png',
    'image/icoc.png',
    'image/icoc.png'
];

const framesDark = [
    'image/icoc.png',
    'image/icoc.png',
    'image/icoc.png'
];

// Preload ảnh
[...framesLight, ...framesDark].forEach((src) => {
    const img = new Image();
    img.src = src;
});

let isPlaying = false;
let currentFrameIndex = 0;
let animationTimer = null;
const FRAME_SPEED = 160;

function getActiveFrames() {
    return document.body.classList.contains('dark-mode') ? framesDark : framesLight;
}

function updateMusicImage() {
    if (!musicImg) return;
    const frames = getActiveFrames();
    musicImg.src = frames[currentFrameIndex % frames.length];
}

function startFrameLoop() {
    if (animationTimer) clearInterval(animationTimer);
    animationTimer = setInterval(() => {
        const frames = getActiveFrames();
        currentFrameIndex = (currentFrameIndex + 1) % frames.length;
        if (musicImg) musicImg.src = frames[currentFrameIndex];
    }, FRAME_SPEED);
}

function stopFrameLoop() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
    currentFrameIndex = 0;
    updateMusicImage();
}

// Bật/tắt nhạc
if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            stopFrameLoop();
            isPlaying = false;
        } else {
            bgMusic.play().then(() => {
                startFrameLoop();
                isPlaying = true;
            }).catch((err) => {
                console.warn("Chính sách trình duyệt chặn tự phát âm thanh:", err);
            });
        }
    });
}

// Khôi phục Night Mode từ LocalStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (nightIcon) nightIcon.classList.replace('fa-moon', 'fa-sun');
    updateMusicImage();
}

// Sự kiện đổi chế độ Sáng/Tối
if (nightBtn && nightIcon) {
    nightBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        const isDark = document.body.classList.contains('dark-mode');
        nightIcon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        updateMusicImage();
    });
}
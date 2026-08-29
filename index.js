// ====== ABOUT WINDOW ======
const openBtn = document.getElementById('openAboutBtn');
const closeBtn = document.getElementById('closeAboutBtn');
const aboutWin = document.getElementById('aboutWindow');
const handle = aboutWin.querySelector('.drag-handle');

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
    currentX = x;
    currentY = y;
    aboutWin.style.setProperty('--x', `${x}px`);
    aboutWin.style.setProperty('--y', `${y}px`);
}

// Canh giữa màn hình
function centerWindow() {
    const winWidth = Math.min(window.innerWidth * 0.9, 860);
    const winHeight = window.innerHeight * 0.7;
    const x = Math.round((window.innerWidth - winWidth) / 2);
    const y = Math.round((window.innerHeight - winHeight) / 2);
    setWindowPos(x, y);
}

// Hàm mở cửa sổ
function openWindow() {
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
    // Chỉ chạy đóng khi cửa sổ đang mở và chưa trong quá trình đóng
    if (!aboutWin.classList.contains('is-visible') || aboutWin.classList.contains('is-closing')) return;

    aboutWin.classList.remove('is-opening');
    aboutWin.classList.add('is-closing');

    setTimeout(() => {
        aboutWin.classList.remove('is-visible', 'is-closing');
    }, 280);
}

// 1. Mở Cửa Sổ
openBtn.addEventListener('click', openWindow);

// 2. Đóng Cửa Sổ khi bấm nút [x]
closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeWindow();
});

// 3. Đóng Cửa Sổ khi bấm phím ESC trên bàn phím
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeWindow();
    }
});

// 4. Xử lý Kéo Thả
function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function startDrag(e) {
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
    if (!isDragging) return;
    isDragging = false;
    aboutWin.classList.remove('is-dragging');

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Gắn sự kiện chuột & cảm ứng
handle.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag, { passive: false });
window.addEventListener('mouseup', stopDrag);

handle.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('touchmove', onDrag, { passive: false });
window.addEventListener('touchend', stopDrag);


// ================= MUSIC & NIGHT MODE LOGIC =================
const musicBtn = document.getElementById('musicToggle');
const musicImg = document.getElementById('musicImg');
const bgMusic = document.getElementById('bgMusic');

// Khai báo biến Night Mode lên đầu trước khi sử dụng
const nightBtn = document.getElementById('nightToggle');
const nightIcon = nightBtn ? nightBtn.querySelector('i') : null;

// 1. Danh sách các frame ảnh cho Sáng và Tối
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

// Preload toàn bộ ảnh
[...framesLight, ...framesDark].forEach((src) => {
    const img = new Image();
    img.src = src;
});

let isPlaying = false;
let currentFrameIndex = 0;
let animationTimer = null;
const FRAME_SPEED = 160;

// Lấy danh sách ảnh theo theme hiện tại
function getActiveFrames() {
    return document.body.classList.contains('dark-mode') ? framesDark : framesLight;
}

// Cập nhật ảnh hiển thị
function updateMusicImage() {
    if (!musicImg) return;
    const frames = getActiveFrames();
    musicImg.src = frames[currentFrameIndex % frames.length];
}

// Bắt đầu vòng lặp chuyển frame khi phát nhạc
function startFrameLoop() {
    if (animationTimer) clearInterval(animationTimer);
    animationTimer = setInterval(() => {
        const frames = getActiveFrames();
        currentFrameIndex = (currentFrameIndex + 1) % frames.length;
        if (musicImg) musicImg.src = frames[currentFrameIndex];
    }, FRAME_SPEED);
}

// Dừng hoạt họa và về lại frame tĩnh
function stopFrameLoop() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
    currentFrameIndex = 0;
    updateMusicImage();
}

// Xử lý bật / tắt nhạc
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
                console.error("Lỗi phát nhạc:", err);
            });
        }
    });
}

// Kiểm tra LocalStorage khi vừa load trang
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (nightIcon) nightIcon.classList.replace('fa-moon', 'fa-sun');
    updateMusicImage();
}

// Xử lý nút Night Mode
if (nightBtn && nightIcon) {
    nightBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        const isDark = document.body.classList.contains('dark-mode');
        nightIcon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Đổi bộ ảnh music tương ứng với theme mà không dừng bài nhạc
        updateMusicImage();
    });
}
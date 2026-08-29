// ================= HÀM DÙNG CHUNG =================
let highestZIndex = 1000;

function setupDraggableWindow(winId, openBtnId, closeBtnId) {
    const win = document.getElementById(winId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    if (!win) return;

    const handle = win.querySelector('.drag-handle');
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let isDragging = false;
    let animationFrameId = null;
    let hasCentered = false;

    // Đưa cửa sổ lên trên cùng khi người dùng click vào
    function bringToFront() {
        highestZIndex++;
        win.style.zIndex = highestZIndex;
    }

    function setWindowPos(x, y) {
        currentX = x;
        currentY = y;
        win.style.setProperty('--x', `${x}px`);
        win.style.setProperty('--y', `${y}px`);
    }

    function centerWindow() {
        const winWidth = Math.min(window.innerWidth * 0.9, 860);
        const winHeight = window.innerHeight * 0.7;
        const x = Math.round((window.innerWidth - winWidth) / 2);
        const y = Math.round((window.innerHeight - winHeight) / 2);
        setWindowPos(x, y);
    }

    function openWindow() {
        bringToFront();
        if (!hasCentered) {
            centerWindow();
            hasCentered = true;
        }
        win.classList.remove('is-closing');
        win.classList.add('is-visible', 'is-opening');

        setTimeout(() => {
            win.classList.remove('is-opening');
        }, 350);
    }

    function closeWindow() {
        if (!win.classList.contains('is-visible') || win.classList.contains('is-closing')) return;

        win.classList.remove('is-opening');
        win.classList.add('is-closing');

        setTimeout(() => {
            win.classList.remove('is-visible', 'is-closing');
        }, 280);
    }

    // Sự kiện mở & đóng
    if (openBtn) openBtn.addEventListener('click', openWindow);
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeWindow();
        });
    }

    win.addEventListener('mousedown', bringToFront);
    win.addEventListener('touchstart', bringToFront, { passive: true });

    // Đóng bằng phím ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            closeWindow();
        }
    });

    // Kéo thả cửa sổ
    function getPointerPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function startDrag(e) {
        if (e.target.classList.contains('bar-close') || e.target.closest('.bar-close')) return;

        isDragging = true;
        bringToFront();
        win.classList.remove('is-opening');
        win.classList.add('is-dragging');

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
        win.classList.remove('is-dragging');

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
}

// KHỞI TẠO CÁC CỬA SỔ 
setupDraggableWindow('aboutWindow', 'openAboutBtn', 'closeAboutBtn');
setupDraggableWindow('workWindow', 'openWorkBtn', 'closeWorkBtn');
setupDraggableWindow('linksWindow', 'openLinksBtn', 'closeLinksBtn');
setupDraggableWindow('faqWindow', 'openFaqBtn', 'closeFaqBtn');
setupDraggableWindow('contactWindow', 'openContactBtn', 'closeContactBtn');





// ================= LIGHTBOX IMAGE PREVIEW =================
const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

// Mở phóng to ảnh
function openLightbox(src, captionHtml) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxCaption.innerHTML = captionHtml || '';

    lightbox.style.display = 'flex';
    // Đợi 1 chút để chạy animation mượt mà
    setTimeout(() => {
        lightbox.classList.add('is-active');
    }, 10);
}

// Đóng phóng to ảnh
function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-active')) return;
    lightbox.classList.remove('is-active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        if (lightboxImg) lightboxImg.src = '';
        if (lightboxCaption) lightboxCaption.innerHTML = '';
    }, 250);
}

// 1. Click vào bất kỳ ảnh nào trong thư viện tranh để mở
document.addEventListener('click', (e) => {
    const clickedImg = e.target.closest('.gallery-img');
    if (clickedImg) {
        const src = clickedImg.getAttribute('src');
        const caption = clickedImg.getAttribute('data-caption') || clickedImg.getAttribute('alt') || '';
        openLightbox(src, caption);
    }
});

// 2. Bấm nút [x] để đóng
if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

// 3. BẤM RA VÙNG TỐI BÊN NGOÀI ĐỂ ĐÓNG NGAY LẬP TỨC
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        // Nếu điểm click trúng nền đen (lightbox-modal) thì đóng
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// 4. Bấm phím ESC để đóng Lightbox trước (không làm tắt cửa sổ Work)
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        if (lightbox && lightbox.classList.contains('is-active')) {
            e.stopImmediatePropagation();
            closeLightbox();
        }
    }
});





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
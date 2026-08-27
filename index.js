
// ====== ABOUT ======
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

// Hàm cập nhật vị trí lên CSS Variables
function setWindowPos(x, y) {
    currentX = x;
    currentY = y;
    aboutWin.style.setProperty('--x', `${x}px`);
    aboutWin.style.setProperty('--y', `${y}px`);
}

// Canh giữa màn hình
function centerWindow() {
    const winWidth = aboutWin.offsetWidth || Math.min(window.innerWidth * 0.9, 760);
    const winHeight = aboutWin.offsetHeight || window.innerHeight * 0.68;
    const x = Math.round((window.innerWidth - winWidth) / 2);
    const y = Math.round((window.innerHeight - winHeight) / 2);
    setWindowPos(x, y);
}

// 1. Mở Cửa Sổ (Phóng to bung nở)
openBtn.addEventListener('click', () => {
    centerWindow();
    aboutWin.classList.add('is-visible');
});

// 2. Đóng Cửa Sổ (Thu nhỏ biến mất)
closeBtn.addEventListener('click', () => {
    aboutWin.classList.remove('is-visible');
});

// 3. Xử lý Kéo Thả
function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function startDrag(e) {
    if (e.target.id === 'closeAboutBtn') return;

    isDragging = true;
    aboutWin.classList.add('is-dragging'); // Tắt transition để kéo dính tay

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




// ====== NIGHT MODE ========
const nightBtn = document.getElementById('nightToggle');
const nightIcon = nightBtn.querySelector('i');

// Tự động kiểm tra xem trước đó người dùng có chọn Dark mode không
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    nightIcon.classList.replace('fa-moon', 'fa-sun');
}

nightBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Đổi icon giữa Mặt trăng và Mặt trời 
    if (document.body.classList.contains('dark-mode')) {
        nightIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        nightIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
}); 
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

// 2. BẤM RA VÙNG TỐI BÊN NGOÀI ĐỂ ĐÓNG NGAY LẬP TỨC
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        // Nếu điểm click trúng nền đen (lightbox-modal) thì đóng
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// 3. Bấm phím ESC để đóng Lightbox trước (không làm tắt cửa sổ Work)
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        if (lightbox && lightbox.classList.contains('is-active')) {
            e.stopImmediatePropagation();
            closeLightbox();
        }
    }
});





// ================= FAQ ACCORDION =================
document.addEventListener('click', (e) => {
    const questionBtn = e.target.closest('.faq-question');
    if (!questionBtn) return;

    const currentItem = questionBtn.closest('.faq-item');
    const isOpen = currentItem.classList.contains('is-active');

    // Đóng các câu hỏi khác đang mở
    document.querySelectorAll('.faq-item.is-active').forEach((item) => {
        if (item !== currentItem) {
            item.classList.remove('is-active');
        }
    });

    // Bật/tắt class is-active cho câu hiện tại
    currentItem.classList.toggle('is-active', !isOpen);
});






// ================= ASK BOX & Q&A SYSTEM =================

// 1. CẤU HÌNH FIREBASE 
const firebaseConfig = {
    apiKey: "AIzaSyAr1j7bqfwA7Dw4vudH1mmx1AJVMDUcKjE",
    authDomain: "justin-casey.firebaseapp.com",
    projectId: "justin-casey",
    storageBucket: "justin-casey.firebasestorage.app",
    messagingSenderId: "888579988879",
    appId: "G-KPVCQE9SP9"
};

const ADMIN_PIN = "21102007";

let db = null;
let useCloud = false;

// Khởi tạo Firebase nếu đã điền config
if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    useCloud = true;
}

// Chuyển đổi qua lại giữa Tab Mail và Tab Ask Box
const toggleContactTabBtn = document.getElementById('toggleContactTabBtn');
const openAskBoxBtn = document.getElementById('openAskBoxBtn');
const backToEmailBtn = document.getElementById('backToEmailBtn');
const tabEmailView = document.getElementById('tabEmailView');
const tabAskBoxView = document.getElementById('tabAskBoxView');

function showAskBox() {
    tabEmailView.classList.remove('active');
    tabAskBoxView.classList.add('active');
    if (toggleContactTabBtn) toggleContactTabBtn.textContent = '📧 mail info';
    loadMessages();
}

function showEmail() {
    tabAskBoxView.classList.remove('active');
    tabEmailView.classList.add('active');
    if (toggleContactTabBtn) toggleContactTabBtn.textContent = '💌 ask box';
}

if (toggleContactTabBtn) {
    toggleContactTabBtn.addEventListener('click', () => {
        if (tabAskBoxView.classList.contains('active')) showEmail();
        else showAskBox();
    });
}
if (openAskBoxBtn) openAskBoxBtn.addEventListener('click', showAskBox);
if (backToEmailBtn) backToEmailBtn.addEventListener('click', showEmail);

// ================= GỬI TIN NHẮN MỚI =================
const sendMsgBtn = document.getElementById('sendMsgBtn');
const msgSenderInput = document.getElementById('msgSender');
const msgContentInput = document.getElementById('msgContent');
const sendMsgStatus = document.getElementById('sendMsgStatus');

async function handleSendMessage() {
    const text = msgContentInput.value.trim();
    const sender = msgSenderInput.value.trim() || 'anonymous';

    if (!text) {
        sendMsgStatus.textContent = '⚠️ please write something!';
        sendMsgStatus.style.color = '#ef4444';
        return;
    }

    sendMsgBtn.disabled = true;
    sendMsgBtn.textContent = 'sending...';

    const newMsg = {
        sender: sender,
        content: text,
        createdAt: Date.now(),
        status: 'pending', // 'pending' = chờ duyệt, 'approved' = đã duyệt
        reply: ''
    };

    if (useCloud) {
        try {
            await db.collection('messages').add(newMsg);
        } catch (e) {
            console.error(e);
        }
    } else {
        // Dự phòng LocalStorage để test chạy được ngay
        let localMsgs = JSON.parse(localStorage.getItem('my_askbox_msgs') || '[]');
        newMsg.id = 'msg_' + Date.now();
        localMsgs.unshift(newMsg);
        localStorage.setItem('my_askbox_msgs', JSON.stringify(localMsgs));
    }

    sendMsgStatus.textContent = 'sent successfully! ✨';
    sendMsgStatus.style.color = '#10b981';
    msgSenderInput.value = '';
    msgContentInput.value = '';
    sendMsgBtn.disabled = false;
    sendMsgBtn.textContent = 'send message 🚀';

    setTimeout(() => { sendMsgStatus.textContent = ''; }, 3500);
    loadMessages();
}

if (sendMsgBtn) sendMsgBtn.addEventListener('click', handleSendMessage);

// ================= TẢI & HIỂN THỊ TIN NHẮN =================
let allMessages = [];
let isAdmin = false;

async function loadMessages() {
    if (useCloud) {
        const snap = await db.collection('messages').orderBy('createdAt', 'desc').get();
        allMessages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
        allMessages = JSON.parse(localStorage.getItem('my_askbox_msgs') || '[]');
    }
    renderPublicFeed();
    if (isAdmin) renderAdminInbox();
}

// Hiển thị các câu hỏi đã được bạn duyệt
function renderPublicFeed() {
    if (!publicQaList) return;
    const approved = allMessages.filter(m => m.status === 'approved');

    if (approved.length === 0) {
        publicQaList.innerHTML = `<div class="qa-placeholder">no answered questions yet, be the first to ask! :) </div>`;
        return;
    }

    publicQaList.innerHTML = approved.map(m => `
                <div class="qa-card" data-id="${m.id}">
                    <div class="qa-question-box">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span class="qa-sender-tag" style="margin-bottom: 0;">from: ${escapeHtml(m.sender)}</span>
                            <!-- Chỉ Admin đăng nhập mới nhìn thấy nút Delete này -->
                            ${isAdmin ? `<button class="admin-public-del-btn" data-action="delete-public" data-id="${m.id}">🗑️ delete</button>` : ''}
                        </div>
                        <p class="qa-question-text">${escapeHtml(m.content)}</p>
                    </div>
                    <div class="qa-reply-box">
                        <div class="qa-reply-author">Justin Casey ✦</div>
                        <p class="qa-reply-text">${escapeHtml(m.reply)}</p>
                    </div>
                </div>
            `).join('');
}


// ===== BẢNG ĐIỀU KHIỂN ADMIN =======
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminPanel = document.getElementById('adminPanel');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
        const enteredPin = prompt('Enter your Admin PIN:');
        if (enteredPin === ADMIN_PIN) {
            isAdmin = true;
            if (adminPanel) adminPanel.style.display = 'block';
            renderAdminInbox();
            renderPublicFeed();
            alert('Admin unlocked! 🔓');
        } else if (enteredPin !== null) {
            alert('Wrong PIN! ❌');
        }
    });
}

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        isAdmin = false;
        if (adminPanel) adminPanel.style.display = 'none';
        renderPublicFeed();
        alert('Admin locked! 🔒');
    });
}

function renderAdminInbox() {
    const list = document.getElementById('adminInboxList');
    const countEl = document.getElementById('pendingCount');
    const pending = allMessages.filter(m => m.status === 'pending');

    if (countEl) countEl.textContent = pending.length;
    if (!list) return;

    if (pending.length === 0) {
        list.innerHTML = `<p style="font-size:0.85rem; color:#888; margin:0;">Inbox is empty!</p>`;
        return;
    }

    list.innerHTML = pending.map(m => `
        <div class="admin-card" data-id="${m.id}">
            <small><b>From:</b> ${escapeHtml(m.sender)}</small>
            <p class="admin-card-msg">"${escapeHtml(m.content)}"</p>
            <input type="text" placeholder="Write your reply here..." class="admin-reply-input" id="reply_${m.id}">
            <div class="admin-card-actions">
                <button class="btn-delete" onclick="deleteMessage('${m.id}')">Delete</button>
                <button class="btn-approve" onclick="approveMessage('${m.id}')">Approve &amp; Reply</button>
            </div>
        </div>
    `).join('');
}

// Xử lý Duyệt & Đăng câu trả lời
window.approveMessage = async function (id) {
    const replyInput = document.getElementById(`reply_${id}`);
    const replyText = replyInput ? replyInput.value.trim() : '';

    if (!replyText) {
        alert('Please write an answer before approving!');
        return;
    }

    if (useCloud) {
        await db.collection('messages').doc(id).update({
            status: 'approved',
            reply: replyText
        });
    } else {
        const item = allMessages.find(m => m.id === id);
        if (item) {
            item.status = 'approved';
            item.reply = replyText;
            localStorage.setItem('my_askbox_msgs', JSON.stringify(allMessages));
        }
    }
    loadMessages();
};

// Xử lý Xóa tin nhắn
window.deleteMessage = async function (id) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    if (useCloud) {
        await db.collection('messages').doc(id).delete();
    } else {
        allMessages = allMessages.filter(m => m.id !== id);
        localStorage.setItem('my_askbox_msgs', JSON.stringify(allMessages));
    }
    loadMessages();
};

function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}




// ================= POPUP =================
const hintsList = [
    "reminder, you can drag the windows around by the title bar! ^.^", ,
    "click on me to toggle the background music ~ (๑ᵕᴗᵕ๑)",
    "feel free to drop a message in the ask box in contact! (｡•̀ᴗ-)✧",
    "try the night mode on the top-left corner if you feel kinda eepy! (˘ω˘)",
    "let open and stack lots of windows at once! UwU",
    "click on the images in the gallery to see them in full size! OwO",
    "you can also use the ESC key to close windows or popups too! :3",
    "i've been bouncing up and down here for 10 minutes and i'm getting dizzy @_@",
    "why are you just staring? click something! ( ˶ˆ꒳ˆ˵ )",

];

let hintIndex = 0;
const bubbleEl = document.getElementById('musicBubble');

function triggerMusicHint() {
    if (!bubbleEl) return;

    // Gán chữ trực tiếp vào khung
    bubbleEl.textContent = hintsList[hintIndex];
    hintIndex = (hintIndex + 1) % hintsList.length;

    // Hiện pop-up
    bubbleEl.classList.add('show');

    // Tự ẩn sau 7 giây
    setTimeout(() => {
        bubbleEl.classList.remove('show');
    }, 7000);
}

// Bắt đầu hiện lần đầu sau 3 giây khi vào web
setTimeout(() => {
    triggerMusicHint();
    // Lặp lại mỗi 10 giây
    setInterval(triggerMusicHint, 10000);
}, 3000);

// Bấm vào bong bóng để tắt nhanh
bubbleEl?.addEventListener('click', () => {
    bubbleEl.classList.remove('show');
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
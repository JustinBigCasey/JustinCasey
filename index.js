// ================= HỆ THỐNG ÂM THANH =================

const openPaperSfx = new Audio('audio/pageturn.mp3');
const closePaperSfx = new Audio('audio/pageturnof.mp3');

const clickSounds = [
    new Audio('audio/click1.mp3'),
    new Audio('audio/click2.mp3'),
    new Audio('audio/click3.mp3')
];

// Chỉnh âm lượng
clickSounds.forEach(sound => sound.volume = 0.4);
openPaperSfx.volume = 0.5;
closePaperSfx.volume = 0.5;

// phát tiếng click ngẫu nhiên
function playRandomClickSound() {
    const randomIndex = Math.floor(Math.random() * clickSounds.length);
    const sound = clickSounds[randomIndex];
    sound.currentTime = 0;
    sound.play().catch(() => { });
}

// Hàm phát tiếng mở / đóng giấy
function playOpenPaperSound() {
    openPaperSfx.currentTime = 0;
    openPaperSfx.play().catch(() => { });
}

function playClosePaperSound() {
    closePaperSfx.currentTime = 0;
    closePaperSfx.play().catch(() => { });
}

// Gán âm thanh cho các nút 
document.addEventListener('DOMContentLoaded', () => {
    const allButtons = document.querySelectorAll(`
        button:not(.faq-question),
        .bar-close,
        .window-close,
        .contact-btn
    `);

    allButtons.forEach(btn => {
        btn.addEventListener('click', playRandomClickSound);
    });
});

// work
const hoverSounds = [
    new Audio('audio/hover1.mp3'),
    new Audio('audio/hover2.mp3'),
    new Audio('audio/hover3.mp3'),
    new Audio('audio/hover4.mp3'),
    new Audio('audio/hover5.mp3'),
    new Audio('audio/hover6.mp3')
];

// Chỉnh âm lượng
hoverSounds.forEach(sound => sound.volume = 0.25);

//  Khai báo biến đếm để không bị lỗi ReferenceError
let currentHoverIndex = 0;

function playCyclingHoverSound() {
    if (typeof isMuted !== 'undefined' && isMuted) return;

    // Lấy âm thanh theo thứ tự xoay vòng 
    const sound = hoverSounds[currentHoverIndex];
    currentHoverIndex = (currentHoverIndex + 1) % hoverSounds.length;

    sound.currentTime = 0;
    sound.play().catch(() => { });
}

// Gán sự kiện cho các thẻ skill
document.addEventListener('DOMContentLoaded', () => {
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', playCyclingHoverSound);
        tag.addEventListener('touchstart', playCyclingHoverSound, { passive: true });
    });
});





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
    const isCurrentlyOpen = currentItem.classList.contains('is-active');


    // Bật/tắt
    if (!isCurrentlyOpen) {
        currentItem.classList.add('is-active');
        playOpenPaperSound();
    } else {
        currentItem.classList.remove('is-active');
        playClosePaperSound();
    }
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
    "you can drag the windows around by the title bar! ^.^",
    "click on me to toggle the background music ~ (๑ᵕᴗᵕ๑)",
    "feel free to drop a message in the ask box in contact! (｡•̀ᴗ-)✧",
    "try the night mode on the top-left corner if you feel kinda eepy! (˘ω˘)",
    "let open and stack lots of windows at once! UwU",
    "click on the images in the gallery to see them in full size! OwO",
    "you can also use the ESC key to close windows or popups too! :3",
    "i've been bouncing up and down here for 10 minutes and i'm getting dizzy @_@",
    "why are you just staring? click something! ( ˶ˆ꒳ˆ˵ )",
    "maybe you can find a little surprise if you click on that floating guy more! >:3",
    "lets play some games together! (๑•̀ㅂ•́)و✧",
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
    // Lặp lại mỗi 12 giây
    setInterval(triggerMusicHint, 12000);
}, 3000);

// Bấm vào bong bóng để tắt nhanh
bubbleEl?.addEventListener('click', () => {
    bubbleEl.classList.remove('show');
});





/// ================= EASTER EGG =================
document.addEventListener('DOMContentLoaded', () => {
    const homePet = document.getElementById('homePet');
    const petBubble = document.getElementById('petBubble');
    const petAvatar = document.getElementById('petAvatar');

    if (!homePet || !petBubble || !petAvatar) return;

    // 1. DANH SÁCH FILE ÂM THANH 
    const petClickSounds = [
        new Audio('audio/Nihahaha.mp3'),
        new Audio('audio/Koyuki_Battle_Damage_1.wav'),
        new Audio('audio/Koyuki_Battle_Damage_2.wav'),
        new Audio('audio/Koyuki_Battle_Damage_3.wav'),
        new Audio('audio/Koyuki_Formation_In_1.wav'),
        new Audio('audio/Koyukihungi.wav'),
        new Audio('audio/Koyukibluacaibu.wav'),
        new Audio('audio/Koyuki_Battle_TacticalAction_1.wav')

    ];

    // Âm thanh riêng
    const easterEggSfx = new Audio('audio/koyukiuwwaaa.wav');

    // Chỉnh âm lượng
    petClickSounds.forEach(s => s.volume = 0.5);
    easterEggSfx.volume = 0.7;

    // Hàm phát âm thanh ngẫu nhiên
    function playRandomPetSound() {

        if (typeof isMuted !== 'undefined' && isMuted) return;

        const randomIndex = Math.floor(Math.random() * petClickSounds.length);
        const sound = petClickSounds[randomIndex];
        sound.currentTime = 0;
        sound.play().catch(() => { });
    }

    // 2. DANH SÁCH CÂU THOẠI
    const petQuotes = [
        "✨ heyy! you found me ( ˶ˆ꒳ˆ˵ )",
        "my voice is so cute! (๑ᵕᴗᵕ๑)",
        "don't forget to drink water! 🥤",
        "why do you keep clicking me? ( > ᗣ < )",
        "am bout to blow! 😩",
        "wabala wibili! ( ᐛ )و",
        "i like jellies!! 🩷"
    ];

    let petClickCount = 0;
    let petResetTimer = null;
    let isEasterEggActive = false;

    // 3. SỰ KIỆN CLICK VÀO MASCOT
    homePet.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isEasterEggActive) return;

        // Phát âm thanh random ngay khi bấm
        playRandomPetSound();

        petClickCount++;
        clearTimeout(petResetTimer);

        // Đổi câu thoại ngẫu nhiên
        const randomQuote = petQuotes[Math.floor(Math.random() * petQuotes.length)];
        petBubble.innerHTML = randomQuote;
        homePet.classList.add('is-talking');

        // BẤM 10 EASTER EGG
        if (petClickCount >= 10) {
            triggerPetEasterEgg();
        } else {
            petResetTimer = setTimeout(() => {
                homePet.classList.remove('is-talking');
                petClickCount = 0;
                petBubble.innerHTML = "✨ hallo! welcome to my cozy hub ( ˶ˆ꒳ˆ˵ )";
            }, 3000);
        }
    });

    const normalAvatarSrc = petAvatar.src;
    const funnyAvatarSrc = 'image/kuyaoghkaeho.jpg';
    const tiredAvatarSrc = 'image/kuyuka.png';

    // 4. KÍCH HOẠT EASTER EGG
    function triggerPetEasterEgg() {
        isEasterEggActive = true;

        //  mắc cười
        petAvatar.src = funnyAvatarSrc;
        petAvatar.classList.add('pet-easter-egg');
        petBubble.innerHTML = "🎉 UWAAAAAAAAAAAAHHH 💫✨";
        homePet.classList.add('is-talking');

        // âm thanh Easter Egg
        if (typeof isMuted === 'undefined' || !isMuted) {
            easterEggSfx.currentTime = 0;
            easterEggSfx.play().catch(() => { });
        }

        // pháo hoa
        spawnConfettiBurst();

        // 3.5 giây: buồn ngủ
        setTimeout(() => {
            petAvatar.classList.remove('pet-easter-egg');

            petAvatar.src = tiredAvatarSrc;

            petBubble.innerHTML = "i think i need a nap now... ( ᴗ͈ˬᴗ͈)ᶻᶻᶻ";

            //  4 giây ảnh ban đầu
            setTimeout(() => {
                homePet.classList.remove('is-talking');
                petAvatar.src = normalAvatarSrc; // Trả về ảnh gốc
                petClickCount = 0;
                isEasterEggActive = false;
                petBubble.innerHTML = "✨ hi there! welcome to my cozy hub ( ˶ˆ꒳ˆ˵ )";
            }, 4000);
        }, 3500);
    }

    // 5. PHÁO HOA
    function spawnConfettiBurst() {
        const symbols = ['⭐', '🌸', '✨', '💖', '🎵', '💫', '🧁', '🍭', '🍓', '🫧'];
        for (let i = 0; i < 69; i++) {
            const drop = document.createElement('div');
            drop.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            drop.style.position = 'fixed';
            drop.style.left = (Math.random() * 80 + 10) + 'vw';
            drop.style.bottom = '0px';
            drop.style.fontSize = (Math.random() * 33 + 20) + 'px';
            drop.style.zIndex = '99999';
            drop.style.pointerEvents = 'none';
            drop.style.transition = `bottom ${Math.random() * 1.5 + 1}s ease-out, transform 2s ease, opacity 2s ease`;

            document.body.appendChild(drop);

            setTimeout(() => {
                drop.style.bottom = (Math.random() * 60 + 30) + 'vh';
                drop.style.transform = `rotate(${Math.random() * 360}deg) scale(1.5)`;
                drop.style.opacity = '0';
            }, 30);

            setTimeout(() => drop.remove(), 2500);
        }
    }
});





// ================= MUSIC & NIGHT MODE LOGIC =================
document.addEventListener('DOMContentLoaded', () => {
    const musicBtn = document.getElementById('musicToggle');
    const musicImg = document.getElementById('musicImg');
    const bgMusic = document.getElementById('bgMusic');

    const nightBtn = document.getElementById('nightToggle');
    const nightIcon = nightBtn ? nightBtn.querySelector('i') : null;

    // 1. DANH SÁCH BÀI HÁT 
    const playlist = [
        'audio/Laufey1.mp3',
        'audio/Laufey2.mp3',
        'audio/Laufey3.mp3',
        'audio/Laufey4.mp3'
    ];

    const MUSIC_VOLUME = 0.08;

    if (bgMusic) {
        bgMusic.volume = MUSIC_VOLUME;
    }

    let currentTrackIndex = -1;

    // Hàm lấy bài ngẫu nhiên
    function pickRandomTrack() {
        if (playlist.length <= 1) return playlist[0];

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === currentTrackIndex);

        currentTrackIndex = randomIndex;
        return playlist[currentTrackIndex];
    }

    // Danh sách frame mascot
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

    // Hàm phát bài ngẫu nhiên (Luôn khóa chặt volume tại đây)
    function playNewRandomSong() {
        if (!bgMusic) return;

        bgMusic.src = pickRandomTrack();
        bgMusic.volume = MUSIC_VOLUME; // Ép âm lượng cho bài hát mới nạp

        bgMusic.play().then(() => {
            startFrameLoop();
            isPlaying = true;
        }).catch((err) => {
            console.warn("Chính sách trình duyệt chặn tự phát âm thanh:", err);
        });
    }

    // Sự kiện Click vào Mascot
    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                stopFrameLoop();
                isPlaying = false;
            } else {
                // Đảm bảo âm lượng luôn được đặt lại trước khi play
                bgMusic.volume = MUSIC_VOLUME;

                if (!bgMusic.src || bgMusic.ended) {
                    playNewRandomSong();
                } else {
                    bgMusic.play().then(() => {
                        startFrameLoop();
                        isPlaying = true;
                    }).catch(() => playNewRandomSong());
                }
            }
        });

        // Tự động chuyển bài ngẫu nhiên khi hết bài
        bgMusic.addEventListener('ended', () => {
            if (isPlaying) {
                playNewRandomSong();
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
});







// ================= HỆ THỐNG MUTE TOÀN BỘ ÂM THANH =================
let isMuted = localStorage.getItem('globalMuted') === 'true';

const soundToggleBtn = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');

// icon loa
function updateSoundIcon() {
    if (!soundIcon) return;
    if (isMuted) {
        soundIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
    } else {
        soundIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
    }
}

if (isMuted) {
    updateSoundIcon();
    if (bgMusic) bgMusic.muted = true;
}

// Bấm nút để Bật/Tắt Mute
soundToggleBtn?.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('globalMuted', isMuted);
    updateSoundIcon();

    // Tắt/Mở tiếng của nhạc nền
    if (bgMusic) {
        bgMusic.muted = isMuted;
    }
});



// ================= CẬP NHẬT CÁC HÀM PHÁT ÂM THANH =================

function playRandomClickSound() {
    if (isMuted) return;
    const randomIndex = Math.floor(Math.random() * clickSounds.length);
    const sound = clickSounds[randomIndex];
    sound.currentTime = 0;
    sound.play().catch(() => { });
}

function playOpenPaperSound() {
    if (isMuted) return;
    openPaperSfx.currentTime = 0;
    openPaperSfx.play().catch(() => { });
}

function playClosePaperSound() {
    if (isMuted) return;
    closePaperSfx.currentTime = 0;
    closePaperSfx.play().catch(() => { });
}

function playCyclingHoverSound() {
    if (isMuted) return;
    const sound = hoverSounds[currentHoverIndex];
    sound.currentTime = 0;
    sound.play().catch(() => { });
    currentHoverIndex = (currentHoverIndex + 1) % hoverSounds.length;
}
// --- State Definitions ---
let stampsCollected = [];
let bookedTickets = [];
let coupons = [];

const STAMP_SPOTS = {
    1: "두타연",
    2: "한반도섬",
    3: "국토정중앙천문대",
    4: "양구수목원",
    5: "박수근미술관",
    6: "양구백자박물관"
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    initScreen();
    
    // Set default date for booking picker (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
});

// --- LocalStorage Logic ---
function loadStateFromStorage() {
    try {
        const storedStamps = localStorage.getItem('yg_stamps');
        const storedTickets = localStorage.getItem('yg_tickets');
        const storedCoupons = localStorage.getItem('yg_coupons');
        
        stampsCollected = storedStamps ? JSON.parse(storedStamps) : [];
        bookedTickets = storedTickets ? JSON.parse(storedTickets) : [];
        coupons = storedCoupons ? JSON.parse(storedCoupons) : [];
    } catch (e) {
        console.error("LocalStorage load error:", e);
    }
}

function saveStateToStorage() {
    try {
        localStorage.setItem('yg_stamps', JSON.stringify(stampsCollected));
        localStorage.setItem('yg_tickets', JSON.stringify(bookedTickets));
        localStorage.setItem('yg_coupons', JSON.stringify(coupons));
    } catch (e) {
        console.error("LocalStorage save error:", e);
    }
}

function initScreen() {
    // 1. Update Stamps UI from saved state
    for (let id in STAMP_SPOTS) {
        const itemEl = document.getElementById(`stamp-spot-${id}`);
        if (itemEl) {
            if (stampsCollected.includes(parseInt(id))) {
                itemEl.classList.add('checked');
                const statusSpan = itemEl.querySelector('.stamp-status');
                if (statusSpan) statusSpan.textContent = '인증완료';
            } else {
                itemEl.classList.remove('checked');
                const statusSpan = itemEl.querySelector('.stamp-status');
                if (statusSpan) statusSpan.textContent = '미인증';
            }
        }
    }
    
    // 2. Refresh Radial progress
    updateRadialProgress();
    
    // 3. Render Coupons & Tickets in My Box
    renderMyBox();
    
    // 4. Update Coupon dropdown list in booking screen
    updateCouponSelector();

    // 5. Initial price calculation
    calculatePrice();
}

// --- Radial Progress Circle Updater ---
function updateRadialProgress() {
    const total = 6;
    const current = stampsCollected.length;
    const percent = Math.round((current / total) * 100);
    
    const progressEl = document.getElementById('stamp-radial-progress');
    const textEl = document.getElementById('stamp-progress-text');
    if (progressEl && textEl) {
        textEl.textContent = `${current} / ${total}`;
        progressEl.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--primary-color) ${percent}%, #eceff1 ${percent}% 100%)`;
    }
}

// --- Single Page App Tab Routing ---
function switchTab(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(s => s.classList.remove('active'));
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update navbar active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNav = document.getElementById(`nav-${screenId}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Refresh contents when navigating to My Box
    if (screenId === 'screen-mybox') {
        renderMyBox();
    }
}

// --- Stamp Verification Simulator (GPS Check) ---
function verifyStamp(spotId) {
    const spotName = STAMP_SPOTS[spotId];
    if (stampsCollected.includes(spotId)) {
        return; // Already collected
    }
    
    // Show GPS Scan Modal Overlay
    const gpsModal = document.getElementById('gps-modal');
    const gpsBar = document.getElementById('gps-progress-bar');
    
    if (gpsModal && gpsBar) {
        gpsBar.style.width = '0';
        gpsModal.classList.add('active');
        
        // Trigger transition width
        setTimeout(() => {
            gpsBar.style.width = '100%';
        }, 50);
        
        // Wait for animation completion (3.5 seconds)
        setTimeout(() => {
            gpsModal.classList.remove('active');
            
            // Add stamp to state
            stampsCollected.push(spotId);
            saveStateToStorage();
            
            // Update spot UI card
            const itemEl = document.getElementById(`stamp-spot-${spotId}`);
            if (itemEl) {
                itemEl.classList.add('checked');
                const statusSpan = itemEl.querySelector('.stamp-status');
                if (statusSpan) statusSpan.textContent = '인증완료';
            }
            
            // Update stats
            updateRadialProgress();
            
            // Unlocked coupon logic if all 6 stamps are collected
            checkAllStampsCollected();
            
            // Show Success Modal
            showSuccessStampModal(spotName);
        }, 3600);
    }
}

function showSuccessStampModal(spotName) {
    const modal = document.getElementById('success-stamp-modal');
    const spotNameEl = document.getElementById('success-spot-name');
    if (modal && spotNameEl) {
        spotNameEl.textContent = spotName;
        modal.classList.add('active');
    }
}

function closeSuccessStampModal() {
    const modal = document.getElementById('success-stamp-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function checkAllStampsCollected() {
    // If all 6 spots are collected and user doesn't already have the welcome coupon
    const hasCoupon = coupons.some(c => c.id === 'welcome-discount');
    if (stampsCollected.length === 6 && !hasCoupon) {
        const newCoupon = {
            id: 'welcome-discount',
            code: 'YG-STAMP-ALL-10',
            label: '곰취 스탬프 완주 10% 할인 쿠폰',
            value: 0.1, // 10% discount
            type: 'percent'
        };
        coupons.push(newCoupon);
        saveStateToStorage();
        updateCouponSelector();
    }
}

// --- Ticket Price Calculation ---
function calculatePrice() {
    const selectProduct = document.getElementById('ticket-type');
    const inputQty = document.getElementById('ticket-qty');
    const selectCoupon = document.getElementById('booking-coupon');
    
    if (!selectProduct || !inputQty || !selectCoupon) return;
    
    const option = selectProduct.options[selectProduct.selectedIndex];
    const unitPrice = parseInt(option.getAttribute('data-price'));
    const qty = parseInt(inputQty.value) || 1;
    
    const originalPrice = unitPrice * qty;
    let discount = 0;
    
    if (selectCoupon.value === 'welcome-discount') {
        discount = Math.round(originalPrice * 0.1);
    }
    
    const totalPrice = originalPrice - discount;
    
    document.getElementById('summary-price-original').textContent = `${originalPrice.toLocaleString()}원`;
    document.getElementById('summary-price-discount').textContent = `-${discount.toLocaleString()}원`;
    document.getElementById('summary-price-total').textContent = `${totalPrice.toLocaleString()}원`;
}

// --- Booking & Payment System ---
let currentPendingBooking = null;

function openPaymentModal() {
    const dateInput = document.getElementById('booking-date').value;
    if (!dateInput) {
        alert("이용 일자를 선택해 주세요.");
        return;
    }
    
    const selectProduct = document.getElementById('ticket-type');
    const inputQty = document.getElementById('ticket-qty');
    const option = selectProduct.options[selectProduct.selectedIndex];
    const productName = option.text.split(' (')[0];
    
    const qty = parseInt(inputQty.value) || 1;
    const priceText = document.getElementById('summary-price-total').textContent;
    const numericPrice = parseInt(priceText.replace(/,/g, '').replace('원', ''));
    
    currentPendingBooking = {
        productKey: selectProduct.value,
        productName: productName,
        date: dateInput,
        qty: qty,
        totalPrice: numericPrice,
        couponUsed: document.getElementById('booking-coupon').value !== 'none'
    };
    
    // Open payment modal
    document.getElementById('payment-modal-price').textContent = numericPrice.toLocaleString();
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
    currentPendingBooking = null;
    
    // Reset form
    document.getElementById('payment-form').reset();
    const paySubmitBtn = document.getElementById('btn-pay-submit');
    if (paySubmitBtn) {
        paySubmitBtn.disabled = false;
        paySubmitBtn.textContent = '결제 승인 요청';
    }
}

function processMockPayment(event) {
    event.preventDefault();
    if (!currentPendingBooking) return;
    
    const paySubmitBtn = document.getElementById('btn-pay-submit');
    if (paySubmitBtn) {
        paySubmitBtn.disabled = true;
        paySubmitBtn.textContent = '카드 승인 처리 중...';
    }
    
    // Simulate payment gateway delay (1.8 seconds)
    setTimeout(() => {
        // Generate random barcode code
        const codeNum = Math.floor(100000000000 + Math.random() * 900000000000);
        const ticketCode = `YG-${codeNum.toString().match(/.{1,4}/g).join('-')}`;
        
        const newTicket = {
            id: 'T' + new Date().getTime(),
            productName: currentPendingBooking.productName,
            date: currentPendingBooking.date,
            qty: currentPendingBooking.qty,
            totalPrice: currentPendingBooking.totalPrice,
            code: ticketCode
        };
        
        bookedTickets.push(newTicket);
        
        // If a coupon was used, consume it
        if (currentPendingBooking.couponUsed) {
            coupons = coupons.filter(c => c.id !== 'welcome-discount');
        }
        
        saveStateToStorage();
        
        // Clean up and switch tabs
        closePaymentModal();
        switchTab('screen-mybox');
        
        alert("🎉 결제가 성공적으로 완료되었습니다! 나의 보관함에서 모바일 티켓을 확인해 주세요.");
    }, 1800);
}

// --- Render My Box Section ---
function renderMyBox() {
    const couponContainer = document.getElementById('coupon-list-container');
    const ticketContainer = document.getElementById('ticket-list-container');
    const couponBadge = document.getElementById('coupon-count-badge');
    const ticketBadge = document.getElementById('ticket-count-badge');
    
    if (!couponContainer || !ticketContainer) return;
    
    // Update count badges
    if (couponBadge) couponBadge.textContent = coupons.length;
    if (ticketBadge) ticketBadge.textContent = bookedTickets.length;
    
    // Render Coupons
    if (coupons.length === 0) {
        couponContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-ticket-simple"></i>
                <p>보유하고 있는 쿠폰이 없습니다.<br>스탬프 투어를 완주해 쿠폰을 획득해보세요!</p>
            </div>`;
    } else {
        let html = '';
        coupons.forEach(c => {
            html += `
                <div class="coupon-item">
                    <div class="coupon-info">
                        <h4>${c.label}</h4>
                        <p>바코드 번호: ${c.code} | 10% 상시 할인</p>
                    </div>
                </div>`;
        });
        couponContainer.innerHTML = html;
    }
    
    // Render Tickets
    if (bookedTickets.length === 0) {
        ticketContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-receipt"></i>
                <p>예매한 티켓이 없습니다.<br>티켓 예매 탭에서 상품을 구매해 주세요.</p>
            </div>`;
    } else {
        let html = '';
        bookedTickets.forEach(t => {
            html += `
                <div class="ticket-item">
                    <div class="ticket-info">
                        <h4>${t.productName}</h4>
                        <p><i class="fa-solid fa-calendar"></i> 이용 일자: ${t.date}</p>
                        <p><i class="fa-solid fa-user-group"></i> 예매 인원: ${t.qty}명</p>
                        <p><i class="fa-solid fa-won-sign"></i> 결제 금액: ${t.totalPrice.toLocaleString()}원</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="showTicketBarcode('${t.id}')">검표 바코드</button>
                </div>`;
        });
        ticketContainer.innerHTML = html;
    }
}

// --- Coupon Option Dropdown List Updater ---
function updateCouponSelector() {
    const optEl = document.getElementById('opt-welcome-coupon');
    const selectEl = document.getElementById('booking-coupon');
    if (!optEl || !selectEl) return;
    
    const hasCoupon = coupons.some(c => c.id === 'welcome-discount');
    if (hasCoupon) {
        optEl.disabled = false;
        optEl.textContent = '곰취 스탬프 완주 10% 할인 쿠폰 (사용가능)';
    } else {
        optEl.disabled = true;
        optEl.value = 'none';
        optEl.textContent = '곰취 스탬프 완주 10% 할인 쿠폰 (스탬프 완주 시 해제)';
        if (selectEl.value === 'welcome-discount') {
            selectEl.value = 'none';
        }
    }
}

// --- Barcode Ticket Modal ---
function showTicketBarcode(ticketId) {
    const ticket = bookedTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const modal = document.getElementById('barcode-modal');
    const title = document.getElementById('barcode-modal-title');
    const date = document.getElementById('barcode-modal-date');
    const number = document.getElementById('mock-barcode-number');
    
    if (modal && title && date && number) {
        title.textContent = ticket.productName;
        date.textContent = `${ticket.date} | 이용 인원 ${ticket.qty}명`;
        number.textContent = ticket.code;
        modal.classList.add('active');
    }
}

function closeBarcodeModal() {
    const modal = document.getElementById('barcode-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// --- Reset Data ---
function resetAppData() {
    if (confirm("⚠️ 앱 내 모든 스탬프 이력, 티켓 구매 목록, 보관함 데이터가 초기화됩니다. 계속하시겠습니까?")) {
        localStorage.removeItem('yg_stamps');
        localStorage.removeItem('yg_tickets');
        localStorage.removeItem('yg_coupons');
        
        stampsCollected = [];
        bookedTickets = [];
        coupons = [];
        
        initScreen();
        switchTab('screen-dashboard');
        alert("🔄 앱 데이터가 초기화되었습니다.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sticky Header Effect ---
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.add('active');
    });

    closeMenuBtn.addEventListener('click', () => {
        mobileNav.classList.remove('active');
    });

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    });

    // --- 3. Scroll Reveal Animation (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- 4. Load Generated Images ---
    // AI 도구로 생성된 이미지들을 찾아 연결합니다.
    // images/ 폴더 안에 복사된 이미지들의 파일명을 파싱하여 적용합니다.
    
    const setBackgroundImage = (selector, namePrefix) => {
        // 실제로는 서버 렌더링이 아니므로 파일명이 정확하지 않을 수 있어
        // 여기서는 패턴 매칭 대신 직접 생성된 파일을 가정하고, 백업용 임시 색상/그라데이션 유지
    };

    // --- 5. Tabs for Travel Course ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding pane
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 6. Map Modal Logic ---
    const mapBtn = document.getElementById('tour-map-btn');
    const mapModal = document.getElementById('map-modal');
    const closeModal = document.getElementById('close-modal');

    if(mapBtn && mapModal) {
        mapBtn.addEventListener('click', () => {
            mapModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        closeModal.addEventListener('click', () => {
            mapModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close on outside click
        mapModal.addEventListener('click', (e) => {
            if(e.target === mapModal) {
                mapModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // --- 7. Modal Tabs Logic ---
    const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
    const modalTabPanes = document.querySelectorAll('.modal-tab-pane');

    modalTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalTabBtns.forEach(b => b.classList.remove('active'));
            modalTabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 8. Gomchwi Center Tabs Logic ---
    const gomchwiTabBtns = document.querySelectorAll('.gomchwi-tab-btn');
    const gomchwiTabPanes = document.querySelectorAll('.gomchwi-tab-pane');

    gomchwiTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gomchwiTabBtns.forEach(b => b.classList.remove('active'));
            gomchwiTabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 9. Gomchwi Gallery Image Changer ---
    window.changeGomchwiImage = function(src) {
        const mainImg = document.getElementById('gomchwi-gallery-main-img');
        if (mainImg) {
            mainImg.src = src;
        }
        
        const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
        thumbs.forEach(t => {
            // Check if source matches, resolving relative vs absolute path difference
            if (t.src === src || (src.includes(t.getAttribute('src')))) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });
    };

    // --- 10. EmailJS Form Handler ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('btn-submit-inquiry');

    if (contactForm && formStatus && submitBtn) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading / sending state
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('span');
            const btnIcon = submitBtn.querySelector('i');
            
            if (btnText) btnText.textContent = '전송 중...';
            if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin';
            
            formStatus.className = 'form-status-message';
            formStatus.textContent = '';

            // Set current time for the EmailJS template variable {{time}}
            const timeInput = document.getElementById('inquiry_time');
            if (timeInput) {
                const now = new Date();
                timeInput.value = now.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }

            // Check if EmailJS SDK is loaded
            if (typeof emailjs === 'undefined') {
                formStatus.className = 'form-status-message error';
                formStatus.textContent = '❌ EmailJS 라이브러리가 로드되지 않았습니다. 광고 차단 프로그램이 실행 중이거나 네트워크 상태를 확인해 주세요.';
                submitBtn.disabled = false;
                if (btnText) btnText.textContent = '문의 보내기';
                if (btnIcon) btnIcon.className = 'fa-solid fa-paper-plane';
                return;
            }

            // Send via emailjs (pass public key explicitly as the 4th parameter)
            emailjs.sendForm('service_gqbezre', 'template_loxffun', '#contact-form', '9MlSUAStuV4mJRbS_')
                .then(function() {
                    formStatus.className = 'form-status-message success';
                    formStatus.textContent = '✉️ 문의가 성공적으로 전송되었습니다! 기재하신 이메일로 빠르게 답변해 드리겠습니다.';
                    contactForm.reset();
                }, function(error) {
                    console.error('EmailJS Send Error:', error);
                    formStatus.className = 'form-status-message error';
                    // Show detailed error response from EmailJS so the user knows exactly why
                    const errorMsg = error.text || error.status || '상세 정보 없음';
                    formStatus.textContent = `❌ 전송에 실패했습니다. (원인: ${errorMsg}). 계정 설정 및 서비스/템플릿 ID를 확인해 주세요.`;
                })
                .finally(function() {
                    submitBtn.disabled = false;
                    if (btnText) btnText.textContent = '문의 보내기';
                    if (btnIcon) btnIcon.className = 'fa-solid fa-paper-plane';
                });
        });
    }

    // --- 11. Educational Notice Modal (With localStorage support) ---
    const eduNoticeModal = document.getElementById('edu-notice-modal');
    const closeEduNoticeBtn = document.getElementById('close-edu-notice-btn');
    const todayCheckbox = document.getElementById('notice-today-checkbox');

    if (eduNoticeModal && closeEduNoticeBtn) {
        // Check localStorage to see if user opted out of popup today
        const noticeHideTime = localStorage.getItem('hideNoticeTime');
        const currentTime = new Date().getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // If no opt-out or opt-out has expired (older than 24 hours)
        if (!noticeHideTime || (currentTime - parseInt(noticeHideTime) > oneDayMs)) {
            setTimeout(() => {
                eduNoticeModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 600);
        }

        closeEduNoticeBtn.addEventListener('click', () => {
            // Save state if "Do not show today" is checked
            if (todayCheckbox && todayCheckbox.checked) {
                localStorage.setItem('hideNoticeTime', new Date().getTime().toString());
            }
            eduNoticeModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});

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
});

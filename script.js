document.addEventListener('DOMContentLoaded', () => {

    // --- HERO VIDEO AUTOPLAY FALLBACK ---
    const forceAutoplay = (video) => {
        if (!video) return;
        video.muted = true;
        video.playsInline = true;

        const tryPlay = () => {
            video.play().catch(() => {
                // Autoplay blocked — start on first user gesture
                const onGesture = () => {
                    video.play();
                    ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt =>
                        document.removeEventListener(evt, onGesture)
                    );
                };
                ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt =>
                    document.addEventListener(evt, onGesture, { once: true })
                );
            });
        };

        tryPlay();
        setTimeout(tryPlay, 500);
    };

    // Apply to both page videos
    forceAutoplay(document.querySelector('.hero-bg-video'));
    forceAutoplay(document.getElementById('tokyo-hero-video'));

    // --- MOBILE MENU TOGGLE ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon between bars and times (close)
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.className = 'fa-solid fa-xmark';
                } else {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // --- COMPONENT SLIDE ENGINE (CAROUSEL) ---
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const currentSlideNum = document.getElementById('current-slide');
    
    let currentIndex = 0;

    function updateCarousel(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        if (currentSlideNum) currentSlideNum.textContent = index + 1;
    }

    if (nextBtn && prevBtn && slides.length > 0) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel(currentIndex);
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(currentIndex);
        });
    }

    // --- SCROLL INTERACTION ---
    const header = document.querySelector('.header-component');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                header.style.background = '#111111';
            } else {
                header.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)';
            }
        });
    }

    // --- REGION/LANGUAGE DROPDOWN ---
    const regionDropdown = document.getElementById('region-dropdown');
    if (regionDropdown) {
        regionDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });

        window.addEventListener('click', () => {
            regionDropdown.classList.remove('active');
        });

        const items = regionDropdown.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            item.addEventListener('click', function() {
                const selectedText = this.innerText;
                const textSpan = regionDropdown.querySelector('.dropdown-selected span');
                if (textSpan) textSpan.innerText = selectedText;
            });
        });
    }

    // --- SMOOTH SCROLL FOR ANCHORS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefVal = this.getAttribute('href');
            if (hrefVal === '#') return; // Skip default empty links
            
            e.preventDefault();
            const target = document.querySelector(hrefVal);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- VIDEO MODAL LOGIC ---
    const tokyoExploreBtn = document.getElementById('explore-tokyo-btn');
    const videoModal = document.getElementById('video-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const tokyoVideo = document.getElementById('tokyo-bay-video');

    if (tokyoExploreBtn && videoModal && closeModalBtn && tokyoVideo) {
        tokyoExploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            videoModal.style.display = 'flex';
            tokyoVideo.play();
        });

        const closeModal = () => {
            videoModal.style.display = 'none';
            tokyoVideo.pause();
            tokyoVideo.currentTime = 0;
        };

        closeModalBtn.addEventListener('click', closeModal);

        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal();
            }
        });
    }
});
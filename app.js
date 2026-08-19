/**
 * LILAN SPORTS ACADEMY — CORE JAVASCRIPT & 3D WEBGL MOTION ENGINE
 * Features:
 * - 3D Interactive Dragon-Qi Particle Canvas (WebGL / Canvas2D hybrid)
 * - 3D Perspective Tilt on Hover for Cards & Frames
 * - Smooth Scroll & Navbar Scrollspy
 * - Mobile Navigation Drawer
 * - Program Category Filtering
 * - Media Gallery with Filter & Interactive Lightbox
 * - Schedule Timetable Tab Switcher
 * - FAQ Accordion
 * - Interactive Booking & Certificate Modals
 * - Contact & Trial Form Real-Time Validation & WhatsApp Integration
 * - Toast Notification System
 */

(function () {
  'use strict';

  // --- DOM Elements Cache ---
  const navbar = document.getElementById('main-navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
  // Hero 3D Canvas
  const heroCanvas = document.getElementById('hero-canvas');
  let heroCtx = null;
  let animationFrameId = null;
  let particles = [];
  let mouse = { x: null, y: null, targetX: 0, targetY: 0, isHovering: false };
  let canvasWidth = 0;
  let canvasHeight = 0;
  
  // Modals & Lightbox
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  
  const bookingModal = document.getElementById('booking-modal');
  const bookingCloseBtn = document.getElementById('booking-close-btn');
  const bookTrialTriggers = document.querySelectorAll('[data-open-booking]');
  
  const certModal = document.getElementById('certificate-modal');
  const certCloseBtn = document.getElementById('cert-close-btn');
  const certCards = document.querySelectorAll('[data-cert-id]');
  
  const toastContainer = document.getElementById('toast-container');
  
  // State
  let galleryItems = [];
  let currentGalleryIndex = 0;

  /* ==========================================================================
     1. 3D DRAGON-QI PARTICLE CANVAS (HERO BACKGROUND)
     ========================================================================== */
  function initHero3DCanvas() {
    if (!heroCanvas) return;
    heroCtx = heroCanvas.getContext('2d');
    if (!heroCtx) return;

    function resizeCanvas() {
      const hero = document.getElementById('hero');
      if (!hero) return;
      canvasWidth = heroCanvas.width = hero.clientWidth;
      canvasHeight = heroCanvas.height = hero.clientHeight;
      createParticles();
    }

    window.addEventListener('resize', debounce(resizeCanvas, 150));
    resizeCanvas();

    // Mouse Move tracking for 3D Dragon Ribbon attraction
    const heroSection = document.getElementById('hero');
    heroSection.addEventListener('mousemove', function (e) {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.targetX = (mouse.x - canvasWidth / 2) / (canvasWidth / 2);
      mouse.targetY = (mouse.y - canvasHeight / 2) / (canvasHeight / 2);
      mouse.isHovering = true;
    });

    heroSection.addEventListener('mouseleave', function () {
      mouse.isHovering = false;
      mouse.targetX = 0;
      mouse.targetY = 0;
    });

    // Gyroscope / Device Orientation for mobile 3D feel
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function (e) {
        if (e.gamma !== null && e.beta !== null) {
          mouse.targetX = Math.min(Math.max(e.gamma / 30, -1), 1);
          mouse.targetY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
        }
      }, { passive: true });
    }

    animateCanvas();
  }

  function createParticles() {
    particles = [];
    // Number of particles optimized for buttery 60fps
    const count = Math.min(Math.floor((canvasWidth * canvasHeight) / 12000), 110);
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        z: Math.random() * 800 + 200, // 3D depth
        radius: Math.random() * 2.2 + 0.8,
        baseSpeedX: (Math.random() - 0.5) * 0.45,
        baseSpeedY: (Math.random() - 0.5) * 0.45 - 0.2, // slight upward float (Qi rising)
        speedX: 0,
        speedY: 0,
        color: i % 7 === 0 ? 'rgba(190, 30, 40, ' : (i % 3 === 0 ? 'rgba(243, 229, 171, ' : 'rgba(212, 175, 55, '),
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseAngle: Math.random() * Math.PI * 2,
        // Dragon wave orbit parameter
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 140 + 40,
        orbitSpeed: (Math.random() - 0.5) * 0.015
      });
    }
  }

  let time = 0;
  function animateCanvas() {
    if (!heroCtx) return;
    time += 0.012;

    heroCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Golden 3D Dragon Energy Ribbons (Sinusoidal 3D Curves)
    drawDragonEnergyStream(time);

    // 2. Draw & Update 3D Qi Particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.pulseAngle += p.pulseSpeed;
      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseAngle));
      p.orbitAngle += p.orbitSpeed;

      // Subtle mouse interaction in 3D
      let offsetX = 0;
      let offsetY = 0;
      if (mouse.isHovering && mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const force = (220 - dist) / 220;
          offsetX = -dx * force * 0.03;
          offsetY = -dy * force * 0.03;
        }
      }

      // Parallax based on z depth
      const depthFactor = 500 / p.z;
      p.x += p.baseSpeedX * depthFactor + Math.sin(p.orbitAngle) * 0.3 + offsetX;
      p.y += p.baseSpeedY * depthFactor + Math.cos(p.orbitAngle * 0.5) * 0.2 + offsetY;

      // Wrap around edges
      if (p.x < -20) p.x = canvasWidth + 20;
      if (p.x > canvasWidth + 20) p.x = -20;
      if (p.y < -20) p.y = canvasHeight + 20;
      if (p.y > canvasHeight + 20) p.y = -20;

      // Draw particle with subtle glow
      const visualRadius = p.radius * depthFactor;
      heroCtx.beginPath();
      heroCtx.arc(p.x, p.y, Math.max(visualRadius, 0.5), 0, Math.PI * 2);
      heroCtx.fillStyle = p.color + currentAlpha + ')';
      heroCtx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      heroCtx.shadowBlur = 8;
      heroCtx.fill();
      heroCtx.shadowBlur = 0; // reset
    }

    // Connect close particles with subtle golden Qi thread lines
    heroCtx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 85) {
          const lineAlpha = (1 - dist / 85) * 0.15;
          heroCtx.beginPath();
          heroCtx.strokeStyle = 'rgba(212, 175, 55, ' + lineAlpha + ')';
          heroCtx.moveTo(p1.x, p1.y);
          heroCtx.lineTo(p2.x, p2.y);
          heroCtx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animateCanvas);
  }

  // Draw majestic 3D dragon flowing energy ribbons
  function drawDragonEnergyStream(t) {
    const centerY = canvasHeight * 0.48;
    const ribbonCount = 2;

    for (let r = 0; r < ribbonCount; r++) {
      heroCtx.beginPath();
      const waveOffset = r * Math.PI;
      const gradient = heroCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
      gradient.addColorStop(0.3, r === 0 ? 'rgba(212, 175, 55, 0.12)' : 'rgba(158, 27, 32, 0.1)');
      gradient.addColorStop(0.7, r === 0 ? 'rgba(243, 229, 171, 0.16)' : 'rgba(212, 175, 55, 0.12)');
      gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

      heroCtx.strokeStyle = gradient;
      heroCtx.lineWidth = r === 0 ? 2.5 : 1.5;

      const segments = 40;
      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const x = progress * canvasWidth;
        const wave1 = Math.sin(progress * 4.5 + t * 0.8 + waveOffset) * 65;
        const wave2 = Math.cos(progress * 2.5 - t * 0.5) * 35;
        const mouseShift = mouse.targetY * 45 * Math.sin(progress * Math.PI);
        const y = centerY + wave1 + wave2 + mouseShift;

        if (i === 0) {
          heroCtx.moveTo(x, y);
        } else {
          heroCtx.lineTo(x, y);
        }
      }
      heroCtx.stroke();
    }
  }

  /* ==========================================================================
     2. 3D PERSPECTIVE TILT ON HOVER (CARDS & PORTRAITS)
     ========================================================================== */
  function init3DCardTilt() {
    const tiltElements = document.querySelectorAll('.perspective-card, .glass-card, .certificate-card, .coach-portrait-frame');
    
    // Disable on touch devices to preserve performance
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    tiltElements.forEach((card) => {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt angles (subtle max 8 deg)
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* ==========================================================================
     3. NAVBAR SCROLL & ACTIVE LINK SPY
     ========================================================================== */
  function initNavbarScrollSpy() {
    function handleScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }

      // ScrollSpy
      let currentSectionId = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ==========================================================================
     4. MOBILE MENU DRAWER
     ========================================================================== */
  function initMobileDrawer() {
    if (!mobileMenuBtn || !mobileDrawer || !drawerBackdrop) return;

    function openDrawer() {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      mobileDrawer.classList.remove('open');
      drawerBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', openDrawer);
    if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  /* ==========================================================================
     5. PROGRAM CATEGORY FILTER TABS
     ========================================================================== */
  function initProgramFilters() {
    const filterBtns = document.querySelectorAll('[data-program-filter]');
    const programCards = document.querySelectorAll('[data-program-category]');

    if (!filterBtns.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-program-filter');

        programCards.forEach((card) => {
          const category = card.getAttribute('data-program-category');
          if (filter === 'all' || category === filter || category.includes(filter)) {
            card.style.display = 'block';
            card.classList.add('reveal-on-scroll', 'revealed');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ==========================================================================
     6. GALLERY FILTER & LIGHTBOX MODAL
     ========================================================================== */
  function initGalleryAndLightbox() {
    const galleryFilterBtns = document.querySelectorAll('[data-gallery-filter]');
    const galleryItemsElements = document.querySelectorAll('.gallery-grid-item');

    // Build index list of gallery items
    function refreshGalleryIndex() {
      galleryItems = [];
      galleryItemsElements.forEach((el) => {
        if (el.style.display !== 'none') {
          const img = el.querySelector('img');
          const title = el.querySelector('h4')?.textContent || 'Lilan Sports Academy';
          const desc = el.querySelector('p')?.textContent || 'Martial Arts Training & Mastery';
          galleryItems.push({
            src: img.getAttribute('data-full-src') || img.src,
            title: title,
            desc: desc,
            element: el
          });
        }
      });
    }

    refreshGalleryIndex();

    // Gallery Filters
    galleryFilterBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        galleryFilterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-gallery-filter');

        galleryItemsElements.forEach((item) => {
          const cat = item.getAttribute('data-gallery-cat');
          if (filter === 'all' || cat === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });

        refreshGalleryIndex();
      });
    });

    // Open Lightbox
    galleryItemsElements.forEach((item) => {
      item.addEventListener('click', function () {
        const img = item.querySelector('img');
        const src = img.getAttribute('data-full-src') || img.src;
        currentGalleryIndex = galleryItems.findIndex((g) => g.src === src);
        if (currentGalleryIndex === -1) currentGalleryIndex = 0;
        openLightbox(currentGalleryIndex);
      });
    });

    function openLightbox(index) {
      if (!galleryItems[index]) return;
      const item = galleryItems[index];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.title;
      lightboxCaption.innerHTML = `<span class="gold-gradient-text font-bold text-lg block mb-1">${escapeHtml(item.title)}</span><span class="text-sm text-gray-300">${escapeHtml(item.desc)}</span>`;
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function showNext() {
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
      openLightbox(currentGalleryIndex);
    }

    function showPrev() {
      currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
      openLightbox(currentGalleryIndex);
    }

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNext);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrev);

    lightboxModal.addEventListener('click', function (e) {
      if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
  }

  /* ==========================================================================
     7. SCHEDULE TIMETABLE TABS
     ========================================================================== */
  function initScheduleTabs() {
    const tabBtns = document.querySelectorAll('[data-schedule-tab]');
    const tabPanels = document.querySelectorAll('.schedule-panel');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.getAttribute('data-schedule-tab');
        tabPanels.forEach((panel) => {
          if (panel.id === target) {
            panel.style.display = 'block';
            panel.classList.add('reveal-on-scroll', 'revealed');
          } else {
            panel.style.display = 'none';
          }
        });
      });
    });
  }

  /* ==========================================================================
     8. FAQ ACCORDION
     ========================================================================== */
  function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach((header) => {
      header.addEventListener('click', function () {
        const item = header.parentElement;
        const body = item.querySelector('.accordion-body');
        const isActive = item.classList.contains('active');

        // Close other items
        document.querySelectorAll('.accordion-item').forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBody = otherItem.querySelector('.accordion-body');
            if (otherBody) otherBody.style.maxHeight = null;
          }
        });

        if (isActive) {
          item.classList.remove('active');
          body.style.maxHeight = null;
        } else {
          item.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 30 + 'px';
        }
      });
    });
  }

  /* ==========================================================================
     9. FREE TRIAL CLASS & BOOKING MODAL
     ========================================================================== */
  function initBookingModal() {
    function openBooking(preselectedProgram) {
      if (preselectedProgram) {
        const select = document.getElementById('booking-program');
        if (select) select.value = preselectedProgram;
      }
      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeBooking() {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    bookTrialTriggers.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const prog = btn.getAttribute('data-program-name') || '';
        openBooking(prog);
      });
    });

    if (bookingCloseBtn) bookingCloseBtn.addEventListener('click', closeBooking);
    bookingModal.addEventListener('click', function (e) {
      if (e.target === bookingModal) closeBooking();
    });

    // Booking Form Validation
    const bookingForm = document.getElementById('trial-booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateBookingForm(bookingForm)) {
          const name = document.getElementById('booking-name').value.trim();
          const phone = document.getElementById('booking-phone').value.trim();
          const program = document.getElementById('booking-program').value;
          const ageGroup = document.getElementById('booking-age-group').value;
          const preferredTime = document.getElementById('booking-time').value;

          showToast(`🥋 Thank you, ${name}! Your trial session request has been registered.`, 'success');
          
          // Generate direct WhatsApp link optionally
          const waMessage = encodeURIComponent(
            `Hello Master Leel Dharmapriya (Lilan Sports Academy),

I would like to book a Free Trial Session.

👤 Name: ${name}
📞 Phone: ${phone}
🥋 Program: ${program}
🎯 Age Group: ${ageGroup}
⏰ Preferred Time: ${preferredTime}`
          );
          
          setTimeout(() => {
            closeBooking();
            bookingForm.reset();
            // Prompt to continue on WhatsApp
            window.open(`https://wa.me/94777746061?text=${waMessage}`, '_blank');
          }, 1200);
        }
      });
    }
  }

  function validateBookingForm(form) {
    let isValid = true;
    const name = document.getElementById('booking-name');
    const phone = document.getElementById('booking-phone');
    const program = document.getElementById('booking-program');

    // Name Validation
    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, 'Please enter a valid full name (at least 2 characters).');
      isValid = false;
    } else {
      clearFieldError(name);
    }

    // Phone Validation
    const phoneRegex = /^[+0-9\s\-()]{7,20}$/;
    if (!phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
      setFieldError(phone, 'Please enter a valid contact phone number.');
      isValid = false;
    } else {
      clearFieldError(phone);
    }

    // Program Validation
    if (!program.value) {
      setFieldError(program, 'Please choose a martial arts training program.');
      isValid = false;
    } else {
      clearFieldError(program);
    }

    return isValid;
  }

  /* ==========================================================================
     10. CERTIFICATE INSPECTION MODAL
     ========================================================================== */
  function initCertificateModal() {
    const certDetails = {
      'cert-wushu': {
        title: 'Wushu Federation Certification & Official Coaching Accreditation',
        body: 'Official recognition and accreditation for coaching Wushu Taolu and Sanda combat disciplines under Sri Lankan and international standards. Certified instructor in traditional forms, difficulty movements (Nandu), and physical conditioning.',
        issuer: 'Wushu Sports Community & National Martial Arts Standards',
        tag: 'Accredited Instructor'
      },
      'cert-qigong': {
        title: 'International Health Qigong & Baduanjin Mastery Recognition',
        body: 'Verified instruction authority in Baduanjin (Eight Brocades), Wu Qin Xi (Five Animal Frolics), and Yi Jin Jing. Collaborating with the Sri Lanka Health Qigong Association and international federations to promote holistic wellness, breath control, and mobility.',
        issuer: 'Sri Lanka Health Qigong Association & International Affiliations',
        tag: 'Health Qigong Specialist'
      },
      'cert-olympic': {
        title: 'National Olympic Committee (NOC) Collaboration & Tribute',
        body: 'Featured production partner for the official National Olympic Theme Song by Mario Ananda ("Jawayen Didulana Mawathe"), filmed at Lilan Sports Academy, Sugathadasa Outdoor Stadium, and BMICH to inspire youth and promote drug-free sports participation.',
        issuer: 'National Olympic Sports Project & Creative Arts Tribute',
        tag: 'Olympic Heritage Tribute'
      },
      'cert-sanda': {
        title: 'Master Coach: Combat Sanda & Practical Martial Arts Self-Defense',
        body: 'Extensive coaching tenure in Chinese Sanda (Sanshou) striking, kicking, sweep/throw mechanics, tactical awareness, and anti-drug youth physical empowerment.',
        issuer: 'Lilan Sports Academy Master Credentials',
        tag: 'Master Coach'
      }
    };

    certCards.forEach((card) => {
      card.addEventListener('click', function () {
        const certId = card.getAttribute('data-cert-id');
        const data = certDetails[certId];
        if (!data) return;

        document.getElementById('cert-modal-title').textContent = data.title;
        document.getElementById('cert-modal-body').textContent = data.body;
        document.getElementById('cert-modal-issuer').textContent = data.issuer;
        document.getElementById('cert-modal-tag').textContent = data.tag;

        certModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (certCloseBtn) {
      certCloseBtn.addEventListener('click', function () {
        certModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    certModal.addEventListener('click', function (e) {
      if (e.target === certModal) {
        certModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     11. CONTACT FORM VALIDATION & WHATSAPP DISPATCH
     ========================================================================== */
  function initContactForm() {
    const contactForm = document.getElementById('academy-contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      const name = document.getElementById('contact-name');
      const email = document.getElementById('contact-email');
      const phone = document.getElementById('contact-phone');
      const program = document.getElementById('contact-program');
      const message = document.getElementById('contact-message');

      let isValid = true;

      // Validate Name
      if (!name.value.trim() || name.value.trim().length < 2) {
        setFieldError(name, 'Please enter your full name.');
        isValid = false;
      } else {
        clearFieldError(name);
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        setFieldError(email, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearFieldError(email);
      }

      // Validate Phone
      const phoneRegex = /^[+0-9\s\-()]{7,20}$/;
      if (!phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
        setFieldError(phone, 'Please enter a valid phone number.');
        isValid = false;
      } else {
        clearFieldError(phone);
      }

      // Validate Message
      if (!message.value.trim() || message.value.trim().length < 5) {
        setFieldError(message, 'Please provide a message or inquiry (at least 5 characters).');
        isValid = false;
      } else {
        clearFieldError(message);
      }

      if (isValid) {
        const userMsg = encodeURIComponent(
          `Hello Lilan Sports Academy (Master Leel Dharmapriya),

New Inquiry from Website:

👤 Name: ${name.value.trim()}
📧 Email: ${email.value.trim()}
📞 Phone: ${phone.value.trim()}
🥋 Program: ${program.value || 'General Inquiry'}
💬 Message: ${message.value.trim()}`
        );

        showToast('✉️ Thank you! Your message has been sent. Connecting to Coach Leel on WhatsApp...', 'success');

        setTimeout(() => {
          window.open(`https://wa.me/94777746061?text=${userMsg}`, '_blank');
          contactForm.reset();
        }, 1200);
      }
    });
  }

  function setFieldError(inputEl, msg) {
    const parent = inputEl.closest('.form-input-group');
    if (!parent) return;
    parent.classList.add('has-error');
    const errEl = parent.querySelector('.form-error-msg');
    if (errEl) errEl.textContent = msg;
  }

  function clearFieldError(inputEl) {
    const parent = inputEl.closest('.form-input-group');
    if (!parent) return;
    parent.classList.remove('has-error');
    const errEl = parent.querySelector('.form-error-msg');
    if (errEl) errEl.textContent = '';
  }

  /* ==========================================================================
     12. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, type = 'gold') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    
    let icon = '🥋';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="text-xl">${icon}</span>
      <div>
        <p class="font-medium">${escapeHtml(message)}</p>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4500);
  }

  /* ==========================================================================
     13. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     14. UTILITY HELPERS
     ========================================================================== */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initHero3DCanvas();
    init3DCardTilt();
    initNavbarScrollSpy();
    initMobileDrawer();
    initProgramFilters();
    initGalleryAndLightbox();
    initScheduleTabs();
    initAccordion();
    initBookingModal();
    initCertificateModal();
    initContactForm();
    initScrollReveal();
  });

})();

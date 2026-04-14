/* ============================================================
   DHIA NAHDI PORTFOLIO — script.js v2.0
   ============================================================ */

// ---- THREE.JS — ENHANCED PARTICLE BACKGROUND ----
(function initThree() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Lines / Grid constellation effect ---
    const particlesCount = 2500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
        size: 0.006,
        color: '#00f2fe',
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // Secondary subtle purple layer
    const posArray2 = new Float32Array(800 * 3);
    for (let i = 0; i < 800 * 3; i++) posArray2[i] = (Math.random() - 0.5) * 12;
    const geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3));
    const mat2 = new THREE.PointsMaterial({ size: 0.012, color: '#7b2fff', transparent: true, opacity: 0.25, sizeAttenuation: true });
    const mesh2 = new THREE.Points(geo2, mat2);
    scene.add(mesh2);

    camera.position.z = 2.5;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Lerp mouse
        targetX += (mouseX - targetX) * 0.02;
        targetY += (mouseY - targetY) * 0.02;

        particlesMesh.rotation.y = elapsed * 0.06 - targetX * 0.3;
        particlesMesh.rotation.x = elapsed * 0.02 + targetY * 0.15;

        mesh2.rotation.y = -elapsed * 0.04 - targetX * 0.2;
        mesh2.rotation.x = elapsed * 0.03 + targetY * 0.1;

        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();


// ---- PRELOADER ----
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.style.display = 'none', 900);
    }, 1800);
});


// ---- CUSTOM CURSOR ----
(function initCursor() {
    if (window.innerWidth <= 768) return;

    const dot     = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const glow    = document.getElementById('mouse-glow');

    let posX = 0, posY = 0;

    window.addEventListener('mousemove', (e) => {
        posX = e.clientX;
        posY = e.clientY;

        dot.style.left = `${posX}px`;
        dot.style.top  = `${posY}px`;

        outline.animate(
            { left: `${posX}px`, top: `${posY}px` },
            { duration: 400, fill: 'forwards' }
        );

        if (glow) {
            glow.style.left = `${posX}px`;
            glow.style.top  = `${posY}px`;
        }
    });

    // Scale on interactive elements
    document.querySelectorAll('a, button, .project-card-3d, .skill-card-3d').forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.transform    = 'translate(-50%, -50%) scale(0)';
            outline.style.width    = '60px';
            outline.style.height   = '60px';
            outline.style.borderColor    = 'rgba(0, 242, 254, 0.9)';
            outline.style.backgroundColor = 'rgba(0, 242, 254, 0.08)';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.transform    = 'translate(-50%, -50%) scale(1)';
            outline.style.width    = '40px';
            outline.style.height   = '40px';
            outline.style.borderColor    = 'rgba(0, 242, 254, 0.5)';
            outline.style.backgroundColor = 'transparent';
        });
    });
})();


// ---- AOS ----
AOS.init({
    duration: 900,
    easing: 'ease-out-cubic',
    once: false,
    mirror: true,
    offset: 80,
});


// ---- NAVBAR: scroll + active link highlight ----
(function initNav() {
    const navbar  = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a:not(.btn-primary-sm)');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        // Glassmorphism on scroll
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlight
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active-link');
            }
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
})();


// ---- STATS COUNTER ----
(function initStats() {
    const counters = document.querySelectorAll('.stat-number');
    let started = false;

    const runCounters = () => {
        if (started) return;
        started = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 1800;
            const startTime = performance.now();

            const step = (now) => {
                const elapsed  = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                counter.textContent = current + (progress === 1 ? suffix : '');
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    };

    const statsSection = document.querySelector('#stats');
    if (statsSection) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                runCounters();
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.4 });
        observer.observe(statsSection);
    }
})();


// ---- SKILL PROGRESS BARS ----
(function initSkillBars() {
    const skillSection = document.querySelector('#skill-bars');
    if (!skillSection) return;

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            document.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
                setTimeout(() => bar.classList.add('animated'), i * 120);
            });
            observer.unobserve(skillSection);
        }
    }, { threshold: 0.3 });
    observer.observe(skillSection);
})();


// ---- PROJECT MODALS ----
const projectsData = {
    bosphore: {
        title: "Le Bosphore POS & ERP",
        category: "MicroZed | Full ERP Ecosystem",
        description: "A robust, centralized ERP and POS solution designed to automate retail management, stock control, and financial tracking for high-traffic businesses. Built to handle thousands of daily transactions with real-time synchronization across all modules.",
        details: [
            "<strong>Sales & POS:</strong> Multi-support interface (PC/Mobile) with B2B wholesale scaling, real-time billing, discount management and receipt printing.",
            "<strong>Stock & Inventory:</strong> Real-time catalogue with scan restrictions, expiry date tracking, multi-store transfers and low-stock alerts.",
            "<strong>Financial Monitoring:</strong> Cashflow tracking, client credit/recovery management, automated margin calculations and profit dashboards.",
            "<strong>Marketing & Sync:</strong> Integrated CRM with SMS campaigns, promotional engine and seamless e-commerce synchronization (Shopify).",
            "<strong>Security & Access:</strong> 2FA authentication, role-based access control, complete audit trails for all financial operations."
        ],
        techStack: ["React / Vite", "Node.js", "Redux", "Material UI", "Socket.io", "Google Auth", "Nodemailer", "PostgreSQL"]
    },
    admin_system: {
        title: "Enterprise & Access Shield",
        category: "Security & Infrastructure",
        description: "Advanced administration module for multi-entity legal configurations and granular permission management. Designed for complex enterprise infrastructures managing multiple companies, locations, and user roles from a single interface.",
        details: [
            "<strong>Permissions:</strong> Role-based access control (RBAC) with field-level visibility restrictions and dynamic permission inheritance.",
            "<strong>Multi-Company:</strong> Configuration engine for managing several legal entities within a single instance with isolated data scopes.",
            "<strong>Audit Logs:</strong> Comprehensive system logs tracking all price changes, sensitive stock movements, and administrative actions.",
            "<strong>User Management:</strong> Advanced employee directory with department hierarchies, shift assignments and access lifecycle management."
        ],
        techStack: ["Node.js", "Express", "PostgreSQL", "React", "JWT", "RBAC", "TypeScript"]
    },
    coficab: {
        title: "Smart Recruitment Matching",
        category: "COFICAB | AI Utilization",
        description: "An intelligent system developed to revolutionize talent acquisition by automating CV parsing and semantic matching through AI (NLP) algorithms, deployed for COFICAB's global HR operations across multiple international sites.",
        details: [
            "<strong>AI Engine:</strong> Integrated NLP models for semantic classification, skill extraction, and candidate-to-offer matching scores with configurable weights.",
            "<strong>CV Parser:</strong> Automated document parsing extracting structured data from PDF/DOCX resumes using regex and ML-assisted extraction.",
            "<strong>Backend:</strong> Microservices architecture ensuring global scalability with asynchronous job queues for processing high volumes.",
            "<strong>HR Dashboard:</strong> Real-time visualization of candidate pipelines, matching accuracy, and hiring funnel analytics."
        ],
        techStack: ["Next.js", "NestJS", "FastAPI", "NLP / AI", "MongoDB", "Docker", "Python", "spaCy"]
    },
    microzed: {
        title: "Business Intelligence Core",
        category: "MicroZed | SaaS Platform",
        description: "A modular SaaS platform designed for high-performance data processing and real-time visualization of thousands of daily business transactions, providing actionable insights for retail operations.",
        details: [
            "<strong>Performance:</strong> Ultra-responsive UI with advanced state management using Redux Toolkit and optimistic updates.",
            "<strong>Security:</strong> Secure authentication with 2FA support, encrypted session management and automated token refresh.",
            "<strong>Analytics:</strong> Real-time dashboards visualizing KPIs, average basket values, top-selling products, and revenue trends.",
            "<strong>Scalability:</strong> Redis caching layer reducing database load by 60%, supporting thousands of concurrent sessions."
        ],
        techStack: ["React.js", "Node.js", "PostgreSQL", "Redis", "TypeScript", "Chart.js", "Socket.io"]
    },
    kufferath: {
        title: "Legacy ERP Modernization",
        category: "Kufferath | Enterprise",
        description: "Modernizing corporate processes through custom ERP modules and digital marketing tracking systems for Kufferath Tunisia, bridging their legacy infrastructure with contemporary web technologies.",
        details: [
            "<strong>Inventory Control:</strong> Tailored modules for logistics, supply chain management, and warehouse operations with barcode scanning.",
            "<strong>Financial Hub:</strong> Centralized hub for expense tracking, revenue reporting, and budget vs. actual comparisons.",
            "<strong>Web Presence:</strong> High-performance responsive corporate site integrated with the ERP backend for real-time product catalog sync.",
            "<strong>Digital Marketing:</strong> Campaign tracking dashboard monitoring social media ROI, lead generation, and conversion analytics."
        ],
        techStack: ["Angular", "Node.js", "Spring Boot", "MySQL", "SEO", "Analytics", "REST API"]
    }
};

(function initModals() {
    const modal      = document.getElementById('project-modal');
    const modalBody  = document.getElementById('modal-body-container');
    const closeBtn   = document.querySelector('.modal-close');
    const cards      = document.querySelectorAll('.project-card-3d');

    if (!modal) return;

    const openModal = (projectId) => {
        const data = projectsData[projectId];
        if (!data) return;

        modalBody.innerHTML = `
            <div class="modal-header">
                <span class="badge-tech">${data.category}</span>
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>
            <div class="modal-body-content">
                <h4><ion-icon name="construct-outline"></ion-icon> Technology Implementation</h4>
                <ul>
                    ${data.details.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <div class="modal-tech-stack">
                    ${data.techStack.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-project');
            openModal(id);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
})();


// ---- VANILLA TILT (ensure init after DOM) ----
window.addEventListener('DOMContentLoaded', () => {
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
            max:      12,
            speed:    400,
            glare:    true,
            'max-glare': 0.12,
            perspective: 1000,
        });
    }
});

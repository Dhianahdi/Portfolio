// --- THREE.JS BACKGROUND ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#hero-canvas'),
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Grid of particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 8;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.005,
    color: '#00f2fe',
    transparent: true,
    opacity: 0.8
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

camera.position.z = 2;

// Mouse Interaction for 3D
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

const animate = () => {
    requestAnimationFrame(animate);
    
    // Rotate particles
    particlesMesh.rotation.y += 0.001;
    
    // Mouse movement influence
    if (mouseX > 0) {
        particlesMesh.rotation.x = -mouseY * 0.0001;
        particlesMesh.rotation.y = -mouseX * 0.0001;
    }

    renderer.render(scene, camera);
};

animate();

// Resizer
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- LOADER ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 800);
    }, 1500); // 1.5s for that premium wait
});


// --- CUSTOM CURSOR & MOUSE GLOW ---
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');
const glow = document.getElementById('mouse-glow');

if(window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Cursor
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });

        // Glow
        if(glow) {
            glow.style.left = `${posX}px`;
            glow.style.top = `${posY}px`;
        }
    });

    // Hover effect for interactive elements
    const interactives = document.querySelectorAll('a, button, .project-card-3d');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            outline.style.borderColor = 'rgba(0, 242, 254, 0.8)';
            outline.style.backgroundColor = 'rgba(0, 242, 254, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.borderColor = 'rgba(0, 242, 254, 0.5)';
            outline.style.backgroundColor = 'transparent';
        });
    });
}


// --- STATS COUNTER ---
const stats = document.querySelectorAll('.stat-number');
const speed = 200;

const startCounters = () => {
    stats.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target + (counter.innerText.includes('%') ? ' %' : '');
            }
        };
        updateCount();
    });
};

// Start counters when section is visible
const observerOptions = { threshold: 0.5 };
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            startCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('#stats');
if(statsSection) statsObserver.observe(statsSection);


// --- PROJECT MODALS DATA & LOGIC ---
const projectsData = {
    bosphore: {
        title: "Le Bosphore POS & ERP",
        category: "MicroZed | Full ERP Ecosystem",
        description: "A robust, centralized ERP and POS solution designed to automate retail management, stock control, and financial tracking for high-traffic businesses.",
        details: [
            "<strong>Sales & POS:</strong> Multi-support interface (PC/Mobile) with B2B wholesale scaling and real-time billing.",
            "<strong>Stock & Inventory:</strong> Real-time catalogue with scan restrictions, expiry date tracking, and multi-store transfers.",
            "<strong>Financial Monitoring:</strong> Cashflow tracking, client credit/recovery management, and automated margin calculations.",
            "<strong>Marketing & Sync:</strong> CRM with SMS campaigns and seamless e-commerce synchronization (Shopify)."
        ],
        techStack: ["React/Vite", "Node.js", "Redux", "Material UI", "Socket.io", "Google Auth", "Nodemailer"]
    },
    admin_system: {
        title: "Enterprise & Access Shield",
        category: "Security & Infrastructure",
        description: "Advanced administration module for multi-entity legal configurations and granular permission management.",
        details: [
            "<strong>Permissions:</strong> Role-based access control (RBAC) with field-level visibility restrictions.",
            "<strong>Multi-Company:</strong> Configuration engine for managing several legal entities within a single instance.",
            "<strong>Audit Logs:</strong> Comprehensive system logs tracking all price changes and sensitive stock movements."
        ],
        techStack: ["Node.js", "Express", "PostgreSQL", "React", "JWT"]
    },
    coficab: {
        title: "Smart Recruitment Matching",
        category: "COFICAB | AI Utilization",
        description: "An intelligent system developed to revolutionize talent acquisition by automating CV parsing and semantic matching through AI (NLP) algorithms.",
        details: [
            "<strong>AI Engine:</strong> Integrated NLP models for semantic classification and candidate-to-offer matching scores.",
            "<strong>Backend:</strong> Micro-services architecture ensuring global scalability for multiple production sites.",
            "<strong>HR Dashboard:</strong> Real-time visualization of candidate pipelines and matching accuracy."
        ],
        techStack: ["Next.js", "NestJS", "FastAPI", "NLP / AI", "NoSQL", "Docker"]
    },
    microzed: {
        title: "Business Intelligence Core",
        category: "MicroZed | SaaS Platform",
        description: "A modular SaaS platform designed for high-performance data processing and visualization of thousands of daily transactions.",
        details: [
            "<strong>Performance:</strong> Ultra-responsive UI with advanced state management using Redux.",
            "<strong>Security:</strong> Secure authentication with 2FA support and encrypted session management.",
            "<strong>Analytics:</strong> Real-time dashboards visualizing KPIs, average baskets, and top-selling products."
        ],
        techStack: ["React.js", "Node.js", "PostgreSQL", "Redis", "TypeScript", "Chart.js"]
    },
    kufferath: {
        title: "Legacy ERP Modernization",
        category: "Kufferath | Enterprise",
        description: "Modernizing corporate processes through custom ERP modules and digital marketing tracking systems.",
        details: [
            "<strong>Inventory Control:</strong> Tailored modules for logistics, supply chain, and warehouse operations.",
            "<strong>Financial Hub:</strong> Centralized hub for expense tracking and revenue reporting.",
            "<strong>Web Presence:</strong> High-performance responsive site integration with ERP backends."
        ],
        techStack: ["Angular", "Node.js", "Spring Boot", "MySQL", "Digital Marketing"]
    }
};

const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body-container');
const closeBtn = document.querySelector('.modal-close');
const projectCards = document.querySelectorAll('.project-card-3d');

// Open Modal
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project');
        const data = projectsData[projectId];
        
        if(data) {
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
            if (window.innerWidth > 768) {
               outline.style.transform = 'translate(-50%, -50%) scale(1)';
               outline.style.borderColor = 'rgba(0, 242, 254, 0.5)';
               outline.style.backgroundColor = 'transparent';
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent background scrolling
        }
    });
});

// Close Modal
const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});


// --- AOS & NAV SCROLL ---
AOS.init({
    duration: 1000,
    once: false,
    mirror: true
});

window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});


// --- CLICK INTERACTION ---
// Smooth scroll for nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

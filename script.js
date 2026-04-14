// ============================================================
//  PROXIMITY PLANET SYSTEM — Navigation wow factor
//  Chaque section est une planète unique avec voyage interstellaire
// ============================================================
(function initPlanetTravel() {
    const canvas = document.getElementById('galaxy-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, cx, cy;
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cx = W / 2; cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    // ---- Configuration ----
    const NUM_STARS = 1500;
    const NUM_NEBULAE = 5;
    const BASE_SPEED = 1.2;
    const JUMP_SPEED = 70;
    
    let nebulae = Array.from({ length: NUM_NEBULAE }, () => ({
        x: (Math.random() - 0.5) * W * 2,
        y: (Math.random() - 0.5) * H * 2,
        r: Math.random() * 400 + 200,
        color: `hsla(${Math.random() * 360}, 70%, 50%, 0.03)`
    }));

    let shootingStars = [];
    function spawnShootingStar() {
        if (Math.random() > 0.98) {
            shootingStars.push({
                x: Math.random() * W,
                y: Math.random() * H * 0.5,
                vx: (Math.random() + 2) * 15,
                vy: (Math.random() + 0.5) * 5,
                len: Math.random() * 80 + 40,
                opacity: 1
            });
        }
    }
    const planets = [
        { id: 'hero',       name: 'SOLAR CENTER',  color: '#ff9d00', r: 255, g: 157, b: 0,   z: 0,      size: 220, detail: 'DHIA NAHDI',      type: 'sun' },
        { id: 'expertise',  name: 'CODE PLANET',   color: '#00f2fe', r: 0,   g: 242, b: 254, z: 2500,   size: 130, detail: 'TECH STACK',      type: 'ring' },
        { id: 'projects',   name: 'CORE AI',       color: '#a06fff', r: 160, g: 111, b: 255, z: 5000,   size: 140, detail: 'NEURAL NETWORKS', type: 'gas'  },
        { id: 'experience', name: 'CAREER ARC',    color: '#ff9d00', r: 255, g: 157, b: 0,   z: 7500,   size: 160, detail: 'LIFE PATH',       type: 'rock', 
          moons: [
            { name: 'MicroZed', dist: 280, speed: 0.02, size: 30, color: '#ff2d78' },
            { name: 'COFICAB', dist: 350, speed: 0.015, size: 25, color: '#00d4ff' },
            { name: 'Kufferath', dist: 420, speed: 0.01, size: 20, color: '#7b2fff' }
          ]
        },
        { id: 'education',  name: 'ACADEMIA',      color: '#00d4ff', r: 0,   g: 212, b: 255, z: 10000,  size: 110, detail: 'KNOWLEDGE BELT',  type: 'ice'  },
        { id: 'contact',    name: 'STATION-C',     color: '#ffffff', r: 255, g: 255, b: 255, z: 12500,  size: 90,  detail: 'SIGNAL RELAY',    type: 'satellite'}
    ];

    let stars = Array.from({ length: NUM_STARS }, () => makeStar(true));
    function makeStar(randomZ = false) {
        return {
            x: (Math.random() - 0.5) * W * 3,
            y: (Math.random() - 0.5) * H * 3,
            z: randomZ ? Math.random() * 15000 : 15000,
            pz: 0,
            alpha: Math.random()
        };
    }

    let cameraZ = 0;
    let targetZ = 0;
    let isJumping = false;
    let currentSpeed = BASE_SPEED;

    // ---- Smooth Navigation ----
    document.querySelectorAll('.nav-links a, .hero-actions a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const planet = planets.find(p => p.id === targetId);
                if (planet) {
                    jumpToPlanet(planet.z, targetId);
                }
            }
        });
    });

    let rotation = 0;
    let targetRotation = 0;
    let ORBIT_RADIUS = W * 0.8;

    window.addEventListener('resize', () => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        cx = W / 2;
        cy = H / 2;
        ORBIT_RADIUS = Math.min(W * 0.8, 1200); // Scale orbit radius safely
    });

    function jumpToPlanet(planetIndex, id) {
        targetRotation = planetIndex * (Math.PI / 2); // Each planet is 90 deg apart
        isJumping = true;
        document.body.classList.add('warping');
        
        const hud = document.getElementById('warp-hud');
        if (hud) {
            hud.classList.add('active');
            const val = document.getElementById('warp-value');
            if (val) val.textContent = '▸ ORBITAL JUMP...';
        }

        setTimeout(() => {
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'auto' });
            }
        }, 800);
    }

    // Sync with manual scroll
    window.addEventListener('scroll', () => {
        if (!isJumping) {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            targetRotation = scrollPercent * (planets.length - 1) * (Math.PI / 2);
        }
        updateTint();
    });

    // Init Interactive HUD
    const indicators = document.querySelectorAll('.planet-indicator');
    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
            const planetId = ind.dataset.planet;
            jumpToPlanet(i, planetId);
        });
    });

    function updateTint() {
        const currentPlanetIndex = Math.round(rotation / (Math.PI / 2));
        const activePlanet = planets[Math.max(0, Math.min(planets.length - 1, currentPlanetIndex))];
        
        if (activePlanet) {
            tintTargR = activePlanet.r; 
            tintTargG = activePlanet.g; 
            tintTargB = activePlanet.b;
            updateHUD(activePlanet.id);
        }
        
        tintR += (tintTargR - tintR) * 0.05;
        tintG += (tintTargG - tintG) * 0.05;
        tintB += (tintTargB - tintB) * 0.05;
        document.documentElement.style.setProperty('--primary', `rgb(${tintR}, ${tintG}, ${tintB})`);
    }

    function updateHUD(activeId) {
        const indicators = document.querySelectorAll('.planet-indicator');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        indicators.forEach(ind => {
            if (ind.dataset.planet === activeId) ind.classList.add('active');
            else ind.classList.remove('active');
        });

        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}`) link.classList.add('active');
            else link.classList.remove('active');
        });
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
    });

    function drawPlanet(p, i) {
        const planetAngle = i * (Math.PI / 2) - rotation;
        const x = cx + Math.sin(planetAngle) * ORBIT_RADIUS;
        const y = cy + Math.cos(planetAngle) * 200;
        const zScale = (Math.cos(planetAngle) + 1.5) / 2.5;
        const r = p.size * zScale;
        const time = Date.now() * 0.001;

        if (zScale < 0.1) return;

        // ---- Constellation Flight Path (to next planet) ----
        if (i < planets.length - 1) {
            const nextAngle = (i + 1) * (Math.PI / 2) - rotation;
            const nx = cx + Math.sin(nextAngle) * ORBIT_RADIUS;
            const ny = cy + Math.cos(nextAngle) * 200;
            const nz = (Math.cos(nextAngle) + 1.5) / 2.5;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = `rgba(0, 242, 254, ${Math.min(zScale, nz) * 0.15})`;
            ctx.setLineDash([5, 15]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // ---- Interactive Scanning Hologram (Hover) ----
        const dx = mouseX - x, dy = mouseY - y;
        const distToMouse = Math.sqrt(dx*dx + dy*dy);
        const isHovered = distToMouse < r * 1.5;

        if (isHovered) {
             ctx.strokeStyle = p.color + 'aa';
             ctx.lineWidth = 1;
             ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, Math.PI * 2); ctx.stroke();
             ctx.beginPath(); ctx.arc(x, y, r * 1.4, time, time + 1); ctx.stroke();
             
             ctx.fillStyle = p.color;
             ctx.font = '10px monospace';
             ctx.fillText(`SCANNING: ${p.id.toUpperCase()}`, x + r + 10, y - r);
             ctx.fillText(`STATUS: NOMINAL`, x + r + 10, y - r + 15);
        }

        // ---- Sun Specific: Massive Pulsing Aura ----
        if (p.type === 'sun') {
            const pulse = 1 + Math.sin(time * 3) * 0.12;
            const sunGlow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 5 * pulse);
            sunGlow.addColorStop(0, '#ffffff'); // White hot fire
            sunGlow.addColorStop(0.2, '#ffdd00'); // Luminous Gold
            sunGlow.addColorStop(0.5, '#ff9d0044'); // Bright Fire Amber
            sunGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = sunGlow;
            ctx.beginPath(); ctx.arc(x, y, r * 5 * pulse, 0, Math.PI * 2); ctx.fill();
        }

        // ---- Planet Atmosphere/Glow ----
        const atmosphere = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.8);
        atmosphere.addColorStop(0, p.color + '66');
        atmosphere.addColorStop(1, 'transparent');
        ctx.fillStyle = atmosphere;
        ctx.beginPath(); ctx.arc(x, y, r * 2.8, 0, Math.PI * 2); ctx.fill();

        // ---- Special Swarm for CODE PLANET ----
        if (p.id === 'expertise') {
            for(let j=0; j<8; j++) {
                const ang = time * 2 + j * (Math.PI / 4);
                const sx = x + Math.cos(ang) * r * 1.8;
                const sy = y + Math.sin(ang) * r * 0.6;
                ctx.fillStyle = '#00f2fe';
                ctx.fillRect(sx, sy, 3*zScale, 3*zScale);
            }
        }

        // ---- Planet Body ----
        const body = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
        if (p.type === 'sun') {
            body.addColorStop(0, '#ffffff');
            body.addColorStop(0.4, '#fff700');
            body.addColorStop(1, '#ff8800');
        } else {
            body.addColorStop(0, '#ffffff');
            body.addColorStop(0.3, p.color);
            body.addColorStop(1, '#02020a');
        }
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

        // ---- Labels ----
        const labelAlpha = Math.max(0, 1 - Math.abs(planetAngle) * 1.5);
        if (labelAlpha > 0.1) {
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = p.color;
            ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;
            ctx.font = `800 ${zScale * 60}px Space Grotesk`;
            ctx.textAlign = 'center';
            ctx.fillText(p.name, x, y + r + zScale * 120);
            ctx.restore();
        }
    }

    function animate() {
        // Absolute Dark Void
        ctx.fillStyle = 'rgba(0, 0, 1, 0.25)';
        ctx.fillRect(0, 0, W, H);

        const dist = targetRotation - rotation;
        if (isJumping) {
            currentSpeed = JUMP_SPEED;
            if (Math.abs(dist) < 0.1) {
                isJumping = false;
                document.body.classList.remove('warping');
                const hud = document.getElementById('warp-hud');
                if (hud) setTimeout(() => hud.classList.remove('active'), 500);
            }
        } else {
            currentSpeed += (BASE_SPEED - currentSpeed) * 0.15;
            if (currentSpeed < BASE_SPEED + 0.1) currentSpeed = BASE_SPEED;
        }

        rotation += (targetRotation - rotation) * (isJumping ? 0.08 : 0.12);

        // 1. Distant Nebulae (Parallax)
        nebulae.forEach(n => {
            n.x -= currentSpeed * 0.5; // Slower for depth
            if (n.x < -n.r * 2) n.x = W + n.r * 2;
            
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            g.addColorStop(0, n.color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        });

        // 2. Stars
        stars.forEach(s => {
            s.x -= currentSpeed * 5;
            if (s.x < -W) s.x = W * 2;

            const sx = s.x;
            const sy = s.y;
            if (sx >= 0 && sx <= W) {
                ctx.fillStyle = `rgba(0, 242, 254, ${s.alpha})`;
                ctx.fillRect(sx, sy, 2, 2);
            }
        });

        // 3. Shooting Stars
        spawnShootingStar();
        shootingStars = shootingStars.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.opacity -= 0.02;
            
            if (s.opacity > 0) {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.len, s.y - s.len * 0.2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                return true;
            }
            return false;
        });

        planets.forEach(drawPlanet);
        requestAnimationFrame(animate);
    }

    animate();
})();

// ============================================================
//  DHIA NAHDI PORTFOLIO — script.js v3.0 — Galaxy + 3DS Edition
// ============================================================

// ---- THREE.JS — ENHANCED GALAXY BACKGROUND ----




// ---- THREE.JS — ENHANCED GALAXY BACKGROUND ----
(function initGalaxy() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- GALAXY CORE PARTICLES (cyan) ---
    const coreCount = 3500;
    const corePosArr = new Float32Array(coreCount * 3);
    const coreSizes = new Float32Array(coreCount);
    for (let i = 0; i < coreCount; i++) {
        corePosArr[i * 3]     = (Math.random() - 0.5) * 14;
        corePosArr[i * 3 + 1] = (Math.random() - 0.5) * 10;
        corePosArr[i * 3 + 2] = (Math.random() - 0.5) * 10;
        coreSizes[i] = Math.random() * 0.012 + 0.004;
    }
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePosArr, 3));
    coreGeo.setAttribute('size', new THREE.BufferAttribute(coreSizes, 1));
    const coreMat = new THREE.PointsMaterial({
        size: 0.007,
        color: new THREE.Color('#00f2fe'),
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
    });
    const coreMesh = new THREE.Points(coreGeo, coreMat);
    scene.add(coreMesh);

    // --- NEBULA LAYER (purple/violet) ---
    const nebCount = 1200;
    const nebPosArr = new Float32Array(nebCount * 3);
    for (let i = 0; i < nebCount; i++) {
        // Arm-like distribution
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 6;
        nebPosArr[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
        nebPosArr[i * 3 + 1] = (Math.random() - 0.5) * 3;
        nebPosArr[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
    }
    const nebGeo = new THREE.BufferGeometry();
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPosArr, 3));
    const nebMat = new THREE.PointsMaterial({
        size: 0.018,
        color: new THREE.Color('#7b2fff'),
        transparent: true,
        opacity: 0.3,
        sizeAttenuation: true,
    });
    const nebMesh = new THREE.Points(nebGeo, nebMat);
    scene.add(nebMesh);

    // --- PINK/ROSE ACCENT LAYER ---
    const roseCount = 600;
    const rosePosArr = new Float32Array(roseCount * 3);
    for (let i = 0; i < roseCount; i++) {
        rosePosArr[i * 3]     = (Math.random() - 0.5) * 16;
        rosePosArr[i * 3 + 1] = (Math.random() - 0.5) * 12;
        rosePosArr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const roseGeo = new THREE.BufferGeometry();
    roseGeo.setAttribute('position', new THREE.BufferAttribute(rosePosArr, 3));
    const roseMat = new THREE.PointsMaterial({
        size: 0.01,
        color: new THREE.Color('#ff2d78'),
        transparent: true,
        opacity: 0.2,
        sizeAttenuation: true,
    });
    const roseMesh = new THREE.Points(roseGeo, roseMat);
    scene.add(roseMesh);

    // --- BRIGHT STAR LAYER ---
    const starCount = 400;
    const starPosArr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPosArr[i * 3]     = (Math.random() - 0.5) * 20;
        starPosArr[i * 3 + 1] = (Math.random() - 0.5) * 14;
        starPosArr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPosArr, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.025,
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
    });
    const starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    // --- SHOOTING STARS ---
    const shootingStars = [];
    function createShootingStar() {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        const x = (Math.random() - 0.5) * 14;
        const y = Math.random() * 5 + 1;
        const z = (Math.random() - 0.5) * 6;
        positions[0] = x;
        positions[1] = y;
        positions[2] = z;
        positions[3] = x + 0.001;
        positions[4] = y;
        positions[5] = z;
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
            color: new THREE.Color('#ffffff'),
            transparent: true,
            opacity: 0,
        });
        const line = new THREE.Line(geo, mat);
        const speed = Math.random() * 0.04 + 0.02;
        const direction = new THREE.Vector3(
            (Math.random() - 0.5) * speed,
            -(Math.random() * speed + 0.01),
            0
        );
        scene.add(line);
        return { line, direction, life: 0, maxLife: Math.random() * 60 + 40, geo, mat };
    }

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            shootingStars.push(createShootingStar());
        }, i * 1800);
    }

    camera.position.z = 3;

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();
    let frameCount = 0;

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        frameCount++;

        targetX += (mouseX - targetX) * 0.018;
        targetY += (mouseY - targetY) * 0.018;

        coreMesh.rotation.y  =  elapsed * 0.05 - targetX * 0.25;
        coreMesh.rotation.x  =  elapsed * 0.015 + targetY * 0.12;
        nebMesh.rotation.y   = -elapsed * 0.035 - targetX * 0.18;
        nebMesh.rotation.x   =  elapsed * 0.025 + targetY * 0.08;
        roseMesh.rotation.y  =  elapsed * 0.044 + targetX * 0.1;
        starMesh.rotation.y  =  elapsed * 0.01;

        // Twinkle bright stars
        starMat.opacity = 0.7 + Math.sin(elapsed * 2.2) * 0.2;

        // Shooting stars update
        if (frameCount % 90 === 0 && shootingStars.length < 8) {
            shootingStars.push(createShootingStar());
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.life++;
            const t = s.life / s.maxLife;
            s.mat.opacity = t < 0.3 ? t / 0.3 : (t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3);

            const pos = s.geo.attributes.position.array;
            const tailLength = 0.6 + t * 0.4;
            pos[0] += s.direction.x;
            pos[1] += s.direction.y;
            pos[3] = pos[0] - s.direction.x * tailLength * 8;
            pos[4] = pos[1] - s.direction.y * tailLength * 8;
            s.geo.attributes.position.needsUpdate = true;

            if (s.life >= s.maxLife) {
                scene.remove(s.line);
                shootingStars.splice(i, 1);
            }
        }

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
    }, 2000);
});


// ---- CUSTOM CURSOR ----
(function initCursor() {
    if (window.innerWidth <= 768) return;

    const dot     = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const glow    = document.getElementById('mouse-glow');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

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

    document.querySelectorAll('a, button, .project-card-3d, .skill-card-3d, .ds3-container').forEach(el => {
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


// ---- NAVBAR ----
(function initNav() {
    const navbar   = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a:not(.btn-primary-sm)');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
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
            const target   = parseInt(counter.getAttribute('data-target'), 10);
            const suffix   = counter.getAttribute('data-suffix') || '';
            const duration = 1800;
            const startTime = performance.now();

            const step = (now) => {
                const elapsed  = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased    = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(eased * target) + (progress === 1 ? suffix : '');
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


// ---- 3DS INTERACTIVE ANIMATION ----
(function init3DS() {
    const ds3 = document.querySelector('.ds3-container');
    if (!ds3) return;

    let rotX = -10, rotY = 15;
    let targetRX = -10, targetRY = 15;
    let isHovered = false;
    let autoAngle = 0;

    // Mouse parallax on hover
    ds3.addEventListener('mouseenter', () => { isHovered = true; });
    ds3.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRX = -10;
        targetRY = 15;
    });
    ds3.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = ds3.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetRY = ((e.clientX - cx) / rect.width) * 30;
        targetRX = -((e.clientY - cy) / rect.height) * 20 - 5;
    });

    const inner = ds3.querySelector('.ds3-inner');
    const screen = ds3.querySelector('.ds3-screen-content');

    let time = 0;
    function animateDS3() {
        requestAnimationFrame(animateDS3);
        time += 0.01;

        if (!isHovered) {
            autoAngle += 0.008;
            targetRY = Math.sin(autoAngle) * 20 + 10;
            targetRX = Math.cos(autoAngle * 0.5) * 8 - 5;
        }

        rotX += (targetRX - rotX) * 0.06;
        rotY += (targetRY - rotY) * 0.06;

        if (inner) {
            inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }

        // Screen glow pulse
        if (screen) {
            const pulse = 0.85 + Math.sin(time * 2.5) * 0.15;
            screen.style.opacity = pulse;
        }
    }
    animateDS3();

    // Screen content — animated code terminal
    const terminalLines = [
        '> Building AI engine...',
        '> Parsing 50k CVs ✓',
        '> Accuracy: 98.2%',
        '> Deploying to prod ✓',
        '> Redis cache: 60% ↑',
        '> System online ✓',
    ];
    let lineIdx = 0;
    const terminal = document.querySelector('.ds3-terminal-text');
    if (terminal) {
        setInterval(() => {
            lineIdx = (lineIdx + 1) % terminalLines.length;
            terminal.style.opacity = '0';
            setTimeout(() => {
                terminal.textContent = terminalLines[lineIdx];
                terminal.style.opacity = '1';
            }, 300);
        }, 1800);
    }
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
    const modal     = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body-container');
    const closeBtn  = document.querySelector('.modal-close');
    const cards     = document.querySelectorAll('.project-card-3d');

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
        card.addEventListener('click', () => openModal(card.getAttribute('data-project')));
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
})();


// ---- VANILLA TILT ----
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

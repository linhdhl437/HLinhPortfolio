/* 🎋 Ambient Canvas (Nét cọ loang thư pháp, hạt rơi theo con trỏ chuột, mây thủy mặc, lá trúc/hoa đào rơi chéo) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Track mouse coordinates and path history
  const mouse = { x: -1000, y: -1000, active: false };
  const lastMouse = { x: null, y: null };
  let cursorParticles = []; // Spawning cursor particles on movement

  // Active particle type for cursor trail
  let activeParticleType = localStorage.getItem("cursorParticleType") || "peach";

  // Arrays to hold background elements
  const leaves = [];
  const birds = [];
  const clouds = [];

  // Wind speed offset driven by scroll velocity
  let scrollWind = 0;
  let lastScrollY = window.scrollY;

  // Listen to custom cursor particle toggle event
  window.addEventListener("cursorParticleTypeChanged", (e) => {
    activeParticleType = e.detail;
  });

  // Wind velocity tracker on scroll
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const diff = Math.abs(currentScrollY - lastScrollY);
    scrollWind += diff * 0.04; // scale scroll velocity to wind force
    lastScrollY = currentScrollY;
  }, { passive: true });

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Config parameters: Giảm 50% số lượng hạt trên di động để tối ưu hiệu năng
  const config = {
    leafCount: isTouch ? 8 : 18,
    birdCount: isTouch ? 2 : 4,
    cloudCount: isTouch ? 2 : 4
  };

  // Resize canvas with debounce
  let resizeTimeout;
  function resize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  }
  window.addEventListener("resize", resize);

  // Track mouse movements and add to brush stroke path + spawn particles
  let lastParticleSpawn = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    // Spawn cursor trail particles if threshold distance exceeded
    const dist = Math.hypot(e.clientX - lastParticleSpawn.x, e.clientY - lastParticleSpawn.y);
    const minDistance = isTouch ? 45 : 15; // Cần di chuyển khoảng cách xa hơn trên di động để giảm tần suất tạo hạt
    if (dist > minDistance && activeParticleType !== "off") {
      cursorParticles.push(new CursorParticle(e.clientX, e.clientY, activeParticleType));
      lastParticleSpawn = { x: e.clientX, y: e.clientY };
    }
  });

  // Track when mouse leaves viewport
  document.addEventListener("mouseleave", () => {
    mouse.active = false;
    lastMouse.x = null;
    lastMouse.y = null;
  });

  // ==========================================================================
  // CURSOR PARTICLES CLASS (🌸 Hoa đào, 🎋 Lá trúc nhỏ, 🪷 Hoa sen)
  // ==========================================================================
  class CursorParticle {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.size = Math.random() * 10 + 8;
      this.life = 1.0;
      this.decay = Math.random() * 0.015 + 0.012; // fades out in 1 - 1.2s

      // Soft physical drift
      this.vx = (Math.random() - 0.35) * 1.6; // slight drift to the right
      this.vy = Math.random() * 1.0 + 0.6;    // falling down slowly
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.05;

      // Classy watercolor color palettes
      if (this.type === 'peach') {
        // Muted peach blossom pink/crimson
        this.color = `rgba(${220 + Math.floor(Math.random() * 30)}, ${90 + Math.floor(Math.random() * 20)}, ${105 + Math.floor(Math.random() * 20)}, `;
      } else if (this.type === 'bamboo') {
        // Sage green for small bamboo leaf
        this.color = `rgba(${90 + Math.floor(Math.random() * 25)}, ${115 + Math.floor(Math.random() * 25)}, ${95 + Math.floor(Math.random() * 25)}, `;
      } else {
        // Classical lotus purple/pink
        this.color = `rgba(${230 + Math.floor(Math.random() * 25)}, ${110 + Math.floor(Math.random() * 30)}, ${150 + Math.floor(Math.random() * 25)}, `;
      }
    }

    update() {
      this.x += this.vx;
      this.y += this.vy + scrollWind * 0.2;
      this.x += Math.sin(this.life * 6) * 0.25; // elegant wavy wobble
      this.angle += this.spin;
      this.life -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      ctx.fillStyle = `${this.color}${this.life * 0.8})`;
      ctx.beginPath();

      if (this.type === 'peach') {
        // Peach blossom petal
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size / 2, -this.size, 0, -this.size);
        ctx.bezierCurveTo(this.size / 2, -this.size, this.size, -this.size / 2, 0, 0);
      } else if (this.type === 'bamboo') {
        // Small narrow bamboo leaf
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.4, 0, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.4, 0, 0, -this.size);
      } else {
        // Lotus petal
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.65, -this.size * 0.4, this.size * 0.65, this.size * 0.4, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.65, this.size * 0.4, -this.size * 0.65, -this.size * 0.4, 0, -this.size);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // ==========================================================================
  // 1. BACKGROUND LEAVES & PEACH BLOSSOMS (RƠI CHÉO, CHỊU ẢNH HƯỞNG GIÓ SCROLL)
  // ==========================================================================
  class BambooLeaf {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      if (isInitial) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      } else {
        if (Math.random() < 0.5) {
          this.x = -50;
          this.y = Math.random() * height * 0.7;
        } else {
          this.x = Math.random() * width * 0.7;
          this.y = -50;
        }
      }

      // Randomly spawn as either bamboo leaf or peach blossom petal
      this.isBlossom = Math.random() < 0.4;

      this.length = Math.random() * 20 + 25;
      this.width = Math.random() * 4 + 4;
      this.speedX = Math.random() * 0.5 + 0.7; // drifts rightward slowly
      this.speedY = Math.random() * 0.4 + 0.6; // drifts downward slowly
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.015;

      if (this.isBlossom) {
        this.alpha = Math.random() * 0.18 + 0.14; // soft red/pink blossom
        this.color = `rgba(${220 + Math.floor(Math.random() * 25)}, ${90 + Math.floor(Math.random() * 25)}, ${100 + Math.floor(Math.random() * 25)}, `;
      } else {
        this.alpha = Math.random() * 0.20 + 0.12; // charcoal-green bamboo leaf
        this.color = `rgba(54, 68, 58, `;
      }
    }

    update() {
      // Wind velocity from scroll interacts with falling speed
      this.x += this.speedX + scrollWind * 0.35;
      this.y += this.speedY + scrollWind * 0.45;
      this.angle += this.spinSpeed + scrollWind * 0.006;

      if (this.x > width + 50 || this.y > height + 50) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      ctx.fillStyle = `${this.color}${this.alpha})`;
      ctx.beginPath();
      
      if (this.isBlossom) {
        // Draw peach petal shape
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.length/2, -this.width, -this.length/4, -this.length/2, 0, -this.length/2);
        ctx.bezierCurveTo(this.length/4, -this.length/2, this.length/2, -this.width, 0, 0);
      } else {
        // Draw bamboo leaf contour
        ctx.moveTo(0, -this.length / 2);
        ctx.quadraticCurveTo(this.width, 0, 0, this.length / 2);
        ctx.quadraticCurveTo(-this.width, 0, 0, -this.length / 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // ==========================================================================
  // 2. BIRDS FLYING (CHIM BAY CHỮ V)
  // ==========================================================================
  class FlyingBird {
    constructor() {
      this.reset(true);
    }

    reset(isInitial = false) {
      this.x = isInitial ? Math.random() * width : -100;
      this.y = Math.random() * height * 0.4 + 50;
      this.speedX = Math.random() * 0.30 + 0.20;
      this.speedY = (Math.random() - 0.5) * 0.05;
      this.size = Math.random() * 5 + 7;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.03 + 0.03;
      this.alpha = Math.random() * 0.16 + 0.10;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.wingPhase += this.wingSpeed;

      if (this.x > width + 100) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      
      const wingOffset = Math.sin(this.wingPhase) * this.size * 0.5;
      
      ctx.strokeStyle = `rgba(28, 28, 28, ${this.alpha})`;
      ctx.lineWidth = 1.0;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      ctx.moveTo(-this.size, wingOffset);
      ctx.quadraticCurveTo(-this.size * 0.3, -this.size * 0.3, 0, 0);
      ctx.quadraticCurveTo(this.size * 0.3, -this.size * 0.3, this.size, wingOffset);
      ctx.stroke();
      
      ctx.restore();
    }
  }

  // ==========================================================================
  // 3. FLOATING CLOUDS VORTEX (MÂY THỦY MẶC XOÁY TÂM)
  // ==========================================================================
  class FloatingCloud {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      const cx = width / 2;
      const cy = height / 2;
      const maxSpawnRadius = Math.sqrt(cx * cx + cy * cy) * 1.1;
      
      this.angle = Math.random() * Math.PI * 2;
      const spawnDist = isInitial ? Math.random() * maxSpawnRadius : maxSpawnRadius;
      this.spawnDist = maxSpawnRadius;
      
      this.x = cx + Math.cos(this.angle) * spawnDist;
      this.y = cy + Math.sin(this.angle) * spawnDist;
      
      this.initialRadius = Math.random() * 100 + 120;
      this.radius = this.initialRadius;
      
      const moveSpeed = Math.random() * 0.12 + 0.12;
      this.vx = -Math.cos(this.angle) * moveSpeed;
      this.vy = -Math.sin(this.angle) * moveSpeed;
      
      const rotateSpeed = Math.random() * 0.06 + 0.03;
      this.vx += -Math.sin(this.angle) * rotateSpeed;
      this.vy += Math.cos(this.angle) * rotateSpeed;
      
      this.initialAlpha = Math.random() * 0.03 + 0.02;
      this.alpha = this.initialAlpha;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      const cx = width / 2;
      const cy = height / 2;
      const dx = cx - this.x;
      const dy = cy - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const progress = Math.min(dist / this.spawnDist, 1);
      this.radius = this.initialRadius * progress;
      this.alpha = this.initialAlpha * progress;
      
      if (dist < 30 || this.alpha <= 0.001) {
        this.reset(false);
      }
    }

    draw() {
      if (this.radius <= 0 || this.alpha <= 0) return;
      
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      grad.addColorStop(0, `rgba(215, 210, 198, ${this.alpha})`);
      grad.addColorStop(0.4, `rgba(235, 230, 220, ${this.alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==========================================================================
  // INITIALIZATION & ANIMATION LOOP
  // ==========================================================================
  for (let i = 0; i < config.leafCount; i++) {
    leaves.push(new BambooLeaf(true));
  }

  for (let i = 0; i < config.birdCount; i++) {
    birds.push(new FlyingBird());
  }

  for (let i = 0; i < config.cloudCount; i++) {
    clouds.push(new FloatingCloud(true));
  }

  let animFrameId = null;
  let isTabActive = true;

  // Main drawing loop
  function loop() {
    if (!isTabActive) return;

    ctx.clearRect(0, 0, width, height);

    // Apply friction to wind force driven by scroll
    scrollWind *= 0.94;

    // 1. Update and draw Clouds
    clouds.forEach(cloud => {
      cloud.update();
      cloud.draw();
    });

    // 2. Update and draw Birds
    birds.forEach(bird => {
      bird.update();
      bird.draw();
    });

    // 3. Update and draw Leaves & Blossoms
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw();
    });

    // 4. Update and draw Cursor particles
    cursorParticles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    cursorParticles = cursorParticles.filter(p => p.life > 0);
    
    if (cursorParticles.length > 80) {
      cursorParticles.shift();
    }



    animFrameId = requestAnimationFrame(loop);
  }

  // Visibility state handlers to save CPU/Battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isTabActive = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    } else {
      if (!isTabActive) {
        isTabActive = true;
        loop();
      }
    }
  });

  // Start loop
  loop();
});

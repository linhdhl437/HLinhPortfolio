/* 🎋 Ambient Canvas (Nét cọ loang thư pháp, mây thủy mặc xoáy tâm, lá trúc rơi, chim bay) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Track mouse coordinates and interpolation
  const mouse = { x: -1000, y: -1000, active: false };
  const lastMouse = { x: null, y: null };

  // Arrays to hold particles/objects
  const inkBlots = [];
  const leaves = [];
  const birds = [];
  const clouds = [];

  // Config parameters
  const config = {
    maxInkBlots: 100, // increased for smoother brush lines
    leafCount: 15,
    birdCount: 4,
    cloudCount: 4
  };

  // Resize canvas
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);

  // Track mouse movements with brush line interpolation
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    
    if (lastMouse.x !== null && lastMouse.y !== null) {
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Interpolate points along the path for a continuous brush stroke
      if (dist > 4) {
        const steps = Math.min(Math.floor(dist / 3), 10);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const interX = lastMouse.x + dx * t;
          const interY = lastMouse.y + dy * t;
          
          // Spawn ink spots along the stroke line
          if (Math.random() < 0.8) {
            spawnInk(interX, interY);
          }
        }
      }
    }
    
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  });

  // Track when mouse leaves viewport
  document.addEventListener("mouseleave", () => {
    mouse.active = false;
    lastMouse.x = null;
    lastMouse.y = null;
  });

  // ==========================================================================
  // 1. CALLIGRAPHY INK BRUSH TRAILS (VẾT MỰC LOANG DẠNG CỌ THƯ PHÁP)
  // ==========================================================================
  class InkBlot {
    constructor(x, y) {
      // Small offset to simulate natural brush hair scatter
      this.x = x + (Math.random() - 0.5) * 6;
      this.y = y + (Math.random() - 0.5) * 6;
      this.radius = Math.random() * 4 + 4; // starting size
      this.maxRadius = Math.random() * 18 + 15; // bleed size (smaller for elegance)
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2;
      this.alpha = 0.09; // very subtle watercolor tint
      this.decay = Math.random() * 0.0018 + 0.0012; // fades out in ~1s
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Bleed out/expand simulating rice paper absorption
      if (this.radius < this.maxRadius) {
        this.radius += (this.maxRadius - this.radius) * 0.06;
      }
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      
      // Multi-layer radial gradient for fuzzy, authentic calligraphy dispersion
      const grad = ctx.createRadialGradient(
        this.x, this.y, this.radius * 0.02,
        this.x, this.y, this.radius
      );
      grad.addColorStop(0, `rgba(20, 20, 20, ${this.alpha})`);
      grad.addColorStop(0.25, `rgba(32, 32, 32, ${this.alpha * 0.75})`);
      grad.addColorStop(0.55, `rgba(80, 80, 80, ${this.alpha * 0.3})`);
      grad.addColorStop(0.85, `rgba(130, 130, 130, ${this.alpha * 0.08})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function spawnInk(x, y) {
    if (inkBlots.length < config.maxInkBlots) {
      inkBlots.push(new InkBlot(x, y));
    }
  }

  // ==========================================================================
  // 2. BAMBOO LEAVES (LÁ TRÚC RƠI CHÉO)
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
      this.length = Math.random() * 20 + 25; // length of leaf
      this.width = Math.random() * 4 + 4;   // width of leaf
      this.speedX = Math.random() * 0.6 + 0.8; // drifts rightward
      this.speedY = Math.random() * 0.5 + 0.7; // drifts downward
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.02;
      this.alpha = Math.random() * 0.22 + 0.13; // Muted contrast
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.angle += this.spinSpeed;

      if (this.x > width + 50 || this.y > height + 50) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      // Muted charcoal-green bamboo leaf color
      ctx.fillStyle = `rgba(54, 68, 58, ${this.alpha})`;
      
      // Draw bamboo leaf contour
      ctx.beginPath();
      ctx.moveTo(0, -this.length / 2);
      ctx.quadraticCurveTo(this.width, 0, 0, this.length / 2);
      ctx.quadraticCurveTo(-this.width, 0, 0, -this.length / 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }

  // ==========================================================================
  // 3. BIRDS FLYING (CHIM BAY CHỮ V)
  // ==========================================================================
  class FlyingBird {
    constructor() {
      this.reset(true);
    }

    reset(isInitial = false) {
      this.x = isInitial ? Math.random() * width : -100;
      this.y = Math.random() * height * 0.4 + 50; // upper sky
      this.speedX = Math.random() * 0.35 + 0.25; // slow speed
      this.speedY = (Math.random() - 0.5) * 0.08;
      this.size = Math.random() * 5 + 7;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.04 + 0.04;
      this.alpha = Math.random() * 0.18 + 0.12; // very soft silhouette
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
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      // Left wing
      ctx.moveTo(-this.size, wingOffset);
      ctx.quadraticCurveTo(-this.size * 0.3, -this.size * 0.3, 0, 0);
      // Right wing
      ctx.quadraticCurveTo(this.size * 0.3, -this.size * 0.3, this.size, wingOffset);
      ctx.stroke();
      
      ctx.restore();
    }
  }

  // ==========================================================================
  // 4. FLOATING CLOUDS VORTEX (MÂY THỦY MẶC XOÁY TÂM)
  // ==========================================================================
  class FloatingCloud {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      const cx = width / 2;
      const cy = height / 2;
      const maxSpawnRadius = Math.sqrt(cx * cx + cy * cy) * 1.1;
      
      // Spawn at a random angle
      this.angle = Math.random() * Math.PI * 2;
      
      // Distance from center
      const spawnDist = isInitial ? Math.random() * maxSpawnRadius : maxSpawnRadius;
      this.spawnDist = maxSpawnRadius;
      
      this.x = cx + Math.cos(this.angle) * spawnDist;
      this.y = cy + Math.sin(this.angle) * spawnDist;
      
      this.initialRadius = Math.random() * 100 + 120; // large watercolor wash clouds
      this.radius = this.initialRadius;
      
      // Speed directing toward center
      const moveSpeed = Math.random() * 0.15 + 0.15;
      this.vx = -Math.cos(this.angle) * moveSpeed;
      this.vy = -Math.sin(this.angle) * moveSpeed;
      
      // Add a slight rotation/whirlpool drift
      const rotateSpeed = Math.random() * 0.08 + 0.04;
      this.vx += -Math.sin(this.angle) * rotateSpeed;
      this.vy += Math.cos(this.angle) * rotateSpeed;
      
      this.initialAlpha = Math.random() * 0.04 + 0.02; // very soft and transparent
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
      
      // Scale down and fade out as it approaches the center
      const progress = Math.min(dist / this.spawnDist, 1);
      this.radius = this.initialRadius * progress;
      this.alpha = this.initialAlpha * progress;
      
      // Reset if too close to center or completely faded
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
  // Instantiate leaves
  for (let i = 0; i < config.leafCount; i++) {
    leaves.push(new BambooLeaf(true));
  }

  // Instantiate birds
  for (let i = 0; i < config.birdCount; i++) {
    birds.push(new FlyingBird());
  }

  // Instantiate clouds
  for (let i = 0; i < config.cloudCount; i++) {
    clouds.push(new FloatingCloud(true));
  }

  // Loop
  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw Clouds (underneath everything else)
    clouds.forEach(cloud => {
      cloud.update();
      cloud.draw();
    });

    // Update and draw Birds
    birds.forEach(bird => {
      bird.update();
      bird.draw();
    });

    // Update and draw Leaves
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw();
    });

    // Update and draw Ink Blots
    for (let i = inkBlots.length - 1; i >= 0; i--) {
      const blot = inkBlots[i];
      blot.update();
      blot.draw();
      
      if (blot.alpha <= 0) {
        inkBlots.splice(i, 1);
      }
    }

    requestAnimationFrame(loop);
  }

  // Start loop
  loop();
});

/* 🎋 Ambient Canvas (Vết mực loang, lá trúc rơi, chim bay, mây trôi) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Track mouse coordinates
  const mouse = { x: -1000, y: -1000, active: false };

  // Arrays to hold particles/objects
  const inkBlots = [];
  const leaves = [];
  const birds = [];
  const clouds = [];

  // Config parameters
  const config = {
    maxInkBlots: 40,
    leafCount: 15,
    birdCount: 4,
    cloudCount: 3
  };

  // Resize canvas
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);

  // Track mouse movements
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    
    // Spawn ink blots occasionally on movement
    if (Math.random() < 0.25) {
      spawnInk(mouse.x, mouse.y);
    }
  });

  // Track when mouse leaves viewport
  document.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // ==========================================================================
  // 1. INK WASH PARTICLES (VẾT MỰC LOANG)
  // ==========================================================================
  class InkBlot {
    constructor(x, y) {
      this.x = x + (Math.random() - 0.5) * 10;
      this.y = y + (Math.random() - 0.5) * 10;
      this.radius = Math.random() * 5 + 5; // starting size
      this.maxRadius = Math.random() * 25 + 30; // bleed size
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.alpha = 0.08; // extremely subtle ink wash
      this.decay = Math.random() * 0.0015 + 0.001; // fades out in ~1s
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Bleed out/expand
      if (this.radius < this.maxRadius) {
        this.radius += (this.maxRadius - this.radius) * 0.05;
      }
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      
      // Radial gradient for watercolor bleed effect
      const grad = ctx.createRadialGradient(
        this.x, this.y, this.radius * 0.1,
        this.x, this.y, this.radius
      );
      grad.addColorStop(0, `rgba(28, 28, 28, ${this.alpha})`);
      grad.addColorStop(0.3, `rgba(40, 40, 40, ${this.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(28, 28, 28, 0)');

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
      // Enter from left or top edges, or random if initial
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
      this.alpha = Math.random() * 0.25 + 0.15; // Muted contrast
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.angle += this.spinSpeed;

      // Wrap around if leaves go off-screen
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
      
      // Draw bamboo leaf contour using bezier curves
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
      this.y = Math.random() * height * 0.4 + 50; // Fly in upper sky
      this.speedX = Math.random() * 0.4 + 0.3; // fly slowly rightward
      this.speedY = (Math.random() - 0.5) * 0.1;
      this.size = Math.random() * 6 + 8; // bird size
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.05 + 0.05;
      this.alpha = Math.random() * 0.2 + 0.15; // Very soft contrast
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
      
      // Classical brush stroke drawing style: flap wings based on phase
      const wingOffset = Math.sin(this.wingPhase) * this.size * 0.6;
      
      ctx.strokeStyle = `rgba(28, 28, 28, ${this.alpha})`;
      ctx.lineWidth = 1.2;
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
  // 4. FLOATING CLOUDS (MÂY TRÔI)
  // ==========================================================================
  class FloatingCloud {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      this.x = isInitial ? Math.random() * width : -300;
      this.y = Math.random() * height * 0.6;
      this.radius = Math.random() * 80 + 120; // large misty clouds
      this.speedX = Math.random() * 0.08 + 0.04; // drift extremely slowly
      this.alpha = Math.random() * 0.04 + 0.03; // almost invisible, ambient
    }

    update() {
      this.x += this.speedX;
      if (this.x > width + 300) {
        this.reset();
      }
    }

    draw() {
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      grad.addColorStop(0, `rgba(220, 215, 205, ${this.alpha})`);
      grad.addColorStop(0.5, `rgba(240, 235, 225, ${this.alpha * 0.4})`);
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

    // Update and draw Clouds
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
      
      // Delete faded out blots
      if (blot.alpha <= 0) {
        inkBlots.splice(i, 1);
      }
    }

    requestAnimationFrame(loop);
  }

  // Start loop
  loop();
});

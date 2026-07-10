/* 🎋 Ambient Canvas (Nét cọ loang thư pháp liên tục, mây thủy mặc xoáy tâm, lá trúc rơi, chim bay) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Track mouse coordinates and path history
  const mouse = { x: -1000, y: -1000, active: false };
  const lastMouse = { x: null, y: null };
  const inkPoints = []; // Holds points of the continuous brush stroke

  // Arrays to hold background elements
  const leaves = [];
  const birds = [];
  const clouds = [];

  // Config parameters
  const config = {
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

  // Track mouse movements and add to brush stroke path
  window.addEventListener("mousemove", (e) => {
    if (document.body.classList.contains("brush-disabled")) {
      mouse.active = false;
      return;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    
    let speed = 0;
    if (lastMouse.x !== null && lastMouse.y !== null) {
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      speed = Math.sqrt(dx * dx + dy * dy);
    }
    
    // Dynamic brush width based on speed: slower = thicker (wet brush), faster = thinner (dry brush)
    const brushWidth = Math.max(22 - speed * 0.35, 7);
    
    inkPoints.push({
      x: mouse.x,
      y: mouse.y,
      life: 1.0, // starts at 100% life
      width: brushWidth
    });
    
    // Cap length to prevent performance lag
    if (inkPoints.length > 150) {
      inkPoints.shift();
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
  // 1. BAMBOO LEAVES (LÁ TRÚC RƠI CHÉO)
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
      this.speedX = Math.random() * 0.5 + 0.7; // drifts rightward slowly
      this.speedY = Math.random() * 0.4 + 0.6; // drifts downward slowly
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.015;
      this.alpha = Math.random() * 0.20 + 0.12; // Muted contrast
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
  // 2. BIRDS FLYING (CHIM BAY CHỮ V)
  // ==========================================================================
  class FlyingBird {
    constructor() {
      this.reset(true);
    }

    reset(isInitial = false) {
      this.x = isInitial ? Math.random() * width : -100;
      this.y = Math.random() * height * 0.4 + 50; // upper sky
      this.speedX = Math.random() * 0.30 + 0.20; // very slow speed
      this.speedY = (Math.random() - 0.5) * 0.05;
      this.size = Math.random() * 5 + 7;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.03 + 0.03;
      this.alpha = Math.random() * 0.16 + 0.10; // very soft silhouette
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
      const moveSpeed = Math.random() * 0.12 + 0.12;
      this.vx = -Math.cos(this.angle) * moveSpeed;
      this.vy = -Math.sin(this.angle) * moveSpeed;
      
      // Add a slight rotation/whirlpool drift
      const rotateSpeed = Math.random() * 0.06 + 0.03;
      this.vx += -Math.sin(this.angle) * rotateSpeed;
      this.vy += Math.cos(this.angle) * rotateSpeed;
      
      this.initialAlpha = Math.random() * 0.03 + 0.02; // very soft and transparent
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

    // Update and draw Calligraphy Ink Stroke (smooth spline curves with dynamic taper and bleed)
    if (inkPoints.length > 2) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Helper function to draw a layer of the calligraphy stroke segment by segment
      const drawStrokeLayer = (widthMultiplier, strokeColorPrefix, alphaMultiplier) => {
        for (let i = 1; i < inkPoints.length - 1; i++) {
          const pA = inkPoints[i - 1];
          const pB = inkPoints[i];
          const pC = inkPoints[i + 1];
          
          const avgLife = (pA.life + pB.life + pC.life) / 3;
          if (avgLife <= 0) continue;

          // Calculate ratio from tail (0) to head (1) for dynamic tapering (nhọn hơn, loang dần)
          const ratioA = (i - 1) / (inkPoints.length - 1);
          const ratioB = i / (inkPoints.length - 1);
          const ratioC = (i + 1) / (inkPoints.length - 1);
          const avgRatio = (ratioA + ratioB + ratioC) / 3;

          ctx.beginPath();
          // Midpoints for smooth spline connecting
          const xc1 = (pA.x + pB.x) / 2;
          const yc1 = (pA.y + pB.y) / 2;
          const xc2 = (pB.x + pC.x) / 2;
          const yc2 = (pB.y + pC.y) / 2;
          
          ctx.moveTo(xc1, yc1);
          ctx.quadraticCurveTo(pB.x, pB.y, xc2, yc2);
          
          // Apply ratio: tail becomes needle-sharp and fades to transparent gradually
          ctx.lineWidth = pB.width * avgRatio * widthMultiplier;
          ctx.strokeStyle = `${strokeColorPrefix}${avgLife * avgRatio * alphaMultiplier})`;
          ctx.stroke();
        }
      };

      // Draw 3 layers for organic watercolor bleed (wet calligraphy feel, much darker core)
      // Layer 1: Wide Bleed Watercolor Wash (loang rộng nhẹ nhàng)
      drawStrokeLayer(3.8, "rgba(68, 64, 58, ", 0.12);
      // Layer 2: Medium Ink Dispersion (loang vừa)
      drawStrokeLayer(1.8, "rgba(40, 36, 32, ", 0.28);
      // Layer 3: Solid Calligraphy Core (lõi mực đậm đặc)
      drawStrokeLayer(0.8, "rgba(12, 12, 10, ", 0.85);
    }

    // Update ink points life decay
    for (let i = inkPoints.length - 1; i >= 0; i--) {
      inkPoints[i].life -= 0.018; // slower decay for longer trails (~0.9 seconds)
      if (inkPoints[i].life <= 0) {
        inkPoints.splice(i, 1);
      }
    }

    requestAnimationFrame(loop);
  }

  // Start loop
  loop();
});

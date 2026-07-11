/* 🎋 Hiệu ứng Mực Loang Đa Hoa Cổ Phong (Premium Calligraphy Flower Ink Splatter) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Hạt bung hoa từ tâm)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals, particleCount) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;

      // Tâm nhụy loang nhẹ
      this.centerPool = {
        radius: 3,
        maxRadius: Math.random() * 8 + 12,
        alpha: 0.65,
        decay: Math.random() * 0.015 + 0.015
      };

      // Sinh các hạt theo các hướng cánh hoa
      this.particles = [];
      const particlesPerPetal = Math.ceil(particleCount / numPetals);
      
      for (let p = 0; p < numPetals; p++) {
        // Góc cơ sở cho mỗi cánh hoa
        const baseAngle = (p / numPetals) * Math.PI * 2;
        
        for (let i = 0; i < particlesPerPetal; i++) {
          // Thêm độ lệch góc nhỏ ngẫu nhiên cho tự nhiên
          const angle = baseAngle + (Math.random() - 0.5) * 0.22; // lệch tối đa ~6 độ
          const speed = Math.random() * 2.8 + 1.2; // Tốc độ bay ra
          
          this.particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 2.2 + 0.8, // Kích thước hạt
            alpha: 0.9,
            decay: Math.random() * 0.015 + 0.015, // Tốc độ mờ dần
            friction: 0.94 // Lực cản không khí chậm dần
          });
        }
      }
    }

    update() {
      // 1. Cập nhật tâm nhụy loang
      if (this.centerPool.alpha > 0) {
        this.centerPool.radius += (this.centerPool.maxRadius - this.centerPool.radius) * 0.12;
        this.centerPool.alpha -= this.centerPool.decay;
      }

      // 2. Cập nhật các hạt
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      // 1. Vẽ nhụy mực loang ở tâm
      if (this.centerPool.alpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPool.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA(this.color, this.centerPool.alpha);
        ctx.fill();
        ctx.restore();
      }

      // 2. Vẽ các hạt cánh hoa bung ra
      this.particles.forEach(p => {
        if (p.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.color, p.alpha);
          ctx.fill();
          ctx.restore();
        }
      });
    }

    isFinished() {
      return this.particles.length === 0 && this.centerPool.alpha <= 0;
    }

    hexToRGBA(hex, alpha) {
      let c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
      }
      return `rgba(26,18,12,${alpha})`;
    }
  }

  // ----------------------------------------------------
  // CLASS: INK CANVAS MANAGER (Quản lý Render Loop tối ưu)
  // ----------------------------------------------------
  class InkCanvasManager {
    constructor() {
      this.canvas = canvas;
      this.ctx = ctx;
      this.effects = [];
      this.rafId = null;

      this.resize();
      
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.resize(), 150);
      }, { passive: true });
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      this.ctx.scale(dpr, dpr);
    }

    addEffect(x, y, color, numPetals, particleCount) {
      // Giới hạn tối đa 6 hiệu ứng đồng thời để tránh quá tải
      if (this.effects.length >= 6) {
        this.effects.shift();
      }

      this.effects.push(new ClickEffect(x, y, color, numPetals, particleCount));

      // Khởi động render loop nếu nó đang dừng
      if (!this.rafId) {
        this.loop();
      }
    }

    loop() {
      // Dùng logical size để xóa context (sau khi đã scale dpr)
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = this.effects.length - 1; i >= 0; i--) {
        const fx = this.effects[i];
        fx.update();
        fx.draw(this.ctx);

        if (fx.isFinished()) {
          this.effects.splice(i, 1);
        }
      }

      if (this.effects.length > 0) {
        this.rafId = requestAnimationFrame(() => this.loop());
      } else {
        this.rafId = null; // Dừng render loop hoàn toàn khi rảnh để tiết kiệm CPU/Pin
      }
    }
  }

  const inkManager = new InkCanvasManager();

  // Lắng nghe click để tạo bông hoa ngẫu nhiên
  let lastClickTime = 0;
  const CLICK_THROTTLE_MS = 100;

  document.addEventListener('pointerdown', (e) => {
    // Không chạy hiệu ứng nếu đang xem Intro
    const introOverlay = document.getElementById("intro-video-overlay");
    if (introOverlay && introOverlay.style.display !== "none" && !introOverlay.classList.contains("fade-out")) {
      return;
    }

    const now = Date.now();
    if (now - lastClickTime < CLICK_THROTTLE_MS) return;
    lastClickTime = now;

    const x = e.clientX;
    const y = e.clientY;
    const target = e.target;

    // Bỏ qua các panel điều khiển
    if (target.closest('#ui-panel') || target.closest('.control-panel') || target.closest('.color-btn')) {
      return;
    }

    // Chọn ngẫu nhiên loại hoa
    const rand = Math.random();
    let color, numPetals, particleCount;

    if (rand < 0.60) {
      // 60% Hoa Đào (5 cánh hồng)
      color = "#FFB7C5";
      numPetals = 5;
      particleCount = 15;
    } else if (rand < 0.90) {
      // 30% Hoa Mẫu Đơn (8 cánh đỏ chu sa)
      color = "#C24D56";
      numPetals = 8;
      particleCount = 24;
    } else {
      // 10% Hoa Cúc (12 cánh vàng kim)
      color = "#B89047";
      numPetals = 12;
      particleCount = 36;
    }

    // Kích hoạt
    inkManager.addEffect(x, y, color, numPetals, particleCount);
  });
});

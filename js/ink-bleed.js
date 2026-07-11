/* 🎋 Hiệu ứng Click Hạt Tròn Sắc Nét Vẽ Hình Bông Hoa Nở (Concentric Flower Dot Burst) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Vòng hạt tròn nở hình hoa pháo hoa)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;
      this.progress = 0;
      this.speed = 0.013; // Giảm xuống 0.013 để lan tỏa từ từ và chậm rãi như pháo hoa (mất khoảng 1.3 giây)

      // Chấm nhụy vàng ở tâm to hơn một chút
      this.centerDot = {
        radius: 4.5,
        alpha: 1.0,
        color: "#FFD700"
      };

      // 2 vòng hoa đồng tâm nở rộng hơn và nhiều hạt hơn cho sắc nét
      this.rings = [
        {
          baseRadius: 0,
          maxBaseRadius: 70, // Tăng bán kính nở rộng
          dotsCount: numPetals * 7, // Tăng số chấm để giữ hình dáng hoa khi phóng to
          amp: 0.25,
          delay: 0
        },
        {
          baseRadius: 0,
          maxBaseRadius: 100, // Vòng ngoài bung rộng hẳn ra
          dotsCount: numPetals * 7,
          amp: 0.25,
          delay: 0.16 // Trễ nhịp rõ hơn một chút để thấy từng lớp pháo hoa nở
        }
      ];
    }

    update() {
      this.progress += this.speed;

      // Nhụy hoa phai màu dần
      this.centerDot.alpha = Math.max(0, 1 - this.progress * 2.0);

      // Cập nhật từng vòng hoa
      this.rings.forEach(r => {
        if (this.progress > r.delay) {
          const p = Math.min(1.0, (this.progress - r.delay) / (1.0 - r.delay));
          const easeOutCubic = 1 - Math.pow(1 - p, 3); // Giảm tốc về cuối giống pháo hoa thực tế
          r.baseRadius = r.maxBaseRadius * easeOutCubic;
          r.alpha = Math.max(0, 1 - p);
        } else {
          r.alpha = 0;
        }
      });
    }

    draw(ctx) {
      // 1. Vẽ nhụy vàng trung tâm
      if (this.centerDot.alpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerDot.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA(this.centerDot.color, this.centerDot.alpha);
        ctx.fill();
        ctx.restore();
      }

      // 2. Vẽ các vòng hoa hạt tròn sắc nét to hơn
      this.rings.forEach(r => {
        if (this.progress > r.delay && r.alpha > 0) {
          const numDots = r.dotsCount;
          const N = this.numPetals;
          const amp = r.amp;

          for (let i = 0; i < numDots; i++) {
            const theta = (i / numDots) * Math.PI * 2;
            
            // Công thức hoa hồng: r = baseRadius * (1 + amp * cos(N * theta))
            const radiusFactor = 1 + amp * Math.cos(N * theta);
            const currentRadius = r.baseRadius * radiusFactor;

            const dotX = this.x + Math.cos(theta) * currentRadius;
            const dotY = this.y + Math.sin(theta) * currentRadius;

            ctx.save();
            ctx.beginPath();
            
            // Tăng kích thước chấm tròn: bắt đầu từ 2.6px và thu nhỏ dần về cuối hành trình
            const dotSize = 2.6 * (1.0 - this.progress * 0.3);
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRGBA(this.color, r.alpha);
            ctx.fill();
            ctx.restore();
          }
        }
      });
    }

    isFinished() {
      return this.progress >= 1.0;
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
  // CLASS: INK CANVAS MANAGER (Quản lý Render Loop cực nhẹ)
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

    addEffect(x, y, color, numPetals) {
      if (this.effects.length >= 5) {
        this.effects.shift();
      }

      this.effects.push(new ClickEffect(x, y, color, numPetals));

      if (!this.rafId) {
        this.loop();
      }
    }

    loop() {
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
        this.rafId = null;
      }
    }
  }

  const inkManager = new InkCanvasManager();

  let lastClickTime = 0;
  const CLICK_THROTTLE_MS = 100;

  document.addEventListener('pointerdown', (e) => {
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

    if (target.closest('#ui-panel') || target.closest('.control-panel') || target.closest('.color-btn')) {
      return;
    }

    const rand = Math.random();
    let color, numPetals;

    if (rand < 0.60) {
      color = "#FF69B4";
      numPetals = 5;
    } else if (rand < 0.90) {
      color = "#C24D56";
      numPetals = 8;
    } else {
      color = "#D4AF37";
      numPetals = 12;
    }

    inkManager.addEffect(x, y, color, numPetals);
  });
});

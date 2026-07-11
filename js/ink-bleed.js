/* 🎋 Hiệu ứng Click Hạt Tròn Sắc Nét Vẽ Hình Bông Hoa Nở (Concentric Flower Dot Burst) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Bông hoa Neon thu nhỏ sắc nét)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;
      this.progress = 0;
      this.speed = 0.015; // Lan tỏa từ từ trung bình

      // Nhụy hoa tâm sáng Neon
      this.centerDot = {
        radius: 3.5,
        alpha: 1.0,
        color: "#FFFFFF" // Màu trắng điện (electric white) làm tâm phát sáng
      };

      // Thu nhỏ kích thước tối đa để bông hoa bé xinh, tăng mật độ chấm để rõ hình cánh hoa
      this.rings = [
        {
          baseRadius: 0,
          maxBaseRadius: 30, // Bông hoa bé nhỏ thu gọn xung quanh con trỏ
          dotsCount: numPetals * 9, // Tăng mật độ hạt (ví dụ 5x9 = 45 chấm) để viền hoa rõ nét
          amp: 0.38, // Tăng biên độ cong (amplitude) giúp cánh hoa uốn lượn rõ ràng hơn
          delay: 0
        },
        {
          baseRadius: 0,
          maxBaseRadius: 45, // Vòng ngoài cũng thu gọn dẹt
          dotsCount: numPetals * 9,
          amp: 0.38,
          delay: 0.14
        }
      ];
    }

    update() {
      this.progress += this.speed;

      this.centerDot.alpha = Math.max(0, 1 - this.progress * 2.2);

      this.rings.forEach(r => {
        if (this.progress > r.delay) {
          const p = Math.min(1.0, (this.progress - r.delay) / (1.0 - r.delay));
          const easeOutCubic = 1 - Math.pow(1 - p, 3);
          r.baseRadius = r.maxBaseRadius * easeOutCubic;
          r.alpha = Math.max(0, 1 - p);
        } else {
          r.alpha = 0;
        }
      });
    }

    draw(ctx) {
      // 1. Vẽ nhụy sáng ở trung tâm (Glow Neon trắng)
      if (this.centerDot.alpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerDot.radius, 0, Math.PI * 2);
        
        // Tạo hiệu ứng phát sáng Neon
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00FFFF"; // Ánh xanh Neon nhẹ quanh nhụy trắng
        ctx.fillStyle = this.hexToRGBA(this.centerDot.color, this.centerDot.alpha);
        ctx.fill();
        ctx.restore();
      }

      // 2. Vẽ các vòng hoa hạt Neon sắc nét
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
            
            // Hạt nhỏ vừa vặn sắc nét
            const dotSize = 2.0 * (1.0 - this.progress * 0.2);
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            
            // Hiệu ứng phát sáng Neon cho viền hoa
            ctx.shadowBlur = 6;
            ctx.shadowColor = this.color;
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
      return `rgba(256,256,256,${alpha})`;
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

    // Chọn ngẫu nhiên loại hoa màu sắc Neon nổi bật
    const rand = Math.random();
    let color, numPetals;

    if (rand < 0.60) {
      // 60% Hoa Đào: Neon Pink nổi bật quyến rũ
      color = "#FF007F"; 
      numPetals = 5;
    } else if (rand < 0.90) {
      // 30% Hoa Mẫu Đơn: Neon Red/Orange rực rỡ
      color = "#FF1F1F"; 
      numPetals = 8;
    } else {
      // 10% Hoa Cúc: Neon Yellow sáng lóa cực sang
      color = "#FFE600"; 
      numPetals = 12;
    }

    inkManager.addEffect(x, y, color, numPetals);
  });
});

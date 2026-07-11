/* 🎋 Hiệu ứng Click Hạt Tròn Sắc Nét Vẽ Hình Bông Hoa Nở (Concentric Flower Dot Burst) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Vòng hạt tròn nở hình hoa)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;
      this.progress = 0;
      this.speed = 0.022; // Hiệu ứng diễn ra trong khoảng 1 giây (~45 frames)

      // Chấm nhụy vàng sắc nét ở tâm
      this.centerDot = {
        radius: 3.5,
        alpha: 1.0,
        color: "#FFD700" // Màu vàng tươi sáng tương phản đẹp mắt
      };

      // 2 vòng hoa đồng tâm nở lệch pha nhau (như hình phác thảo)
      this.rings = [
        {
          baseRadius: 0,
          maxBaseRadius: 60,
          dotsCount: numPetals * 6, // Số chấm tỷ lệ với số cánh hoa để tạo nét đều
          amp: 0.26, // Biên độ nhấp nhô của cánh hoa
          delay: 0
        },
        {
          baseRadius: 0,
          maxBaseRadius: 85,
          dotsCount: numPetals * 6,
          amp: 0.26,
          delay: 0.12 // Vòng ngoài nở trễ hơn một chút tạo hiệu ứng sóng
        }
      ];
    }

    update() {
      this.progress += this.speed;

      // Nhụy hoa biến mất nhanh hơn vòng cánh hoa bên ngoài
      this.centerDot.alpha = Math.max(0, 1 - this.progress * 2.2);

      // Cập nhật từng vòng hoa
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
      // 1. Vẽ nhụy vàng sắc nét ở trung tâm
      if (this.centerDot.alpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerDot.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA(this.centerDot.color, this.centerDot.alpha);
        ctx.fill();
        ctx.restore();
      }

      // 2. Vẽ các vòng hoa hạt tròn xếp theo đường viền cánh hoa
      this.rings.forEach(r => {
        if (this.progress > r.delay && r.alpha > 0) {
          const numDots = r.dotsCount;
          const N = this.numPetals;
          const amp = r.amp;

          for (let i = 0; i < numDots; i++) {
            const theta = (i / numDots) * Math.PI * 2;
            
            // Công thức đường hoa hồng: r = baseRadius * (1 + amp * cos(N * theta))
            const radiusFactor = 1 + amp * Math.cos(N * theta);
            const currentRadius = r.baseRadius * radiusFactor;

            const dotX = this.x + Math.cos(theta) * currentRadius;
            const dotY = this.y + Math.sin(theta) * currentRadius;

            ctx.save();
            ctx.beginPath();
            
            // Kích thước các chấm tròn nhỏ lại một chút khi nở rộng ra xa
            const dotSize = 1.5 * (1.0 - this.progress * 0.25);
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRGBA(this.color, r.alpha);
            ctx.fill();
            ctx.restore();
          }
        }
      });
    }

    isFinished() {
      // Kết thúc khi vòng ngoài cùng đã mờ hết
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
      // Giới hạn tối đa 5 hiệu ứng đồng thời
      if (this.effects.length >= 5) {
        this.effects.shift();
      }

      this.effects.push(new ClickEffect(x, y, color, numPetals));

      // Khởi động render loop nếu đang tạm dừng
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
        this.rafId = null; // Tắt hoàn toàn loop khi rảnh
      }
    }
  }

  const inkManager = new InkCanvasManager();

  // Lắng nghe click chuột tạo hoa ngẫu nhiên sắc nét
  let lastClickTime = 0;
  const CLICK_THROTTLE_MS = 100;

  document.addEventListener('pointerdown', (e) => {
    // Bỏ qua nếu đang phát intro video
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

    // Bỏ qua nếu nhấn vào panel cài đặt
    if (target.closest('#ui-panel') || target.closest('.control-panel') || target.closest('.color-btn')) {
      return;
    }

    // Chọn ngẫu nhiên loại hoa
    const rand = Math.random();
    let color, numPetals;

    if (rand < 0.60) {
      // 60% Hoa Đào (5 cánh hồng đào tươi)
      color = "#FF69B4";
      numPetals = 5;
    } else if (rand < 0.90) {
      // 30% Hoa Mẫu Đơn (8 cánh đỏ chu sa thắm)
      color = "#C24D56";
      numPetals = 8;
    } else {
      // 10% Hoa Cúc (12 cánh vàng cổ kính)
      color = "#D4AF37";
      numPetals = 12;
    }

    inkManager.addEffect(x, y, color, numPetals);
  });
});

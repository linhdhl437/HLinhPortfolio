/* 🎋 Hiệu ứng Click Hạt Tròn Sắc Nét Vẽ Hình Bông Hoa Nở (Concentric Flower Dot Burst) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Hiệu ứng Pháo Hoa Hạt Viền Hoa Độc Bản)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;
      this.progress = 0;
      this.speed = 0.010; // Lan tỏa từ từ chậm rãi (khoảng 1.6 giây) tạo cảm giác pháo hoa nở chậm

      // Nhụy hoa tả thực phát sáng Neon (Gồm nhân chính và các hạt đầu nhụy nhỏ xung quanh)
      this.centerPistil = {
        coreRadius: 3.8,
        coreColor: "#FFFFFF", // Nhân trắng điện phát sáng
        stamenCount: 5,
        stamenRadius: 1.3,
        stamenDist: 6.5,
        stamenColor: "#FFE600", // Đầu nhụy vàng tươi sáng
        alpha: 1.0
      };

      // Chỉ có duy nhất 1 làn sóng (1 vòng viền hoa) lan tỏa rộng ra ngoài
      this.ring = {
        baseRadius: 0,
        maxBaseRadius: 52, // Kích thước bông hoa vừa vặn xinh xắn
        dotsCount: numPetals * (numPetals === 5 ? 14 : numPetals === 8 ? 11 : 9), // Mật độ chấm dày dặn để rõ hình dáng
        alpha: 1.0
      };
    }

    update() {
      this.progress += this.speed;

      // Nhụy hoa mờ dần
      this.centerPistil.alpha = Math.max(0, 1 - this.progress * 1.8);

      // Cánh hoa nở rộng theo hàm cubic giảm tốc về cuối
      const easeOutCubic = 1 - Math.pow(1 - this.progress, 3);
      this.ring.baseRadius = this.ring.maxBaseRadius * easeOutCubic;
      this.ring.alpha = Math.max(0, 1 - this.progress);
    }

    draw(ctx) {
      // 1. Vẽ nhụy hoa chi tiết sắc nét ở trung tâm
      if (this.centerPistil.alpha > 0) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#FFE600";

        // Vẽ nhụy cái (Core) ở giữa
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPistil.coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA(this.centerPistil.coreColor, this.centerPistil.alpha);
        ctx.fill();

        // Vẽ 5 nhụy đực (Stamens) nhỏ bay xung quanh tâm nhụy chính
        const sCount = this.centerPistil.stamenCount;
        const sDist = this.centerPistil.stamenDist;
        for (let s = 0; s < sCount; s++) {
          // Nhụy xoay nhẹ theo thời gian lan tỏa để tăng vẻ sinh động
          const sAngle = (s / sCount) * Math.PI * 2 + this.progress * 0.4;
          const sX = this.x + Math.cos(sAngle) * sDist;
          const sY = this.y + Math.sin(sAngle) * sDist;

          ctx.beginPath();
          ctx.arc(sX, sY, this.centerPistil.stamenRadius, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, this.centerPistil.alpha);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Vẽ duy nhất 1 vòng cánh hoa hạt Neon sắc nét (Đào khía, Mẫu Đơn xếp nếp, Cúc thon dài)
      if (this.ring.alpha > 0) {
        const numDots = this.ring.dotsCount;
        const N = this.numPetals;
        const baseRadius = this.ring.baseRadius;

        for (let i = 0; i < numDots; i++) {
          const theta = (i / numDots) * Math.PI * 2;
          let radiusFactor = 1;

          // Thiết kế hình dáng các loài hoa dựa theo đường cong toán học thực tế
          if (N === 5) {
            // Hoa Đào (5 cánh): Đầu cánh bầu bĩnh có khía hình chữ V lõm nhẹ đặc trưng ở giữa
            const cos5 = Math.cos(5 * theta);
            const baseShape = Math.sign(cos5) * Math.pow(Math.abs(cos5), 0.65);
            const notch = Math.cos(10 * theta); // Sóng bậc hai tạo vết khía ở đỉnh
            radiusFactor = 1 + 0.32 * baseShape - 0.06 * notch;
          } else if (N === 8) {
            // Hoa Mẫu Đơn (8 cánh): Viền cánh uốn lượn dập dềnh xếp nếp mềm mại quý phái
            const cos8 = Math.cos(8 * theta);
            const baseShape = Math.sign(cos8) * Math.pow(Math.abs(cos8), 0.7);
            const ruffle = Math.sin(16 * theta); // Sóng xếp nếp ở rìa
            radiusFactor = 1 + 0.28 * baseShape + 0.04 * ruffle;
          } else {
            // Hoa Cúc (12 cánh): Cánh hoa thon mảnh, nhọn dần và vươn dài ra ngoài
            const cos12 = Math.cos(12 * theta);
            const positiveLobe = Math.max(0, cos12);
            const negativeValley = Math.max(0, -cos12);
            radiusFactor = 1 + 0.42 * Math.pow(positiveLobe, 1.4) - 0.12 * negativeValley;
          }

          const dotX = this.x + Math.cos(theta) * currentRadius;
          const dotY = this.y + Math.sin(theta) * currentRadius;

          // Sử dụng toán học trực tiếp
          const finalRadius = baseRadius * radiusFactor;
          const dx = this.x + Math.cos(theta) * finalRadius;
          const dy = this.y + Math.sin(theta) * finalRadius;

          ctx.save();
          ctx.beginPath();
          
          // Chấm tròn nhỏ đi một chút khi bay ra xa
          const dotSize = 1.8 * (1.0 - this.progress * 0.2);
          ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
          
          ctx.shadowBlur = 6;
          ctx.shadowColor = this.color;
          ctx.fillStyle = this.hexToRGBA(this.color, this.ring.alpha);
          
          ctx.fill();
          ctx.restore();
        }
      }
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
      // 30% Hoa Mẫu Đơn: Neon Red rực rỡ
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

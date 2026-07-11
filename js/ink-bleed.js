/* 🎋 Hiệu ứng Click Hạt Tròn Sắc Nét Vẽ Hình Bông Hoa Nở (Concentric Flower Dot Burst) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Bông hoa Neon thu nhỏ tả thực)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals, type) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;
      this.type = type; // "dao", "maudon", "cuc"
      this.progress = 0;
      this.speed = 0.011; // Lan tỏa chậm rãi hơn để pháo hoa nở từ từ đẹp mắt

      // Nhụy hoa phác thảo tả thực phóng to hơn một chút
      this.centerPistil = {
        coreRadius: 3.5,
        coreColor: "#FFFFFF",
        stamenColor: "#FFE600",
        lineColor: "#FFA500", // Đường chỉ nhụy màu cam vàng ấm áp
        alpha: 1.0
      };

      // Thiết lập kích thước siêu nhỏ gọn (bé hơn nữa)
      if (this.type === "dao") {
        this.maxRadius = 22; // Bông hoa đào bé nhỏ tinh tế
      } else if (this.type === "maudon") {
        this.maxRadius = 26; // Mẫu đơn xòe lớp vừa phải
      } else {
        this.maxRadius = 30; // Hoa cúc mảnh
      }

      this.alpha = 1.0;
    }

    update() {
      this.progress += this.speed;
      this.alpha = Math.max(0, 1 - this.progress);
    }

    draw(ctx) {
      const alpha = this.alpha;
      if (alpha <= 0) return;

      const easeOutCubic = 1 - Math.pow(1 - this.progress, 3);
      const currentBaseRadius = this.maxRadius * easeOutCubic;

      // ----------------------------------------------------
      // 1. VẼ NHỤY HOA TẢ THỰC CHI TIẾT (Tổ hợp Nhị đực + Nhị cái)
      // ----------------------------------------------------
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#FFE600";

      if (this.type === "dao") {
        // NHỤY HOA ĐÀO (Hình 1): 10 sợi nhụy mảnh tỏa tròn có chấm tròn nhỏ ở đầu
        const sCount = 10;
        const sLength = 8.5; // Chiều dài sợi nhụy tỉ lệ với hoa bé
        const rotationOffset = this.progress * 0.15; // Xoay cực nhẹ sinh động

        // Vẽ nhụy cái ở tâm
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPistil.coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA(this.centerPistil.coreColor, alpha);
        ctx.fill();

        // Vẽ các tia nhụy đực tỏa ra
        for (let s = 0; s < sCount; s++) {
          const angle = (s / sCount) * Math.PI * 2 + rotationOffset;
          const endX = this.x + Math.cos(angle) * sLength;
          const endY = this.y + Math.sin(angle) * sLength;

          // Vẽ sợi chỉ nhụy mảnh
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = this.hexToRGBA(this.centerPistil.lineColor, alpha * 0.65);
          ctx.lineWidth = 0.6;
          ctx.stroke();

          // Vẽ hạt phấn nhỏ ở đầu sợi nhụy
          ctx.beginPath();
          ctx.arc(endX, endY, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, alpha);
          ctx.fill();
        }
      } else if (this.type === "maudon") {
        // NHỤY HOA MẪU ĐƠN (Hình 2): Cụm nhụy vàng kim dày đặc lấm tấm ở giữa
        const mCount = 14;
        const rotationOffset = -this.progress * 0.1;

        // Vẽ tâm nhụy sẫm hơn
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPistil.coreRadius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA("#FFA500", alpha);
        ctx.fill();

        // Vẽ cụm hạt nhụy vàng xếp xoắn ốc tỏa nhẹ
        for (let m = 0; m < mCount; m++) {
          const dist = 3.5 + (m * 0.35); // Xếp từ trong ra ngoài
          const angle = m * 137.5 * (Math.PI / 180) + rotationOffset; // Góc vàng phyllotaxis
          const mX = this.x + Math.cos(angle) * dist;
          const mY = this.y + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(mX, mY, 1.0, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, alpha);
          ctx.fill();
        }
      } else {
        // NHỤY HOA CÚC: Tâm nhụy vàng kim to sáng rực rỡ
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA("#FFE600", alpha);
        ctx.fill();
      }
      ctx.restore();

      // ----------------------------------------------------
      // 2. VẼ ĐƯỜNG VIỀN CÁNH HOA HẠT NEON SẮC NÉT
      // ----------------------------------------------------
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.hexToRGBA(this.color, alpha);

      const N = this.numPetals;
      
      // Vẽ cánh hoa dựa trên loài hoa cụ thể
      if (this.type === "dao") {
        // HOA ĐÀO (Hình 1): 5 cánh bầu bĩnh hơi nhọn nhẹ ở đầu cánh hoa
        const dotsCount = 70; // Đảm bảo đường viền khít sát khi hoa bé
        for (let i = 0; i < dotsCount; i++) {
          const theta = (i / dotsCount) * Math.PI * 2;
          const cos5 = Math.cos(5 * theta);
          const baseShape = Math.sign(cos5) * Math.pow(Math.abs(cos5), 0.65);
          // Cộng thêm sóng bậc hai cos(10*theta) dương để tạo đầu cánh hơi vuốt nhọn nhẹ tinh tế như hình vẽ
          const peakPoint = Math.cos(10 * theta);
          const radiusFactor = 1 + 0.28 * baseShape + 0.06 * peakPoint;

          const finalRadius = currentBaseRadius * radiusFactor;
          const dx = this.x + Math.cos(theta) * finalRadius;
          const dy = this.y + Math.sin(theta) * finalRadius;

          ctx.beginPath();
          const dotSize = 1.5 * (1.0 - this.progress * 0.22);
          ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.type === "maudon") {
        // HOA MẪU ĐƠN (Hình 2): Vẽ hai lớp cánh xếp đè so le tạo độ dày dặn xếp nếp
        const layers = [
          { scale: 0.78, dots: 55, rot: Math.PI / 8, amp: 0.25 }, // Lớp trong
          { scale: 1.0, dots: 75, rot: 0, amp: 0.28 } // Lớp ngoài
        ];

        layers.forEach(layer => {
          for (let i = 0; i < layer.dots; i++) {
            const theta = (i / layer.dots) * Math.PI * 2;
            const cos8 = Math.cos(8 * (theta + layer.rot));
            const baseShape = Math.sign(cos8) * Math.pow(Math.abs(cos8), 0.7);
            const ruffle = Math.sin(16 * (theta + layer.rot)); // Xếp nếp viền cánh nhăn sóng nhẹ
            const radiusFactor = 1 + layer.amp * baseShape + 0.05 * ruffle;

            const finalRadius = currentBaseRadius * layer.scale * radiusFactor;
            const dx = this.x + Math.cos(theta) * finalRadius;
            const dy = this.y + Math.sin(theta) * finalRadius;

            ctx.beginPath();
            const dotSize = 1.3 * (1.0 - this.progress * 0.2);
            ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else {
        // HOA CÚC: 12 cánh hoa kim vươn thon nhọn
        const dotsCount = 96;
        for (let i = 0; i < dotsCount; i++) {
          const theta = (i / dotsCount) * Math.PI * 2;
          const cos12 = Math.cos(12 * theta);
          const positiveLobe = Math.max(0, cos12);
          const negativeValley = Math.max(0, -cos12);
          const radiusFactor = 1 + 0.42 * Math.pow(positiveLobe, 1.4) - 0.12 * negativeValley;

          const finalRadius = currentBaseRadius * radiusFactor;
          const dx = this.x + Math.cos(theta) * finalRadius;
          const dy = this.y + Math.sin(theta) * finalRadius;

          ctx.beginPath();
          const dotSize = 1.3 * (1.0 - this.progress * 0.2);
          ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
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

    addEffect(x, y, color, numPetals, type) {
      if (this.effects.length >= 5) {
        this.effects.shift();
      }

      this.effects.push(new ClickEffect(x, y, color, numPetals, type));

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
    let color, numPetals, type;

    if (rand < 0.60) {
      // 60% Hoa Đào: Neon Pink nổi bật quyến rũ
      color = "#FF007F"; 
      numPetals = 5;
      type = "dao";
    } else if (rand < 0.90) {
      // 30% Hoa Mẫu Đơn: Neon Red rực rỡ
      color = "#FF1F1F"; 
      numPetals = 8;
      type = "maudon";
    } else {
      // 10% Hoa Cúc: Neon Yellow sáng lóa cực sang
      color = "#FFE600"; 
      numPetals = 12;
      type = "cuc";
    }

    inkManager.addEffect(x, y, color, numPetals, type);
  });
});

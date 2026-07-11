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
      this.speed = 0.010; // Lan tỏa chậm rãi pháo hoa

      // Nhụy hoa phát sáng Neon
      this.centerPistil = {
        coreRadius: 3.5,
        coreColor: "#FFFFFF",
        stamenColor: "#FFE600",
        lineColor: "#FFA500",
        alpha: 1.0
      };

      // Thiết lập kích thước siêu nhỏ gọn (bé hơn nữa)
      if (this.type === "dao") {
        this.maxRadius = 22; // Bông hoa đào bé nhỏ tinh tế
      } else if (this.type === "maudon") {
        this.maxRadius = 26; // Mẫu đơn xòe lớp vừa phải
      } else {
        this.maxRadius = 30; // Hoa cúc thon mảnh
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
      const N = this.numPetals;

      // Xác định cấu trúc lớp cánh hoa theo loài để dùng chung cho vẽ gân & vẽ chấm viền
      let layers = [];
      if (this.type === "dao") {
        // HOA ĐÀO: Vẽ 2 lớp cánh (lớp trong xếp so le lớp ngoài) y hệt ảnh mẫu
        layers = [
          { scale: 0.76, dots: 45, rot: Math.PI / 5, amp: 0.28 },
          { scale: 1.0, dots: 65, rot: 0, amp: 0.32 }
        ];
      } else if (this.type === "maudon") {
        // HOA MẪU ĐƠN: 2 lớp cánh xếp đè nếp nhăn sóng
        layers = [
          { scale: 0.78, dots: 55, rot: Math.PI / 8, amp: 0.25 },
          { scale: 1.0, dots: 75, rot: 0, amp: 0.28 }
        ];
      } else {
        // HOA CÚC: 2 lớp cánh thon mảnh so le
        layers = [
          { scale: 0.75, dots: 60, rot: Math.PI / 12, amp: 0.42 },
          { scale: 1.0, dots: 84, rot: 0, amp: 0.42 }
        ];
      }

      // ----------------------------------------------------
      // 1. VẼ CÁC ĐƯỜNG GÂN CÁNH HOA NỐI NHỤY (Petals connected to pistil)
      // ----------------------------------------------------
      // Vẽ các sợi gân hoa mảnh tỏa từ tâm ra đỉnh cánh của lớp ngoài cùng
      ctx.save();
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.strokeStyle = this.hexToRGBA(this.color, alpha * 0.35); // Độ trong suốt nhẹ tinh tế
      ctx.lineWidth = 0.6;

      const outerLayer = layers[layers.length - 1];
      for (let k = 0; k < N; k++) {
        // Tính góc đỉnh cánh chính xác
        const theta = (k / N) * Math.PI * 2 - outerLayer.rot;
        let radiusFactor = 1;

        if (this.type === "dao") {
          const cos5 = Math.cos(5 * theta);
          const baseShape = Math.sign(cos5) * Math.pow(Math.abs(cos5), 0.65);
          const notch = Math.cos(10 * theta);
          radiusFactor = 1 + outerLayer.amp * baseShape + 0.06 * notch;
        } else if (this.type === "maudon") {
          const cos8 = Math.cos(8 * theta);
          const baseShape = Math.sign(cos8) * Math.pow(Math.abs(cos8), 0.7);
          const ruffle = Math.sin(16 * theta);
          radiusFactor = 1 + outerLayer.amp * baseShape + 0.05 * ruffle;
        } else {
          const cos12 = Math.cos(12 * theta);
          const positiveLobe = Math.max(0, cos12);
          const negativeValley = Math.max(0, -cos12);
          radiusFactor = 1 + outerLayer.amp * Math.pow(positiveLobe, 1.4) - 0.12 * negativeValley;
        }

        const finalRadius = currentBaseRadius * outerLayer.scale * radiusFactor;
        const px = this.x + Math.cos(theta) * finalRadius;
        const py = this.y + Math.sin(theta) * finalRadius;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      ctx.restore();

      // ----------------------------------------------------
      // 2. VẼ NHỤY HOA TẢ THỰC CHI TIẾT (Đè lên điểm xuất phát của gân hoa)
      // ----------------------------------------------------
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#FFE600";

      if (this.type === "dao") {
        const sCount = 10;
        const sLength = 8.5;
        const rotationOffset = this.progress * 0.15;

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

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = this.hexToRGBA(this.centerPistil.lineColor, alpha * 0.65);
          ctx.lineWidth = 0.6;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(endX, endY, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, alpha);
          ctx.fill();
        }
      } else if (this.type === "maudon") {
        const mCount = 14;
        const rotationOffset = -this.progress * 0.1;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPistil.coreRadius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA("#FFA500", alpha);
        ctx.fill();

        for (let m = 0; m < mCount; m++) {
          const dist = 3.5 + (m * 0.35);
          const angle = m * 137.5 * (Math.PI / 180) + rotationOffset;
          const mX = this.x + Math.cos(angle) * dist;
          const mY = this.y + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(mX, mY, 1.0, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, alpha);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA("#FFE600", alpha);
        ctx.fill();
      }
      ctx.restore();

      // ----------------------------------------------------
      // 3. VẼ ĐƯỜNG VIỀN CÁNH HOA HẠT NEON SẮC NÉT
      // ----------------------------------------------------
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.hexToRGBA(this.color, alpha);

      layers.forEach(layer => {
        for (let i = 0; i < layer.dots; i++) {
          const theta = (i / layer.dots) * Math.PI * 2;
          const relativeTheta = theta + layer.rot;
          let radiusFactor = 1;

          if (this.type === "dao") {
            const cos5 = Math.cos(5 * relativeTheta);
            const baseShape = Math.sign(cos5) * Math.pow(Math.abs(cos5), 0.65);
            const notch = Math.cos(10 * relativeTheta);
            radiusFactor = 1 + layer.amp * baseShape + 0.06 * notch;
          } else if (this.type === "maudon") {
            const cos8 = Math.cos(8 * relativeTheta);
            const baseShape = Math.sign(cos8) * Math.pow(Math.abs(cos8), 0.7);
            const ruffle = Math.sin(16 * relativeTheta);
            radiusFactor = 1 + layer.amp * baseShape + 0.05 * ruffle;
          } else {
            const cos12 = Math.cos(12 * relativeTheta);
            const positiveLobe = Math.max(0, cos12);
            const negativeValley = Math.max(0, -cos12);
            radiusFactor = 1 + layer.amp * Math.pow(positiveLobe, 1.4) - 0.12 * negativeValley;
          }

          const finalRadius = currentBaseRadius * layer.scale * radiusFactor;
          const dx = this.x + Math.cos(theta) * finalRadius;
          const dy = this.y + Math.sin(theta) * finalRadius;

          ctx.beginPath();
          const dotSize = 1.3 * (1.0 - this.progress * 0.2);
          ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
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
      color = "#FF007F"; 
      numPetals = 5;
      type = "dao";
    } else if (rand < 0.90) {
      color = "#FF1F1F"; 
      numPetals = 8;
      type = "maudon";
    } else {
      color = "#FFE600"; 
      numPetals = 12;
      type = "cuc";
    }

    inkManager.addEffect(x, y, color, numPetals, type);
  });
});

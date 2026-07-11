/* 🎋 Hiệu ứng Click Hạt Tròn Sắc Nét Vẽ Hình Bông Hoa Nở (Concentric Flower Dot Burst) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });

  // Hàm bổ trợ tính điểm trên đường cong Bezier bậc 3 (Cubic Bezier)
  function getBezierPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    
    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
  }

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Bông hoa Neon tả thực toán học)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, color, numPetals, type) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.numPetals = numPetals;
      this.type = type; // "dao", "sen", "maudon", "cuc"
      this.progress = 0;
      this.speed = 0.008; // Lan tỏa chậm rãi (khoảng 2.0 giây) giống pháo hoa nở chậm

      // Nhụy hoa phát sáng Neon
      this.centerPistil = {
        coreRadius: 4.5,
        coreColor: "#FFFFFF",
        stamenColor: "#FFE600",
        lineColor: "#FFA500",
        alpha: 1.0
      };

      // Thiết lập kích thước tối đa vừa vặn nổi bật
      if (this.type === "dao") {
        this.maxRadius = 30; // Bông hoa đào
      } else if (this.type === "sen") {
        this.maxRadius = 35; // Bông hoa sen
      } else if (this.type === "maudon") {
        this.maxRadius = 36; // Bông hoa mẫu đơn
      } else {
        this.maxRadius = 40; // Bông hoa cúc
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
      // 1. VẼ CÁC ĐƯỜNG GÂN CÁNH HOA NỐI NHỤY
      // ----------------------------------------------------
      ctx.save();
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.strokeStyle = this.hexToRGBA(this.color, alpha * 0.35); // Nét gân hoa mờ ẩn dưới nhụy
      ctx.lineWidth = 0.6;

      if (this.type === "dao") {
        // HOA ĐÀO: Vẽ 5 đường gân thẳng nối tâm tới 5 đỉnh cánh hoa đối xứng tâm
        const angles = [
          Math.PI / 2, // 90 độ (đỉnh trên cùng)
          Math.PI / 10, // 18 độ
          1.7 * Math.PI, // 306 độ
          1.3 * Math.PI, // 234 độ
          0.9 * Math.PI  // 162 độ
        ];
        
        angles.forEach(theta => {
          // Tính toán bán kính tại đỉnh cánh đào có khía V lõm
          const angleForFormula = theta - Math.PI / 2;
          const cos5 = Math.cos(5 * angleForFormula);
          const baseShape = Math.sign(cos5) * Math.pow(Math.abs(cos5), 0.65);
          const notch = Math.cos(10 * angleForFormula);
          const radiusFactor = 1 + 0.32 * baseShape - 0.08 * notch;

          const px = this.x + Math.cos(theta) * currentBaseRadius * radiusFactor;
          const py = this.y + Math.sin(theta) * currentBaseRadius * radiusFactor;

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(px, py);
          ctx.stroke();
        });
      } else if (this.type === "sen") {
        // HOA SEN: Vẽ 7 đường gân nối nhụy từ tâm tới 7 đỉnh cánh hoa thiết kế Bezier
        const lotusTips = [
          { x: 0, y: -0.75 }, // Cánh đứng giữa
          { x: -0.40, y: -0.60 }, { x: 0.40, y: -0.60 }, // Lớp cánh bên trên
          { x: -0.72, y: -0.35 }, { x: 0.72, y: -0.35 }, // Lớp cánh bên giữa
          { x: -0.85, y: 0.05 }, { x: 0.85, y: 0.05 }   // Lớp cánh xòe dưới
        ];

        lotusTips.forEach(tip => {
          const px = this.x + tip.x * currentBaseRadius;
          const py = this.y + tip.y * currentBaseRadius;

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(px, py);
          ctx.stroke();
        });
      } else if (this.type === "maudon") {
        // HOA MẪU ĐƠN: 8 đường gân tỏa ra 8 đỉnh nếp xếp cánh hoa ngoài cùng
        for (let k = 0; k < 8; k++) {
          const theta = (k / 8) * Math.PI * 2;
          const cos8 = Math.cos(8 * theta);
          const baseShape = Math.sign(cos8) * Math.pow(Math.abs(cos8), 0.7);
          const ruffle = Math.sin(16 * theta);
          const radiusFactor = 1 + 0.28 * baseShape + 0.05 * ruffle;

          const px = this.x + Math.cos(theta) * currentBaseRadius * radiusFactor;
          const py = this.y + Math.sin(theta) * currentBaseRadius * radiusFactor;

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      } else {
        // HOA CÚC: 12 đường gân tỏa ra 12 đỉnh cánh thon nhọn
        for (let k = 0; k < 12; k++) {
          const theta = (k / 12) * Math.PI * 2;
          const cos12 = Math.cos(12 * theta);
          const positiveLobe = Math.max(0, cos12);
          const negativeValley = Math.max(0, -cos12);
          const radiusFactor = 1 + 0.42 * Math.pow(positiveLobe, 1.4) - 0.12 * negativeValley;

          const px = this.x + Math.cos(theta) * currentBaseRadius * radiusFactor;
          const py = this.y + Math.sin(theta) * currentBaseRadius * radiusFactor;

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ----------------------------------------------------
      // 2. VẼ NHỤY HOA TẢ THỰC CHI TIẾT
      // ----------------------------------------------------
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#FFE600";

      if (this.type === "dao") {
        // NHỤY HOA ĐÀO (Hình mẫu): 18 sợi chỉ nhụy mảnh tỏa tròn có chấm phấn tròn vàng
        const sCount = 18;
        const sLength = 11.5 * easeOutCubic; // Nở rộng theo tỉ lệ hoa
        const rotationOffset = this.progress * 0.15;

        // Vẽ nhụy cái ở tâm
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPistil.coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA(this.centerPistil.coreColor, alpha);
        ctx.fill();

        // Vẽ các tia nhị đực
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
          ctx.arc(endX, endY, 1.3, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, alpha);
          ctx.fill();
        }
      } else if (this.type === "sen") {
        // NHỤY HOA SEN (Đài sen elip dẹt + 7 hạt sen tĩnh nửa trên elip)
        const scale = easeOutCubic;
        const rx = 6.2 * scale; // Bán kính ngang elip đài sen
        const ry = 3.0 * scale; // Bán kính dọc elip đài sen
        const cy = this.y - 1.8 * scale; // Tâm elip hơi lệch lên trên nhụy chút

        // Vẽ viền đài sen (elip dẹt dập dềnh 16 chấm tròn)
        ctx.fillStyle = this.hexToRGBA("#FFE600", alpha);
        const borderDots = 14;
        for (let i = 0; i < borderDots; i++) {
          const t = (i / borderDots) * Math.PI * 2;
          const ex = this.x + rx * Math.cos(t);
          const ey = cy + ry * Math.sin(t);

          ctx.beginPath();
          ctx.arc(ex, ey, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vẽ 7 hạt sen (seeds) tọa độ tĩnh lọt trong nửa trên đài elip
        const staticSeeds = [
          { dx: 0, dy: -1.2 },
          { dx: -2.2, dy: -1.0 }, { dx: 2.2, dy: -1.0 },
          { dx: -4.0, dy: -0.6 }, { dx: 4.0, dy: -0.6 },
          { dx: -1.8, dy: 0.2 }, { dx: 1.8, dy: 0.2 }
        ];

        ctx.fillStyle = this.hexToRGBA("#8FBC8F", alpha); // Hạt sen màu xanh nhạt đạm chất thủy mặc
        staticSeeds.forEach(seed => {
          const sx = this.x + seed.dx * scale;
          const sy = cy + seed.dy * scale;

          ctx.beginPath();
          ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (this.type === "maudon") {
        const mCount = 16;
        const rotationOffset = -this.progress * 0.1;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.centerPistil.coreRadius * 1.0, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRGBA("#FFA500", alpha);
        ctx.fill();

        for (let m = 0; m < mCount; m++) {
          const dist = (3.5 + (m * 0.4)) * easeOutCubic;
          const angle = m * 137.5 * (Math.PI / 180) + rotationOffset;
          const mX = this.x + Math.cos(angle) * dist;
          const mY = this.y + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(mX, mY, 1.1, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.centerPistil.stamenColor, alpha);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5.5, 0, Math.PI * 2);
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

      const dotSize = 1.3 * (1.0 - this.progress * 0.2);

      if (this.type === "dao") {
        // HOA ĐÀO (Hình mẫu): Đúng 1 lớp duy nhất gồm 5 cánh đối xứng trục thẳng đứng (cánh trên hướng 90 độ)
        const dotsCount = 80;
        for (let i = 0; i < dotsCount; i++) {
          const theta = (i / dotsCount) * Math.PI * 2;
          
          // Trục cánh hoa thẳng đứng: xoay theta lệch đi -Math.PI / 2
          const angleForFormula = theta - Math.PI / 2;
          const cos5 = Math.cos(5 * angleForFormula);
          const baseShape = Math.sign(cos5) * Math.pow(Math.abs(cos5), 0.65);
          const notch = Math.cos(10 * angleForFormula);
          
          // Khía V ở đầu cánh làm bán kính r giảm đột ngột (notch)
          const radiusFactor = 1 + 0.32 * baseShape - 0.08 * notch;

          const finalRadius = currentBaseRadius * radiusFactor;
          const dx = this.x + Math.cos(theta) * finalRadius;
          const dy = this.y + Math.sin(theta) * finalRadius;

          ctx.beginPath();
          ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.type === "sen") {
        // HOA SEN (Hình mẫu mới): Cấu trúc 7 cánh uốn lượn cấu tạo bằng các đường cong Bezier bậc 3
        const lotusPetals = [
          // 1. Cánh chính giữa thẳng đứng hướng lên trên
          {
            start: { x: 0, y: 0.25 }, end: { x: 0, y: -0.75 },
            c1Left: { x: -0.28, y: 0.1 }, c2Left: { x: -0.26, y: -0.4 },
            c1Right: { x: 0.28, y: 0.1 }, c2Right: { x: 0.26, y: -0.4 }
          },
          // 2. Cặp cánh bên trên hướng chéo lên
          {
            start: { x: -0.08, y: 0.25 }, end: { x: -0.40, y: -0.60 },
            c1Left: { x: -0.25, y: 0.1 }, c2Left: { x: -0.42, y: -0.30 },
            c1Right: { x: -0.02, y: -0.05 }, c2Right: { x: -0.15, y: -0.45 }
          },
          {
            start: { x: 0.08, y: 0.25 }, end: { x: 0.40, y: -0.60 },
            c1Left: { x: 0.02, y: -0.05 }, c2Left: { x: 0.15, y: -0.45 },
            c1Right: { x: 0.25, y: 0.1 }, c2Right: { x: 0.42, y: -0.30 }
          },
          // 3. Cặp cánh bên giữa nghiêng rộng
          {
            start: { x: -0.15, y: 0.25 }, end: { x: -0.72, y: -0.35 },
            c1Left: { x: -0.45, y: 0.25 }, c2Left: { x: -0.75, y: -0.10 },
            c1Right: { x: -0.05, y: -0.02 }, c2Right: { x: -0.32, y: -0.25 }
          },
          {
            start: { x: 0.15, y: 0.25 }, end: { x: 0.72, y: -0.35 },
            c1Left: { x: 0.05, y: -0.02 }, c2Left: { x: 0.32, y: -0.25 },
            c1Right: { x: 0.45, y: 0.25 }, c2Right: { x: 0.75, y: -0.10 }
          },
          // 4. Cặp cánh ôm dưới cùng xòe ngang dẹt xuống
          {
            start: { x: -0.15, y: 0.25 }, end: { x: -0.85, y: 0.05 },
            c1Left: { x: -0.45, y: 0.38 }, c2Left: { x: -0.75, y: 0.30 },
            c1Right: { x: -0.38, y: 0.15 }, c2Right: { x: -0.76, y: 0.10 }
          },
          {
            start: { x: 0.15, y: 0.25 }, end: { x: 0.85, y: 0.05 },
            c1Left: { x: 0.38, y: 0.15 }, c2Left: { x: 0.76, y: 0.10 },
            c1Right: { x: 0.45, y: 0.38 }, c2Right: { x: 0.75, y: 0.30 }
          }
        ];

        // Rải hạt dọc theo phương trình Bezier cho từng cánh hoa sen
        const stepsPerSide = 12; // 12 hạt cho mỗi nửa cánh hoa
        lotusPetals.forEach(petal => {
          for (let s = 0; s <= stepsPerSide; s++) {
            const t = s / stepsPerSide;
            
            // Vẽ nửa bên trái cánh hoa
            const ptL = getBezierPoint(petal.start, petal.c1Left, petal.c2Left, petal.end, t);
            const lx = this.x + ptL.x * currentBaseRadius;
            const ly = this.y + ptL.y * currentBaseRadius;
            
            ctx.beginPath();
            ctx.arc(lx, ly, dotSize, 0, Math.PI * 2);
            ctx.fill();

            // Vẽ nửa bên phải cánh hoa
            const ptR = getBezierPoint(petal.start, petal.c1Right, petal.c2Right, petal.end, t);
            const rx = this.x + ptR.x * currentBaseRadius;
            const ry = this.y + ptR.y * currentBaseRadius;
            
            ctx.beginPath();
            ctx.arc(rx, ry, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (this.type === "maudon") {
        // HOA MẪU ĐƠN: 2 lớp cánh xếp đè nếp nhăn sóng
        const layers = [
          { scale: 0.78, dots: 65, rot: Math.PI / 8, amp: 0.25 },
          { scale: 1.0, dots: 90, rot: 0, amp: 0.28 }
        ];

        layers.forEach(layer => {
          for (let i = 0; i < layer.dots; i++) {
            const theta = (i / layer.dots) * Math.PI * 2;
            const relativeTheta = theta + layer.rot;
            const cos8 = Math.cos(8 * relativeTheta);
            const baseShape = Math.sign(cos8) * Math.pow(Math.abs(cos8), 0.7);
            const ruffle = Math.sin(16 * relativeTheta);
            const radiusFactor = 1 + layer.amp * baseShape + 0.05 * ruffle;

            const finalRadius = currentBaseRadius * layer.scale * radiusFactor;
            const dx = this.x + Math.cos(theta) * finalRadius;
            const dy = this.y + Math.sin(theta) * finalRadius;

            ctx.beginPath();
            ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else {
        // HOA CÚC: 2 lớp cánh thon mảnh so le
        const layers = [
          { scale: 0.75, dots: 70, rot: Math.PI / 12, amp: 0.42 },
          { scale: 1.0, dots: 96, rot: 0, amp: 0.42 }
        ];

        layers.forEach(layer => {
          for (let i = 0; i < layer.dots; i++) {
            const theta = (i / layer.dots) * Math.PI * 2;
            const relativeTheta = theta + layer.rot;
            const cos12 = Math.cos(12 * relativeTheta);
            const positiveLobe = Math.max(0, cos12);
            const negativeValley = Math.max(0, -cos12);
            const radiusFactor = 1 + layer.amp * Math.pow(positiveLobe, 1.4) - 0.12 * negativeValley;

            const finalRadius = currentBaseRadius * layer.scale * radiusFactor;
            const dx = this.x + Math.cos(theta) * finalRadius;
            const dy = this.y + Math.sin(theta) * finalRadius;

            ctx.beginPath();
            ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        });
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

    // Chọn ngẫu nhiên loại hoa với tỉ lệ bằng nhau (25% mỗi hoa)
    const rand = Math.random();
    let color, numPetals, type;

    if (rand < 0.25) {
      // 25% Hoa Đào (Hồng phấn FFB7B2 chuẩn)
      color = "#FF8EA4"; 
      numPetals = 5;
      type = "dao";
    } else if (rand < 0.50) {
      // 25% Hoa Sen (Hồng sen thắm, 7 cánh Bezier)
      color = "#FF5E8E"; 
      numPetals = 7; // 7 cánh chính diện
      type = "sen";
    } else if (rand < 0.75) {
      // 25% Hoa Mẫu Đơn (Đỏ thắm)
      color = "#FF1F1F"; 
      numPetals = 8;
      type = "maudon";
    } else {
      // 25% Hoa Cúc (Vàng Neon)
      color = "#FFE600"; 
      numPetals = 12;
      type = "cuc";
    }

    inkManager.addEffect(x, y, color, numPetals, type);
  });
});

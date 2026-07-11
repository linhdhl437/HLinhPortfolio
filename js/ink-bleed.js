/* 🎋 Hiệu ứng Mực Loang Thủy Mặc & Gợn Sóng Nước Cao Cấp (Premium Ink Bleed & Water Ripples) */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false
  });
  
  // Tham số vật lý mặc định của mực loang
  const params = {
    sizeScale: 1.0,
    noiseScale: 14,      // Độ méo đường viền của mực loang
    bleedDuration: 2.2,  // Thời gian chạy hiệu ứng loang (2.2 giây)
    rippleCount: 3,      // Số lượng vòng sóng nước nền
  };

  // ----------------------------------------------------
  // CLASS: CLICK EFFECT REPRESENTATION (Mực loang + Gợn sóng)
  // ----------------------------------------------------
  class ClickEffect {
    constructor(x, y, baseMaxRadius, color, scaleX = 1.0, scaleY = 1.0, numVertices = 90, historyLength = 25) {
      this.x = x;
      this.y = y;
      this.maxRadius = baseMaxRadius * params.sizeScale;
      this.color = color;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.numVertices = numVertices;
      this.maxHistoryLength = historyLength;
      this.progress = 0; // Chạy từ 0 đến 1
      
      // Tốc độ cập nhật dựa theo thời gian chạy mong muốn (Bleed Duration)
      this.speed = 0.016 / params.bleedDuration; 

      // Sóng nước phụ trợ (Water Ripples) - mỏng nhẹ làm nền bổ trợ
      this.ripples = [];
      const count = params.rippleCount;
      for (let i = 0; i < count; i++) {
        this.ripples.push({
          delay: (i * 0.16), 
          scale: 0,
          opacity: 0.22 - (i * 0.04)
        });
      }

      // Khởi tạo các sóng hài (harmonics) tạo hình méo ngẫu nhiên cho vòng mực chính
      this.harmonics = [];
      const numHarmonics = 6;
      for (let j = 0; j < numHarmonics; j++) {
        this.harmonics.push({
          amp: Math.random() * 0.16 + 0.05, // Biên độ méo cơ sở
          freq: Math.floor(Math.random() * 6) + 3, // Tần số méo (3 đến 8 đỉnh răng cưa)
          phase: Math.random() * Math.PI * 2, // Pha ban đầu
          spin: (Math.random() - 0.5) * 1.5 // Tốc độ xoắn xoay của nhánh méo khi lan ra
        });
      }

      // Lịch sử vị trí/bán kính để vẽ bóng mờ dần (Fading Trail) trên đường đi
      this.history = [];

      // Hạt bụi mực lấm tấm bắn ra (giảm số lượng trên di động)
      this.particles = [];
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const numParticles = isTouch ? (Math.floor(Math.random() * 3) + 3) : (Math.floor(Math.random() * 6) + 7);
      for (let k = 0; k < numParticles; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.8 + 1.0;
        this.particles.push({
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * speed * this.scaleX,
          vy: Math.sin(angle) * speed * this.scaleY,
          radius: Math.random() * 2.0 + 0.5,
          opacity: 0.8,
          friction: 0.94
        });
      }
    }

    update() {
      this.progress += this.speed;
      
      // Bán kính cơ sở nở ra theo hàm ease-out-cubic
      const easeOutCubic = 1 - Math.pow(1 - this.progress, 3);
      this.currentBaseRadius = this.maxRadius * 0.78 * easeOutCubic;

      // Lưu trạng thái hiện tại vào lịch sử vết bóng mờ
      if (this.progress < 1.0) {
        this.history.push({
          radius: this.currentBaseRadius,
          progress: this.progress,
          phaseOffset: this.progress * 0.6
        });
        if (this.history.length > this.maxHistoryLength) {
          this.history.shift();
        }
      }

      // Cập nhật gợn sóng nước nền
      this.ripples.forEach(r => {
        if (this.progress > r.delay) {
          const p = Math.min(1, (this.progress - r.delay) / (1 - r.delay));
          const easeOutQuart = 1 - Math.pow(1 - p, 4);
          r.scale = easeOutQuart;
          r.opacity = Math.max(0, (1 - p) * 0.22);
        }
      });

      // Cập nhật hạt bụi mực bắn
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.opacity = Math.max(0, 1 - this.progress);
      });
    }

    // Vẽ vòng mực méo theo tham số
    drawRingShape(ctx, baseRadius, phaseOffset, opacity, baseLineWidth) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = this.hexToRGBA(this.color, opacity);
      
      const currentProgress = baseRadius / (this.maxRadius * 0.78);
      ctx.lineWidth = baseLineWidth * (1 - currentProgress * 0.45); // Nét vẽ mảnh dần khi ra xa
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const numVertices = this.numVertices;
      for (let i = 0; i < numVertices; i++) {
        const theta = (i / numVertices) * Math.PI * 2;
        let noise = 0;
        
        this.harmonics.forEach(h => {
          const currentAmp = h.amp * (0.2 + 0.8 * currentProgress);
          noise += currentAmp * Math.sin(h.freq * theta + h.phase + h.spin * phaseOffset);
        });

        const r = baseRadius * (1 + noise);
        const vx = this.x + Math.cos(theta) * r * this.scaleX;
        const vy = this.y + Math.sin(theta) * r * this.scaleY;

        if (i === 0) {
          ctx.moveTo(vx, vy);
        } else {
          ctx.lineTo(vx, vy);
        }
      }

      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    draw(ctx) {
      const mainOpacity = Math.max(0, 1 - this.progress);

      // 1. VẼ VẾT BÓNG MỜ DẦN (Trail History) tạo quầng nước loang mềm
      this.history.forEach((state, idx) => {
        const ageFactor = idx / this.history.length;
        const trailOpacity = mainOpacity * (0.3 + 0.7 * ageFactor) * 0.85;
        if (trailOpacity > 0.01) {
          this.drawRingShape(ctx, state.radius, state.phaseOffset, trailOpacity, 3.2);
        }
      });

      // 2. VẼ VÒNG MỰC CHÍNH ĐANG LAN TỎA (Có viền sắc nét wet-edge)
      if (mainOpacity > 0.01) {
        this.drawRingShape(ctx, this.currentBaseRadius, this.progress * 0.6, mainOpacity, 3.5);
      }

      // 3. VẼ GỢN SÓNG NƯỚC ĐỒNG TÂM (Tròn dẹt Oval đồng bộ)
      this.ripples.forEach(r => {
        if (this.progress > r.delay && r.scale > 0) {
          ctx.save();
          ctx.beginPath();
          const rad = this.maxRadius * r.scale;
          ctx.ellipse(this.x, this.y, rad * this.scaleX, rad * this.scaleY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = this.hexToRGBA(this.color, r.opacity);
          ctx.lineWidth = 0.8 * (1 - r.scale) + 0.15;
          ctx.stroke();
          ctx.restore();
        }
      });

      // 4. VẼ BỤI MỰC BẮN LẤM TẤM
      this.particles.forEach(p => {
        if (p.opacity > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.hexToRGBA(this.color, p.opacity);
          ctx.fill();
          ctx.restore();
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
  // CLASS: INK CANVAS MANAGER (Quản lý Render Loop)
  // ----------------------------------------------------
  class InkCanvasManager {
    constructor() {
      this.canvas = canvas;
      this.ctx = ctx;
      this.effects = [];
      this.rafId = null;
      this.isTabActive = true;
      
      this.resize();
      
      this.resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.resize(), 150);
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isTabActive = false;
          if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
          }
        } else {
          if (!this.isTabActive) {
            this.isTabActive = true;
            if (this.effects.length > 0 && !this.rafId) {
              this.loop();
            }
          }
        }
      });
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      this.ctx.scale(dpr, dpr);
    }

    addEffect(x, y, maxRadius, color, scaleX = 1.0, scaleY = 1.0) {
      // TỐI ƯU HIỆU NĂNG: Nếu click quá nhanh liên tục, tăng tốc phai vệt cũ
      if (this.effects.length >= 3) {
        this.effects.forEach((fx, idx) => {
          if (idx < this.effects.length - 1) {
            fx.speed = fx.speed * 2.2;
          }
        });
      }

      // Khống chế số lượng hiệu ứng vẽ đồng thời để chống quá tải CPU
      if (this.effects.length >= 4) {
        this.effects.shift();
      }

      // Tự thích ứng độ phức tạp đa giác khi click dồn dập (tối ưu mạnh trên di động)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      let numVertices = isTouchDevice ? 40 : 90;
      let historyLength = isTouchDevice ? 12 : 25;

      if (this.effects.length >= 2) {
        numVertices = isTouchDevice ? 25 : 60;
        historyLength = isTouchDevice ? 6 : 8;
      } else if (this.effects.length >= 3) {
        numVertices = isTouchDevice ? 18 : 45;
        historyLength = isTouchDevice ? 3 : 4;
      }

      this.effects.push(new ClickEffect(x, y, maxRadius, color, scaleX, scaleY, numVertices, historyLength));

      // Kích hoạt lại loop nếu đang tạm dừng
      if (!this.rafId && this.isTabActive) {
        this.loop();
      }
    }

    loop() {
      if (!this.isTabActive) return;

      // CANVAS-06: clearRect sử dụng logical width/height để khớp với tọa độ đã scale
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = this.effects.length - 1; i >= 0; i--) {
        const fx = this.effects[i];
        fx.update();
        fx.draw(this.ctx);

        if (fx.isFinished()) {
          this.effects.splice(i, 1);
        }
      }

      // Dừng vòng lặp vẽ nếu không còn hiệu ứng nào
      if (this.effects.length === 0) {
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(() => this.loop());
    }
  }

  // Khởi tạo Ink Canvas Manager toàn cục
  const inkManager = new InkCanvasManager();

  // ----------------------------------------------------
  // LOGIC: ĐO KÍCH THƯỚC PHẦN TỬ & KÍCH HOẠT HIỆU ỨNG (Có Throttle)
  // ----------------------------------------------------
  let lastClickTime = 0;
  const CLICK_THROTTLE_MS = 100; // Ngăn spam click dưới 100ms

  document.addEventListener('pointerdown', (e) => {
    // 1. Kiểm tra Intro video có đang hiển thị không (nếu có thì bỏ qua hiệu ứng)
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
    
    // Bỏ qua nếu nhấn vào setting panel hoặc các thanh trượt
    if (target.closest('#ui-panel') || target.closest('.control-panel') || target.closest('.color-btn')) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const diagonal = Math.sqrt(width * width + height * height);

    let maxRadius = 120; // Bán kính loang mặc định nhỏ gọn cho khoảng không nền
    let color = '#FFB7C5'; // Mặc định
    let scaleX = 1.0;
    let scaleY = 1.0;

    const isInteractive = target && target !== document.body && target !== document.documentElement;

    if (isInteractive) {
      // Tìm phần tử tương tác gần nhất
      const clickTarget = target.closest('a, button, .nav-link, .nav-stage-item, .journey-tab-item, .accordion-header, .timeline-node, .stage-node');
      
      if (clickTarget) {
        const tRect = clickTarget.getBoundingClientRect();
        const tWidth = tRect.width;
        const tHeight = tRect.height;
        const tDiagonal = Math.sqrt(tWidth * tWidth + tHeight * tHeight);

        // Kéo dãn hình học dẹt dạng Oval tương thích kích thước nút
        const maxDim = Math.max(tWidth, tHeight);
        if (maxDim > 0) {
          scaleX = (tWidth / maxDim) * 0.65 + 0.35;
          scaleY = (tHeight / maxDim) * 0.65 + 0.35;
        }

        // Thiết lập kích thước tối đa dựa trên loại nút
        if (clickTarget.tagName === 'A' || clickTarget.tagName === 'BUTTON' || clickTarget.classList.contains('nav-link') || clickTarget.classList.contains('nav-stage-item') || clickTarget.classList.contains('accordion-header')) {
          maxRadius = Math.max(35, tDiagonal * 0.4);
        } else if (clickTarget.classList.contains('journey-tab-item')) {
          maxRadius = Math.max(45, tDiagonal * 0.35);
        } else {
          maxRadius = Math.max(60, tDiagonal * 0.3);
        }

        // Chọn sắc màu thủy mặc tương thích ngữ cảnh hành động
        if (clickTarget.classList.contains('btn-back-sticky') || clickTarget.id === 'btn-back-to-timeline' || clickTarget.classList.contains('btn-skip-intro')) {
          color = '#B3ECEC'; // Xanh nhạt cho các hành động thoái lui/quay lại/bỏ qua
        } else if (clickTarget.classList.contains('nav-stage-item') || clickTarget.classList.contains('nav-link') || clickTarget.classList.contains('journey-tab-item')) {
          color = '#B89047'; // Vàng trầm cổ điển cho các nút liên kết/menu/tab chặng
        } else if (clickTarget.classList.contains('accordion-header')) {
          color = '#B89047'; // Vàng trầm cho tiêu đề accordion
        } else if (clickTarget.classList.contains('btn-classical') || clickTarget.tagName === 'BUTTON') {
          color = '#B3ECEC'; // Xanh nhạt cho các nút bấm chính nổi bật
        } else {
          color = '#B89047'; // Các phần tử tương tác khác màu vàng kim
        }
      } else {
        // Cú click nền trống: chọn ngẫu nhiên trong 3 tông màu chính (Hồng nhạt/cánh sen, Vàng cổ điển, Xanh nhạt)
        const bgColors = ['#FFB7C5', '#E2587F', '#B89047', '#B3ECEC'];
        color = bgColors[Math.floor(Math.random() * bgColors.length)];
      }
    } else {
      // Cú click nền trống: chọn ngẫu nhiên trong 3 tông màu chính (Hồng nhạt/cánh sen, Vàng cổ điển, Xanh nhạt)
      const bgColors = ['#FFB7C5', '#E2587F', '#B89047', '#B3ECEC'];
      color = bgColors[Math.floor(Math.random() * bgColors.length)];
    }

    // Kích hoạt vẽ hiệu ứng lên canvas
    inkManager.addEffect(x, y, maxRadius, color, scaleX, scaleY);
  });
});

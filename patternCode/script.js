/** @format */

(function () {
  // ========== 初始化画布 ==========
  const canvas = document.getElementById("patternCanvas");
  const ctx = canvas.getContext("2d");
  const pointCountSpan = document.getElementById("pointCount");

  // 固定尺寸
  const SIZE = 300;
  canvas.width = SIZE;
  canvas.height = SIZE;

  // ========== 配置参数 ==========
  const MARGIN = 48; // 边距
  const SPACING = (SIZE - 2 * MARGIN) / 2; // 相邻点间隔
  const HOVER_THRESHOLD = 30; // 吸附阈值

  // ========== 生成9个点坐标 ==========
  const points = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = MARGIN + col * SPACING;
      const y = MARGIN + row * SPACING;
      points.push({ x, y, index: row * 3 + col });
    }
  }

  // ========== 状态变量 ==========
  let selectedPoints = []; // 按顺序存储选中的点index
  let currentDrawing = false; // 是否正在绘制中
  let hoverPointIndex = -1; // 当前悬停点的索引
  let lastPointIndex = -1; // 上一个添加的点index
  let linePoints = []; // 存储用于绘制连线的点坐标

  // ========== 初始化小点容器 ==========
  const miniDots = document.getElementById("miniDotsContainer");
  for (let i = 0; i < 9; i++) {
    const dot = document.createElement("div");
    dot.className = "dot-mini";
    miniDots.appendChild(dot);
  }
  const miniDotElements = document.querySelectorAll(".dot-mini");

  // ========== 更新UI组件 ==========
  function updateMiniDots() {
    // 重置所有小点
    miniDotElements.forEach((dot) => dot.classList.remove("active"));
    // 点亮选中的点（按首次出现顺序）
    const uniqueSelected = [...new Set(selectedPoints)];
    uniqueSelected.forEach((index) => {
      if (index >= 0 && index < 9) {
        miniDotElements[index].classList.add("active");
      }
    });
    // 更新计数
    pointCountSpan.textContent = selectedPoints.length;
  }

  // ========== 画布绘制 ==========
  function drawPattern() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // 1. 绘制背景细网格
    ctx.strokeStyle = "rgba(80, 110, 140, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const pos = MARGIN + i * SPACING;
      // 水平线
      ctx.beginPath();
      ctx.moveTo(MARGIN, pos);
      ctx.lineTo(SIZE - MARGIN, pos);
      ctx.strokeStyle = "rgba(100, 140, 180, 0.15)";
      ctx.stroke();
      // 垂直线
      ctx.beginPath();
      ctx.moveTo(pos, MARGIN);
      ctx.lineTo(pos, SIZE - MARGIN);
      ctx.stroke();
    }

    // 2. 绘制已连接线段
    if (linePoints.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = "#8cd9ff";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#3fa0d0";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.moveTo(linePoints[0].x, linePoints[0].y);
      for (let i = 1; i < linePoints.length; i++) {
        ctx.lineTo(linePoints[i].x, linePoints[i].y);
      }
      ctx.stroke();

      // 绘制拖尾半透明辅助线
      if (currentDrawing && hoverPointIndex !== -1 && linePoints.length > 0) {
        const lastPt = linePoints[linePoints.length - 1];
        const hoverPt = points[hoverPointIndex];
        if (lastPt && hoverPt && hoverPointIndex !== lastPointIndex) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(140, 200, 255, 0.5)";
          ctx.lineWidth = 6;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#3fa0d0";
          ctx.moveTo(lastPt.x, lastPt.y);
          ctx.lineTo(hoverPt.x, hoverPt.y);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    }

    // 3. 绘制9个点
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const isSelected = selectedPoints.includes(i);

      // 外发光（选中点大光晕）
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 22, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(110, 210, 240, 0.15)";
        ctx.shadowColor = "#00b8ff";
        ctx.shadowBlur = 25;
        ctx.fill();
      }

      // 点背景
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16, 0, 2 * Math.PI);
      ctx.fillStyle = "#1f2c36";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.fill();

      // 外圈
      ctx.beginPath();
      ctx.arc(p.x, p.y, 15, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? "#72d7ff" : "#526e84";
      ctx.lineWidth = 3;
      ctx.shadowBlur = isSelected ? 18 : 6;
      ctx.shadowColor = isSelected ? "#3cc5ff" : "#1e3f5a";
      ctx.stroke();

      // 内亮点
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? "#b3ecff" : "#809aaf";
      ctx.shadowBlur = 12;
      ctx.shadowColor = isSelected ? "#9ee9ff" : "#305d7a";
      ctx.fill();

      // 显示序号
      if (isSelected) {
        const order = selectedPoints.indexOf(i) + 1;
        if (order > 0) {
          ctx.font = 'bold 14px "Inter", "Segoe UI", monospace';
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#00000050";
          ctx.fillStyle = "#ffffffdd";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(order.toString(), p.x, p.y - 1);
        }
      }
    }
    ctx.shadowBlur = 0;
  }

  // ========== 辅助函数 ==========
  function syncLinePointsFromSelected() {
    linePoints = selectedPoints.map((idx) => points[idx]);
  }

  function clearPattern() {
    selectedPoints = [];
    linePoints = [];
    currentDrawing = false;
    hoverPointIndex = -1;
    lastPointIndex = -1;
    updateMiniDots();
    drawPattern();
  }

  function tryAddPoint(index) {
    if (index === undefined || index === null || index < 0 || index >= 9)
      return false;
    if (!selectedPoints.includes(index)) {
      selectedPoints.push(index);
      lastPointIndex = index;
      syncLinePointsFromSelected();
      updateMiniDots();
      drawPattern();
      return true;
    }
    return false;
  }

  // ========== 坐标转换 ==========
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const canvasDisplayX = clientX - rect.left;
    const canvasDisplayY = clientY - rect.top;

    const canvasX = Math.min(SIZE, Math.max(0, canvasDisplayX * scaleX));
    const canvasY = Math.min(SIZE, Math.max(0, canvasDisplayY * scaleY));
    return { x: canvasX, y: canvasY };
  }

  function getHoverPointIndex(coord, threshold = HOVER_THRESHOLD) {
    let minDist = Infinity;
    let hitIndex = -1;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const dx = p.x - coord.x;
      const dy = p.y - coord.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold && dist < minDist) {
        minDist = dist;
        hitIndex = i;
      }
    }
    return hitIndex;
  }

  // ========== 事件处理 ==========
  function handleStart(e) {
    e.preventDefault();
    const coord = getCanvasCoords(e);
    const idx = getHoverPointIndex(coord, HOVER_THRESHOLD);

    if (idx !== -1) {
      currentDrawing = true;
      if (selectedPoints.length === 0) {
        tryAddPoint(idx);
        hoverPointIndex = idx;
      } else {
        if (!selectedPoints.includes(idx)) {
          hoverPointIndex = idx;
        } else {
          hoverPointIndex = idx;
        }
      }
      drawPattern();
    } else {
      currentDrawing = false;
      hoverPointIndex = -1;
      drawPattern();
    }
  }

  function handleMove(e) {
    if (!currentDrawing) return;
    e.preventDefault();

    const coord = getCanvasCoords(e);
    const idx = getHoverPointIndex(coord, HOVER_THRESHOLD);

    if (idx !== -1 && idx !== lastPointIndex) {
      if (!selectedPoints.includes(idx)) {
        tryAddPoint(idx);
      }
      hoverPointIndex = idx;
    } else if (idx === -1) {
      hoverPointIndex = -1;
    }
    drawPattern();
  }

  function handleEnd(e) {
    e.preventDefault();
    currentDrawing = false;
    hoverPointIndex = -1;
    drawPattern();
  }

  // ========== 事件绑定 ==========
  canvas.addEventListener("mousedown", handleStart);
  canvas.addEventListener("mousemove", handleMove);
  canvas.addEventListener("mouseup", handleEnd);
  canvas.addEventListener("mouseleave", function (e) {
    if (currentDrawing) {
      currentDrawing = false;
      hoverPointIndex = -1;
      drawPattern();
    }
  });

  canvas.addEventListener("touchstart", handleStart, { passive: false });
  canvas.addEventListener("touchmove", handleMove, { passive: false });
  canvas.addEventListener("touchend", handleEnd);
  canvas.addEventListener("touchcancel", handleEnd);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // 清空按钮
  document.getElementById("clearBtn").addEventListener("click", clearPattern);

  // ========== 初始化 ==========
  clearPattern();
})();

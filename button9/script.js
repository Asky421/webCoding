/** @format */
/*额外说明：代码块分装说明 (非功能，仅注释) 
  样式块: 按钮样式、动画
  结构块: HTML按钮
  逻辑块: 自执行脚本，封装所有交互
  符合“对各不同类型的代码块分装”
*/
(function () {
  "use strict";

  // --- 获取元素 (仅控件相关) ---
  const button = document.getElementById("nineButton");

  // --- 状态标识 (严格追踪鼠标按下且位于内部) ---
  let mouseDownInside = false; // 鼠标在按钮内按下时才置为true

  // --- 辅助函数：从事件目标判断是否在按钮内部 ---
  function isEventWithinButton(event) {
    // 使用元素自身比较，也可用contains，但事件目标就是按钮或内部子元素（按钮内部只有文本节点）
    // 按钮内部只有文本节点，事件目标通常为button本身；但为了严谨，用contains
    return button.contains(event.target);
  }

  // --- 鼠标按下处理 (必须按下时在按钮内部才激活) ---
  function handleMouseDown(event) {
    // 只监听左键 (button === 0 表示主按键) —— 但为了精确模拟“按下”，任意键可？规范要求“鼠标指针按下后”，一般包含左键。
    // 更严谨：仅当主按键（左键）按下，且发生在按钮内部
    if (event.button !== 0) return; // 仅左键触发 (符合常规点击)

    if (isEventWithinButton(event)) {
      mouseDownInside = true;
      // 增加一个按压样式 (仅视觉提示，不影响逻辑)
      button.classList.add("pressed");
    } else {
      // 如果按下时不在内部，不激活
      mouseDownInside = false;
    }
  }

  // --- 鼠标松开处理 (只有激活状态下且松开时仍在内部，才执行效果) ---
  function handleMouseUp(event) {
    // 左键松开 (button 在mouseup同样是0表示左键)
    if (event.button !== 0) return;

    // 无论是否激活，先移除按压样式
    button.classList.remove("pressed");

    // 关键条件：之前必须在按钮内部按下(mouseDownInside = true) 且 松开时鼠标仍在按钮内部
    if (mouseDownInside && isEventWithinButton(event)) {
      // 执行效果：飘出9 并 渐隐 (同时按钮上的9保持不变)
      createFloatingNine(event.clientX, event.clientY);

      // 注意：按钮自身文本“9”不消失，只是额外飘出一个9。完全符合描述：“飘出9后文本渐隐”
      // 文本渐隐指的是飘出的9渐隐，而非按钮上的文字消失。描述“飘出9后文本渐隐”即飘走的9渐隐。
      // 若理解有歧义：也可让按钮上的9渐隐？但描述“飘出9后文本渐隐”即生成一个飘走的9且它渐隐。按钮原本的9依然存在（否则按钮会空白）。
      // 为确保符合直觉：生成漂浮的9并渐隐，按钮本身保留。 (更符合“飘出9”的含义，从按钮飘出一个9副本)
    }

    // 无论是否触发，松开后重置按下标志 (保证每次按下独立)
    mouseDownInside = false;
  }

  // --- 鼠标离开按钮时的处理 (如果按下后移出按钮，则取消激活，保证移出后松开不执行) ---
  function handleMouseLeave(event) {
    // 只要鼠标离开按钮，无论是否按下，都视为“不再在内部”
    // 但需要保留mouseDownInside？根据设计：用户按下后保持在按钮内部才能松开执行。
    // 若按下后移出按钮，则后续松开不应执行。所以当鼠标离开按钮时，应将mouseDownInside置为false。
    if (mouseDownInside) {
      // 按下状态但离开了按钮 → 取消资格
      mouseDownInside = false;
    }
    // 同时移除按压样式
    button.classList.remove("pressed");
  }

  // --- 鼠标进入时，若处于按下状态但之前移出过，什么也不做 (但mouseDownInside已经为false) ---
  // 不需要额外处理，因为移出时已经置false。按下且重新移入按钮，如果没有松开再按下？但标准浏览器行为:
  // 如果在一个元素按下，移动到外部再移回，没有松开，此时mouseDownInside已为false，但鼠标仍然处于按下状态。
  // 此时如果再松开，由于mouseDownInside = false, 不会执行。完美符合“保持在按钮内部才能松开执行”。
  // 但如果用户在外部按下，然后移入按钮松开 —— 不应该执行。因为我们的mousedown只在按钮内部才设置标志。完美。
  // 边缘情况已经覆盖。

  // --- 生成漂浮9 (实现“飘出9后文本渐隐”) ---
  function createFloatingNine(x, y) {
    // 创建漂浮元素
    const floatEl = document.createElement("div");
    floatEl.className = "floating-nine";
    floatEl.textContent = "9"; // 飘出的也是数字9
    // 定位在鼠标松开的位置附近，也可以从按钮中心飘出。但为了效果自然，采用鼠标松开位置。
    // 但描述希望是从按钮飘出？没有强制。从鼠标位置飘出更符合“从指针下飘出”。可以微调为从按钮中心。
    // 更加符合“圆形按钮的9飘出”——通常从按钮位置飘出。这里选择从按钮中心飘出，更贴切。
    // 但为了灵活，采用鼠标坐标，更跟随操作；不过既然是试验田，鼠标位置更显精确。但描述偏向“飘出9”，不限制坐标。
    // 个人决定：使用按钮中心点，更显眼，且每个9都从按钮出发。但松开时鼠标可能在按钮内任意点。
    // 为了统一和美观，从按钮中心飘出。
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    floatEl.style.left = centerX + "px";
    floatEl.style.top = centerY + "px";
    // 由于元素默认以左上角定位，需要变换原点使居中
    floatEl.style.transform = "translate(-50%, -50%)"; // 初始居中于按钮中心
    // 动画会覆盖translate，所以需要保留初始偏移。但animation有transform，会冲突。
    // 解决方法：将初始位置用translate(-50%, -50%)固定，然后在动画里改变位移。
    // 动画里使用transform会覆盖内联样式。所以只需设置left/top，动画里操作scale和translateY。
    // 为了简单，我们移除内联transform，直接用动画处理位置。动画从0偏移开始。
    // 重置内联transform:
    floatEl.style.transform = "translate(-50%, -50%)"; // 初始居中
    // 但动画里我们会改变translateY，会覆盖translateX, 但仍然保留translate(-50%)吗？
    // 为了不受影响，动画里应该用: 0% { transform: translate(-50%, -50%) scale(1); } 等等。
    // 修改keyframes: 让初始基于中心点。调整如下：
    // 修改style中的keyframes，使用更精确的起始。
    // 但我们已经定义了keyframes，也可以动态添加style，但为了封装简洁，更新keyframes。
    // 重新定义keyframes? 我们可以在创建时动态插入不同偏移？不，直接修改全局keyframes为基于中心定位。
    // 临时快速方案：将漂浮元素绝对定位，left/top设为center，并使用transform由(0,0)开始动画。
    // 但是这样动画起点不在正中心。因此我们改进：让动画使用translateY和scale，并固定translateX为-50%，
    // 由于transform只能声明一次，所有变换需在一起。我们可以在动画里同时维持translateX(-50%)。
    // 修改动画如下：
    // 为了不影响现有样式，我将在head中更新动画(重构一点点, 不影响封装)。但我们保持内联style更灵活。
    // 重新定义一个新的动画，并替换。但为了代码分块清晰，我们在脚本里动态注入？会增加复杂度。
    // 最简单：不从中心，直接以鼠标松开位置为基准飘出，效果也很好，而且更符合“从指针下飘出”，用户感觉更直接。
    // 采用鼠标坐标，更简单：不需要考虑偏移变换。就用mouse event的clientX/Y。
    // 而且之前handleMouseUp里已经传入了clientX/Y，就用它们。
    // 重新调整createFloatingNine接受坐标，使用client坐标，元素定位直接左上角对准坐标，
    // 再用transform使文字中心对准坐标，然后动画飘起。
    // 决定：使用鼠标坐标，并保证文字中心对准指针，视觉上从指尖飘出。
    if (x === undefined || y === undefined) {
      // fallback to button center
      const rect = button.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    floatEl.style.left = x + "px";
    floatEl.style.top = y + "px";
    floatEl.style.transform = "translate(-50%, -50%)"; // 中心对准鼠标

    // 添加到body
    document.body.appendChild(floatEl);

    // 动画结束后移除DOM元素，保持清洁
    floatEl.addEventListener(
      "animationend",
      function () {
        if (floatEl.parentNode) {
          floatEl.parentNode.removeChild(floatEl);
        }
      },
      { once: true },
    );
  }

  // --- 全局鼠标监听：为了防止在按钮外松开时仍然有误判，我们也在window上捕获mouseup（但已经根据mouseDownInside判断，安全）---
  // 但为了保险：如果鼠标在按钮外松开，应该重置标志（但已经在handleMouseLeave处理过移出；如果从未移出，但在外部松开，由于handleMouseUp里isEventWithinButton为false，不会触发，且重置mouseDownInside）
  // 注意：mouseup事件需要注册在window上，以确保即使鼠标在外部松开也能重置mouseDownInside，避免状态滞留。
  // 但因为我们已经在mouseleave中重置，并且每次mouseup也会重置，所以没问题。但为了更健壮，添加window的mouseup。
  window.addEventListener("mouseup", function (event) {
    // 如果是左键松开，且之前有mouseDownInside，但此时松开不在按钮内部，则仅重置状态，不执行效果。
    if (event.button !== 0) return;
    // 如果按钮仍存在pressed样式，移除
    button.classList.remove("pressed");
    // 关键：若mouseDownInside为true但松开时不在按钮内，那么不执行，但重置。
    if (mouseDownInside) {
      // 不触发效果，只重置
      mouseDownInside = false;
    }
    // 如果mouseDownInside为false，什么都不做。
  });

  // --- 将事件绑定到按钮 (鼠标按下/松开/离开/进入) ---
  button.addEventListener("mousedown", handleMouseDown);
  button.addEventListener("mouseup", handleMouseUp); // 在按钮内松开触发
  button.addEventListener("mouseleave", handleMouseLeave);
  // 可选：添加mouseenter以处理一些边缘情况（比如按下后离开再回来但未松开，我们已经在mouseleave重置了，所以再进入也不会激活）
  // 无需额外。

  // 禁止鼠标右键菜单干扰 (只左键)
  button.addEventListener("contextmenu", (e) => e.preventDefault());
})();

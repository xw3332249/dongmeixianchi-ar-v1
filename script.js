const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  explored: new Set(),
  sound: true,
  actionIndex: 0,
};

const actions = [
  {
    src: 'assets/interactions/xiaoxiu_hold_basket.png',
    title: '捧茶问好',
    tag: '介绍',
    text: '你好呀，我把三江早春茶带来啦，先从这一口清润鲜爽开始认识侗美仙池。',
    model: 'assets/model/xiaoxiu_default.glb',
    modelLabel: '导览3D模型',
    orbit: '150deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_drink_sit.png',
    title: '请你喝茶',
    tag: '品茶',
    text: '请喝一口早春茶，感受清润、鲜爽、回甘。',
    model: 'assets/model/xiaoxiu_interact.glb',
    modelLabel: '互动3D模型',
    orbit: '92deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_leaf_side.png',
    title: '展示茶芽',
    tag: '鲜',
    text: '这片嫩芽来自三江云雾茶山，早春鲜叶让茶汤更清爽。',
    model: 'assets/model/xiaoxiu_interact.glb',
    modelLabel: '互动3D模型',
    orbit: '86deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_wave_full.png',
    title: '挥手互动',
    tag: '互动',
    text: '扫一下海报或包装，就能把我唤醒，跟我一起看茶山和非遗。',
    model: 'assets/model/xiaoxiu_default.glb',
    modelLabel: '导览3D模型',
    orbit: '130deg 70deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_love_basket.png',
    title: '喜欢好茶',
    tag: '喜欢',
    text: '喜欢这杯茶的话，也可以把侗美仙池分享给朋友。',
    model: 'assets/model/xiaoxiu_default.glb',
    modelLabel: '导览3D模型',
    orbit: '150deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_question.png',
    title: '好奇提问',
    tag: '问答',
    text: '想知道这杯茶背后的故事吗？点开茶知识问答试试看。',
    model: 'assets/model/xiaoxiu_interact.glb',
    modelLabel: '互动3D模型',
    orbit: '70deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_pray.png',
    title: '礼貌感谢',
    tag: '感谢',
    text: '谢谢你愿意了解侗美仙池，愿这杯茶把侗乡的春天带给你。',
    model: 'assets/model/xiaoxiu_default.glb',
    modelLabel: '导览3D模型',
    orbit: '150deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_sleepy_basket.png',
    title: '困困小绣',
    tag: '表情',
    text: '采茶很辛苦，但能把好茶带给你，小绣又有精神啦。',
    model: 'assets/model/xiaoxiu_interact.glb',
    modelLabel: '互动3D模型',
    orbit: '110deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_angry_full.png',
    title: '认真守护',
    tag: '非遗',
    text: '传统纹样不能只是装饰，要被看见、被理解、被继续喜欢。',
    model: 'assets/model/xiaoxiu_default.glb',
    modelLabel: '导览3D模型',
    orbit: '150deg 72deg auto'
  },
  {
    src: 'assets/interactions/xiaoxiu_run.png',
    title: '活力奔跑',
    tag: '分享',
    text: '带着三江早春茶去见更多朋友，让好茶和好故事被更多人知道。',
    model: 'assets/model/xiaoxiu_interact.glb',
    modelLabel: '互动3D模型',
    orbit: '95deg 72deg auto'
  }
];

const guideTexts = {
  intro: '先从“听小绣介绍”开始，了解侗美仙池为什么把好茶、非遗与助农放在一起。',
  voice: '你正在听品牌导览：从三江茶山，到侗族纹样，再到助农故事。',
  motion: '你已触发小绣互动：让传统茶文化变得更亲切、更容易分享。',
  culture: '这里可以看懂非遗纹样：它们不只是装饰，而是三江侗乡的文化记忆。',
  support: '这里可以了解助农去向：茶农、手艺人与品牌共同把好茶送到你面前。',
  quiz: '完成小问答，就能领取侗茶体验徽章。',
  reward: '体验徽章已解锁，可以分享给朋友一起认识侗美仙池。',
};

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function setExplored(key) {
  if (key !== 'reward') state.explored.add(key);
  const count = Math.min(state.explored.size, 5);
  $('#progressCount').textContent = `${count}/5`;
  const button = $(`.dock-btn[data-action="${key}"]`);
  if (button) button.classList.add('done');
}

function updateBubble(text) {
  $('#speechBubble').textContent = text;
}

function updateGuide(key) {
  $('#guideText').textContent = guideTexts[key] || guideTexts.intro;
}

function speak(text) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.9;
  utterance.pitch = 1.02;
  window.speechSynthesis.speak(utterance);
}

function openModal(html) {
  $('#modalContent').innerHTML = html;
  const modal = $('#modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function renderInteractionCard(item, index) {
  return `
    <button class="interaction-thumb ${index === state.actionIndex ? 'active' : ''}" data-index="${index}" type="button" aria-label="${item.title}">
      <img src="${item.src}" alt="${item.title}" />
      <span>${item.tag}</span>
    </button>
  `;
}

function showInteractionModal(currentItem) {
  const thumbs = actions.map((item, index) => renderInteractionCard(item, index)).join('');
  openModal(`
    <h3>🧚 和小绣互动</h3>
    <p style="line-height:1.8;color:#4e6357">这里把 3D 人物模型和小绣的平面动作表情结合起来：中间主场景保留可旋转 3D，小弹层展示更丰富的情绪和动作。</p>
    <div class="interaction-showcase">
      <div class="interaction-preview">
        <img id="interactionPreview" src="${currentItem.src}" alt="${currentItem.title}" />
        <div class="interaction-caption">
          <strong id="interactionTitle">${currentItem.title}</strong>
          <span id="interactionText">${currentItem.text}</span>
        </div>
      </div>
      <div>
        <div class="interaction-meta">
          <span>当前展示：<b id="interactionModelLabel">${currentItem.modelLabel}</b></span>
          <span>动作库：${actions.length} 组</span>
        </div>
        <div class="interaction-grid">${thumbs}</div>
        <button id="nextInteraction" class="primary-btn wide" type="button">换一个动作</button>
      </div>
    </div>
  `);

  const applyItem = (index) => {
    state.actionIndex = index;
    const item = actions[index];
    $('#interactionPreview').src = item.src;
    $('#interactionPreview').alt = item.title;
    $('#interactionTitle').textContent = item.title;
    $('#interactionText').textContent = item.text;
    $('#interactionModelLabel').textContent = item.modelLabel;
    $$('.interaction-thumb').forEach(btn => btn.classList.toggle('active', Number(btn.dataset.index) === index));
    applyModelAction(item);
  };

  $$('.interaction-thumb').forEach(btn => {
    btn.addEventListener('click', () => applyItem(Number(btn.dataset.index)));
  });
  $('#nextInteraction').addEventListener('click', () => {
    applyItem((state.actionIndex + 1) % actions.length);
  });
}

function applyModelAction(item) {
  const model = $('#xiaoxiuModel');
  const chip = $('#modelModeChip');
  const stage = $('#modelStage');
  const loader = $('#modelLoader');
  if (model && item.model) {
    const current = model.getAttribute('src');
    if (current !== item.model) {
      if (stage) stage.classList.remove('ready');
      if (loader) {
        loader.classList.remove('error');
        loader.innerHTML = '<span class="loader-ring"></span><strong>正在切换 3D 小绣</strong><small>模型较大，首次切换请等待几秒</small>';
      }
      // 只在用户点击互动时加载第二个模型，避免页面一打开就同时加载两个 GLB。
      model.setAttribute('src', item.model);
    }
    model.setAttribute('camera-orbit', item.orbit || '150deg 72deg auto');
    model.setAttribute('auto-rotate', '');
  }
  if (chip) chip.textContent = `当前：${item.modelLabel}`;
}


function closeModal() {
  const modal = $('#modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function createLeaves() {
  const layer = $('#leafLayer');
  setInterval(() => {
    if (document.hidden) return;
    const leaf = document.createElement('span');
    leaf.className = 'leaf';
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.setProperty('--x', `${(Math.random() - 0.5) * 260}px`);
    leaf.style.animationDuration = `${7 + Math.random() * 7}s`;
    leaf.style.animationDelay = `${Math.random() * 0.8}s`;
    layer.appendChild(leaf);
    setTimeout(() => leaf.remove(), 15000);
  }, 820);
}

function createConfetti() {
  const canvas = $('#arCanvas');
  if (!canvas) return;
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${48 + Math.random() * 8}%`;
    piece.style.top = `${42 + Math.random() * 10}%`;
    piece.style.background = Math.random() > 0.5 ? '#c99a48' : '#4d9b57';
    piece.style.setProperty('--tx', `${(Math.random() - 0.5) * 520}px`);
    piece.style.setProperty('--ty', `${(Math.random() - 0.35) * 360}px`);
    canvas.appendChild(piece);
    setTimeout(() => piece.remove(), 1500);
  }
}

function handleVoice() {
  const text = '你好，我是侗茶小绣。侗美仙池来自广西三江，那里云雾环绕，茶山青绿。我们把早春茶的鲜爽、侗族非遗的纹样和助农的心意放进一杯茶里。希望你喝到好茶，也看见茶背后的人。';
  updateBubble('小绣导览已开始：听见三江茶山、侗族非遗与助农故事。');
  updateGuide('voice');
  setExplored('voice');
  speak(text);
  openModal(`
    <h3>🔊 小绣导览</h3>
    <p style="line-height:1.9;color:#4e6357">${text}</p>
    <div class="value-list">
      <div><strong>你会喝到：</strong>清润鲜爽的三江早春茶。</div>
      <div><strong>你会看到：</strong>侗族纹样、织锦色彩与鼓楼意象。</div>
      <div><strong>你会支持：</strong>茶农种植、非遗传播与侗乡文化被更多人看见。</div>
    </div>
  `);
}

function handleMotion() {
  state.actionIndex = (state.actionIndex + 1) % actions.length;
  const item = actions[state.actionIndex];
  const stage = $('#modelStage');

  if (stage) {
    stage.classList.add('motion');
    setTimeout(() => stage.classList.remove('motion'), 1300);
  }

  applyModelAction(item);
  updateBubble(item.text || '小绣回应了你：拖动中间模型，可以 360° 查看 3D 形象。');
  updateGuide('motion');
  setExplored('motion');
  showToast('小绣互动已触发：3D模型 + 表情动作已切换');
  showInteractionModal(item);
}

function handleCulture() {
  updateBubble('非遗纹样已打开：看见侗族美学如何进入现代茶礼。');
  updateGuide('culture');
  setExplored('culture');
  openModal(`
    <h3>🪡 非遗纹样怎么读？</h3>
    <p style="line-height:1.85;color:#4e6357">侗美仙池不只是把图案印在包装上，而是把侗族服饰、织锦、鼓楼等文化符号转化为现代茶礼的视觉语言。</p>
    <div class="culture-cards">
      <div class="culture-card"><strong>侗族纹样</strong><p>象征祝福、秩序和生活美感，让茶礼更有文化识别。</p></div>
      <div class="culture-card"><strong>鼓楼意象</strong><p>代表三江地域记忆，也让品牌更容易被记住。</p></div>
      <div class="culture-card"><strong>织锦色彩</strong><p>以绿色、蓝色和暖金色呼应茶山、民族服饰和礼品质感。</p></div>
      <div class="culture-card"><strong>小绣 IP</strong><p>把抽象文化变成可互动的角色，让年轻用户更愿意了解和分享。</p></div>
    </div>
  `);
}

function handleSupport() {
  updateBubble('助农去向已打开：这杯茶背后，有茶农、手艺人与品牌一起努力。');
  updateGuide('support');
  setExplored('support');
  openModal(`
    <h3>🌱 一杯茶如何帮助三江？</h3>
    <p style="line-height:1.85;color:#4e6357">侗美仙池希望把“好喝”之外的价值讲清楚：消费者买到好茶，茶农获得稳定支持，非遗手艺也有新的展示和传播机会。</p>
    <div class="value-list">
      <div><strong>茶农：</strong>负责种出高品质早春鲜叶，获得更稳定的销售机会。</div>
      <div><strong>手艺人：</strong>提供纹样、织锦、鼓楼等文化内容，让茶礼更有三江特色。</div>
      <div><strong>品牌：</strong>把好茶、包装、传播和渠道连接起来，让更多人认识侗乡茶。</div>
      <div><strong>消费者：</strong>每一次选择，都不只是买茶，也是支持一份来自三江的善意。</div>
    </div>
  `);
}

function handleQuiz() {
  updateBubble('完成一个小问答，即可领取侗茶体验徽章。');
  updateGuide('quiz');
  setExplored('quiz');
  openModal(`
    <h3>❓ 茶知识问答</h3>
    <p style="line-height:1.8;color:#4e6357">侗美仙池最想传递给用户的三重价值是什么？</p>
    <div class="quiz-options">
      <button class="quiz-option" data-right="true">A. 自然鲜韵、非遗传承、助农增收</button>
      <button class="quiz-option">B. 只追求低价和促销</button>
      <button class="quiz-option">C. 只看包装，不看产地和故事</button>
    </div>
    <p id="quizResult" style="min-height:28px;font-weight:950;color:#0c3d2a"></p>
  `);
  $$('.quiz-option').forEach(option => {
    option.addEventListener('click', () => {
      const result = $('#quizResult');
      if (option.dataset.right) {
        result.textContent = '答对啦！你已解锁“侗茶小绣体验徽章”。';
        setExplored('reward');
        updateBubble('答对啦！侗茶小绣体验徽章已经解锁。');
        createConfetti();
        speak('答对啦，你已经解锁侗茶小绣体验徽章。');
      } else {
        result.textContent = '再想想哦，侗美仙池强调的是自然好茶、非遗文化与助农温度。';
      }
    });
  });
}

function handleReward() {
  updateBubble('恭喜你完成体验，获得侗茶小绣体验徽章。');
  updateGuide('reward');
  setExplored('reward');
  createConfetti();
  openModal(`
    <div class="reward-card">
      <h3>🏅 侗茶小绣体验徽章</h3>
      <img src="assets/badge.png" alt="侗茶体验徽章" />
      <p style="line-height:1.85;color:#4e6357">你已完成侗美仙池数字导览。愿这一杯来自三江的早春茶，把自然鲜韵、非遗之美和助农善意带给你。</p>
      <div class="cert">
        <strong>侗茶体验官</strong>
        <p>已完成：扫码识别 / 小绣导览 / 非遗纹样 / 助农去向 / 茶知识问答</p>
      </div>
    </div>
  `);
}

function handleProduct(name) {
  const details = {
    '早春鲜享装': ['适合日常自饮、办公室分享和家庭常备。', '主打清润鲜爽、轻包装、亲民实用。'],
    '非遗茶礼盒': ['适合节日送礼、企业伴手礼和文化茶礼。', '主打非遗纹样、鼓楼意象、礼品质感。'],
    '小绣文旅纪念款': ['适合景区、展馆、茶博会和游客打卡。', '主打 IP 互动、徽章解锁、年轻化分享。'],
  };
  const [line1, line2] = details[name] || ['这是一款侗美仙池茶礼。', '正式上线可接入商城或小程序购买。'];
  openModal(`
    <h3>🍵 ${name}</h3>
    <div class="value-list">
      <div><strong>适用场景：</strong>${line1}</div>
      <div><strong>产品亮点：</strong>${line2}</div>
      <div><strong>上线建议：</strong>这里可接入微信小程序、淘宝店铺、京东店铺或线下门店导航。</div>
    </div>
  `);
  showToast(`已打开 ${name}`);
}

function startScan() {
  const line = $('#scanLine');
  const success = $('#scanSuccess');
  const button = $('#startScan');
  button.disabled = true;
  button.textContent = '扫描中...';
  line.classList.add('active');
  success.classList.remove('show');
  setTimeout(() => {
    line.classList.remove('active');
    success.classList.add('show');
    button.textContent = '重新扫描';
    button.disabled = false;
    showToast('识别成功，小绣已出现');
    speak('识别成功，侗茶小绣已出现。');
  }, 2100);
  setTimeout(() => {
    document.getElementById('guide').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 2850);
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => observer.observe(el));
}

function initControls() {
  $('#startScan').addEventListener('click', startScan);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', event => {
    if (event.target.id === 'modal') closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
  $('#soundToggle').addEventListener('click', () => {
    state.sound = !state.sound;
    $('#soundToggle').textContent = state.sound ? '语音：开' : '语音：关';
    $('#soundToggle').setAttribute('aria-pressed', String(state.sound));
    if (!state.sound && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });
  $$('.dock-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'voice') handleVoice();
      if (action === 'motion') handleMotion();
      if (action === 'culture') handleCulture();
      if (action === 'support') handleSupport();
      if (action === 'quiz') handleQuiz();
      if (action === 'reward') handleReward();
    });
  });
  $$('[data-action="product"]').forEach(button => {
    button.addEventListener('click', () => handleProduct(button.dataset.name));
  });
  $('#shareBtn').addEventListener('click', async () => {
    const text = '我刚体验了侗美仙池数字茶礼，扫码认识三江早春茶、侗族非遗和助农故事。';
    try {
      if (navigator.share) await navigator.share({ title: '侗美仙池', text, url: location.href });
      else await navigator.clipboard.writeText(location.href);
      showToast('链接已准备好分享');
    } catch {
      showToast('分享已取消');
    }
  });
  $('#saveBtn').addEventListener('click', () => showToast('已收藏到你的茶礼清单'));
}

function initParallax() {
  const canvas = $('#arCanvas');
  const modelStage = $('#modelStage');
  const bubble = $('#speechBubble');
  if (!canvas || !bubble) return;
  canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (modelStage) {
      modelStage.style.marginLeft = (x * 18) + 'px';
      modelStage.style.marginBottom = (y * -10) + 'px';
    }
    bubble.style.transform = 'translateX(calc(-50% + ' + (x * -12) + 'px))';
  });
  canvas.addEventListener('mouseleave', () => {
    if (modelStage) {
      modelStage.style.marginLeft = '';
      modelStage.style.marginBottom = '';
    }
    bubble.style.transform = 'translateX(-50%)';
  });
}

function initModelViewer() {
  const stage = $('#modelStage');
  const model = $('#xiaoxiuModel');
  const loader = $('#modelLoader');
  if (!stage || !model || !loader) return;

  model.addEventListener('load', () => {
    stage.classList.add('ready');
    model.setAttribute('camera-orbit', model.dataset.frontOrbit || '150deg 72deg auto');
    loader.classList.remove('error');
    loader.innerHTML = '<span class="loader-ring"></span><strong>正在加载 3D 小绣</strong><small>加载完成后可拖动旋转、放大查看</small>';
    showToast('3D 小绣加载完成，可以拖动旋转查看');
  });

  model.addEventListener('error', () => {
    loader.classList.add('error');
    loader.innerHTML = '<strong>3D 模型暂未加载成功</strong><small>请检查 assets/model/xiaoxiu_default.glb 与 xiaoxiu_interact.glb 是否已上传，或刷新页面重试。</small>';
  });

  setTimeout(() => {
    if (!customElements.get('model-viewer') && loader) {
      loader.classList.add('error');
      loader.innerHTML = '<strong>3D 组件未加载</strong><small>当前网络未能加载 model-viewer 组件。请刷新，或稍后再试。</small>';
    }
  }, 6000);
}

function initModelViewActions() {
  const model = $('#xiaoxiuModel');
  const stage = $('#modelStage');
  if (!model) return;
  const viewMap = {
    front: model.dataset.frontOrbit || '150deg 72deg auto',
    side: model.dataset.sideOrbit || '86deg 72deg auto',
    back: model.dataset.backOrbit || '-28deg 72deg auto',
  };
  $$('.model-view-actions button').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      model.setAttribute('auto-rotate', '');
      model.setAttribute('camera-orbit', viewMap[view] || viewMap.front);
      $$('.model-view-actions button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      if (stage) {
        stage.classList.add('switching');
        setTimeout(() => stage.classList.remove('switching'), 650);
      }
      const label = view === 'front' ? '正面' : view === 'side' ? '侧面' : '背面';
      updateBubble(`已切换到 3D 小绣${label}视角，你可以继续拖动查看细节。`);
      showToast(`已切换 ${label} 视角`);
    });
  });
}

function initHotspots() {
  $$('.hotspot').forEach(hotspot => {
    hotspot.addEventListener('click', () => {
      const tip = hotspot.dataset.tip || '';
      updateBubble(tip);
      showToast(tip);
    });
  });
}

createLeaves();
initReveal();
initControls();
initParallax();
initModelViewer();
initModelViewActions();
initHotspots();

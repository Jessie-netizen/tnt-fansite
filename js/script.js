/* ============================================
   时代少年团 TNT 追星网站 - 主脚本
   ============================================ */

// ---- DOM 就绪 ----
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initCustomCursor();
  initNavbar();
  initScrollReveal();
  initParallax();
  initGalleryFilter();
  initRippleEffect();
  initThemeToggle();
  initBackToTop();
  initMobileMenu();
  initFormSubmit();
  initSmoothScroll();
  initMemberModal();
  initLightbox();
  initGalleryUpload();
  initMusicPlayer();
});

// ==================== 页面加载动画 ====================
function initLoader() {
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1500);
  });
}

// ==================== 流星夜空背景 ====================
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let meteors = [];
  let animFrameId;
  let flashAlpha = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 星星 - 静止闪烁
  class Star {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.5;
      this.baseAlpha = Math.random() * 0.7 + 0.3;
      this.twinkleSpeed = Math.random() * 0.03 + 0.008;
      this.twinkleOffset = Math.random() * Math.PI * 2;
      this.hue = Math.random() < 0.15 ? 50 : 200 + Math.random() * 60;
    }
    draw(time) {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const dim = isDark ? 1 : 0.4;
      const alpha = (this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3) * dim;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 60%, 80%, ${Math.max(0, alpha)})`;
      ctx.fill();
    }
  }

  // 流星
  class Meteor {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      this.y = initial ? Math.random() * canvas.height : -20;
      this.length = Math.random() * 80 + 60;
      this.speed = Math.random() * 6 + 4;
      this.angle = (Math.random() * 30 + 20) * (Math.PI / 180);
      this.opacity = 0;
      this.fadeIn = true;
      this.trail = [];
      this.maxTrail = 20;
      this.life = 0;
      this.maxLife = Math.random() * 60 + 80;
      this.hue = Math.random() < 0.3 ? 50 : 200 + Math.random() * 40;
    }
    update() {
      this.life++;
      if (this.fadeIn) {
        this.opacity = Math.min(1, this.opacity + 0.05);
        if (this.opacity >= 1) this.fadeIn = false;
      }
      if (this.life > this.maxLife * 0.7) {
        this.opacity = Math.max(0, this.opacity - 0.03);
      }

      this.trail.push({ x: this.x, y: this.y, alpha: this.opacity });
      if (this.trail.length > this.maxTrail) this.trail.shift();

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (this.y > canvas.height + 50 || this.x > canvas.width + 50 || this.opacity <= 0) {
        this.reset(false);
      }
    }
    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const dim = isDark ? 1 : 0.5;
      if (this.opacity <= 0.01) return;

      // 绘制拖尾
      if (this.trail.length > 1) {
        for (let i = 1; i < this.trail.length; i++) {
          const t = this.trail[i];
          const prev = this.trail[i - 1];
          const alpha = (i / this.trail.length) * this.opacity * 0.4 * dim;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(t.x, t.y);
          ctx.strokeStyle = `hsla(${this.hue}, 80%, 70%, ${alpha})`;
          ctx.lineWidth = i / this.trail.length * 2;
          ctx.stroke();
        }
      }

      // 绘制流星头部
      const gradient = ctx.createLinearGradient(
        this.x, this.y,
        this.x - Math.cos(this.angle) * this.length,
        this.y - Math.sin(this.angle) * this.length
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 90%, ${this.opacity * dim})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0)`);

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.length,
        this.y - Math.sin(this.angle) * this.length
      );
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 流星头部光点
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 95%, ${this.opacity * dim})`;
      ctx.fill();
    }
  }

  const starCount = Math.min(120, Math.floor(window.innerWidth * 0.1));
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }

  // 初始流星
  for (let i = 0; i < 2; i++) {
    meteors.push(new Meteor());
  }

  let time = 0;
  let meteorTimer = 0;

  function animate() {
    time++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // 绘制星星
    stars.forEach(s => s.draw(time));

    // 偶尔全局闪烁
    if (isDark && Math.random() < 0.003) {
      flashAlpha = 0.15;
    }
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 240, ${flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      flashAlpha = Math.max(0, flashAlpha - 0.005);
    }

    // 绘制和更新流星
    meteors.forEach(m => {
      m.update();
      m.draw();
    });

    // 随机生成新流星
    meteorTimer++;
    if (meteorTimer > 80 + Math.random() * 180) {
      meteorTimer = 0;
      if (meteors.length < 4) {
        meteors.push(new Meteor());
      }
    }

    // 清理死流星
    meteors = meteors.filter(m => m.opacity > 0 && m.y < canvas.height + 100);

    // 保证至少有一个流星在途中
    if (meteors.length === 0) {
      meteors.push(new Meteor());
    }

    animFrameId = requestAnimationFrame(animate);
  }
  animate();
}

// ==================== 自定义光标 ====================
function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('customCursor');
  const trail = document.getElementById('cursorTrail');
  if (!cursor || !trail) return;

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // 悬停可交互元素时光标变大
  const interactive = 'a, button, .btn, input, textarea, .gallery-item, .member-card, .playlist-item, .filter-btn, .about-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) {
      cursor.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) {
      cursor.classList.remove('hover');
    }
  });
}

// ==================== 导航栏滚动效果 ====================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // 导航栏渐变
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // 活跃导航项
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  });
}

// ==================== 滚动显示动画 ====================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => observer.observe(el));
}

// ==================== 视差滚动 ====================
function initParallax() {
  const parallaxBg = document.querySelector('.hero-parallax-bg');
  if (!parallaxBg) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    parallaxBg.style.transform = `translateY(${scrolled * 0.4}px)`;
  });
}

// ==================== 相册筛选 ====================
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeInScale 0.4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

// 淡入缩放动画注入
const fadeInScaleStyle = document.createElement('style');
fadeInScaleStyle.textContent = `
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(fadeInScaleStyle);

// ==================== 音乐播放器（QQ音乐链接） ====================
function initMusicPlayer() {
  const playlistItems = document.querySelectorAll('.music-playlist .playlist-item');
  const playLink = document.getElementById('musicPlayLink');
  const titleEl = document.getElementById('musicTitle');

  if (!playlistItems.length) return;

  playlistItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // 更新活跃状态
      playlistItems.forEach(el => el.classList.remove('active'));
      this.classList.add('active');

      // 更新播放按钮链接和标题
      if (playLink && titleEl) {
        playLink.href = this.href;
        titleEl.textContent = this.getAttribute('data-title') || '';
      }
    });
  });
}

// ==================== 涟漪效果 ====================
function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const rippleBtn = e.target.closest('.ripple-btn');
    if (!rippleBtn) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = rippleBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    rippleBtn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ==================== 主题切换 ====================
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  const icon = toggleBtn.querySelector('i');

  // 从 localStorage 读取
  const savedTheme = localStorage.getItem('tnt-theme');
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    icon.className = 'fas fa-sun';
  }

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const isLight = current === 'light';

    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      icon.className = 'fas fa-moon';
      localStorage.setItem('tnt-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      icon.className = 'fas fa-sun';
      localStorage.setItem('tnt-theme', 'light');
    }

    // 派发主题变更事件
    window.dispatchEvent(new Event('themeChanged'));
  });
}

// ==================== 回到顶部 ====================
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==================== 移动端菜单 ====================
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// ==================== 表单提交 ====================
function initFormSubmit() {
  const form = document.getElementById('supportForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> 发送成功！';
    btn.style.background = 'linear-gradient(135deg, #00b894, #55efc4)';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      form.reset();
    }, 2000);
  });
}

// ==================== 平滑滚动 ====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ==================== 成员详情弹窗 ====================
const memberData = [
  {
    id: 0,
    photo: 'https://aka.doubaocdn.com/s/VGvl1wmG5g',
    name: '马嘉祺',
    role: '队长 · 主唱',
    color: '#9A91F2',
    gradient: 'linear-gradient(135deg, #EAF2FF, #9A91F2)',
    colorName: '月白星紫',
    birth: '2002年12月12日',
    birthplace: '河南郑州',
    height: '180cm',
    position: '队长、主唱、全能ACE',
    weibo: 'https://weibo.com/u/6290114447',
    douyin: 'https://www.douyin.com/user/91210716168',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E9%A9%AC%E5%98%89%E7%A5%BA&t=song',
    tags: ['温柔细腻', '唱功扎实', '钢琴王子', '少年感'],
    intro: '时代少年团队长，拥有清澈温柔的嗓音和扎实的唱功。从小学习钢琴，音乐素养极高，舞台表现力极强，是团队公认的全能ACE。性格温柔细腻，对队员照顾有加，是团队最可靠的大家长。',
    experience: '2017年加入TF家族成为练习生，凭借出色的唱功和舞台表现力迅速崭露头角。2019年11月23日，作为时代少年团队长正式出道。先后参加了《我是唱作人》《声生不息·宝岛季》等音乐节目，展现了卓越的音乐才华。2024年举办个人首场音乐会，获得广泛好评。',
    highlights: '《我是唱作人》人气选手、《声生不息·宝岛季》常驻嘉宾、个人音乐会'  },
  {
    id: 1,
    photo: 'https://aka.doubaocdn.com/s/uFBH1wmG5h',
    name: '丁程鑫',
    role: '主舞 · 门面',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFF8DC, #FFD700)',
    colorName: '金色',
    birth: '2002年2月24日',
    birthplace: '四川资阳',
    height: '181cm',
    position: '主舞、门面担当',
    weibo: 'https://weibo.com/u/5781292544',
    douyin: 'https://www.douyin.com/user/78311158830',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E4%B8%81%E7%A8%8B%E9%91%AB&t=song',
    tags: ['舞蹈王者', '颜值担当', '阳光开朗', '舞台焦点'],
    intro: '时代少年团主舞兼门面担当，舞蹈实力在团队中首屈一指。自2013年加入TF家族，是团队中练习时间最长的成员，有着扎实的舞蹈功底和出色的舞台表现力。性格阳光开朗，是团队的活力源泉。',
    experience: '2013年成为TF家族练习生，经历了长达六年的练习生涯。2019年随时代少年团正式出道，凭借出色的舞蹈实力和帅气外形迅速走红。参演影视剧《甜蜜的你》，参与《你好，星期六》等综艺节目录制，展现了多面魅力。',
    highlights: 'TF家族最长练习生、参演《甜蜜的你》、《你好，星期六》嘉宾'
  },
  {
    id: 2,
    photo: 'https://aka.doubaocdn.com/s/9FHA1wmG5i',
    name: '宋亚轩',
    role: '主唱 · 综艺担当',
    color: '#63C5DE',
    gradient: 'linear-gradient(135deg, #E1F5FA, #63C5DE)',
    colorName: '浅空天胧',
    birth: '2004年3月4日',
    birthplace: '山东滨州',
    height: '183cm',
    position: '主唱、综艺担当',
    weibo: 'https://weibo.com/u/6015189526',
    douyin: 'https://www.douyin.com/user/SYXxxx0304',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E5%AE%8B%E4%BA%9A%E8%BD%A9&t=song',
    tags: ['治愈嗓音', '综艺感满分', '笑容治愈', '人气小太阳'],
    intro: '时代少年团主唱之一，拥有清澈独特的嗓音，被誉为"人间百灵鸟"。笑容治愈，性格开朗活泼，综艺感满分，是团队中的人气担当。舞台上专注认真，舞台下可爱搞怪，反差魅力圈粉无数。',
    experience: '2016年加入TF家族，2019年随时代少年团正式出道。凭借出色的唱功和综艺感，先后参加《王牌对王牌》《奔跑吧》《萌探探探案》等热门综艺，成为新生代最具综艺感的偶像之一。',
    highlights: '《王牌对王牌》常驻、个人单曲《5:23PM》、综艺人气王'
  },
  {
    id: 3,
    photo: 'https://aka.doubaocdn.com/s/ZAYA1wmG5j',
    name: '刘耀文',
    role: 'Rapper · 舞担',
    color: '#A1A3A6',
    gradient: 'linear-gradient(135deg, #FFFFFF, #A1A3A6, #D1D1D1)',
    colorName: '耀月银白',
    birth: '2005年9月23日',
    birthplace: '重庆',
    height: '185cm',
    position: 'Rapper、舞担、忙内',
    weibo: 'https://weibo.com/u/6177367279',
    douyin: 'https://www.douyin.com/user/69074181673',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E5%88%98%E8%80%80%E6%96%87&t=song',
    tags: ['低音炮Rap', '狼系少年', '舞台炸裂', '霸气忙内'],
    intro: '时代少年团最小的成员，也是团队中身高最高的成员。拥有独特的低音炮嗓音，Rap实力炸裂全场。舞台上的他霸气十足，舞台下却是个可爱的弟弟，反差萌让人无法抗拒。',
    experience: '2017年加入TF家族，2019年随时代少年团正式出道。作为团队忙内，成长速度惊人，从青涩少年蜕变为舞台王者。参与团队多首热门歌曲的Rap创作，展现了出色的音乐才华。',
    highlights: '低音炮Rap担当、团队身高担当、从练习生到舞台王者的蜕变'
  },
  {
    id: 4,
    photo: 'https://aka.doubaocdn.com/s/nhHG1wmG5t',
    name: '张真源',
    role: '主唱 · 创作',
    color: '#f98d74',
    gradient: 'linear-gradient(135deg, #c0ebd7, #f98d74)',
    colorName: '水玉暖炽',
    birth: '2003年4月16日',
    birthplace: '重庆',
    height: '182cm',
    position: '主唱、创作担当',
    weibo: 'https://weibo.com/u/5908064369',
    douyin: 'https://www.douyin.com/user/29832527783',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E5%BC%A0%E7%9C%9F%E6%BA%90&t=song',
    tags: ['音域宽广', '温柔沉稳', '实力唱将', '创作才子'],
    intro: '时代少年团主唱之一，拥有宽广的音域和扎实的唱功。性格温柔沉稳，是团队中不可或缺的实力派。无论是高音的爆发力还是低音的细腻度，都能完美驾驭。',
    experience: '2015年加入TF家族，2019年随时代少年团正式出道。在团队音乐作品中展现了出色的演唱实力，同时参与歌曲创作，展现了全能音乐人的潜力。',
    highlights: '音域最广成员、参与团队歌曲创作、温柔沉稳的实力派'
  },
  {
    id: 5,
    photo: 'https://aka.doubaocdn.com/s/0C3H1wmG5u',
    name: '严浩翔',
    role: 'Rapper · 创作',
    color: '#FF5546',
    gradient: 'linear-gradient(135deg, #FF8A80, #FF5546)',
    colorName: '珊瑚红',
    birth: '2004年8月16日',
    birthplace: '广东广州',
    height: '182cm',
    position: 'Rapper、创作担当',
    weibo: 'https://weibo.com/u/6400910960',
    douyin: 'https://www.douyin.com/user/26823758580',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E4%B8%A5%E6%B5%A9%E7%BF%94&t=song',
    tags: ['Rap创作', '舞台炸裂', '全能艺人', '音乐才子'],
    intro: '时代少年团Rapper兼创作担当，Rap创作实力超群。拥有独特的音乐审美和创作能力，是团队中的全能创作型艺人。舞台表现力炸裂，每一次表演都能点燃全场。',
    experience: '2015年加入TF家族，2019年随时代少年团正式出道。参与多首团队歌曲的Rap词曲创作，展现了出色的原创音乐才华。在音乐创作道路上不断探索，是团队中不可或缺的音乐力量。',
    highlights: '原创Rap词曲创作、舞台表现力炸裂、全能创作型艺人'
  },
  {
    id: 6,
    photo: 'https://aka.doubaocdn.com/s/GUY41wmG5u',
    name: '贺峻霖',
    role: '舞担 · 综艺',
    color: '#ADD5A2',
    gradient: 'linear-gradient(135deg, #E8F5E9, #ADD5A2)',
    colorName: '春海明月',
    birth: '2004年6月15日',
    birthplace: '四川成都',
    height: '178cm',
    position: '舞担、综艺担当',
    weibo: 'https://weibo.com/u/6405901418',
    douyin: 'https://www.douyin.com/user/50417803600',
    qqmusic: 'https://y.qq.com/n/ryqq/search?w=%E8%B4%BA%E5%B3%BB%E9%9C%96&t=song',
    tags: ['舞蹈灵动', '口才出众', '机灵可爱', '快乐源泉'],
    intro: '时代少年团舞担之一，舞蹈灵动有范，动作干净利落。口才出众，机灵可爱，是团队的快乐源泉和综艺担当。在舞台上魅力四射，在综艺中金句频出，深受粉丝喜爱。',
    experience: '2015年加入TF家族，2019年随时代少年团正式出道。凭借出色的舞蹈实力和综艺感，在团队中扮演着不可或缺的角色。参与多档综艺节目录制，展现了超强的口才和反应能力。',
    highlights: '舞蹈灵动有范、综艺金句频出、团队的快乐源泉'
  }
];

function initMemberModal() {
  const modal = document.getElementById('memberModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const memberCards = document.querySelectorAll('.member-card');

  // 点击成员卡片
  memberCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index < memberData.length) {
        openModal(memberData[index]);
      }
    });
  });

  // 关闭弹窗
  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.member-modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function openModal(member) {
    modalBody.innerHTML = `
      <div class="member-detail-header" style="background: ${member.gradient};">
        <div class="member-detail-avatar">
          <img src="${member.photo}" alt="${member.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        </div>
      </div>
      <div class="member-detail-info">
        <h2 class="member-detail-name">${member.name}</h2>
        <p class="member-detail-role">${member.role} · 应援色：${member.colorName}</p>
        <div class="member-detail-stats">
          <div class="member-detail-stat">
            <div class="member-detail-stat-label">生日</div>
            <div class="member-detail-stat-value">${member.birth}</div>
          </div>
          <div class="member-detail-stat">
            <div class="member-detail-stat-label">出生地</div>
            <div class="member-detail-stat-value">${member.birthplace}</div>
          </div>
          <div class="member-detail-stat">
            <div class="member-detail-stat-label">身高</div>
            <div class="member-detail-stat-value">${member.height}</div>
          </div>
          <div class="member-detail-stat">
            <div class="member-detail-stat-label">定位</div>
            <div class="member-detail-stat-value">${member.position}</div>
          </div>
        </div>
        <div class="member-detail-section">
          <h4><i class="fas fa-star"></i> 个人简介</h4>
          <p>${member.intro}</p>
        </div>
        <div class="member-detail-section">
          <h4><i class="fas fa-history"></i> 演艺经历</h4>
          <p>${member.experience}</p>
        </div>
        <div class="member-detail-section">
          <h4><i class="fas fa-trophy"></i> 高光时刻</h4>
          <p>${member.highlights}</p>
        </div>
        <div class="member-detail-tags">
          ${member.tags.map(tag => `<span class="member-detail-tag">#${tag}</span>`).join('')}
        </div>
        <div class="member-detail-links">
          <a href="${member.weibo}" target="_blank" class="member-detail-link">
            <i class="fab fa-weibo"></i> 微博
          </a>
          <a href="${member.douyin}" target="_blank" class="member-detail-link">
            <i class="fab fa-tiktok"></i> 抖音
          </a>
          <a href="${member.qqmusic}" target="_blank" class="member-detail-link">
            <i class="fas fa-music"></i> QQ音乐
          </a>
        </div>
      </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.member-modal-container').scrollTop = 0;
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==================== 图片灯箱 ====================
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const overlay = lightbox.querySelector('.lightbox-overlay');

  let currentImages = [];
  let currentIndex = 0;

  function getGalleryImages() {
    const items = document.querySelectorAll('.gallery-item:not(.hidden) .gallery-img img');
    return Array.from(items);
  }

  function openLightbox(img, index) {
    currentImages = getGalleryImages();
    currentIndex = index !== undefined ? index : currentImages.indexOf(img);
    if (currentIndex < 0) currentIndex = 0;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateLightbox() {
    if (currentImages.length === 0) return;
    const img = currentImages[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxPrev.style.display = currentImages.length > 1 ? 'flex' : 'none';
    lightboxNext.style.display = currentImages.length > 1 ? 'flex' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prevImage() {
    if (currentImages.length === 0) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateLightbox();
  }

  function nextImage() {
    if (currentImages.length === 0) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateLightbox();
  }

  // 点击相册图片打开灯箱
  document.getElementById('galleryGrid').addEventListener('click', (e) => {
    const img = e.target.closest('.gallery-img img');
    if (!img) return;
    e.preventDefault();
    const images = getGalleryImages();
    const index = images.indexOf(img);
    openLightbox(img, index);
  });

  lightboxClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
}

// ==================== 访客上传图片 ====================
function initGalleryUpload() {
  const uploadInput = document.getElementById('galleryUpload');
  const galleryGrid = document.getElementById('galleryGrid');

  uploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', 'upload');
        item.setAttribute('data-reveal', '');
        item.innerHTML = `
          <div class="gallery-img">
            <img src="${ev.target.result}" alt="${file.name}" loading="lazy">
          </div>
          <div class="gallery-overlay">
            <h4>粉丝投稿</h4>
            <p>${file.name}</p>
          </div>
        `;
        galleryGrid.appendChild(item);
        // 触发淡入动画
        item.style.animation = 'fadeInScale 0.5s ease forwards';
        // 标记为已展示
        item.classList.add('revealed');
      };
      reader.readAsDataURL(file);
    });

    // 重置上传框，允许重复上传同一文件
    uploadInput.value = '';
  });
}
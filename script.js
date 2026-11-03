/**
 * Алексей Ходеев — Персональный сайт бизнес-тренера
 * Интерактивная логика: частицы на Canvas, Scrollspy, фильтрация программ, модальные окна
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. АНИМАЦИЯ ХОЛСТА В HERO (Интерактивные частицы)
  // ==========================================
  const canvas = document.getElementById('hero-particles-canvas');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isCanvasVisible = false;
    let particles = [];
    let canvasRect = canvas.getBoundingClientRect();
    const mouse = { x: -1000, y: -1000, radius: 130 };

    const PARTICLE_COUNT = 50;
    const CONNECT_DISTANCE = 115;

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = init ? Math.random() * width : Math.random() * width;
        this.y = init ? Math.random() * height : (Math.random() < 0.5 ? -10 : height + 10);
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2.2 + 1.2;
        // Палитра частиц: сапфировый (#2563EB) и теплый янтарный (#D97706)
        this.isAccent = Math.random() < 0.35;
        this.baseAlpha = Math.random() * 0.35 + 0.15;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Отскок от краев
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Взаимодействие с курсором мыши (плавное отклонение)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2.5;
          this.y -= Math.sin(angle) * force * 2.5;
          this.alpha = Math.min(0.8, this.baseAlpha + force * 0.4);
        } else {
          this.alpha += (this.baseAlpha - this.alpha) * 0.05;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.isAccent) {
          ctx.fillStyle = `rgba(217, 130, 20, ${this.alpha})`; // Янтарно-золотой
        } else {
          ctx.fillStyle = `rgba(31, 115, 68, ${this.alpha})`; // Насыщенный болотный зеленый
        }
        ctx.fill();
      }
    }

    function updateCanvasRect() {
      if (canvas) {
        canvasRect = canvas.getBoundingClientRect();
      }
    }

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      updateCanvasRect();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      particles = [];
      const count = Math.min(PARTICLE_COUNT, Math.floor((width * height) / 14000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      if (!isCanvasVisible) return;
      ctx.clearRect(0, 0, width, height);

      // Живые плавные моушн-волны (Kinetic Aurora Ribbons)
      const time = performance.now() * 0.00075;
      
      // Волна 1: Насыщенный моховой изумруд
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      for (let x = 0; x <= width; x += 12) {
        const y = height * 0.65 + Math.sin(x * 0.003 + time) * 36 + Math.cos(x * 0.006 + time * 0.7) * 22;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(30, 112, 68, 0.22)';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Волна 2: Шелковистый живой зеленый шлейф
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      for (let x = 0; x <= width; x += 12) {
        const y = height * 0.72 + Math.sin(x * 0.004 - time * 0.8) * 44 + Math.sin(x * 0.008 + time * 1.2) * 16;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(46, 168, 102, 0.18)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Волна 3: Теплый золотисто-янтарный контур
      ctx.beginPath();
      ctx.moveTo(0, height * 0.58);
      for (let x = 0; x <= width; x += 12) {
        const y = height * 0.58 + Math.cos(x * 0.0035 + time * 1.1) * 30 + Math.sin(x * 0.005 - time * 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(217, 130, 20, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Отрисовка соединительных линий
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < CONNECT_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECT_DISTANCE) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(31, 115, 68, ${lineAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Отрисовка частиц
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    // Debounced resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 120);
    });
    window.addEventListener('scroll', updateCanvasRect, { passive: true });

    resizeCanvas();

    // IntersectionObserver для паузы анимации вне экрана
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isCanvasVisible = true;
          updateCanvasRect();
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          isCanvasVisible = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    heroObserver.observe(canvas.parentElement || canvas);

    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        // Используем закешированный rect для устранения Forced Synchronous Layout
        mouse.x = e.clientX - canvasRect.left;
        mouse.y = e.clientY - canvasRect.top;
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });
    }
  }

  // ==========================================
  // 2. ОДНОСТРАНИЧНАЯ ПЛАВНАЯ НАВИГАЦИЯ И SCROLLSPY
  // ==========================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mainHeader = document.querySelector('.header, .main-header');

  // Эффект тени у липкого хедера при скролле
  if (mainHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // =========================================================================
  // Плавный скролл по якорным ссылкам в шапке и кнопках
  // Натуральный браузерный скролл: без примагничивания и вмешательства в ручную прокрутку
  // =========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerH = mainHeader ? mainHeader.getBoundingClientRect().height : 68;
        const top = targetEl.getBoundingClientRect().top + window.scrollY;
        const targetY = targetId === '#hero' ? 0 : Math.max(0, Math.round(top - headerH));

        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // Scrollspy через IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  function setNavActive(id) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    if (window.scrollY < 80) {
      setNavActive('hero');
      return;
    }

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setNavActive(id);
      }
    });
  }, observerOptions);

  window.addEventListener('scroll', () => {
    if (window.scrollY < 80) {
      setNavActive('hero');
    }
  }, { passive: true });

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // ==========================================
  // 3. ФИЛЬТРАЦИЯ КАРТОЧЕК ТРЕНИНГОВ
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const trainingCards = document.querySelectorAll('.training-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      trainingCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(/\s+/);
        const isMatch = (filterValue === 'all') || categories.includes(filterValue);

        if (isMatch) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
        // Очищаем инлайн-стили, предотвращая конфликты
        card.style.display = '';
        card.style.opacity = '';
        card.style.transform = '';
      });
    });
  });

  // ==========================================
  // 4. ДАННЫЕ ПРОГРАММ ОБУЧЕНИЯ
  // ==========================================
  const TRAININGS_DATA = {
    'custom-training': {
      title: 'Тренинг под ваш запрос: Индивидуальная разработка',
      badge: 'Под задачу',
      duration: 'Индивидуально · от 4 часов',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_custom.webp',
      pdfUrl: '',
      pdfFileName: '',
      audience: [
        'Команды и подразделения компании',
        'Руководители и проектные группы',
        'Сотрудники под целевые бизнес-задачи'
      ],
      price: 'Индивидуальный расчет под масштаб проекта',
      syllabus: [
        '<strong>Диагностика и анализ запроса:</strong> изучим специфику компании, бизнес-процессы и текущие сложности, определим потребности участников и ожидаемые результаты обучения.',
        '<strong>Проектирование программы:</strong> сформируем структуру тренинга, подберём темы, инструменты и методы обучения с учётом целей бизнеса и уровня подготовки участников.',
        '<strong>Разработка практических заданий:</strong> подготовим упражнения, деловые игры, бизнес-симуляции и кейсы на основе реальных рабочих ситуаций компании.',
        '<strong>Создание учебных материалов:</strong> разработаем презентации, памятки, чек-листы и шаблоны для использования в повседневной работе.',
        '<strong>Проведение и адаптация тренинга:</strong> проведём обучение в согласованном формате, соберём обратную связь и при необходимости скорректируем содержание под задачи участников.',
        '<strong>Посттренинговое сопровождение:</strong> подготовим рекомендации по внедрению инструментов в работу, чтобы участники могли применять полученные знания после обучения.'
      ],
      security: '',
      materials: '',
      topicValue: 'Тренинг под ваш запрос'
    },
    'ai-tables': {
      title: 'Работа с таблицами при помощи ИИ',
      badge: 'Прикладной ИИ',
      duration: '6 часов',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_ai_tables.webp',
      pdfUrl: 'assets/docs/Programma_AI_Tables_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_Работа_с_таблицами_ИИ.pdf',
      audience: [
        'Аналитики, финансисты и экономисты',
        'Руководители отделов и менеджеры проектов',
        'Сотрудники, работающие с Excel и отчетами'
      ],
      price: '',
      syllabus: [
        '<strong>Авторская концептуальная модель ПИК:</strong> П – промпт (навыки и принципы точного промптинга), И – инструмент (выбор наиболее подходящих инструментов ИИ под задачи), К – кругозор (расширение паттернов использования ИИ).',
        '<strong>Создание и редактирование таблиц одним запросом:</strong> разработка Excel-таблиц от простых базовых шаблонов до сложных рабочих аналитических файлов.',
        '<strong>Контроль работы ИИ и защита от галлюцинаций:</strong> правильная подготовка рабочей среды, чтобы нейросеть не «галлюцинировала» и не добавляла информацию от себя.',
        '<strong>Создание макросов с помощью ИИ:</strong> самостоятельное создание автоматизации практически под любую задачу в Excel без знания программирования.',
        '<strong>Разработка HTML-инструментов для Excel:</strong> создание простых веб-страниц, способных загружать, обрабатывать, анализировать и преобразовывать данные из excel, word, txt, xls и т.д.'
      ],
      security: 'Работа с корпоративными данными с учётом требований информационной безопасности компании: обезличивание данных, безопасные сценарии и регламенты работы с моделями.',
      materials: 'Библиотека проверенных промптов под табличные сценарии, чек-листы контроля ошибок и готовые шаблоны микроинструментов.',
      topicValue: 'Работа с таблицами при помощи ИИ'
    },
    'ai-pres': {
      title: 'Создание презентаций с помощью ИИ',
      badge: 'Прикладной ИИ',
      duration: 'Очный и онлайн: 6 часов',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_ai_pres.webp',
      pdfUrl: 'assets/docs/Programma_AI_Presentations_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_Создание_презентаций_ИИ.pdf',
      audience: [
        'Руководители отделов и лидеры команд',
        'Менеджеры проектов, продуктов и аналитики',
        'Специалисты, защищающие идеи и презентации'
      ],
      price: '',
      syllabus: [
        '<strong>Авторская концептуальная модель ПИК:</strong> П — промпт (навыки и принципы промптинга), И — инструмент (выбор наиболее подходящих инструментов ИИ под задачи), К — кругозор (расширение паттернов использования ИИ).',
        '<strong>Правила идеального промптинга:</strong> какие формулировки дают наилучший результат, который позволит выполнить задачу с первого раза.',
        '<strong>Продвинутый стек актуальных инструментов:</strong> подборка лучших ИИ-сервисов для создания логической структуры, лаконичного текста и эстетичного дизайна.',
        '<strong>Практика в реальном времени:</strong> сборка готовой презентации от идеи до финального слайда прямо во время тренинга за несколько минут.'
      ],
      security: 'Техники безопасной подготовки аналитических справок и отчетов без риска утечки конфиденциальной коммерческой информации компании.',
      materials: 'Банк готовых промптов и инструментов для отчетов и презентаций',
      topicValue: 'Создание презентаций с помощью ИИ'
    },
    'ai-agents': {
      title: 'Применение ИИ-агентов в бизнесе: Автоматизация процессов',
      badge: 'Прикладной ИИ',
      duration: '6 часов · Практический воркшоп',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_ai_agents.webp',
      pdfUrl: 'assets/docs/Programma_AI_Agents_Business_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_ИИ_Агенты_в_бизнесе.pdf',
      audience: [
        'Собственники бизнеса и топ-менеджеры',
        'Руководители отделов и подразделений',
        'HR-специалисты и менеджеры проектов'
      ],
      price: '',
      syllabus: [
        '<strong>Основы работы ИИ-агентов:</strong> принципы работы, особенности промптинга и отличие агентов от обычных ИИ-чатов.',
        '<strong>Настройка и управление агентами:</strong> выбор инструментов, подключение мессенджеров, настройка прав доступа и границ самостоятельных действий.',
        '<strong>Автоматизация задач руководителя:</strong> напоминания, календари, встречи, почта, заметки и работа с документами.',
        '<strong>Мониторинг и аналитика:</strong> сбор информации из интернета, обработка данных, расшифровка встреч и подготовка аналитических выжимок.',
        '<strong>Создание собственных ИИ-агентов:</strong> разработка и настройка агента под конкретную рабочую задачу с проверкой результата.'
      ],
      security: 'Баланс локальных моделей и облачных, разграничение прав доступа и строгий контроль за передачей корпоративных данных.',
      materials: 'Чек-лист настройки агента под любую задачу, подборка лучших инструментов и локальных моделей, подробная инструкция после тренинга для пошаговой настройки, большая подборка актуальных идей для агентов.',
      topicValue: 'Применение ИИ-агентов в бизнесе'
    },
    'spin-sales': {
      title: 'SPIN продажи: Управление диалогом',
      badge: 'B2B Продажи',
      duration: 'Очный и онлайн: 6 часов',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_spin.webp',
      pdfUrl: 'assets/docs/Programma_SPIN_Sales_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_SPIN_Продажи_B2B.pdf',
      audience: [
        'Менеджеры по продажам (B2B)',
        'Руководители отделов продаж',
        'Менеджеры по продажам (B2C)'
      ],
      price: '',
      syllabus: [
        '<strong>Конструирование вопросов в единую систему:</strong> последовательное построение цепочки Ситуационных, Проблемных, Извлекающих и Направляющих вопросов.',
        '<strong>Удержание внимания и вовлечённости:</strong> практические приемы сохранения фокуса клиента до самого конца встречи.',
        '<strong>Управление диалогом:</strong> переход от пассивного рассказа о продукте к осознанному управлению ходом переговоров.'
      ],
      security: '',
      materials: '',
      topicValue: 'SPIN продажи'
    },
    'cold-calls': {
      title: 'Холодные продажи по телефону (B2C / B2B)',
      badge: 'B2C Продажи',
      duration: '1 день · Интенсив (6 часов)',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_cold_calls.webp',
      pdfUrl: 'assets/docs/Programma_Cold_Calls_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_Холодные_продажи_по_телефону.pdf',
      audience: [
        'Менеджеры первой линии',
        'Операторы телемаркетинга',
        'Специалисты отделов активных продаж'
      ],
      price: 'По запросу',
      syllabus: [
        '<strong>Специфика телефонных продаж:</strong> разберём ключевые отличия телефонных продаж от очных встреч, научимся удерживать внимание клиента без визуального контакта и выстраивать доверие в разговоре.',
        '<strong>Пять этапов телефонных продаж:</strong> изучим каждый этап — от установления контакта и выявления потребностей до презентации предложения, работы с возражениями и завершения сделки. Отработаем приёмы и формулировки для каждого этапа.',
        '<strong>Работа с возражениями и сложными клиентами:</strong> научимся реагировать на отказы, отвечать на сомнения, работать с фразами «мне неинтересно» и «я подумаю», сохраняя конструктивный диалог.',
        '<strong>Управление эмоциями и стрессоустойчивость:</strong> разберём, как справляться с отказами, сохранять рабочий настрой после сложных звонков и предотвращать эмоциональное выгорание при работе на линии.',
        '<strong>Практика телефонных переговоров:</strong> отработаем навыки в ролевых играх, разберём типичные ошибки и попробуем разные подходы к ведению разговора с клиентом.'
      ],
      security: '',
      materials: '',
      topicValue: 'Холодные продажи по телефону'
    },
    'sales-stages': {
      title: 'Этапы продаж и финансовые инструменты (Лемана Про / Ритейл)',
      badge: 'B2C Продажи',
      duration: '4 часа / 1 день (8 часов)',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_sales_stages.webp',
      pdfUrl: 'assets/docs/Programma_Sales_Stages_Retail_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_Этапы_продаж_в_ритейле.pdf',
      audience: [
        'Продавцы-консультанты',
        'Менеджеры торгового зала',
        'Руководители коммерческих секций ритейла'
      ],
      price: 'По запросу',
      syllabus: [
        '<strong>Пять этапов продаж:</strong> от установления контакта до завершения сделки, задачи каждого этапа и логика перехода между ними.',
        '<strong>Психология покупателя:</strong> мотивы принятия решений, формирование доверия и факторы, влияющие на готовность клиента к покупке.',
        '<strong>Техники убеждения:</strong> аргументация ценности продукта, работа с сомнениями и применение эффективных приёмов влияния в переговорах.',
        '<strong>Сложные переговоры:</strong> работа с требовательными клиентами, обсуждение цены и условий, сохранение конструктивного диалога в конфликтных ситуациях.',
        '<strong>Практика продаж:</strong> ролевые игры, разбор типичных ошибок и отработка переговорных навыков на реалистичных ситуациях.'
      ],
      security: '',
      materials: '',
      topicValue: 'Этапы продаж в B2C'
    },
    'smart-goals': {
      title: 'Постановка целей по SMART и тайм-менеджмент',
      badge: 'Менеджмент',
      duration: '4 часа · Практикум',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_smart.webp',
      pdfUrl: 'assets/docs/Programma_SMART_Goals_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_SMART_постановка_целей.pdf',
      audience: [
        'Руководители отделов и тимлиды',
        'Менеджеры проектов',
        'Специалисты отделов продаж и клиентского сервиса'
      ],
      price: 'По запросу',
      syllabus: [
        '<strong>Принципы SMART:</strong> разберём пять критериев эффективной цели – конкретность, измеримость, достижимость, значимость и ограниченность во времени.',
        '<strong>Формулирование целей:</strong> научимся превращать общие пожелания в чёткие цели с понятными критериями результата и сроками.',
        '<strong>Декомпозиция целей:</strong> освоим разбиение крупных целей на конкретные задачи, этапы и промежуточные результаты.',
        '<strong>Контроль достижения целей:</strong> разберём способы отслеживания прогресса, выявления отклонений и корректировки плана действий.',
        '<strong>Практика на рабочих задачах:</strong> переработаем примеры некорректно поставленных целей в формате SMART и составим собственные цели для сотрудников и команд.'
      ],
      security: '',
      materials: '',
      topicValue: 'Постановка целей по SMART'
    },
    'chess-mgmt': {
      title: 'Шахматы в управлении командой',
      badge: 'Стратегия & Менеджмент',
      duration: '8 часов',
      format: 'Очно / Онлайн / Вебинар',
      cover: 'assets/images/cover_chess.webp',
      pdfUrl: 'assets/docs/Programma_Chess_Management_Khodeev.pdf',
      pdfFileName: 'Программа_Ходеев_Шахматы_в_управлении_командой.pdf',
      audience: [
        'Руководители команд и подразделений',
        'Руководители проектов',
        'Заместители руководителей'
      ],
      price: '',
      syllabus: [
        '<strong>Основы шахмат:</strong> изучим правила, научимся ходить фигурами, освоим базовые приёмы и сыграем первые партии.',
        '<strong>Стратегическое мышление:</strong> разберём, как оценивать ситуацию, прогнозировать действия соперника, планировать ходы и принимать решения с учётом ограниченных ресурсов.',
        '<strong>Инструменты управления командой:</strong> освоим распределение ролей и ответственности, делегирование, постановку целей, RACI-матрицу и дорожную карту.',
        '<strong>Ситуационное лидерство:</strong> разберём, как выбирать подход к управлению сотрудниками с учётом их опыта, самостоятельности и поставленных задач.',
        '<strong>Практика на бизнес-кейсах:</strong> решим управленческие задачи, применим изученные инструменты и проведём параллели между шахматными партиями и реальными ситуациями управления командой.'
      ],
      security: '',
      materials: '',
      topicValue: 'Шахматы в управлении командой'
    }
  };

  // Алиас для надежности обратной совместимости
  TRAININGS_DATA['lemana-retail'] = TRAININGS_DATA['sales-stages'];

  // ==========================================
  // 5. МОДАЛЬНОЕ ОКНО ДЕТАЛЬНОЙ ПРОГРАММЫ ТРЕНИНГА
  // ==========================================
  const trainingModalOverlay = document.getElementById('training-modal-overlay');
  const modalCoverImg = document.getElementById('modal-cover-img');
  const modalCategoryBadge = document.getElementById('modal-category-badge');
  const modalDurationVal = document.getElementById('modal-duration-val');
  const modalFormatVal = document.getElementById('modal-format-val');
  const modalAudienceVal = document.getElementById('modal-audience-val');
  const modalPdfBtn = document.getElementById('modal-pdf-btn');
  const modalTitleVal = document.getElementById('modal-title-val');
  const modalSyllabusList = document.getElementById('modal-syllabus-list');
  const modalSecurityVal = document.getElementById('modal-security-val');
  const modalMaterialsVal = document.getElementById('modal-materials-val');
  const modalBookBtn = document.getElementById('modal-book-btn');
  const closeTrainingModalBtns = document.querySelectorAll('[data-close-training-modal]');

  let currentTrainingTopic = '';

  function openTrainingModal(trainingId) {
    const data = TRAININGS_DATA[trainingId];
    if (!data || !trainingModalOverlay) return;

    currentTrainingTopic = data.topicValue || data.title;

    if (modalCoverImg) {
      modalCoverImg.src = data.cover;
      modalCoverImg.alt = data.title;
    }
    if (modalCategoryBadge) modalCategoryBadge.textContent = data.badge;
    if (modalDurationVal) modalDurationVal.textContent = data.duration;
    if (modalFormatVal) modalFormatVal.textContent = data.format;
    if (modalAudienceVal) {
      if (Array.isArray(data.audience)) {
        modalAudienceVal.innerHTML = `
          <div class="param-val-list">
            ${data.audience.map(item => `
              <div class="param-audience-item">
                <span class="param-audience-bullet" aria-hidden="true">•</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        modalAudienceVal.textContent = data.audience;
      }
    }
    if (modalTitleVal) modalTitleVal.textContent = data.title;

    if (modalPdfBtn) {
      if (data.pdfUrl) {
        modalPdfBtn.href = data.pdfUrl;
        modalPdfBtn.setAttribute('download', data.pdfFileName || 'Программа_тренинга.pdf');
        modalPdfBtn.style.display = 'inline-flex';
      } else {
        modalPdfBtn.style.display = 'none';
      }
    }

    if (modalSyllabusList) {
      modalSyllabusList.innerHTML = '';
      if (Array.isArray(data.syllabus)) {
        data.syllabus.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = item;
          modalSyllabusList.appendChild(li);
        });
      }
    }

    const modalSecurityBlock = document.getElementById('modal-security-block');
    if (modalSecurityBlock && modalSecurityVal) {
      if (data.security) {
        modalSecurityVal.textContent = data.security;
        modalSecurityBlock.style.display = 'block';
      } else {
        modalSecurityBlock.style.display = 'none';
      }
    }

    const modalMaterialsBlock = document.getElementById('modal-materials-block');
    if (modalMaterialsBlock && modalMaterialsVal) {
      if (data.materials) {
        modalMaterialsVal.textContent = data.materials;
        modalMaterialsBlock.style.display = 'block';
      } else {
        modalMaterialsBlock.style.display = 'none';
      }
    }

    const modalExperienceBlock = document.getElementById('modal-experience-block');
    const modalExperienceVal = document.getElementById('modal-experience-val');
    if (modalExperienceBlock && modalExperienceVal) {
      if (data.experience) {
        modalExperienceVal.textContent = data.experience;
        modalExperienceBlock.style.display = 'block';
      } else {
        modalExperienceBlock.style.display = 'none';
      }
    }

    const modalPriceRow = document.getElementById('modal-price-row');
    const modalPriceVal = document.getElementById('modal-price-val');
    if (modalPriceRow && modalPriceVal) {
      if (data.price) {
        modalPriceVal.textContent = data.price;
        modalPriceRow.style.display = 'flex';
      } else {
        modalPriceRow.style.display = 'none';
      }
    }

    trainingModalOverlay.scrollTop = 0;
    trainingModalOverlay.classList.add('active');
    trainingModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTrainingModal() {
    if (!trainingModalOverlay) return;
    trainingModalOverlay.classList.remove('active');
    trainingModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Клики по карточкам и кнопкам "Программа тренинга →"
  document.querySelectorAll('[data-open-training-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-open-training-modal');
      if (id) openTrainingModal(id);
    });
  });

  document.querySelectorAll('.training-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Игнорируем клик, если нажата прямая ссылка на скачивание PDF
      if (e.target.closest('a[download]')) return;
      const id = card.getAttribute('data-training-id');
      if (id) openTrainingModal(id);
    });
  });

  closeTrainingModalBtns.forEach(btn => {
    btn.addEventListener('click', closeTrainingModal);
  });

  if (trainingModalOverlay) {
    trainingModalOverlay.addEventListener('click', (e) => {
      if (e.target === trainingModalOverlay) closeTrainingModal();
    });
  }

  if (modalBookBtn) {
    modalBookBtn.addEventListener('click', () => {
      const topic = currentTrainingTopic;
      closeTrainingModal();
      openContactModal(topic);
    });
  }

  if (modalPdfBtn) {
    modalPdfBtn.addEventListener('click', () => {
      showToast('Загрузка официального PDF-буклета программы...');
    });
  }

  // ==========================================
  // 6. МОДАЛЬНОЕ ОКНО "ОБСУДИТЬ ОБУЧЕНИЕ"
  // ==========================================
  const contactModal = document.getElementById('contact-modal');
  const modalFormTopic = document.getElementById('modal-form-topic');
  const openContactModalBtns = document.querySelectorAll('[data-open-modal], [data-open-contact-modal]');
  const closeContactModalBtns = document.querySelectorAll('[data-close-modal]');

  function openContactModal(defaultTopic = '') {
    if (!contactModal) return;
    if (modalFormTopic && defaultTopic) {
      modalFormTopic.value = defaultTopic;
    }
    contactModal.scrollTop = 0;
    contactModal.classList.add('active');
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove('active');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openContactModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = btn.getAttribute('data-topic') || '';
      openContactModal(topic);
    });
  });

  closeContactModalBtns.forEach(btn => {
    btn.addEventListener('click', closeContactModal);
  });

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) closeContactModal();
    });
  }

  // Закрытие по нажатию Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTrainingModal();
      closeContactModal();
    }
  });

  // ==========================================
  // 7. TOAST УВЕДОМЛЕНИЕ
  // ==========================================
  const toast = document.getElementById('toast');
  function showToast(message = 'Запрос отправлен! Алексей свяжется с вами в ближайшее время.') {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  }

  // ==========================================
  // 8. ОБРАБОТКА ФОРМ И НАДЁЖНОЕ СОХРАНЕНИЕ ЗАЯВОК (LEAD VAULT)
  // ==========================================
  const forms = [
    document.getElementById('contact-form'),
    document.getElementById('quick-inquiry-form')
  ].filter(Boolean);

  // Глобальный доступ для просмотра сохраненных заявок из консоли DevTools
  window.getLeads = () => {
    try {
      const vault = JSON.parse(localStorage.getItem('uh_leads_vault') || '[]');
      console.table(vault);
      return vault;
    } catch (e) {
      return [];
    }
  };

  window.clearLeads = () => {
    localStorage.removeItem('uh_leads_vault');
    console.info('Хранилище заявок очищено.');
  };

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';

      // Сбор данных формы
      const formData = new FormData(form);
      const lead = {
        id: 'lead_' + Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        form: form.id === 'quick-inquiry-form' ? 'Быстрое модальное окно' : 'Основная форма на странице',
        name: (formData.get('name') || '').toString().trim(),
        company: (formData.get('company') || '').toString().trim(),
        contact: (formData.get('contact') || '').toString().trim(),
        program: (formData.get('program') || form.querySelector('#modal-form-topic')?.value || currentTrainingTopic || 'Общий запрос').toString().trim(),
        comment: (formData.get('comment') || '').toString().trim()
      };

      // Сохранение в защищенный локальный Vault
      try {
        const leadsVault = JSON.parse(localStorage.getItem('uh_leads_vault') || '[]');
        leadsVault.push(lead);
        localStorage.setItem('uh_leads_vault', JSON.stringify(leadsVault));
        console.info('📥 Заявка успешно сохранена в хранилище сайта (uh_leads_vault):', lead);
      } catch (err) {
        console.warn('Не удалось записать заявку в localStorage:', err);
      }

      // Опциональная отправка на внешний вебхук (если настроен)
      if (window.UH_WEBHOOK_URL) {
        fetch(window.UH_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        }).catch(err => console.warn('Webhook dispatch failed:', err));
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite; margin-right: 8px;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Отправка...
        `;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
        form.reset();
        closeContactModal();
        showToast('Заявка успешно принята! Алексей свяжется с вами в течение рабочего дня.');
      }, 600);
    });
  });

  // =========================================================================
  // 9. КАСТОМНЫЙ ВЫПАДАЮЩИЙ СПИСОК "ИНТЕРЕСУЮЩАЯ ПРОГРАММА" С ЦЕНТРОВКОЙ
  // =========================================================================
  const selectBox = document.getElementById('program-select-wrapper');
  if (selectBox) {
    const trigger = selectBox.querySelector('.custom-select-trigger');
    const valueEl = selectBox.querySelector('.custom-select-value');
    const dropdown = selectBox.querySelector('.custom-select-dropdown');
    const nativeSelect = selectBox.querySelector('#form-program');
    const options = selectBox.querySelectorAll('.custom-select-option');
    const contactForm = selectBox.closest('form');

    const toggleDropdown = (open) => {
      const isOpen = open !== undefined ? open : !selectBox.classList.contains('is-open');
      if (isOpen) {
        selectBox.classList.add('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
      } else {
        selectBox.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    };

    selectBox.addEventListener('click', (e) => {
      if (e.target.closest('.custom-select-option')) return;
      toggleDropdown();
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-value') || opt.textContent.trim();
        const text = opt.textContent.trim();

        if (valueEl) valueEl.textContent = text;
        if (nativeSelect) {
          nativeSelect.value = val;
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        toggleDropdown(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (!selectBox.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    selectBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === 'Escape') {
        toggleDropdown(false);
      }
    });

    if (contactForm) {
      contactForm.addEventListener('reset', () => {
        setTimeout(() => {
          if (options.length > 0) {
            options.forEach(o => o.classList.remove('active'));
            const defaultOpt = selectBox.querySelector('.custom-select-option[data-value="Индивидуальная программа"]') || options[options.length - 1];
            if (defaultOpt) {
              defaultOpt.classList.add('active');
              if (valueEl) valueEl.textContent = defaultOpt.textContent.trim();
              if (nativeSelect) nativeSelect.value = defaultOpt.getAttribute('data-value') || defaultOpt.textContent.trim();
            }
          }
        }, 10);
      });
    }
  }
});

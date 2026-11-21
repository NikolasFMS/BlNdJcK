(function () {
  'use strict';

  // =========================================================================
  // 1. ISOLATED STORAGE (Safe for shared GitHub Pages domains!)
  // =========================================================================
  const STORAGE_PREFIX = 'vanilka_blindjack_v1_';
  const KEYS = {
    USED: STORAGE_PREFIX + 'used_cards',
    CUSTOM: STORAGE_PREFIX + 'custom_cards',
    SOUND: STORAGE_PREFIX + 'sound',
    LANG: STORAGE_PREFIX + 'lang',
    SESSION: STORAGE_PREFIX + 'active_session',
  };

  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  }

  // =========================================================================
  // 2. DATA, THEMES & TRANSLATIONS
  // =========================================================================
  const DATA = window.BLIND_JACK_DATA || { OFFICIAL_DECK: [], OFFICIAL_DISTRIBUTION: {} };
  const TEAM_THEMES = [
    { id: 'plum', hex: '#6D4C9F', text: '#4B2F78' },
    { id: 'tangerine', hex: '#E06224', text: '#9E3E0F' },
    { id: 'teal', hex: '#11847E', text: '#0A5955' },
    { id: 'berry', hex: '#C82D54', text: '#8F1937' },
  ];
  const DEFAULT_NAMES = {
    ru: ['Команда 1', 'Команда 2', 'Команда 3', 'Команда 4'],
    en: ['Team 1', 'Team 2', 'Team 3', 'Team 4'],
  };

  function formatOrdinal(n, lang) {
    if (lang === 'ru') return n + '-е';
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return n + 'th';
  }

  function formatStoppedOrd(n, lang) {
    return lang === 'ru' ? n + '-ми' : formatOrdinal(n, 'en');
  }

  function formatNum(n) {
    return n === 6 || n === 9 ? n + '.' : String(n);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cardQ(card, lang) {
    return lang === 'en' && card.questionEn ? card.questionEn : card.question;
  }

  function cardFact(card, lang) {
    return lang === 'en' && card.factEn ? card.factEn : card.fact;
  }

  const I18N = {
    ru: {
      appTitle: 'Блайнд Джек',
      docTitle: 'Блайнд Джек — Настольная игра',
      rulesAria: 'Правила игры',
      stats: 'Статистика',
      install: 'Установить',
      iosInstallTitle: 'Установка на iPhone / iPad',
      iosInstallHtml:
        '1. Нажмите кнопку <strong>«Поделиться»</strong> в панели Safari.<br>2. Выберите <strong>«На экран „Домой“»</strong> — игра будет работать как приложение без интернета.',
      gotIt: 'Понятно',
      offlineMsg: 'Автономный режим — всё работает без интернета',
      metaLine: '12+ · 15 мин · 2–12 игроков',
      heroDesc:
        'Отвечайте на вопросы числами от <strong>0 до 10</strong>, но свои реальные ответы видят только соперники. Наберите сумму ближе к <strong>21</strong> и не переберите!',
      inBox: (rem, tot) => `В коробке: <strong>${rem}</strong> из ${tot} новых карт`,
      boxBtn: 'Коробка',
      noteTitle: 'Автономная версия без зависимостей',
      noteBody:
        'Полная колода из <strong>391 проверенной карты</strong> (распределение 0–10, среднее 5.0), защита от спойлеров, подвижные жетоны <strong>1–21</strong> и защита от случайной перезагрузки.',
      teamsTitle: 'Команды',
      teamsHint:
        'Рекомендуется до 3 игроков в команде. Если вас больше 6 человек — добавьте 3-ю или 4-ю команду.',
      modeTitle: 'Режим игры',
      classicTitle: 'Обычная партия',
      classicDesc: 'Одна быстрая игра из 20 карт. Побеждает сумма ближе всего к 21.',
      superTitle: 'Супер Блайнд Джек',
      superDesc: 'Серия игр до 3 очков. За ровно 21 — бонус +2 очка или мгновенная победа.',
      exact21Label: 'Награда за точные 21 в серии:',
      exact21Two: '+2 очка',
      exact21Instant: 'Сразу победа',
      startGame: 'Начать партию',
      menu: 'Меню',
      roundDeck: (r, left) => `Раунд ${r} · Колода: ${left}`,
      turnOf: (n) => `Ход: ${n}`,
      secretTitle: 'Секретный показ',
      cardsCount: (n) => `Карт на столе: ${n}`,
      teamGuess: (n) => `Ответ команды: ${n}`,
      footerQ: 'Ответ — целое число от 0 до 10',
      footerHidden: 'Экран скрыт от активной команды',
      guessPrompt: 'Предполагаемый ответ команды:',
      nowEst: (n) => `Сейчас ~${n}`,
      avg5: 'ср. 5',
      takeShow: 'Взять карту и показать соперникам',
      stopBtn: 'Остановиться (не брать эту карту)',
      stopLocked: 'Остановиться можно начиная с 3-го раунда (после 2 взятых карт)',
      passToOpponents: (opp, act) =>
        `<strong>Передайте экран соперникам</strong> (${escapeHtml(opp)}). Команда <strong>${escapeHtml(act)}</strong> не должна видеть ответ!`,
      holdPeek: 'Удерживайте, чтобы увидеть ответ',
      releaseHide: 'Ответ открыт — отпустите, чтобы скрыть',
      peekDone: 'Соперники посмотрели ответ',
      releaseHint: 'Отпустите палец — карта скроется',
      lockShow: 'Показать без удержания',
      lockHide: 'Скрыть',
      hidePass: 'Скрыть карту и передать ход',
      tracksTitle: 'Шкалы команд (1–21)',
      estSums: 'Предполагаемые суммы',
      jumpToCard: '↑ К карте',
      jumpToTracks: 'Шкалы ↓',
      activeDot: '· Ход',
      stoppedTag: (o) => `Стоп (${formatOrdinal(o, 'ru')})`,
      seriesTag: (s) => `Серия: ${s}/3`,
      estLine: (v) => `Оценка: <strong>~${v}</strong> из 21`,
      bustRisk: 'Риск перебора',
      near21: 'Близко к 21',
      moveHint: 'Жетон можно двигать',
      teamCardsTitle: (n) => `Карты: ${n}`,
      noCardsYet: 'У команды пока нет взятых карт.',
      cardsUpNote:
        'Карты лежат стороной с вопросом вверх. Реальные значения откроются только в конце партии!',
      cardRound: (i, r) => `Карта #${i} · Раунд ${r}`,
      estShort: 'Оценка',
      abortTitle: 'Прервать партию?',
      abortDesc:
        'Текущий прогресс раунда не сохранится. Разыгранные карты останутся отмеченными в коробке.',
      stay: 'Остаться',
      toMenu: 'В меню',
      revealHeader: 'Вскрытие карт',
      revealAll: 'Открыть все сразу',
      revealRule:
        '<strong>По правилам игры:</strong> первой переворачивает свои карты команда, которая остановилась раньше. Нажимайте на зелёные карты, чтобы узнать реальную сумму!',
      revealTeamBtn: 'Открыть карты команды',
      bustBadge: 'Конец партии · Перебор',
      exact21Badge: 'Ровно 21 · Блайнд Джек!',
      seriesResults: (n) => `Итоги партии №${n}`,
      classicResults: 'Итоги партии',
      allLostTitle: 'Все команды проиграли!',
      tieTitle: (names) => `Ничья: ${names}`,
      tieJoin: ' и ',
      winTitle: (n) => `Победа: ${n}`,
      allLostDesc: 'Каждая команда набрала больше 21 — в этом раунде победителей нет.',
      tieDesc: 'Команды набрали одинаковую лучшую сумму не выше 21 — побеждают обе!',
      winDesc: 'Сумма ответов оказалась ближе всех к 21 без перебора.',
      superTitleBox: 'Супер Блайнд Джек (до 3)',
      superHint: (inst) => `<21: +1 · ровно 21: ${inst ? 'сразу победа' : '+2 очка'}`,
      seriesTie: 'Ничья в серии — сыграйте решающую партию!',
      seriesChamp: (n) => `Чемпион серии: ${n}!`,
      stoppedEst: (o, e) => `Остановились ${formatStoppedOrd(o, 'ru')} · Оценка была ~${e}`,
      bustLabel: 'ПЕРЕБОР (>21)',
      exact21Sum: 'РОВНО 21!',
      finalSum: 'Итоговая сумма',
      openedOf: (a, b) => `Открыто ${a}/${b}`,
      guessedLbl: (v) => `Назвали: ${v}`,
      answerLbl: (v) => `Ответ: ${v}`,
      flipBtn: 'Перевернуть',
      whyBtn: 'Почему так?',
      hideFact: 'Скрыть факт',
      openAllSmall: 'Открыть все',
      newSeries: 'Начать новую серию',
      nextSeries: 'Следующая партия серии',
      playAgain: 'Сыграть ещё партию',
      settingsTeams: 'Настройки и команды',
      modalTitle: 'Памятка и коробка карт',
      tabRules: 'Правила',
      tabStats: 'Статистика',
      tabBox: (n) => `Коробка (${n})`,
      rulesHtml: `
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:0 0 6px;">Цель игры</h3>
        <p style="margin:0 0 14px;">Все карты — это вопросы, ответы на которые являются целыми числами от <strong>0 до 10</strong>. Наберите реальную сумму ответов как можно ближе к <strong>21, но не больше!</strong></p>
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:14px 0 6px;padding-top:14px;border-top:1px solid var(--border-soft);">Ход игры</h3>
        <ol style="padding-left:20px;margin:0 0 14px;">
          <li style="margin-bottom:6px;">В партию замешивается <strong>20 случайных карт</strong> из коробки. Игроки делятся на 2 (или 3–4) команды.</li>
          <li style="margin-bottom:6px;">Активная команда читает вопрос вслух, называет свой предполагаемый ответ (0–10), и её жетон сдвигается на шкале 1–21.</li>
          <li style="margin-bottom:6px;">Телефон передаётся <strong>только соперникам</strong>: они удерживают кнопку, чтобы увидеть реальный ответ. Активная команда его не знает!</li>
          <li>Карта ложится перед командой вопросом вверх, и ход переходит дальше.</li>
        </ol>
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:14px 0 6px;padding-top:14px;border-top:1px solid var(--border-soft);">Начиная с 3-го раунда</h3>
        <p style="margin:0 0 8px;">Начиная с <strong>3-го раунда</strong>, команда может остановиться и не брать верхнюю карту. Этот же вопрос остаётся следующей продолжающей команде!</p>
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:14px 0 6px;padding-top:14px;border-top:1px solid var(--border-soft);">Конец партии и «Супер Блайнд Джек»</h3>
        <p style="margin:0;">Когда все остановились, карты вскрываются в порядке остановки. Побеждает сумма ближе всего к 21 без перебора. В серии до 3 очков: перебор — 0, победа &lt;21 — 1 очко, ровно 21 — 2 очка или мгновенная победа.</p>
      `,
      statsTitle: 'Распределение 391 карты в коробке',
      statsSub: 'Симметричный баланс официальной колоды «Блайнд Джек»',
      avgLbl: 'Средний ответ',
      cardsWord: (n) => `${n} карт`,
      statsFoot: 'По 17 (0, 10) · По 32 (1, 9) · По 37 (2, 8) · По 43 (3, 7) · По 44 (4, 6) · 45 (5).',
      boxRemLbl: 'Новых несыгранных карт в коробке',
      boxRemNote: 'Разыгранные карты убираются в конец коробки, чтобы не повторяться.',
      reshuffleBtn: 'Перемешать всё',
      addTitle: 'Добавить свою карту в коробку',
      qLbl: 'Вопрос (ответ — целое число от 0 до 10)',
      qPlaceholder: 'Например: Сколько струн у укулеле?',
      aLbl: 'Точный ответ:',
      fLbl: 'Краткое пояснение (необязательно)',
      fPlaceholder: 'Показывается в конце партии',
      qErr: 'Введите полноценный вопрос (минимум 6 символов).',
      addBtn: 'Добавить карту',
      yourCards: (n) => `Ваши карты (${n})`,
      customHidden: 'Ответ скрыт до игры · Своя карта',
      reinstallTitle: 'Переустановка и обновление',
      reinstallDesc:
        'Обновляет файлы и офлайн-кеш программы до последней версии. Все сохранения, свои карты и текущая партия останутся на месте.',
      reinstallBtn: 'Переустановить программу',
      reinstallingBtn: 'Переустановка...',
      toastReshuffled: 'Коробка из 391 карты пройдена и перемешана заново!',
      toastExhausted: 'Все 20 карт партии разыграны — переходим к вскрытию!',
      toastStopped: (n) => `${n} остановились — вопрос остаётся на столе!`,
      toastReturned: 'Все карты возвращены в коробку и перемешаны!',
      toastAdded: 'Карта добавлена в коробку!',
      toastRestored: 'Партия восстановлена после перезагрузки',
      toastOfflineReinstall: 'Для переустановки нужен интернет — офлайн-кеш сохранён.',
    },
    en: {
      appTitle: 'Blind Jack',
      docTitle: 'Blind Jack — Tabletop Companion',
      rulesAria: 'Game rules',
      stats: 'Stats',
      install: 'Install',
      iosInstallTitle: 'Install on iPhone / iPad',
      iosInstallHtml:
        '1. Tap the <strong>Share</strong> button in Safari.<br>2. Choose <strong>Add to Home Screen</strong> — the app will run fullscreen and completely offline.',
      gotIt: 'Got it',
      offlineMsg: 'Offline mode — running fully locally',
      metaLine: '12+ · 15 min · 2–12 players',
      heroDesc:
        'Answer trivia questions with numbers from <strong>0 to 10</strong>, but only your opponents see your real answers. Get as close to <strong>21</strong> as you can without busting!',
      inBox: (rem, tot) => `In box: <strong>${rem}</strong> of ${tot} fresh cards`,
      boxBtn: 'Card Box',
      noteTitle: 'Zero-Dependency Standalone Edition',
      noteBody:
        'Complete deck of <strong>391 verified cards</strong> (exact 0–10 distribution, average 5.0), anti-spoiler peek, movable <strong>1–21 tokens</strong>, and accidental reload protection.',
      teamsTitle: 'Teams',
      teamsHint:
        'Up to 3 players per team recommended. For more than 6 players, add a 3rd or 4th team.',
      modeTitle: 'Game Mode',
      classicTitle: 'Classic Game',
      classicDesc: 'A single fast 20-card match. Closest total to 21 without busting wins.',
      superTitle: 'Super Blind Jack',
      superDesc: 'First-to-3 points series. Exact 21 awards +2 points or an instant win.',
      exact21Label: 'Reward for hitting exact 21:',
      exact21Two: '+2 points',
      exact21Instant: 'Instant win',
      startGame: 'Start Game',
      menu: 'Menu',
      roundDeck: (r, left) => `Round ${r} · Deck: ${left}`,
      turnOf: (n) => `Turn: ${n}`,
      secretTitle: 'Secret Reveal',
      cardsCount: (n) => `Cards on table: ${n}`,
      teamGuess: (n) => `Team guessed: ${n}`,
      footerQ: 'Answer is a whole number from 0 to 10',
      footerHidden: 'Answer hidden from active team',
      guessPrompt: "Team's estimated answer:",
      nowEst: (n) => `Currently ~${n}`,
      avg5: 'avg 5',
      takeShow: 'Take card & show opponents',
      stopBtn: 'Stop (pass on this card)',
      stopLocked: 'You can stop starting from Round 3 (after taking 2 cards)',
      passToOpponents: (opp, act) =>
        `<strong>Pass the screen to opponents</strong> (${escapeHtml(opp)}). <strong>${escapeHtml(act)}</strong> must not look at the screen!`,
      holdPeek: 'Press & hold to peek at the answer',
      releaseHide: 'Answer visible — release to hide',
      peekDone: 'Opponents have seen the answer',
      releaseHint: 'Release your finger to flip back',
      lockShow: 'Keep shown without holding',
      lockHide: 'Hide',
      hidePass: 'Hide card & pass turn',
      tracksTitle: 'Team Tracks (1–21)',
      estSums: 'Estimated totals',
      jumpToCard: '↑ To card',
      jumpToTracks: 'Tracks ↓',
      activeDot: '· Turn',
      stoppedTag: (o) => `Stopped (${formatOrdinal(o, 'en')})`,
      seriesTag: (s) => `Series: ${s}/3`,
      estLine: (v) => `Estimate: <strong>~${v}</strong> of 21`,
      bustRisk: 'Bust risk',
      near21: 'Close to 21',
      moveHint: 'Adjust token anytime',
      teamCardsTitle: (n) => `Cards: ${n}`,
      noCardsYet: 'This team has not taken any cards yet.',
      cardsUpNote: 'Cards rest question-side up. Real answers stay hidden until the final reveal!',
      cardRound: (i, r) => `Card #${i} · Round ${r}`,
      estShort: 'Guess',
      abortTitle: 'End current game?',
      abortDesc: 'Current round progress will be lost. Played cards remain marked in the box.',
      stay: 'Stay',
      toMenu: 'Exit to Menu',
      revealHeader: 'Final Reveal',
      revealAll: 'Reveal all',
      revealRule:
        '<strong>Official order:</strong> the team that stopped first flips their cards first. Tap the green cards to uncover your real total!',
      revealTeamBtn: "Reveal team's cards",
      bustBadge: 'Game Over · Bust',
      exact21Badge: 'Exact 21 · Blind Jack!',
      seriesResults: (n) => `Game #${n} Results`,
      classicResults: 'Game Results',
      allLostTitle: 'Everyone busted!',
      tieTitle: (names) => `Tie: ${names}`,
      tieJoin: ' & ',
      winTitle: (n) => `Winner: ${n}`,
      allLostDesc: 'Every team went over 21 — no winners this round.',
      tieDesc: 'Teams tied with the closest total not over 21 — both win!',
      winDesc: 'Closest real total to 21 without going over.',
      superTitleBox: 'Super Blind Jack (to 3)',
      superHint: (inst) => `<21: +1 · exact 21: ${inst ? 'instant win' : '+2 pts'}`,
      seriesTie: 'Series tied — play a tiebreaker game!',
      seriesChamp: (n) => `Series Champion: ${n}!`,
      stoppedEst: (o, e) => `Stopped ${formatStoppedOrd(o, 'en')} · Estimated ~${e}`,
      bustLabel: 'BUST (>21)',
      exact21Sum: 'EXACT 21!',
      finalSum: 'Final total',
      openedOf: (a, b) => `Revealed ${a}/${b}`,
      guessedLbl: (v) => `Guessed: ${v}`,
      answerLbl: (v) => `Answer: ${v}`,
      flipBtn: 'Flip card',
      whyBtn: 'Why?',
      hideFact: 'Hide fact',
      openAllSmall: 'Reveal all',
      newSeries: 'Start New Series',
      nextSeries: 'Next Series Game',
      playAgain: 'Play Another Game',
      settingsTeams: 'Settings & Teams',
      modalTitle: 'Rules & Card Box',
      tabRules: 'Rules',
      tabStats: 'Stats',
      tabBox: (n) => `Box (${n})`,
      rulesHtml: `
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:0 0 6px;">Goal of the Game</h3>
        <p style="margin:0 0 14px;">Every card is a trivia question whose answer is a whole number from <strong>0 to 10</strong>. Reach a real total as close to <strong>21 as possible, without going over!</strong></p>
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:14px 0 6px;padding-top:14px;border-top:1px solid var(--border-soft);">How to Play</h3>
        <ol style="padding-left:20px;margin:0 0 14px;">
          <li style="margin-bottom:6px;">Deal <strong>20 random cards</strong> from the box. Split into 2 (or 3–4) teams.</li>
          <li style="margin-bottom:6px;">The active team reads the question aloud and picks their estimated answer (0–10), moving their token on the 1–21 track.</li>
          <li style="margin-bottom:6px;">Pass the device to <strong>opponents only</strong>: they press and hold to peek at the real answer. The active team never sees it!</li>
          <li>The card stays question-side up in front of the team, and play passes on.</li>
        </ol>
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:14px 0 6px;padding-top:14px;border-top:1px solid var(--border-soft);">Starting from Round 3</h3>
        <p style="margin:0 0 8px;">Starting in <strong>Round 3</strong>, a team may stop instead of taking the top card. That exact same question stays for the next active team!</p>
        <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:14px 0 6px;padding-top:14px;border-top:1px solid var(--border-soft);">End of Game & Super Blind Jack</h3>
        <p style="margin:0;">Once all teams stop, cards are flipped in stop order. Closest total to 21 without busting wins. First to 3 points series: bust = 0, win &lt;21 = 1 pt, exact 21 = 2 pts or instant win.</p>
      `,
      statsTitle: '391-Card Box Distribution',
      statsSub: 'Preserves the symmetric Blind Jack bell-curve balance',
      avgLbl: 'Average answer',
      cardsWord: (n) => `${n} cards`,
      statsFoot: '17 each (0, 10) · 32 each (1, 9) · 37 each (2, 8) · 43 each (3, 7) · 44 each (4, 6) · 45 (5).',
      boxRemLbl: 'Unplayed cards left in the box',
      boxRemNote: 'Played cards move to the back of the box so future games deal fresh questions.',
      reshuffleBtn: 'Reshuffle all',
      addTitle: 'Add a Custom Card',
      qLbl: 'Question (answer must be a whole number 0–10)',
      qPlaceholder: 'e.g., How many strings does a standard ukulele have?',
      aLbl: 'Exact answer:',
      fLbl: 'Short explanation (optional)',
      fPlaceholder: 'Shown during the final reveal',
      qErr: 'Please enter a full question (at least 6 characters).',
      addBtn: 'Add Card',
      yourCards: (n) => `Your Custom Cards (${n})`,
      customHidden: 'Answer hidden until play · Custom card',
      reinstallTitle: 'Reinstall & Update',
      reinstallDesc:
        'Refreshes app files and offline cache to the latest version. All saved progress, custom cards, and active games remain intact.',
      reinstallBtn: 'Reinstall App',
      reinstallingBtn: 'Reinstalling...',
      toastReshuffled: 'All 391 cards played — the box has been freshly reshuffled!',
      toastExhausted: 'All 20 cards played — moving to the final reveal!',
      toastStopped: (n) => `${n} stopped — the question stays on the table!`,
      toastReturned: 'All cards returned to the box and reshuffled!',
      toastAdded: 'Custom card added to the box!',
      toastRestored: 'Active game restored after reload',
      toastOfflineReinstall: 'Internet connection required to reinstall — offline cache kept.',
    },
  };

  // =========================================================================
  // 3. INLINE SVG ICONS (Zero external icon dependencies)
  // =========================================================================
  const ICON = {
    book: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    chart: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    volOn: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    volOff: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',
    dl: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    back: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    layers: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    eye: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    hand: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v4"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
    box: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
    wifiOff: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F4A62A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/></svg>',
  };

  // =========================================================================
  // 4. WEB AUDIO SOUND SYNTHESIZER
  // =========================================================================
  let audioCtx = null;
  function getAudio() {
    if (!state.soundEnabled) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(function () {});
    return audioCtx;
  }

  function playTone(freqs, type, dur, vol, step) {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    freqs.forEach(function (f, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, now + i * step);
      gain.gain.setValueAtTime(vol, now + i * step);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * step + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * step);
      osc.stop(now + i * step + dur + 0.02);
    });
  }

  const sfx = {
    tick: () => playTone([480], 'triangle', 0.045, 0.07, 0),
    flip: () => playTone([320, 520], 'sine', 0.07, 0.08, 0.03),
    stop: () => playTone([392, 330], 'sine', 0.16, 0.09, 0.08),
    reveal: (high) => playTone([high ? 587 : 440, high ? 740 : 554], 'triangle', 0.14, 0.09, 0.05),
    bust: () => playTone([220, 196, 165], 'sawtooth', 0.2, 0.05, 0.11),
    win: () => playTone([523, 659, 784, 1046], 'triangle', 0.25, 0.1, 0.08),
  };

  // =========================================================================
  // 5. APPLICATION STATE & RELOAD RECOVERY
  // =========================================================================
  const savedLang = safeGet(KEYS.LANG, 'ru');
  const initialLang = savedLang === 'en' ? 'en' : 'ru';
  const savedSession = safeGet(KEYS.SESSION, null);
  const hasValidSession =
    savedSession &&
    (savedSession.screen === 'playing' || savedSession.screen === 'finale') &&
    Array.isArray(savedSession.teams) &&
    savedSession.teams.length > 0 &&
    Array.isArray(savedSession.gameDeck) &&
    savedSession.gameDeck.length > 0;

  const state = {
    lang: initialLang,
    soundEnabled: safeGet(KEYS.SOUND, true) !== false,
    usedCardIds: Array.isArray(safeGet(KEYS.USED, [])) ? safeGet(KEYS.USED, []) : [],
    customCards: Array.isArray(safeGet(KEYS.CUSTOM, [])) ? safeGet(KEYS.CUSTOM, []) : [],
    teamCount: hasValidSession ? savedSession.teamCount : 2,
    teamNames: hasValidSession ? savedSession.teamNames : DEFAULT_NAMES[initialLang].slice(),
    mode: hasValidSession ? savedSession.mode : 'classic',
    exact21Rule: hasValidSession ? savedSession.exact21Rule : 'two_points',
    screen: hasValidSession ? savedSession.screen : 'setup',
    teams: hasValidSession ? savedSession.teams : [],
    gameDeck: hasValidSession ? savedSession.gameDeck : [],
    currentCardIndex: hasValidSession ? savedSession.currentCardIndex : 0,
    activeTeamIndex: hasValidSession ? savedSession.activeTeamIndex : 0,
    roundNumber: hasValidSession ? savedSession.roundNumber : 1,
    turnStage: hasValidSession ? savedSession.turnStage : 'question',
    pendingGuess: hasValidSession ? savedSession.pendingGuess : null,
    seriesRoundNumber: hasValidSession ? savedSession.seriesRoundNumber : 1,
    outcome: hasValidSession ? savedSession.outcome : null,

    // Ephemeral UI state
    peekLocked: false,
    hasPeeked: false,
    modal: null, // 'rules' | 'stats' | 'box' | 'inspect' | 'exit' | 'ios' | null
    inspectTeamId: null,
    openFactKey: null,
    customAnswer: 5,
    customError: '',
    toast: hasValidSession ? I18N[initialLang].toastRestored : null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    deferredPrompt: null,
    isInstalled:
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true,
    isIOS: /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()),
    isReinstalling: false,
    skipBeforeUnload: false,
  };

  // Keep the display awake only while a game or its results are on screen.
  // Wake locks are released by the browser when the document is hidden, so
  // request them again when the app becomes visible. Unsupported browsers
  // simply continue without this optional feature.
  let screenWakeLock = null;
  let wakeLockRequestPending = false;

  function isGameScreenActive() {
    return state.screen === 'playing' || state.screen === 'finale';
  }

  async function releaseScreenWakeLock() {
    const lock = screenWakeLock;
    screenWakeLock = null;
    if (lock) {
      try {
        await lock.release();
      } catch (_) {}
    }
  }

  async function syncScreenWakeLock() {
    if (!isGameScreenActive() || document.visibilityState !== 'visible') {
      await releaseScreenWakeLock();
      return;
    }
    if (!('wakeLock' in navigator) || screenWakeLock || wakeLockRequestPending) return;

    wakeLockRequestPending = true;
    try {
      const lock = await navigator.wakeLock.request('screen');
      // The screen may have changed while the asynchronous request was pending.
      if (!isGameScreenActive() || document.visibilityState !== 'visible') {
        await lock.release().catch(function () {});
        return;
      }
      screenWakeLock = lock;
      lock.addEventListener('release', function () {
        if (screenWakeLock === lock) {
          screenWakeLock = null;
          // A release can be browser initiated; retry while the game remains visible.
          if (isGameScreenActive() && document.visibilityState === 'visible') {
            syncScreenWakeLock();
          }
        }
      });
    } catch (_) {
      // Permission, platform, or transient errors must not affect gameplay.
    } finally {
      wakeLockRequestPending = false;
    }
  }

  document.addEventListener('visibilitychange', syncScreenWakeLock);

  let toastTimer = null;
  function showToast(msg) {
    state.toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      state.toast = null;
      render();
    }, 3200);
  }

  if (state.toast) {
    toastTimer = setTimeout(function () {
      state.toast = null;
      render();
    }, 3200);
  }

  function persistSession() {
    if ((state.screen === 'playing' || state.screen === 'finale') && state.teams.length > 0) {
      safeSet(KEYS.SESSION, {
        screen: state.screen,
        teamCount: state.teamCount,
        teamNames: state.teamNames,
        mode: state.mode,
        exact21Rule: state.exact21Rule,
        teams: state.teams,
        gameDeck: state.gameDeck,
        currentCardIndex: state.currentCardIndex,
        activeTeamIndex: state.activeTeamIndex,
        roundNumber: state.roundNumber,
        turnStage: state.turnStage,
        pendingGuess: state.pendingGuess,
        seriesRoundNumber: state.seriesRoundNumber,
        outcome: state.outcome,
      });
    } else {
      safeRemove(KEYS.SESSION);
    }
  }

  // Accidental reload guard
  window.addEventListener('beforeunload', function (e) {
    if (state.skipBeforeUnload) return;
    if (state.screen === 'playing' || state.screen === 'finale') {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Connectivity & PWA install listeners
  window.addEventListener('online', function () {
    state.isOnline = true;
    render();
  });
  window.addEventListener('offline', function () {
    state.isOnline = false;
    render();
  });
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    state.deferredPrompt = e;
    render();
  });
  window.addEventListener('appinstalled', function () {
    state.isInstalled = true;
    state.deferredPrompt = null;
    render();
  });

  // Scoped Service Worker registration (strictly ./ scope!)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js', { scope: './', updateViaCache: 'none' })
        .catch(function () {});
    });
  }

  // =========================================================================
  // 5b. CONTEXTUAL SMOOTH SCROLL HELPERS
  // =========================================================================
  let pendingScrollTimer = 0;

  function getScrollBehavior(instant) {
    if (instant) return 'auto';
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'auto';
    }
    return 'smooth';
  }

  function scrollToTop(instant) {
    window.scrollTo({ top: 0, behavior: getScrollBehavior(instant) });
  }

  function scrollToEl(el, opts) {
    if (!el) return;
    const o = opts || {};
    const offset = typeof o.offset === 'number' ? o.offset : 66;
    const bottomMargin = typeof o.bottomMargin === 'number' ? o.bottomMargin : 20;
    const onlyIfNeeded = !!o.onlyIfNeeded;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const safeTop = offset;
    const safeBottom = vh - bottomMargin;

    if (onlyIfNeeded) {
      if (rect.top >= safeTop && rect.bottom <= safeBottom) return;
      if (rect.height <= safeBottom - safeTop && rect.bottom > safeBottom) {
        window.scrollTo({
          top: Math.max(0, window.scrollY + (rect.bottom - safeBottom)),
          behavior: getScrollBehavior(o.instant),
        });
        return;
      }
    }

    const targetY = Math.max(0, rect.top + window.scrollY - safeTop);
    window.scrollTo({ top: targetY, behavior: getScrollBehavior(o.instant) });
  }

  function scheduleScrollToId(id, opts, delayMs) {
    if (pendingScrollTimer) clearTimeout(pendingScrollTimer);
    const run = function () {
      requestAnimationFrame(function () {
        scrollToEl(document.getElementById(id), opts);
      });
    };
    if (delayMs && delayMs > 0) {
      pendingScrollTimer = setTimeout(run, delayMs);
    } else {
      run();
    }
  }

  function getCurrentRevealTeamId() {
    const ordered = state.teams.slice().sort((a, b) => (a.stopOrder || 99) - (b.stopOrder || 99));
    const first = ordered.find((tm) => tm.cards.some((c) => !c.revealed));
    return first ? first.id : null;
  }

  // =========================================================================
  // 6. GAME ENGINE LOGIC
  // =========================================================================
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function getAllBoxCards() {
    return DATA.OFFICIAL_DECK.concat(state.customCards);
  }

  function getRemainingCount() {
    const used = new Set(state.usedCardIds);
    return getAllBoxCards().filter((c) => !used.has(c.id)).length;
  }

  function drawDeck20() {
    const all = getAllBoxCards();
    const used = new Set(state.usedCardIds);
    const fresh = shuffle(all.filter((c) => !used.has(c.id)));
    if (fresh.length >= 20) return fresh.slice(0, 20);
    const played = shuffle(all.filter((c) => used.has(c.id)));
    state.usedCardIds = [];
    safeSet(KEYS.USED, []);
    showToast(I18N[state.lang].toastReshuffled);
    return fresh.concat(played).slice(0, 20);
  }

  function startNewParty(preserveSeries) {
    state.gameDeck = drawDeck20();
    const nextTeams = [];
    for (let i = 0; i < state.teamCount; i++) {
      const prev = preserveSeries ? state.teams[i] : null;
      const name = (state.teamNames[i] || '').trim() || DEFAULT_NAMES[state.lang][i];
      nextTeams.push({
        id: 'team-' + (i + 1),
        name: name,
        color: TEAM_THEMES[i],
        cards: [],
        estimatedSum: 0,
        stopped: false,
        stopOrder: null,
        seriesScore: prev ? prev.seriesScore : 0,
      });
    }
    state.teams = nextTeams;
    state.currentCardIndex = 0;
    state.activeTeamIndex = 0;
    state.roundNumber = 1;
    state.turnStage = 'question';
    state.pendingGuess = null;
    state.outcome = null;
    state.peekLocked = false;
    state.hasPeeked = false;
    state.openFactKey = null;
    state.seriesRoundNumber = preserveSeries ? state.seriesRoundNumber + 1 : 1;
    state.screen = 'playing';
    sfx.flip();
    persistSession();
    render();
    scrollToTop(true);
  }

  function findNextActive(fromIdx) {
    const n = state.teams.length;
    for (let off = 1; off <= n; off++) {
      const idx = (fromIdx + off) % n;
      if (!state.teams[idx].stopped) return idx;
    }
    return -1;
  }

  function enterFinale() {
    let maxOrd = state.teams.reduce((m, tm) => Math.max(m, tm.stopOrder || 0), 0);
    state.teams.forEach(function (tm) {
      if (!tm.stopOrder) {
        maxOrd += 1;
        tm.stopped = true;
        tm.stopOrder = maxOrd;
      }
    });
    state.outcome = null;
    state.screen = 'finale';
    sfx.stop();
    persistSession();
    render();
    scrollToTop(true);
  }

  function completeHandoff() {
    if (state.pendingGuess === null) return;
    const card = state.gameDeck[state.currentCardIndex];
    if (!card) return;
    if (!state.usedCardIds.includes(card.id)) {
      state.usedCardIds.push(card.id);
      safeSet(KEYS.USED, state.usedCardIds);
    }
    const active = state.teams[state.activeTeamIndex];
    active.estimatedSum += state.pendingGuess;
    active.cards.push({
      card: card,
      guessedValue: state.pendingGuess,
      roundTaken: state.roundNumber,
      revealed: false,
    });

    const nextCardIdx = state.currentCardIndex + 1;
    const nextTeamIdx = findNextActive(state.activeTeamIndex);
    state.pendingGuess = null;
    state.turnStage = 'question';
    state.peekLocked = false;
    state.hasPeeked = false;

    if (nextTeamIdx === -1 || nextCardIdx >= state.gameDeck.length) {
      if (nextCardIdx >= state.gameDeck.length) {
        showToast(I18N[state.lang].toastExhausted);
      }
      enterFinale();
      return;
    }

    if (nextTeamIdx <= state.activeTeamIndex) {
      state.roundNumber += 1;
    }
    state.currentCardIndex = nextCardIdx;
    state.activeTeamIndex = nextTeamIdx;
    sfx.flip();
    persistSession();
    render();
    scheduleScrollToId('active-turn-stage', { offset: 62, onlyIfNeeded: false });
  }

  function stopActiveTeam() {
    const active = state.teams[state.activeTeamIndex];
    const maxOrd = state.teams.reduce((m, tm) => Math.max(m, tm.stopOrder || 0), 0);
    active.stopped = true;
    active.stopOrder = maxOrd + 1;
    state.pendingGuess = null;
    state.turnStage = 'question';
    state.peekLocked = false;
    state.hasPeeked = false;

    const nextTeamIdx = findNextActive(state.activeTeamIndex);
    if (nextTeamIdx === -1) {
      enterFinale();
      return;
    }

    if (nextTeamIdx <= state.activeTeamIndex) {
      state.roundNumber += 1;
    }
    state.activeTeamIndex = nextTeamIdx;
    sfx.stop();
    showToast(I18N[state.lang].toastStopped(active.name));
    persistSession();
    render();
    scheduleScrollToId('active-turn-stage', { offset: 62, onlyIfNeeded: false });
  }

  function checkOutcomeIfDone() {
    const allDone = state.teams.every((tm) => tm.cards.every((c) => c.revealed));
    if (!allDone || state.outcome) return;

    const scores = state.teams.map((tm) => ({
      id: tm.id,
      sum: tm.cards.reduce((s, c) => s + c.card.answer, 0),
    }));
    const valid = scores.filter((s) => s.sum <= 21);
    const exact21Ids = valid.filter((s) => s.sum === 21).map((s) => s.id);

    let winnerIds = [];
    let allBusted = false;
    let isTie = false;

    if (valid.length === 0) {
      allBusted = true;
      sfx.bust();
    } else {
      const best = Math.max.apply(null, valid.map((s) => s.sum));
      winnerIds = valid.filter((s) => s.sum === best).map((s) => s.id);
      isTie = winnerIds.length > 1;
      sfx.win();
    }

    let seriesWinnerIds = [];
    if (state.mode === 'super') {
      state.teams.forEach(function (tm) {
        if (!winnerIds.includes(tm.id)) return;
        const isExact = exact21Ids.includes(tm.id);
        let delta = 1;
        if (isExact) {
          delta = state.exact21Rule === 'instant_win' ? Math.max(2, 3 - tm.seriesScore) : 2;
        }
        tm.seriesScore += delta;
      });
      const reached3 = state.teams.filter((tm) => tm.seriesScore >= 3);
      if (reached3.length > 0) {
        const top = Math.max.apply(null, reached3.map((tm) => tm.seriesScore));
        seriesWinnerIds = reached3.filter((tm) => tm.seriesScore === top).map((tm) => tm.id);
      }
    }

    state.outcome = { winnerIds, allBusted, isTie, exact21Ids, seriesWinnerIds };
  }

  function toggleLang() {
    sfx.tick();
    const prev = state.lang;
    const next = prev === 'ru' ? 'en' : 'ru';
    state.teamNames = state.teamNames.map((n, i) =>
      n === DEFAULT_NAMES[prev][i] ? DEFAULT_NAMES[next][i] : n
    );
    state.teams.forEach(function (tm, i) {
      if (tm.name === DEFAULT_NAMES[prev][i]) tm.name = DEFAULT_NAMES[next][i];
    });
    state.lang = next;
    safeSet(KEYS.LANG, next);
    persistSession();
    render();
  }

  // =========================================================================
  // 7. HTML RENDERING
  // =========================================================================
  function renderCardHtml(card, flipped, sizeClass, footerText, dataAttr) {
    return `
      <div class="card-perspective ${sizeClass}" ${dataAttr || ''}>
        <div class="card-inner ${flipped ? 'is-flipped' : ''}" id="${sizeClass === 'card-lg' ? 'active-card-inner' : ''}">
          <div class="card-face card-front">
            <span class="card-qmark" aria-hidden="true">?</span>
            <div class="card-question">${escapeHtml(cardQ(card, state.lang))}</div>
            <div class="card-footer-hint">${footerText ? escapeHtml(footerText) : ''}</div>
          </div>
          <div class="card-face card-back">
            <div class="card-sunburst">
              <span class="card-answer-num tabular-nums">${formatNum(card.answer)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderInstallButton(t) {
    if (state.isInstalled) return '';
    if (state.deferredPrompt) {
      return `<button type="button" class="install-btn" data-action="install-pwa" aria-label="${escapeHtml(t.install)}" title="${escapeHtml(t.install)}">${ICON.dl}</button>`;
    }
    if (state.isIOS) {
      return `<button type="button" class="install-btn" data-action="open-modal" data-modal="ios" aria-label="${escapeHtml(t.install)}" title="${escapeHtml(t.install)}">${ICON.dl}</button>`;
    }
    return '';
  }

  function renderSetup(t) {
    const allCount = getAllBoxCards().length;
    const remCount = getRemainingCount();
    let teamInputsHtml = '';
    for (let i = 0; i < state.teamCount; i++) {
      teamInputsHtml += `
        <div class="team-input-wrap">
          <span class="team-dot" style="background:${TEAM_THEMES[i].hex}"></span>
          <input class="team-input" type="text" maxlength="24" data-team-input="${i}"
            value="${escapeHtml(state.teamNames[i] || '')}"
            placeholder="${escapeHtml(DEFAULT_NAMES[state.lang][i])}" />
        </div>`;
    }

    return `
      <div class="page-shell">
        <header class="topbar">
          <div class="topbar-inner">
            <span class="brand">${t.appTitle}</span>
            <div class="topbar-actions">
              ${renderInstallButton(t)}
              <button type="button" class="icon-btn" data-action="open-modal" data-modal="rules" aria-label="${t.rulesAria}" title="${t.rulesAria}">${ICON.book}</button>
              <button type="button" class="lang-btn" data-action="toggle-lang">${state.lang === 'ru' ? 'EN' : 'RU'}</button>
              <button type="button" class="icon-btn ${state.soundEnabled ? '' : 'muted'}" data-action="toggle-sound" aria-label="Sound">${state.soundEnabled ? ICON.volOn : ICON.volOff}</button>
            </div>
          </div>
        </header>

        <main class="main-wrap">
          <div class="setup-grid">
            <section>
              <div class="hero-box">
                <div class="hero-meta">
                  <span>${t.metaLine}</span>
                  <span class="hero-21">21</span>
                </div>
                <h1 class="hero-title">${t.appTitle}</h1>
                <p class="hero-desc">${t.heroDesc}</p>
                <div class="hero-footer">
                  <span class="tabular-nums">${t.inBox(remCount, allCount)}</span>
                  <button type="button" class="hero-box-link" data-action="open-modal" data-modal="box">${ICON.box}<span>${t.boxBtn}</span></button>
                </div>
              </div>
              <div class="hero-note">
                <div class="hero-note-title">${t.noteTitle}</div>
                <p style="margin:0;">${t.noteBody}</p>
              </div>
            </section>

            <section class="stack-md">
              <div id="setup-teams-panel" class="panel stack-sm">
                <div class="panel-head">
                  <h2 class="panel-title">${t.teamsTitle}</h2>
                  <div class="segmented">
                    ${[2, 3, 4]
                      .map(
                        (c) =>
                          `<button type="button" class="seg-btn tabular-nums ${state.teamCount === c ? 'active' : ''}" data-action="set-team-count" data-val="${c}">${c}</button>`
                      )
                      .join('')}
                  </div>
                </div>
                <p class="muted-note">${t.teamsHint}</p>
                <div class="teams-inputs">${teamInputsHtml}</div>
              </div>

              <div class="panel stack-sm">
                <h2 class="panel-title">${t.modeTitle}</h2>
                <div class="mode-grid">
                  <button type="button" class="mode-card ${state.mode === 'classic' ? 'active' : ''}" data-action="set-mode" data-val="classic">
                    <div class="mode-card-title">${t.classicTitle}</div>
                    <p class="mode-card-desc">${t.classicDesc}</p>
                  </button>
                  <button type="button" class="mode-card ${state.mode === 'super' ? 'active' : ''}" data-action="set-mode" data-val="super">
                    <div class="mode-card-title">${t.superTitle}</div>
                    <p class="mode-card-desc">${t.superDesc}</p>
                  </button>
                </div>
                ${
                  state.mode === 'super'
                    ? `<div id="setup-exact21-row" class="exact21-row">
                        <span>${t.exact21Label}</span>
                        <div class="segmented">
                          <button type="button" class="seg-btn ${state.exact21Rule === 'two_points' ? 'active-light' : ''}" data-action="set-21-rule" data-val="two_points">${t.exact21Two}</button>
                          <button type="button" class="seg-btn ${state.exact21Rule === 'instant_win' ? 'active-light' : ''}" data-action="set-21-rule" data-val="instant_win">${t.exact21Instant}</button>
                        </div>
                      </div>`
                    : ''
                }
              </div>

              <div class="desktop-only">
                <button type="button" class="btn-primary display-cta" data-action="start-game">${ICON.play}<span>${t.startGame}</span></button>
              </div>
            </section>
          </div>
        </main>

        <div class="mobile-sticky-cta">
          <button type="button" class="btn-primary display-cta" data-action="start-game">${ICON.play}<span>${t.startGame}</span></button>
        </div>
      </div>
    `;
  }

  function renderTracksHtml(t) {
    return state.teams
      .map(function (tm, idx) {
        const isActive = idx === state.activeTeamIndex && !tm.stopped;
        const pct = (Math.max(0, Math.min(21, tm.estimatedSum)) / 21) * 100;
        const over = tm.estimatedSum > 21;
        const near = tm.estimatedSum >= 18 && tm.estimatedSum <= 21;
        const barCol = over ? '#D93848' : tm.color.hex;
        const statusText = over
          ? `<span style="color:var(--danger);font-weight:700;">${t.bustRisk}</span>`
          : near
          ? `<span style="color:#B86E00;font-weight:700;">${t.near21}</span>`
          : `<span>${t.moveHint}</span>`;

        return `
          <div class="track-card ${isActive ? 'active' : ''}" style="${isActive ? 'box-shadow:0 0 0 2px ' + tm.color.hex + ',0 6px 20px rgba(17,42,36,0.09);' : ''}">
            <div class="track-head">
              <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                <span class="team-dot" style="background:${tm.color.hex}"></span>
                <strong style="font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(tm.name)}</strong>
                ${isActive ? `<span style="font-size:12px;font-weight:700;color:${tm.color.text};white-space:nowrap;">${t.activeDot}</span>` : ''}
                ${tm.stopped && tm.stopOrder ? `<span style="font-size:12px;font-weight:600;color:#7A6E58;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;">${ICON.lock}${t.stoppedTag(tm.stopOrder)}</span>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                ${state.mode === 'super' ? `<span class="tabular-nums" style="font-size:12px;font-weight:600;color:var(--ink-muted);">${t.seriesTag(tm.seriesScore)}</span>` : ''}
                <button type="button" class="text-btn" style="min-height:32px;padding:0 6px;color:var(--emerald);" data-action="inspect-team" data-team="${tm.id}">
                  ${ICON.layers}<span class="tabular-nums">${tm.cards.length}</span>
                </button>
              </div>
            </div>

            <div class="track-controls">
              <button type="button" class="step-btn" data-action="adj-est" data-team="${tm.id}" data-delta="-1" ${tm.estimatedSum <= 0 ? 'disabled' : ''}>−</button>
              <div class="track-rail-wrap">
                <div class="track-rail">
                  <div class="track-groove">
                    <div class="track-fill" style="width:${pct}%;background:${barCol};"></div>
                  </div>
                  <div class="track-token tabular-nums" style="left:${pct}%;background:${barCol};">${tm.estimatedSum}</div>
                </div>
                <div class="track-marks tabular-nums">
                  <span>0</span><span>1</span><span>5</span><span>10</span><span>15</span><span style="color:#B82838;">21</span>
                </div>
              </div>
              <button type="button" class="step-btn" data-action="adj-est" data-team="${tm.id}" data-delta="1">+</button>
            </div>

            <div class="track-foot tabular-nums">
              <span>${t.estLine(tm.estimatedSum)}</span>
              ${statusText}
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderGame(t) {
    const active = state.teams[state.activeTeamIndex];
    const card = state.gameDeck[state.currentCardIndex];
    const opponents = state.teams
      .filter((tm) => tm.id !== active.id)
      .map((tm) => tm.name)
      .join(', ');
    const canStop = state.roundNumber >= 3 && active.cards.length >= 2;
    const projected =
      state.pendingGuess !== null ? active.estimatedSum + state.pendingGuess : active.estimatedSum;
    const flipped = state.turnStage === 'handoff' && state.peekLocked;

    let stageControls = '';
    if (state.turnStage === 'question') {
      const guessButtons = Array.from({ length: 11 }, (_, n) => {
        const sel = state.pendingGuess === n;
        return `<button type="button" class="guess-btn tabular-nums ${sel ? 'selected' : ''}" style="${sel ? 'background:' + active.color.hex : ''}" data-action="pick-guess" data-val="${n}">${n}</button>`;
      }).join('');

      const projHtml =
        state.pendingGuess !== null
          ? `${active.estimatedSum} + ${state.pendingGuess} = <strong style="color:${projected > 21 ? 'var(--danger)' : projected >= 18 ? '#B86E00' : 'var(--emerald)'}">~${projected}</strong>`
          : t.nowEst(active.estimatedSum);

      stageControls = `
        <div class="panel stack-sm" style="margin-top:18px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:12px;">
            <strong style="color:#395249;">${t.guessPrompt}</strong>
            <span class="tabular-nums" style="color:var(--ink-muted);font-weight:600;">${projHtml}</span>
          </div>
          <div class="guess-grid">
            ${guessButtons}
            <div class="guess-avg">${t.avg5}</div>
          </div>
        </div>
        <div id="guess-action-wrap" class="stack-sm" style="margin-top:14px;">
          <button type="button" class="btn-primary" data-action="confirm-take" ${state.pendingGuess === null ? 'disabled' : ''}>${t.takeShow}</button>
          ${
            canStop
              ? `<button type="button" class="btn-stop" data-action="stop-team">${ICON.lock}<span>${t.stopBtn}</span></button>`
              : `<p class="muted-note" style="text-align:center;">${t.stopLocked}</p>`
          }
        </div>
      `;
    } else {
      stageControls = `
        <div class="panel stack-sm" style="margin-top:18px;">
          <div style="font-size:14px;line-height:1.45;">${t.passToOpponents(opponents, active.name)}</div>
          <button type="button" id="hold-peek-btn" class="peek-btn ${state.peekLocked ? 'peeking' : ''}">
            ${state.peekLocked ? ICON.eye : ICON.hand}
            <span id="hold-peek-label">${state.peekLocked ? t.releaseHide : t.holdPeek}</span>
          </button>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--ink-muted);">
            <span id="peek-status-text">${state.hasPeeked ? t.peekDone : t.releaseHint}</span>
            <button type="button" style="color:var(--emerald);font-weight:700;min-height:32px;" data-action="toggle-lock-peek">
              ${state.peekLocked ? t.lockHide : t.lockShow}
            </button>
          </div>
        </div>
        <div style="margin-top:12px;">
          <button type="button" id="complete-handoff-btn" class="btn-primary" data-action="complete-handoff" ${state.hasPeeked ? '' : 'disabled'}>${t.hidePass}</button>
        </div>
      `;
    }

    return `
      <div class="page-shell">
        <header class="topbar">
          <div class="topbar-inner">
            <button type="button" class="text-btn" data-action="open-modal" data-modal="exit" aria-label="${escapeHtml(t.menu)}">${ICON.back}<span class="desktop-only-inline">${t.menu}</span></button>
            <div class="topbar-center tabular-nums">${t.roundDeck(state.roundNumber, Math.max(0, state.gameDeck.length - state.currentCardIndex))}</div>
            <div class="topbar-actions">
              <button type="button" class="icon-btn" data-action="open-modal" data-modal="rules" aria-label="${t.rulesAria}" title="${t.rulesAria}">${ICON.book}</button>
              <button type="button" class="lang-btn" data-action="toggle-lang">${state.lang === 'ru' ? 'EN' : 'RU'}</button>
              <button type="button" class="icon-btn ${state.soundEnabled ? '' : 'muted'}" data-action="toggle-sound" aria-label="Sound">${state.soundEnabled ? ICON.volOn : ICON.volOff}</button>
            </div>
          </div>
        </header>

        <main class="main-wrap" style="padding-bottom:32px;">
          <div class="game-grid">
            <section id="active-turn-stage" class="card-stage">
              <div class="turn-bar">
                <div class="turn-team">
                  <span class="team-dot" style="background:${active.color.hex}"></span>
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${state.turnStage === 'question' ? escapeHtml(t.turnOf(active.name)) : t.secretTitle}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                  <span class="turn-meta tabular-nums">${state.turnStage === 'question' ? t.cardsCount(active.cards.length) : t.teamGuess(state.pendingGuess)}</span>
                  ${state.turnStage === 'question' ? `<button type="button" class="jump-btn mobile-only-jump" data-action="scroll-to" data-target="tracks-stage">${t.jumpToTracks}</button>` : ''}
                </div>
              </div>

              ${renderCardHtml(card, flipped, 'card-lg', state.turnStage === 'question' ? t.footerQ : flipped ? '' : t.footerHidden)}

              ${stageControls}
            </section>

            <aside id="tracks-stage" class="stack-sm">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 4px;">
                <h2 class="panel-title" style="font-size:16px;color:var(--emerald);">${t.tracksTitle}</h2>
                <span class="desktop-only-inline" style="font-size:12px;color:var(--ink-muted);">${t.estSums}</span>
                <button type="button" class="jump-btn mobile-only-jump" data-action="scroll-to" data-target="active-turn-stage">${t.jumpToCard}</button>
              </div>
              <div class="stack-sm">${renderTracksHtml(t)}</div>
            </aside>
          </div>
        </main>
      </div>
    `;
  }

  function renderFinale(t) {
    const ordered = state.teams.slice().sort((a, b) => (a.stopOrder || 99) - (b.stopOrder || 99));
    const allRevealed = state.teams.every((tm) => tm.cards.every((c) => c.revealed));
    const currentTeam = ordered.find((tm) => tm.cards.some((c) => !c.revealed)) || null;
    const out = state.outcome;
    const hasSeriesWin = state.mode === 'super' && out && out.seriesWinnerIds.length > 0;

    let verdictHtml = '';
    if (allRevealed && out) {
      const winTitleText = out.allBusted
        ? t.allLostTitle
        : out.isTie
        ? t.tieTitle(
            state.teams
              .filter((tm) => out.winnerIds.includes(tm.id))
              .map((tm) => tm.name)
              .join(t.tieJoin)
          )
        : t.winTitle((state.teams.find((tm) => tm.id === out.winnerIds[0]) || {}).name || '');

      const badgeText = out.allBusted
        ? t.bustBadge
        : out.exact21Ids.length > 0
        ? t.exact21Badge
        : state.mode === 'super'
        ? t.seriesResults(state.seriesRoundNumber)
        : t.classicResults;

      const seriesBlock =
        state.mode === 'super'
          ? `<div class="series-box">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;opacity:0.85;margin-bottom:8px;">${t.superTitleBox}</div>
              ${state.teams
                .map(
                  (tm) =>
                    `<div style="display:flex;justify-content:space-between;gap:16px;font-size:14px;margin-bottom:4px;"><span>${escapeHtml(tm.name)}</span><strong class="font-display tabular-nums" style="font-size:17px;">${tm.seriesScore} / 3</strong></div>`
                )
                .join('')}
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.2);font-size:11px;opacity:0.85;">${t.superHint(state.exact21Rule === 'instant_win')}</div>
              ${
                hasSeriesWin
                  ? `<div style="margin-top:6px;font-size:12px;font-weight:700;color:var(--gold);">${
                      out.seriesWinnerIds.length > 1
                        ? t.seriesTie
                        : escapeHtml(
                            t.seriesChamp(
                              (state.teams.find((tm) => tm.id === out.seriesWinnerIds[0]) || {}).name || ''
                            )
                          )
                    }</div>`
                  : ''
              }
            </div>`
          : '';

      verdictHtml = `
        <section id="finale-verdict" class="verdict-box ${out.allBusted ? 'bust' : ''}">
          <div class="verdict-inner">
            <div>
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;opacity:0.88;">${badgeText}</div>
              <h1 class="font-display" style="margin:6px 0;font-size:clamp(28px,4vw,38px);text-transform:uppercase;line-height:1.08;">${escapeHtml(winTitleText)}</h1>
              <p style="margin:0;font-size:14px;opacity:0.9;">${out.allBusted ? t.allLostDesc : out.isTie ? t.tieDesc : t.winDesc}</p>
            </div>
            ${seriesBlock}
          </div>
        </section>
      `;
    }

    const teamsHtml = ordered
      .map(function (tm) {
        const revCards = tm.cards.filter((c) => c.revealed);
        const sum = revCards.reduce((s, c) => s + c.card.answer, 0);
        const done = tm.cards.every((c) => c.revealed);
        const bust = sum > 21;
        const exact21 = done && sum === 21;
        const isWin = allRevealed && out && out.winnerIds.includes(tm.id);
        const isCurr = currentTeam && currentTeam.id === tm.id;

        const cardsRows = tm.cards
          .map(function (pl, idx) {
            const fKey = tm.id + '-' + idx;
            const showF = state.openFactKey === fKey;
            const fact = cardFact(pl.card, state.lang);
            return `
              <div>
                <div class="finale-card-row">
                  <div style="cursor:pointer;" data-action="flip-finale-card" data-team="${tm.id}" data-idx="${idx}">
                    ${renderCardHtml(pl.card, pl.revealed, 'card-sm', '')}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:700;line-height:1.35;">${escapeHtml(cardQ(pl.card, state.lang))}</div>
                    <div class="tabular-nums" style="margin-top:6px;font-size:12px;color:var(--ink-muted);display:flex;flex-wrap:wrap;gap:8px;">
                      <span>${t.guessedLbl(pl.guessedValue)}</span>
                      <span>·</span>
                      ${
                        pl.revealed
                          ? `<strong style="color:var(--emerald);">${t.answerLbl(formatNum(pl.card.answer))}</strong>`
                          : `<button type="button" style="color:var(--emerald);font-weight:700;text-decoration:underline;" data-action="flip-finale-card" data-team="${tm.id}" data-idx="${idx}">${t.flipBtn}</button>`
                      }
                    </div>
                    ${
                      pl.revealed && fact
                        ? `<button type="button" style="margin-top:6px;font-size:12px;font-weight:600;color:var(--ink-muted);" data-action="toggle-fact" data-key="${fKey}">${showF ? t.hideFact : t.whyBtn}</button>`
                        : ''
                    }
                  </div>
                </div>
                ${pl.revealed && showF && fact ? `<div id="fact-box-${fKey}" class="fact-box">${escapeHtml(fact)}</div>` : ''}
              </div>
            `;
          })
          .join('');

        return `
          <section id="finale-team-${tm.id}" class="finale-team-card ${isWin ? 'winner' : isCurr ? 'next-reveal' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--surface-muted);">
              <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="team-dot" style="background:${tm.color.hex}"></span>
                  <h2 class="font-display" style="margin:0;font-size:21px;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(tm.name)}</h2>
                </div>
                <div class="tabular-nums" style="font-size:12px;color:var(--ink-muted);margin-top:4px;">${t.stoppedEst(tm.stopOrder || 1, tm.estimatedSum)}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="font-display tabular-nums" style="font-size:38px;font-weight:700;line-height:1;color:${bust ? 'var(--danger)' : exact21 ? 'var(--emerald)' : 'var(--ink)'};">${sum}</div>
                <div style="font-size:11px;font-weight:700;margin-top:3px;color:${bust ? 'var(--danger)' : exact21 ? 'var(--emerald)' : 'var(--ink-muted)'};">
                  ${bust ? t.bustLabel : exact21 ? t.exact21Sum : done ? t.finalSum : t.openedOf(revCards.length, tm.cards.length)}
                </div>
              </div>
            </div>
            <div class="stack-sm" style="margin-top:14px;">${cardsRows}</div>
            ${
              revCards.length > 0
                ? `<div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--surface-muted);display:flex;justify-content:space-between;font-size:12px;color:var(--ink-muted);" class="tabular-nums">
                    <span>${revCards.map((c) => c.card.answer).join(' + ')} = <strong style="color:var(--ink);">${sum}</strong></span>
                    ${!done ? `<button type="button" style="color:var(--emerald);font-weight:700;" data-action="reveal-team" data-team="${tm.id}">${t.openAllSmall}</button>` : ''}
                  </div>`
                : ''
            }
          </section>
        `;
      })
      .join('');

    const isSeriesFinished = hasSeriesWin && out.seriesWinnerIds.length === 1;
    const nextAction = isSeriesFinished ? 'reset-series-play' : 'next-game';
    const nextLabel = isSeriesFinished
      ? t.newSeries
      : state.mode === 'super'
      ? t.nextSeries
      : t.playAgain;

    return `
      <div class="page-shell">
        <header class="topbar">
          <div class="topbar-inner">
            <button type="button" class="brand" style="text-align:left;" data-action="finale-focus-important">${t.revealHeader}</button>
            <div class="topbar-actions">
              <button type="button" class="lang-btn" data-action="toggle-lang">${state.lang === 'ru' ? 'EN' : 'RU'}</button>
              ${
                !allRevealed
                  ? `<button type="button" class="btn-secondary" style="min-height:40px;" data-action="reveal-all">${ICON.eye}<span>${t.revealAll}</span></button>`
                  : `<button type="button" class="text-btn" data-action="go-menu">${t.toMenu}</button>`
              }
            </div>
          </div>
        </header>

        <main class="main-wrap stack-md">
          ${
            !allRevealed
              ? `<div class="panel" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
                  <div style="font-size:14px;flex:1;min-width:220px;">${t.revealRule}</div>
                  ${currentTeam ? `<button type="button" class="btn-primary" style="width:auto;min-height:40px;font-size:12px;" data-action="reveal-team" data-team="${currentTeam.id}">${t.revealTeamBtn}</button>` : ''}
                </div>`
              : ''
          }

          ${verdictHtml}

          <div class="finale-grid">${teamsHtml}</div>

          ${
            allRevealed
              ? `<div class="desktop-only">
                  <div class="desktop-flex" style="margin-top:8px;">
                    <button type="button" class="btn-primary display-cta" style="width:auto;padding:0 28px;" data-action="${nextAction}">${nextLabel}</button>
                    <button type="button" class="btn-secondary" style="min-height:54px;padding:0 24px;" data-action="go-menu">${t.settingsTeams}</button>
                  </div>
                </div>`
              : ''
          }
        </main>

        ${
          allRevealed
            ? `<div class="mobile-sticky-cta">
                <button type="button" class="btn-primary display-cta" data-action="${nextAction}">${nextLabel}</button>
              </div>`
            : ''
        }
      </div>
    `;
  }

  function renderModal(t) {
    if (!state.modal) return '';

    if (state.modal === 'ios') {
      return `
        <div class="modal-backdrop" data-action="close-modal">
          <div class="modal-sheet" style="max-width:400px;padding:20px;" data-stop-prop="1">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <h3 class="font-display" style="margin:0;color:var(--emerald);text-transform:uppercase;">${t.iosInstallTitle}</h3>
              <button type="button" class="icon-btn" data-action="close-modal">${ICON.close}</button>
            </div>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.55;">${t.iosInstallHtml}</p>
            <button type="button" class="btn-primary" style="min-height:44px;" data-action="close-modal">${t.gotIt}</button>
          </div>
        </div>
      `;
    }

    if (state.modal === 'exit') {
      return `
        <div class="modal-backdrop" data-action="close-modal">
          <div class="modal-sheet" style="max-width:380px;padding:22px;" data-stop-prop="1">
            <h3 class="font-display" style="margin:0 0 8px;font-size:21px;text-transform:uppercase;">${t.abortTitle}</h3>
            <p style="margin:0 0 18px;font-size:14px;color:var(--ink-muted);">${t.abortDesc}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <button type="button" class="btn-secondary" data-action="close-modal">${t.stay}</button>
              <button type="button" class="btn-danger" data-action="go-menu">${t.toMenu}</button>
            </div>
          </div>
        </div>
      `;
    }

    if (state.modal === 'inspect') {
      const tm = state.teams.find((x) => x.id === state.inspectTeamId);
      if (!tm) return '';
      const listHtml =
        tm.cards.length === 0
          ? `<p style="text-align:center;color:var(--ink-muted);padding:24px 0;">${t.noCardsYet}</p>`
          : `<p class="muted-note" style="margin-bottom:12px;">${t.cardsUpNote}</p>` +
            tm.cards
              .map(
                (pl, idx) => `
              <div class="played-mini-card" style="margin-bottom:10px;">
                <div style="min-width:0;">
                  <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:2px;">${t.cardRound(idx + 1, pl.roundTaken)}</div>
                  <div class="font-display" style="font-size:14px;text-transform:uppercase;line-height:1.3;">${escapeHtml(cardQ(pl.card, state.lang))}</div>
                </div>
                <div style="text-align:right;padding-left:10px;border-left:1px solid rgba(255,255,255,0.18);flex-shrink:0;">
                  <div style="font-size:10px;opacity:0.75;">${t.estShort}</div>
                  <div class="font-display tabular-nums" style="font-size:20px;font-weight:700;color:var(--gold);">~${pl.guessedValue}</div>
                </div>
              </div>`
              )
              .join('');

      return `
        <div class="modal-backdrop" data-action="close-modal">
          <div class="modal-sheet" data-stop-prop="1">
            <div class="modal-header">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="team-dot" style="background:${tm.color.hex}"></span>
                <h3 class="font-display" style="margin:0;text-transform:uppercase;">${escapeHtml(t.teamCardsTitle(tm.name))}</h3>
              </div>
              <button type="button" class="icon-btn" data-action="close-modal">${ICON.close}</button>
            </div>
            <div class="modal-body">${listHtml}</div>
          </div>
        </div>
      `;
    }

    // Rules / Stats / Box modal
    const allCount = getAllBoxCards().length;
    const remCount = getRemainingCount();
    let bodyHtml = '';

    if (state.modal === 'rules') {
      bodyHtml = `
        ${t.rulesHtml}
        <div class="reinstall-section">
          <h3 class="font-display" style="color:var(--emerald);text-transform:uppercase;margin:0 0 6px;">${t.reinstallTitle}</h3>
          <p class="muted-note" style="margin:0 0 12px;">${t.reinstallDesc}</p>
          <button type="button" class="btn-reinstall" data-action="reinstall-app" ${state.isReinstalling ? 'disabled' : ''}>
            <span class="${state.isReinstalling ? 'spin-icon' : ''}" style="display:inline-flex;">${ICON.refresh}</span>
            <span>${state.isReinstalling ? t.reinstallingBtn : t.reinstallBtn}</span>
          </button>
        </div>
      `;
    } else if (state.modal === 'stats') {
      const maxDist = Math.max.apply(null, [1].concat(Object.values(DATA.OFFICIAL_DISTRIBUTION)));
      const bars = Object.entries(DATA.OFFICIAL_DISTRIBUTION)
        .map(function ([val, cnt]) {
          const num = Number(val);
          const pct = (cnt / maxDist) * 100;
          const col = num >= 3 && num <= 7 ? '#0B4A37' : num === 0 || num === 10 ? '#E06224' : '#148F86';
          return `
            <div class="stats-bar-row">
              <span class="font-display tabular-nums" style="width:28px;text-align:right;font-weight:700;">${formatNum(num)}</span>
              <div class="stats-bar-track">
                <div class="stats-bar-fill tabular-nums" style="width:${pct}%;background:${col};">${t.cardsWord(cnt)}</div>
              </div>
            </div>`;
        })
        .join('');

      bodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding-bottom:12px;border-bottom:1px solid var(--border-soft);margin-bottom:14px;">
          <div>
            <h3 class="font-display" style="margin:0;color:var(--emerald);text-transform:uppercase;">${t.statsTitle}</h3>
            <div style="font-size:12px;color:var(--ink-muted);">${t.statsSub}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:var(--ink-muted);">${t.avgLbl}</div>
            <div class="font-display tabular-nums" style="font-size:28px;font-weight:700;color:var(--emerald);">5.0</div>
          </div>
        </div>
        <div class="stack-sm" style="gap:8px;">${bars}</div>
        <p class="muted-note" style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border-soft);">${t.statsFoot}</p>
      `;
    } else if (state.modal === 'box') {
      const numBtns = Array.from({ length: 11 }, (_, n) => {
        const active = state.customAnswer === n;
        return `<button type="button" class="guess-btn tabular-nums ${active ? 'selected' : ''}" style="min-height:36px;${active ? 'background:var(--emerald);' : ''}" data-action="set-custom-ans" data-val="${n}">${n}</button>`;
      }).join('');

      const customList =
        state.customCards.length > 0
          ? `<div class="stack-sm" style="margin-top:16px;">
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--ink-muted);">${t.yourCards(state.customCards.length)}</div>
              ${state.customCards
                .map(
                  (c) => `
                <div class="panel" style="padding:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                  <div style="min-width:0;">
                    <div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(c.question)}</div>
                    <div style="font-size:11px;color:var(--ink-muted);">${t.customHidden}</div>
                  </div>
                  <button type="button" class="icon-btn" style="color:var(--danger);" data-action="del-custom" data-id="${c.id}">${ICON.trash}</button>
                </div>`
                )
                .join('')}
            </div>`
          : '';

      bodyHtml = `
        <div class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;">
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--ink-muted);">${t.boxRemLbl}</div>
            <div class="font-display tabular-nums" style="font-size:30px;font-weight:700;color:var(--emerald);">${remCount} <span style="font-size:18px;color:#7A6E58;">/ ${allCount}</span></div>
            <div style="font-size:12px;color:var(--ink-muted);margin-top:2px;">${t.boxRemNote}</div>
          </div>
          <button type="button" class="btn-secondary" data-action="reset-box" ${state.usedCardIds.length === 0 ? 'disabled' : ''}>${t.reshuffleBtn}</button>
        </div>

        <form id="custom-card-form" class="panel stack-sm">
          <h3 class="font-display" style="margin:0;color:var(--emerald);text-transform:uppercase;">${t.addTitle}</h3>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-muted);margin-bottom:4px;">${t.qLbl}</label>
            <input id="custom-q-input" class="form-input" type="text" placeholder="${escapeHtml(t.qPlaceholder)}" />
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-muted);margin-bottom:6px;">${t.aLbl} <strong style="color:var(--emerald);">${state.customAnswer}</strong></label>
            <div class="guess-grid">${numBtns}</div>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-muted);margin-bottom:4px;">${t.fLbl}</label>
            <input id="custom-f-input" class="form-input" type="text" placeholder="${escapeHtml(t.fPlaceholder)}" />
          </div>
          ${state.customError ? `<div style="font-size:12px;font-weight:700;color:var(--danger);">${escapeHtml(state.customError)}</div>` : ''}
          <button type="submit" class="btn-primary" style="min-height:44px;">${t.addBtn}</button>
        </form>
        ${customList}
      `;
    }

    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-sheet" data-stop-prop="1">
          <div class="modal-header">
            <h2 class="font-display" style="margin:0;color:var(--emerald);text-transform:uppercase;">${t.modalTitle}</h2>
            <button type="button" class="icon-btn" data-action="close-modal">${ICON.close}</button>
          </div>
          <div style="padding:12px 20px 6px;">
            <div class="segmented full">
              <button type="button" class="seg-btn ${state.modal === 'rules' ? 'active-light' : ''}" data-action="open-modal" data-modal="rules">${t.tabRules}</button>
              <button type="button" class="seg-btn ${state.modal === 'stats' ? 'active-light' : ''}" data-action="open-modal" data-modal="stats">${t.tabStats}</button>
              <button type="button" class="seg-btn ${state.modal === 'box' ? 'active-light' : ''}" data-action="open-modal" data-modal="box">${t.tabBox(remCount)}</button>
            </div>
          </div>
          <div class="modal-body">${bodyHtml}</div>
        </div>
      </div>
    `;
  }

  function render() {
    syncScreenWakeLock();
    const t = I18N[state.lang];
    document.documentElement.lang = state.lang;
    document.title = t.docTitle;

    const root = document.getElementById('app');
    let html = '';
    if (state.screen === 'setup') html = renderSetup(t);
    else if (state.screen === 'playing') html = renderGame(t);
    else html = renderFinale(t);

    html += renderModal(t);

    if (!state.isOnline) {
      html += `<div class="offline-badge" role="status">${ICON.wifiOff}<span>${t.offlineMsg}</span></div>`;
    }
    if (state.toast) {
      html += `<div class="toast" role="status">${escapeHtml(state.toast)}</div>`;
    }

    root.innerHTML = html;
    bindDynamicControls();
  }

  // Bind hold-to-peek directly without re-rendering during hold
  function bindDynamicControls() {
    const holdBtn = document.getElementById('hold-peek-btn');
    if (holdBtn) {
      const t = I18N[state.lang];
      const setPeekVisual = function (open) {
        const cardInner = document.getElementById('active-card-inner');
        const lbl = document.getElementById('hold-peek-label');
        const statusEl = document.getElementById('peek-status-text');
        const doneBtn = document.getElementById('complete-handoff-btn');
        if (cardInner) cardInner.classList.toggle('is-flipped', open);
        holdBtn.classList.toggle('peeking', open);
        if (lbl) lbl.textContent = open ? t.releaseHide : t.holdPeek;
        if (open && !state.hasPeeked) {
          state.hasPeeked = true;
          if (statusEl) statusEl.textContent = t.peekDone;
          if (doneBtn) doneBtn.disabled = false;
        }
      };

      holdBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (!state.peekLocked) {
          sfx.flip();
          setPeekVisual(true);
        }
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
        holdBtn.addEventListener(ev, function () {
          if (!state.peekLocked) {
            setPeekVisual(false);
            if (state.hasPeeked) {
              scheduleScrollToId('complete-handoff-btn', { offset: 62, bottomMargin: 24, onlyIfNeeded: true });
            }
          }
        });
      });
      holdBtn.addEventListener('contextmenu', function (e) {
        e.preventDefault();
      });
    }

    const customForm = document.getElementById('custom-card-form');
    if (customForm) {
      customForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const qInput = document.getElementById('custom-q-input');
        const fInput = document.getElementById('custom-f-input');
        const q = (qInput.value || '').trim();
        const f = (fInput.value || '').trim();
        if (q.length < 6) {
          state.customError = I18N[state.lang].qErr;
          render();
          return;
        }
        state.customCards.unshift({
          id: 'custom-' + Date.now(),
          question: q,
          answer: state.customAnswer,
          fact: f || undefined,
          isCustom: true,
        });
        safeSet(KEYS.CUSTOM, state.customCards);
        state.customAnswer = 5;
        state.customError = '';
        sfx.reveal(false);
        showToast(I18N[state.lang].toastAdded);
        render();
      });
    }
  }

  // =========================================================================
  // 8. DELEGATED EVENT HANDLERS
  // =========================================================================
  const appRoot = document.getElementById('app');

  appRoot.addEventListener('input', function (e) {
    const target = e.target;
    if (target && target.hasAttribute('data-team-input')) {
      const idx = Number(target.getAttribute('data-team-input'));
      state.teamNames[idx] = target.value;
    }
  });

  appRoot.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (el.getAttribute('data-action') === 'close-modal' && e.target.closest('[data-stop-prop]') && e.target.closest('[data-action]') === el) {
      // Allow explicit close buttons inside modal
    } else if (el.getAttribute('data-action') === 'close-modal' && e.target !== el && e.target.closest('[data-stop-prop]')) {
      return;
    }

    const action = el.getAttribute('data-action');
    switch (action) {
      case 'toggle-lang':
        toggleLang();
        break;
      case 'toggle-sound':
        state.soundEnabled = !state.soundEnabled;
        safeSet(KEYS.SOUND, state.soundEnabled);
        render();
        break;
      case 'install-pwa':
        if (state.deferredPrompt) {
          state.deferredPrompt.prompt();
          state.deferredPrompt.userChoice.then(function (res) {
            if (res && res.outcome === 'accepted') {
              state.isInstalled = true;
              state.deferredPrompt = null;
              render();
            }
          });
        }
        break;
      case 'open-modal':
        state.modal = el.getAttribute('data-modal');
        state.customError = '';
        render();
        break;
      case 'close-modal':
        state.modal = null;
        state.inspectTeamId = null;
        render();
        break;
      case 'scroll-to': {
        const targetId = el.getAttribute('data-target');
        scrollToEl(document.getElementById(targetId), { offset: 64 });
        break;
      }
      case 'finale-focus-important': {
        const verdictEl = document.getElementById('finale-verdict');
        if (verdictEl) {
          scrollToEl(verdictEl, { offset: 68 });
        } else {
          const curId = getCurrentRevealTeamId();
          if (curId) scrollToEl(document.getElementById('finale-team-' + curId), { offset: 68 });
        }
        break;
      }
      case 'set-team-count': {
        const prevCount = state.teamCount;
        const nextCount = Number(el.getAttribute('data-val'));
        sfx.tick();
        state.teamCount = nextCount;
        render();
        if (nextCount > prevCount) {
          scheduleScrollToId('setup-teams-panel', { offset: 70, bottomMargin: 96, onlyIfNeeded: true });
        }
        break;
      }
      case 'set-mode': {
        const prevMode = state.mode;
        const nextMode = el.getAttribute('data-val');
        sfx.tick();
        state.mode = nextMode;
        render();
        if (nextMode === 'super' && prevMode !== 'super') {
          scheduleScrollToId('setup-exact21-row', { offset: 70, bottomMargin: 96, onlyIfNeeded: true });
        }
        break;
      }
      case 'set-21-rule':
        sfx.tick();
        state.exact21Rule = el.getAttribute('data-val');
        render();
        break;
      case 'start-game':
        startNewParty(false);
        break;
      case 'pick-guess':
        sfx.tick();
        state.pendingGuess = Number(el.getAttribute('data-val'));
        persistSession();
        render();
        scheduleScrollToId('guess-action-wrap', { offset: 62, bottomMargin: 24, onlyIfNeeded: true });
        break;
      case 'confirm-take':
        if (state.pendingGuess !== null) {
          sfx.flip();
          state.turnStage = 'handoff';
          state.peekLocked = false;
          state.hasPeeked = false;
          persistSession();
          render();
          scheduleScrollToId('active-turn-stage', { offset: 62, onlyIfNeeded: false });
        }
        break;
      case 'toggle-lock-peek':
        state.peekLocked = !state.peekLocked;
        if (state.peekLocked) {
          state.hasPeeked = true;
          sfx.flip();
        }
        render();
        if (!state.peekLocked && state.hasPeeked) {
          scheduleScrollToId('complete-handoff-btn', { offset: 62, bottomMargin: 24, onlyIfNeeded: true });
        }
        break;
      case 'complete-handoff':
        completeHandoff();
        break;
      case 'stop-team':
        stopActiveTeam();
        break;
      case 'adj-est': {
        const tm = state.teams.find((x) => x.id === el.getAttribute('data-team'));
        const delta = Number(el.getAttribute('data-delta'));
        if (tm) {
          sfx.tick();
          tm.estimatedSum = Math.max(0, Math.min(35, tm.estimatedSum + delta));
          persistSession();
          render();
        }
        break;
      }
      case 'inspect-team':
        state.inspectTeamId = el.getAttribute('data-team');
        state.modal = 'inspect';
        render();
        break;
      case 'go-menu':
        state.modal = null;
        state.screen = 'setup';
        safeRemove(KEYS.SESSION);
        render();
        scrollToTop(true);
        break;
      case 'flip-finale-card': {
        const tm = state.teams.find((x) => x.id === el.getAttribute('data-team'));
        const idx = Number(el.getAttribute('data-idx'));
        if (tm && tm.cards[idx]) {
          const item = tm.cards[idx];
          if (!item.revealed) {
            const prevRevTeam = getCurrentRevealTeamId();
            const hadOutcome = !!state.outcome;
            item.revealed = true;
            const sum = tm.cards.filter((c) => c.revealed).reduce((s, c) => s + c.card.answer, 0);
            if (sum > 21) sfx.bust();
            else sfx.reveal(item.card.answer >= 7);
            checkOutcomeIfDone();
            persistSession();
            render();
            if (!hadOutcome && state.outcome) {
              scheduleScrollToId('finale-verdict', { offset: 68, onlyIfNeeded: false }, 360);
            } else {
              const nextRevTeam = getCurrentRevealTeamId();
              if (nextRevTeam && nextRevTeam !== prevRevTeam) {
                scheduleScrollToId('finale-team-' + nextRevTeam, { offset: 68, onlyIfNeeded: false }, 280);
              }
            }
          } else if (cardFact(item.card, state.lang)) {
            const key = tm.id + '-' + idx;
            state.openFactKey = state.openFactKey === key ? null : key;
            render();
            if (state.openFactKey) {
              scheduleScrollToId('fact-box-' + state.openFactKey, { offset: 68, bottomMargin: 96, onlyIfNeeded: true });
            }
          }
        }
        break;
      }
      case 'toggle-fact': {
        const key = el.getAttribute('data-key');
        state.openFactKey = state.openFactKey === key ? null : key;
        render();
        if (state.openFactKey) {
          scheduleScrollToId('fact-box-' + state.openFactKey, { offset: 68, bottomMargin: 96, onlyIfNeeded: true });
        }
        break;
      }
      case 'reveal-team': {
        const tm = state.teams.find((x) => x.id === el.getAttribute('data-team'));
        if (tm) {
          const prevRevTeam = getCurrentRevealTeamId();
          const hadOutcome = !!state.outcome;
          tm.cards.forEach((c) => (c.revealed = true));
          const sum = tm.cards.reduce((s, c) => s + c.card.answer, 0);
          if (sum > 21) sfx.bust();
          else sfx.reveal(true);
          checkOutcomeIfDone();
          persistSession();
          render();
          if (!hadOutcome && state.outcome) {
            scheduleScrollToId('finale-verdict', { offset: 68, onlyIfNeeded: false }, 360);
          } else {
            const nextRevTeam = getCurrentRevealTeamId();
            if (nextRevTeam && nextRevTeam !== prevRevTeam) {
              scheduleScrollToId('finale-team-' + nextRevTeam, { offset: 68, onlyIfNeeded: false }, 280);
            }
          }
        }
        break;
      }
      case 'reveal-all': {
        const hadOutcome = !!state.outcome;
        state.teams.forEach((tm) => tm.cards.forEach((c) => (c.revealed = true)));
        checkOutcomeIfDone();
        persistSession();
        render();
        if (!hadOutcome && state.outcome) {
          scheduleScrollToId('finale-verdict', { offset: 68, onlyIfNeeded: false }, 360);
        }
        break;
      }
      case 'next-game':
        startNewParty(state.mode === 'super');
        break;
      case 'reset-series-play':
        startNewParty(false);
        break;
      case 'reset-box':
        state.usedCardIds = [];
        safeSet(KEYS.USED, []);
        sfx.flip();
        showToast(I18N[state.lang].toastReturned);
        render();
        break;
      case 'set-custom-ans':
        sfx.tick();
        state.customAnswer = Number(el.getAttribute('data-val'));
        render();
        break;
      case 'del-custom':
        state.customCards = state.customCards.filter((c) => c.id !== el.getAttribute('data-id'));
        safeSet(KEYS.CUSTOM, state.customCards);
        render();
        break;
      case 'reinstall-app': {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          showToast(I18N[state.lang].toastOfflineReinstall);
          render();
          break;
        }
        if (state.isReinstalling) break;
        state.isReinstalling = true;
        state.skipBeforeUnload = true;
        persistSession();
        render();

        // Strictly isolated cleanup: only this app's SW scope and cache prefix.
        // Never touches localStorage (all vanilka_blindjack_v1_* saves remain intact)
        // and never touches other GitHub Pages apps on the same domain.
        const expectedScope = new URL('./', window.location.href).href;
        const tasks = [];
        if ('serviceWorker' in navigator) {
          tasks.push(
            navigator.serviceWorker
              .getRegistrations()
              .then(function (regs) {
                return Promise.all(
                  regs
                    .filter(function (reg) {
                      return reg.scope === expectedScope;
                    })
                    .map(function (reg) {
                      return reg.unregister();
                    })
                );
              })
              .catch(function () {})
          );
        }
        if ('caches' in window) {
          tasks.push(
            caches
              .keys()
              .then(function (keys) {
                return Promise.all(
                  keys
                    .filter(function (key) {
                      return key.startsWith('vanilka-blindjack-cache-');
                    })
                    .map(function (key) {
                      return caches.delete(key);
                    })
                );
              })
              .catch(function () {})
          );
        }
        const coreUrls = [
          './index.html',
          './styles.css',
          './cards.js',
          './app.js',
          './manifest.webmanifest',
          './sw.js',
        ];
        Promise.all(tasks)
          .then(function () {
            // Refresh browser HTTP disk cache too (important for GitHub Pages max-age=600)
            return Promise.all(
              coreUrls.map(function (url) {
                return fetch(url, { cache: 'reload' }).catch(function () {});
              })
            );
          })
          .finally(function () {
            window.location.reload();
          });
        break;
      }
    }
  });

  // Initial render
  render();
})();

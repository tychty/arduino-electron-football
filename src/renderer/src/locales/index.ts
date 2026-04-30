export interface LocaleStrings {
  game: {
    score: string
    hits: string
    endGame: string
    done: string
    gameOver: string
    points: string
    enterYourName: string
    saveScore: string
    noActiveScoringPins: string
    miss: string
    goal: string
    pressSpaceToStart: string
    pressSpaceToLeaderboard: string
    place: string
  }
  playerInfo: {
    title: string
    name: string
    company: string
    email: string
    emailInvalid: string
    required: string
    start: string
  }
  leaderboard: {
    title: string
    noScoresYet: string
    colNumber: string
    colName: string
    colScore: string
    colDate: string
    newGame: string
    settings: string
  }
  settings: {
    back: string
    title: string
    connection: string
    game: string
    pins: string
    leaderboard: string
    language: string
    hitLimit: string
    hits: string
    hitDebounce: string
    flashDuration: string
    resetLeaderboard: string
    clearAllEntries: string
    yesClear: string
    cancel: string
    editLayout: string
  }
  connection: {
    selectPort: string
    refresh: string
    connect: string
    disconnect: string
    error: string
    deckConnected: string
    deckNotConnected: string
  }
  pins: {
    pin: string
    noKeybind: string
    key: string
    active: string
    miss: string
    scorePoints: string
    debounce: string
    noise: string
    addPin: string
  }
}

export type Language = 'en' | 'ru' | 'kz'

const en: LocaleStrings = {
  game: {
    score: 'score',
    hits: 'hits',
    endGame: 'End Game',
    done: 'Done',
    gameOver: 'game over',
    points: 'points',
    enterYourName: 'enter your name',
    saveScore: 'Save Score',
    noActiveScoringPins: 'no active scoring pins',
    miss: 'MISS',
    goal: 'GOOOAAAL!',
    pressSpaceToStart: 'PRESS SPACE TO START',
    pressSpaceToLeaderboard: 'PRESS SPACE TO GO TO LEADERBOARD',
    place: 'place',
  },
  playerInfo: {
    title: 'Player Info',
    name: 'Name',
    company: 'Company',
    email: 'Email',
    emailInvalid: 'Enter a valid email',
    required: 'Required',
    start: 'Start Game',
  },
  leaderboard: {
    title: 'Leaderboard',
    noScoresYet: 'no scores yet',
    colNumber: '#',
    colName: 'name',
    colScore: 'score',
    colDate: 'date',
    newGame: 'New Game',
    settings: 'Settings',
  },
  settings: {
    back: '← back',
    title: 'Settings',
    connection: 'Connection',
    game: 'Game',
    pins: 'Pins',
    leaderboard: 'Leaderboard',
    language: 'Language',
    hitLimit: 'hit limit',
    hits: 'hits',
    hitDebounce: 'hit debounce',
    flashDuration: 'flash duration',
    resetLeaderboard: 'reset leaderboard',
    clearAllEntries: 'clear all entries?',
    yesClear: 'yes, clear',
    cancel: 'cancel',
    editLayout: 'Edit Layout',
  },
  connection: {
    selectPort: '-- select port --',
    refresh: 'Refresh',
    connect: 'Connect',
    disconnect: 'Disconnect',
    error: 'Error',
    deckConnected: 'deck connected',
    deckNotConnected: 'deck not connected',
  },
  pins: {
    pin: 'pin',
    noKeybind: 'no keybind (pin > 9)',
    key: 'key',
    active: 'active',
    miss: 'miss',
    scorePoints: 'score points',
    debounce: 'debounce',
    noise: 'noise',
    addPin: '+ Add Pin',
  },
}

const ru: LocaleStrings = {
  game: {
    score: 'очки',
    hits: 'удары',
    endGame: 'Завершить игру',
    done: 'Готово',
    gameOver: 'игра окончена',
    points: 'очков',
    enterYourName: 'введите имя',
    saveScore: 'Сохранить',
    noActiveScoringPins: 'нет активных пинов',
    miss: 'МИМО',
    goal: 'ГОЛ!',
    pressSpaceToStart: 'НАЖМИТЕ ПРОБЕЛ',
    pressSpaceToLeaderboard: 'НАЖМИТЕ ПРОБЕЛ ДЛЯ ПЕРЕХОДА К РЕКОРДАМ',
    place: 'место',
  },
  playerInfo: {
    title: 'Данные игрока',
    name: 'Имя',
    company: 'Компания',
    email: 'Email',
    emailInvalid: 'Введите корректный email',
    required: 'Обязательное поле',
    start: 'Начать игру',
  },
  leaderboard: {
    title: 'Таблица рекордов',
    noScoresYet: 'пока нет результатов',
    colNumber: '#',
    colName: 'имя',
    colScore: 'очки',
    colDate: 'дата',
    newGame: 'Новая игра',
    settings: 'Настройки',
  },
  settings: {
    back: '← назад',
    title: 'Настройки',
    connection: 'Подключение',
    game: 'Игра',
    pins: 'Пины',
    leaderboard: 'Таблица рекордов',
    language: 'Язык',
    hitLimit: 'лимит ударов',
    hits: 'ударов',
    hitDebounce: 'задержка удара',
    flashDuration: 'длительность вспышки',
    resetLeaderboard: 'сбросить рекорды',
    clearAllEntries: 'удалить все записи?',
    yesClear: 'да, удалить',
    cancel: 'отмена',
    editLayout: 'Редактировать макет',
  },
  connection: {
    selectPort: '-- выбрать порт --',
    refresh: 'Обновить',
    connect: 'Подключить',
    disconnect: 'Отключить',
    error: 'Ошибка',
    deckConnected: 'контроллер подключён',
    deckNotConnected: 'контроллер не подключён',
  },
  pins: {
    pin: 'пин',
    noKeybind: 'нет клавиши (пин > 9)',
    key: 'клавиша',
    active: 'активен',
    miss: 'мимо',
    scorePoints: 'очки',
    debounce: 'задержка',
    noise: 'шум',
    addPin: '+ Добавить пин',
  },
}

const kz: LocaleStrings = {
  game: {
    score: 'ұпай',
    hits: 'соққы',
    endGame: 'Ойынды аяқтау',
    done: 'Дайын',
    gameOver: 'ойын аяқталды',
    points: 'ұпай',
    enterYourName: 'атыңызды енгізіңіз',
    saveScore: 'Нәтижені сақтау',
    noActiveScoringPins: 'белсенді пиндер жоқ',
    miss: 'ЖАҢЫЛЫС',
    goal: 'ГОЛ!',
    pressSpaceToStart: 'БАСТАУ ҮШІН БОС ОРЫНДЫ БАСЫҢЫЗ',
    pressSpaceToLeaderboard: 'РЕКОРДТАРҒА ӨТУ ҮШІН БОС ОРЫНДЫ БАСЫҢЫЗ',
    place: 'орын',
  },
  playerInfo: {
    title: 'Ойыншы туралы ақпарат',
    name: 'Аты',
    company: 'Компания',
    email: 'Email',
    emailInvalid: 'Жарамды email енгізіңіз',
    required: 'Міндетті өріс',
    start: 'Ойынды бастау',
  },
  leaderboard: {
    title: 'Рекордтар тізімі',
    noScoresYet: 'нәтижелер жоқ',
    colNumber: '#',
    colName: 'аты',
    colScore: 'ұпай',
    colDate: 'күні',
    newGame: 'Жаңа ойын',
    settings: 'Баптаулар',
  },
  settings: {
    back: '← артқа',
    title: 'Баптаулар',
    connection: 'Қосылым',
    game: 'Ойын',
    pins: 'Пиндер',
    leaderboard: 'Рекордтар тізімі',
    language: 'Тіл',
    hitLimit: 'соққы шегі',
    hits: 'соққы',
    hitDebounce: 'соққы кешігуі',
    flashDuration: 'жыпылықтау ұзақтығы',
    resetLeaderboard: 'рекордтарды тазалау',
    clearAllEntries: 'барлық жазбаларды жою?',
    yesClear: 'иә, жою',
    cancel: 'болдырмау',
    editLayout: 'Макетті өңдеу',
  },
  connection: {
    selectPort: '-- порт таңдау --',
    refresh: 'Жаңарту',
    connect: 'Қосу',
    disconnect: 'Ажырату',
    error: 'Қате',
    deckConnected: 'контроллер қосылды',
    deckNotConnected: 'контроллер қосылмаған',
  },
  pins: {
    pin: 'пин',
    noKeybind: 'пернесі жоқ (пин > 9)',
    key: 'перне',
    active: 'белсенді',
    miss: 'жаңылыс',
    scorePoints: 'ұпай',
    debounce: 'кешігу',
    noise: 'шуыл',
    addPin: '+ Пин қосу',
  },
}

export const locales: Record<Language, LocaleStrings> = { en, ru, kz }

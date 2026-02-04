// src/app/context/LanguageContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

// Полный набор ключей переводов
export type TranslationKeys =
  // Существующие ключи...
  | 'comingSoon'
  | 'course'
  | 'newsDescription'
  | 'knowledgeDescription'
  | 'educationDescription'
  | 'partnershipDescription'
  | 'myCompanyDescription'
  | 'myProjectsDescription'
  | 'myStartupsDescription'
  | 'settingsDescription'
  | 'licenseDescription'
  | 'supportDescription'
  | 'platformNewsDescription'
  | 'technicalMentor'
  | 'saintPetersburg'
  | 'architecture'
  | 'consultation'
  | 'webinar'
  | 'groupSession'
  | 'expertReview1'
  | 'expertReview2'
  | 'advancedFeatures'
  | 'article'
  | 'verifiedExpert'
  | 'expertFor'
  | 'sessionsCompleted'
  | 'averageRating'
  | 'graduates'
  | 'thisMonth'
  | 'todaySchedule'
  | 'start'
  | 'mentorshipQueue'
  | 'requestsWaiting'
  | 'reviewRequests'
  | 'areasOfExpertise'
  | 'currentMentees'
  | 'active'
  | 'pending'
  | 'createdContent'
  | 'views'
  | 'reviewsAndRatings'
  | 'earningsStats'
  | 'totalBalance'
  | 'thisMonthEarnings'
  | 'platform'
  | 'search'
  | 'profile'
  | 'login'
  | 'register'
  | 'loginLabel'
  | 'loginPlaceholder'
  | 'passwordLabel'
  | 'passwordPlaceholder'
  | 'forgotPassword'
  | 'cancel'
  | 'loginButton'
  | 'emailLabel'
  | 'emailPlaceholder'
  | 'confirmPasswordLabel'
  | 'confirmPasswordPlaceholder'
  | 'agreeToTerms'
  | 'registerButton'
  | 'passwordMismatch'
  | 'menu'
  | 'myCompany'
  | 'myProjects'
  | 'myStartups'
  | 'news'
  | 'knowledgeBase'
  | 'education'
  | 'partnershipProgram'
  | 'settings'
  | 'licenseAndPayment'
  | 'support'
  | 'platformNews'
  | 'colorScheme'
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'online'
  | 'offline'
  | 'typeMessage'
  | 'aboutUs'
  | 'help'
  | 'privacy'
  | 'allSystemsOperational'
  | 'platformUpdate'
  | 'platformUpdateDesc'
  | 'newTeamMembers'
  | 'newTeamMembersDesc'
  | 'webinarSchedule'
  | 'webinarScheduleDesc'
  | 'gettingStarted'
  | 'userGuides'
  | 'faq'
  | 'technicalDocs'
  | 'videoTutorials'
  | 'tipsAndTricks'
  | 'articles'
  | 'platformBasics'
  | 'advancedFeatures'
  | 'systemAdministration'
  | 'hours'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'becomePartner'
  | 'becomePartnerDesc'
  | 'join'
  | 'highCommissions'
  | 'highCommissionsDesc'
  | 'support247'
  | 'support247Desc'
  | 'revenueGrowth'
  | 'revenueGrowthDesc'
  | 'darkMode'
  | 'lightMode'
  | 'language'
  | 'sortBy'
  | 'filterByTopic'
  | 'viewMode'
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'allTopics'
  | 'updates'
  | 'announcements'
  | 'events'
  | 'listView'
  | 'gridView'
  | 'compactView'
  | 'messenger'
  | 'contacts'
  | 'businessNotifications'
  | 'aiAssistant'
  | 'aiAssistantDescription'
  | 'aiSuggest1'
  | 'aiSuggest2'
  | 'aiSuggest3'
  | 'aiInputPlaceholder'
  | 'ask'
  | 'contactAnna'
  | 'contactPeter'
  | 'contactMaria'
  | 'contactIvan'
  | 'chatMessage1'
  | 'chatMessage2'
  | 'notifTitle1'
  | 'notifMessage1'
  | 'notifTime1'
  | 'notifTitle2'
  | 'notifMessage2'
  | 'notifTime2'
  | 'notifTitle3'
  | 'notifMessage3'
  | 'notifTime3'
  | 'companyInfo'
  | 'companyManagement'
  | 'companyName'
  | 'companyNameValue'
  | 'inn'
  | 'innValue'
  | 'employees'
  | 'employeesValue'
  | 'registrationDate'
  | 'registrationDateValue'
  | 'yourActiveProjects'
  | 'projectAlpha'
  | 'projectBeta'
  | 'projectGamma'
  | 'inProgress'
  | 'planning'
  | 'completed'
  | 'chatPanel'
  | 'swapPosition'
  | 'collapse'
  | 'expand'
  | 'usernameLabel'
  | 'usernamePlaceholder'
  | 'usernameRequirements'
  | 'usernameInvalid'
  | 'usernameOptional'
  | 'firstNameLabel'
  | 'firstNamePlaceholder'
  | 'lastNameLabel'
  | 'lastNamePlaceholder'
  | 'passwordRecommendations'
  | 'passwordManagerSuggestion'
  | 'optional'
  | 'registerSuccess'
  | 'registerError'
  | 'passwordInvalid'
  | 'loginSuccess'
  | 'loginError'
  | 'loading'
  | 'logoutSuccess'
  | 'logoutError'
  | 'myProfile'
  | 'logout'
  | 'editProfile'
  | 'personalInfo'
  | 'location'
  | 'notSpecified'
  | 'phone'
  | 'position'
  | 'educationalProgress'
  | 'currentCourses'
  | 'completedCourses'
  | 'noCourses'
  | 'certificates'
  | 'skills'
  | 'community'
  | 'followers'
  | 'following'
  | 'groups'
  | 'myPortfolio'
  | 'noPortfolioYet'
  | 'addProject'
  | 'activityStats'
  | 'achievements'
  | 'recentActivity'
  | 'noActivityYet'
  | 'companyDescription'
  | 'educationalPlatform'
  | 'verified'
  | 'employeesCount'
  | 'editCompanyProfile'
  | 'team'
  | 'activeProjects'
  | 'openVacancies'
  | 'completedProjects'
  | 'aboutCompany'
  | 'ourTeam'
  | 'viewAllTeam'
  | 'applicants'
  | 'apply'
  | 'postNewVacancy'
  | 'members'
  | 'techStack'
  | 'portfolio'
  | 'partners'
  | 'companyNews'
  | 'companyNewsTitle1'
  | 'companyNewsText1'
  | 'companyNewsTitle2'
  | 'companyNewsText2'
  | 'contactInfo'
  | 'businessInquiries'
  | 'recruitment'
  | 'accelerator'
  | 'investor'
  | 'partner'
  | 'founded';

const translations = {
  ru: {
    course: 'курс',
    platform: 'Платформа',
    search: 'Поиск...',
    profile: 'Профиль',
    login: 'Войти',
    register: 'Зарегистрироваться',
    loginLabel: 'Логин',
    loginPlaceholder: 'Введите логин',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'Введите пароль',
    forgotPassword: 'Забыли пароль?',
    cancel: 'Отмена',
    loginButton: 'Войти',
    emailLabel: 'Email',
    emailPlaceholder: 'Введите email',
    confirmPasswordLabel: 'Подтверждение пароля',
    confirmPasswordPlaceholder: 'Повторите пароль',
    agreeToTerms: 'Я согласен с условиями использования и политикой конфиденциальности',
    registerButton: 'Зарегистрироваться',
    passwordMismatch: 'Пароли не совпадают',
    menu: 'Меню',
    myCompany: 'Моя компания',
    myProjects: 'Мои проекты',
    myStartups: 'Мои стартапы',
    news: 'Новости',
    knowledgeBase: 'База знаний',
    education: 'Обучение',
    partnershipProgram: 'Партнерская программа',
    settings: 'Настройки',
    licenseAndPayment: 'Лицензия и оплата',
    support: 'Поддержка',
    platformNews: 'Новости платформы',
    colorScheme: 'Цветовая схема',
    blue: 'Синий',
    purple: 'Фиолетовый',
    green: 'Зеленый',
    orange: 'Оранжевый',
    online: 'В сети',
    offline: 'Не в сети',
    typeMessage: 'Введите сообщение...',
    aboutUs: 'О нас',
    help: 'Помощь',
    privacy: 'Конфиденциальность',
    allSystemsOperational: 'Все системы работают',
    platformUpdate: 'Обновление платформы v2.0',
    platformUpdateDesc: 'Мы рады представить новую версию платформы с улучшенным интерфейсом и расширенными возможностями.',
    newTeamMembers: 'Новые участники команды',
    newTeamMembersDesc: 'В нашу команду присоединилось 5 новых специалистов для улучшения качества обслуживания.',
    webinarSchedule: 'Расписание вебинаров',
    webinarScheduleDesc: 'Опубликовано расписание вебинаров на первый квартал 2026 года.',
    gettingStarted: 'Начало работы',
    userGuides: 'Руководства пользователя',
    faq: 'FAQ',
    technicalDocs: 'Техническая документация',
    videoTutorials: 'Видеоуроки',
    tipsAndTricks: 'Советы и хитрости',
    articles: 'статей',
    platformBasics: 'Основы работы с платформой',
    advancedFeatures: 'Продвинутые возможности',
    systemAdministration: 'Администрирование системы',
    hours: 'часа',
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    becomePartner: 'Станьте нашим партнером',
    becomePartnerDesc: 'Получайте до 30% от каждого привлеченного клиента',
    join: 'Присоединиться',
    highCommissions: 'Высокие комиссии',
    highCommissionsDesc: 'До 30% с каждой продажи',
    support247: 'Поддержка 24/7',
    support247Desc: 'Персональный менеджер',
    revenueGrowth: 'Рост дохода',
    revenueGrowthDesc: 'Регулярные выплаты',
    darkMode: 'Темная тема',
    lightMode: 'Светлая тема',
    language: 'Язык',
    sortBy: 'Сортировка',
    filterByTopic: 'Фильтр по темам',
    viewMode: 'Вид',
    newest: 'Новые',
    oldest: 'Старые',
    popular: 'Популярные',
    allTopics: 'Все темы',
    updates: 'Обновления',
    announcements: 'Объявления',
    events: 'События',
    listView: 'Список',
    gridView: 'Сетка',
    compactView: 'Компактный',
    messenger: 'Мессенджер',
    contacts: 'Контакты',
    businessNotifications: 'Бизнес-уведомления',
    aiAssistant: 'ИИ помощник',
    aiAssistantDescription: 'Задайте вопрос или выберите готовый сценарий',
    aiSuggest1: 'Как создать новый проект?',
    aiSuggest2: 'Показать аналитику за месяц',
    aiSuggest3: 'Помощь с настройками',
    aiInputPlaceholder: 'Задайте вопрос...',
    ask: 'Спросить',
    contactAnna: 'Анна Иванова',
    contactPeter: 'Петр Сидоров',
    contactMaria: 'Мария Петрова',
    contactIvan: 'Иван Иванов',
    chatMessage1: 'Привет! Как дела?',
    chatMessage2: 'Отлично, спасибо!',
    notifTitle1: 'Новый проект',
    notifMessage1: 'Добавлен проект "Веб-платформа"',
    notifTime1: '5 мин назад',
    notifTitle2: 'Обновление',
    notifMessage2: 'Система обновлена до версии 2.0',
    notifTime2: '1 час назад',
    notifTitle3: 'Встреча',
    notifMessage3: 'Напоминание о встрече в 15:00',
    notifTime3: '2 часа назад',
    companyInfo: 'Информация о компании',
    companyManagement: 'Управление информацией о вашей компании',
    companyName: 'Название компании',
    companyNameValue: 'ООО "Технологии будущего"',
    inn: 'ИНН',
    innValue: '7701234567',
    employees: 'Сотрудников',
    employeesValue: '24 человека',
    registrationDate: 'Дата регистрации',
    registrationDateValue: '15 марта 2020',
    yourActiveProjects: 'Ваши активные проекты',
    projectAlpha: 'Проект Alpha',
    projectBeta: 'Проект Beta',
    projectGamma: 'Проект Gamma',
    inProgress: 'В процессе',
    planning: 'Планирование',
    completed: 'завершено',
    chatPanel: 'Панель чата',
    swapPosition: 'Поменять местами',
    collapse: 'Свернуть',
    expand: 'Развернуть',
    usernameLabel: 'Имя пользователя',
    usernamePlaceholder: 'johndoe (необязательно)',
    usernameRequirements: '3-30 символов, буквы, цифры, подчеркивания',
    usernameInvalid: 'Имя пользователя может содержать только буквы, цифры и подчеркивания (3-30 символов)',
    usernameOptional: 'Если не указано, будет использован email',
    firstNameLabel: 'Имя',
    firstNamePlaceholder: 'Иван (необязательно)',
    lastNameLabel: 'Фамилия',
    lastNamePlaceholder: 'Иванов (необязательно)',
    passwordRecommendations: 'Для надежного пароля:',
    passwordManagerSuggestion: 'Рекомендуем использовать менеджер паролей для создания надежных паролей.',
    optional: '(необязательно)',
    registerSuccess: 'Регистрация успешна!',
    registerError: 'Ошибка регистрации',
    passwordInvalid: 'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
    loginSuccess: 'Вход выполнен успешно!',
    loginError: 'Ошибка входа',
    loading: 'Загрузка...',
    logoutSuccess: 'Выход выполнен успешно',
    logoutError: 'Ошибка выхода',
    myProfile: 'Мой профиль',
    logout: 'Выйти',
    editProfile: 'Редактировать профиль',
    personalInfo: 'Личная информация',
    location: 'Местоположение',
    notSpecified: 'Не указано',
    phone: 'Телефон',
    position: 'Должность',
    educationalProgress: 'Образовательный прогресс',
    currentCourses: 'Текущие курсы',
    completedCourses: 'Завершенные курсы',
    noCourses: 'Нет активных курсов',
    certificates: 'Сертификат',
    skills: 'Навыки',
    community: 'Сообщество',
    followers: 'Подписчики',
    following: 'Подписки',
    groups: 'Группы',
    myPortfolio: 'Мое портфолио',
    noPortfolioYet: 'Портфолио пока пусто',
    addProject: 'Добавить проект',
    activityStats: 'Статистика активности',
    achievements: 'Достижения',
    recentActivity: 'Недавняя активность',
    noActivityYet: 'Активность пока отсутствует',
    companyDescription: 'Ведущая технологическая компания, специализирующаяся на разработке инновационных решений для бизнеса и стартапов.',
    educationalPlatform: 'Образовательная платформа',
    verified: 'Проверено',
    employeesCount: 'сотрудников',
    editCompanyProfile: 'Редактировать профиль компании',
    team: 'Команда',
    activeProjects: 'Активные проекты',
    openVacancies: 'Открытые вакансии',
    completedProjects: 'Завершенные проекты',
    aboutCompany: 'О компании',
    ourTeam: 'Наша команда',
    viewAllTeam: 'Посмотреть всю команду',
    applicants: 'откликов',
    apply: 'Откликнуться',
    postNewVacancy: 'Разместить вакансию',
    members: 'участников',
    techStack: 'Технологический стек',
    portfolio: 'Портфолио',
    partners: 'Партнеры',
    companyNews: 'Новости компании',
    companyNewsTitle1: 'Запуск нового продукта',
    companyNewsText1: 'Мы рады объявить о запуске нового продукта для автоматизации бизнес-процессов.',
    companyNewsTitle2: 'Расширение команды',
    companyNewsText2: 'Наша команда продолжает расти. Присоединяйтесь к нам!',
    contactInfo: 'Контактная информация',
    businessInquiries: 'Деловые запросы',
    recruitment: 'Рекрутинг',
    accelerator: 'Акселератор',
    investor: 'Инвестор',
    partner: 'Партнер',
    founded: 'Основана',
    comingSoon: 'Скоро будет',
    newsDescription: 'Последние новости и обновления платформы',
    knowledgeDescription: 'База знаний и документация',
    educationDescription: 'Обучающие материалы и курсы',
    partnershipDescription: 'Партнерская программа и условия',
    myCompanyDescription: 'Управление информацией о вашей компании',
    myProjectsDescription: 'Ваши текущие проекты и задачи',
    myStartupsDescription: 'Управление стартапами и инвестициями',
    settingsDescription: 'Настройки аккаунта и системы',
    licenseDescription: 'Лицензии и управление оплатами',
    supportDescription: 'Поддержка пользователей и помощь',
    platformNewsDescription: 'Новости и обновления платформы',
    technicalMentor: 'Технический ментор',
    saintPetersburg: 'Санкт-Петербург',
    architecture: 'Архитектура',
    consultation: 'Консультация',
    webinar: 'Вебинар',
    groupSession: 'Групповая сессия',
    expertReview1: 'Отличный специалист, очень помог с архитектурой проекта',
    expertReview2: 'Очень профессионально и качественно',
    article: 'Статья',
    verifiedExpert: 'Проверенный эксперт',
    expertFor: 'Эксперт с',
    sessionsCompleted: 'Сессий проведено',
    averageRating: 'Средний рейтинг',
    graduates: 'Выпускников',
    thisMonth: 'В этом месяце',
    todaySchedule: 'Расписание на сегодня',
    start: 'Начать',
    mentorshipQueue: 'Очередь на менторство',
    requestsWaiting: 'запросов в ожидании',
    reviewRequests: 'Запросы на ревью',
    areasOfExpertise: 'Области экспертизы',
    currentMentees: 'Текущие менти',
    active: 'Активен',
    pending: 'В ожидании',
    createdContent: 'Созданный контент',
    views: 'просмотров',
    reviewsAndRatings: 'Отзывы и оценки',
    earningsStats: 'Статистика заработка',
    totalBalance: 'Общий баланс',
    thisMonthEarnings: 'Заработок в этом месяце',
  },


  en: {
    platform: 'Platform',
    search: 'Search...',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    loginLabel: 'Login',
    loginPlaceholder: 'Enter login',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    forgotPassword: 'Forgot password?',
    cancel: 'Cancel',
    loginButton: 'Login',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter email',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Repeat password',
    agreeToTerms: 'I agree to the terms of use and privacy policy',
    registerButton: 'Register',
    passwordMismatch: 'Passwords do not match',
    menu: 'Menu',
    myCompany: 'My Company',
    myProjects: 'My Projects',
    myStartups: 'My Startups',
    news: 'News',
    knowledgeBase: 'Knowledge Base',
    education: 'Education',
    partnershipProgram: 'Partnership Program',
    settings: 'Settings',
    licenseAndPayment: 'License & Payment',
    support: 'Support',
    platformNews: 'Platform News',
    colorScheme: 'Color Scheme',
    blue: 'Blue',
    purple: 'Purple',
    green: 'Green',
    orange: 'Orange',
    online: 'Online',
    offline: 'Offline',
    typeMessage: 'Type a message...',
    aboutUs: 'About Us',
    help: 'Help',
    privacy: 'Privacy',
    allSystemsOperational: 'All systems operational',
    platformUpdate: 'Platform Update v2.0',
    platformUpdateDesc: 'We are excited to introduce a new version of the platform with improved interface and enhanced features.',
    newTeamMembers: 'New Team Members',
    newTeamMembersDesc: '5 new specialists have joined our team to improve service quality.',
    webinarSchedule: 'Webinar Schedule',
    webinarScheduleDesc: 'Webinar schedule for the first quarter of 2026 has been published.',
    gettingStarted: 'Getting Started',
    userGuides: 'User Guides',
    faq: 'FAQ',
    technicalDocs: 'Technical Documentation',
    videoTutorials: 'Video Tutorials',
    tipsAndTricks: 'Tips & Tricks',
    articles: 'articles',
    platformBasics: 'Platform Basics',
    advancedFeatures: 'Advanced Features',
    systemAdministration: 'System Administration',
    hours: 'hours',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    becomePartner: 'Become Our Partner',
    becomePartnerDesc: 'Earn up to 30% from each client you refer',
    join: 'Join',
    highCommissions: 'High Commissions',
    highCommissionsDesc: 'Up to 30% per sale',
    support247: '24/7 Support',
    support247Desc: 'Personal manager',
    revenueGrowth: 'Revenue Growth',
    revenueGrowthDesc: 'Regular payments',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    sortBy: 'Sort By',
    filterByTopic: 'Filter by Topic',
    viewMode: 'View',
    newest: 'Newest',
    oldest: 'Oldest',
    popular: 'Popular',
    allTopics: 'All Topics',
    updates: 'Updates',
    announcements: 'Announcements',
    events: 'Events',
    listView: 'List',
    gridView: 'Grid',
    compactView: 'Compact',
    messenger: 'Messenger',
    contacts: 'Contacts',
    businessNotifications: 'Business Notifications',
    aiAssistant: 'AI Assistant',
    aiAssistantDescription: 'Ask a question or select a ready-made scenario',
    aiSuggest1: 'How to create a new project?',
    aiSuggest2: 'Show analytics for the month',
    aiSuggest3: 'Help with settings',
    aiInputPlaceholder: 'Ask a question...',
    ask: 'Ask',
    contactAnna: 'Anna Ivanova',
    contactPeter: 'Peter Sidorov',
    contactMaria: 'Maria Petrova',
    contactIvan: 'Ivan Ivanov',
    chatMessage1: 'Hi! How are you?',
    chatMessage2: 'Great, thanks!',
    notifTitle1: 'New Project',
    notifMessage1: 'Project "Web Platform" has been added',
    notifTime1: '5 min ago',
    notifTitle2: 'Update',
    notifMessage2: 'System updated to version 2.0',
    notifTime2: '1 hour ago',
    notifTitle3: 'Meeting',
    notifMessage3: 'Reminder about meeting at 3:00 PM',
    notifTime3: '2 hours ago',
    companyInfo: 'Company Information',
    companyManagement: 'Manage your company information',
    companyName: 'Company Name',
    companyNameValue: 'LLC "Future Technologies"',
    inn: 'INN',
    innValue: '7701234567',
    employees: 'Employees',
    employeesValue: '24 people',
    registrationDate: 'Registration Date',
    registrationDateValue: 'March 15, 2020',
    yourActiveProjects: 'Your Active Projects',
    projectAlpha: 'Project Alpha',
    projectBeta: 'Project Beta',
    projectGamma: 'Project Gamma',
    inProgress: 'In Progress',
    planning: 'Planning',
    completed: 'completed',
    chatPanel: 'Chat Panel',
    swapPosition: 'Swap Position',
    collapse: 'Collapse',
    expand: 'Expand',
    usernameLabel: 'Username',
    usernamePlaceholder: 'johndoe (optional)',
    usernameRequirements: '3-30 characters, letters, numbers, underscores',
    usernameInvalid: 'Username can only contain letters, numbers and underscores (3-30 characters)',
    usernameOptional: 'If not provided, email will be used',
    firstNameLabel: 'First Name',
    firstNamePlaceholder: 'John (optional)',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'Doe (optional)',
    passwordRecommendations: 'For a stronger password:',
    passwordManagerSuggestion: 'Consider using a password manager for strong, unique passwords.',
    optional: '(optional)',
    registerSuccess: 'Registration successful!',
    registerError: 'Registration failed',
    passwordInvalid: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    loginSuccess: 'Login successful!',
    loginError: 'Login failed',
    loading: 'Loading...',
    logoutSuccess: 'Logged out successfully',
    logoutError: 'Logout failed',
    myProfile: 'My Profile',
    logout: 'Logout',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    location: 'Location',
    notSpecified: 'Not specified',
    phone: 'Phone',
    position: 'Position',
    educationalProgress: 'Educational Progress',
    currentCourses: 'Current Courses',
    completedCourses: 'Completed Courses',
    noCourses: 'No active courses',
    certificates: 'Certificate',
    skills: 'Skills',
    community: 'Community',
    followers: 'Followers',
    following: 'Following',
    groups: 'Groups',
    myPortfolio: 'My Portfolio',
    noPortfolioYet: 'Portfolio is empty',
    addProject: 'Add Project',
    activityStats: 'Activity Statistics',
    achievements: 'Achievements',
    recentActivity: 'Recent Activity',
    noActivityYet: 'No activity yet',
    companyDescription: 'A leading technology company specializing in developing innovative solutions for businesses and startups.',
    educationalPlatform: 'Educational Platform',
    verified: 'Verified',
    employeesCount: 'employees',
    editCompanyProfile: 'Edit Company Profile',
    team: 'Team',
    activeProjects: 'Active Projects',
    openVacancies: 'Open Vacancies',
    completedProjects: 'Completed Projects',
    aboutCompany: 'About Company',
    ourTeam: 'Our Team',
    viewAllTeam: 'View All Team',
    applicants: 'applicants',
    apply: 'Apply',
    postNewVacancy: 'Post New Vacancy',
    members: 'members',
    techStack: 'Tech Stack',
    portfolio: 'Portfolio',
    partners: 'Partners',
    companyNews: 'Company News',
    companyNewsTitle1: 'New Product Launch',
    companyNewsText1: 'We are excited to announce the launch of our new product for business process automation.',
    companyNewsTitle2: 'Team Expansion',
    companyNewsText2: 'Our team continues to grow. Join us!',
    contactInfo: 'Contact Information',
    businessInquiries: 'Business Inquiries',
    recruitment: 'Recruitment',
    accelerator: 'Accelerator',
    investor: 'Investor',
    partner: 'Partner',
    founded: 'Founded',
    comingSoon: 'Coming soon',
    newsDescription: 'Latest news and platform updates',
    knowledgeDescription: 'Knowledge base and documentation',
    educationDescription: 'Educational materials and courses',
    partnershipDescription: 'Partnership program and conditions',
    myCompanyDescription: 'Manage your company information',
    myProjectsDescription: 'Your current projects and tasks',
    myStartupsDescription: 'Startup and investment management',
    settingsDescription: 'Account and system settings',
    licenseDescription: 'Licenses and payment management',
    supportDescription: 'User support and help',
    platformNewsDescription: 'Platform news and updates',
    technicalMentor: 'Technical mentor',
    saintPetersburg: 'Saint Petersburg',
    architecture: 'Architecture',
    consultation: 'Consultation',
    webinar: 'Webinar',
    groupSession: 'Group session',
    expertReview1: 'Great specialist, helped a lot with project architecture',
    expertReview2: 'Very professional and high quality',
    article: 'Article',
    verifiedExpert: 'Verified expert',
    expertFor: 'Expert since',
    sessionsCompleted: 'Sessions completed',
    averageRating: 'Average rating',
    graduates: 'Graduates',
    thisMonth: 'This month',
    todaySchedule: "Today's schedule",
    start: 'Start',
    mentorshipQueue: 'Mentorship queue',
    requestsWaiting: 'requests waiting',
    reviewRequests: 'Review requests',
    areasOfExpertise: 'Areas of expertise',
    currentMentees: 'Current mentees',
    active: 'Active',
    pending: 'Pending',
    createdContent: 'Created content',
    views: 'views',
    reviewsAndRatings: 'Reviews and ratings',
    earningsStats: 'Earnings statistics',
    totalBalance: 'Total balance',
    thisMonthEarnings: 'This month earnings',
    course: 'course'
  },
};

const defaultContextValue: LanguageContextType = {
  language: 'ru',
  setLanguage: () => {},
  t: (key: TranslationKeys) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: TranslationKeys): string => {
    const translation = translations[language][key];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
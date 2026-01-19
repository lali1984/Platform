valery@MacBook-Pro-Valery platform-ecosystem % tree -I 'node_modules|dist|build|.git|.next|.cache' -L 7
.
├── CONTRIBUTING.md
├── README.md
├── Users
├── configs
│   └── postgres
│       ├── init-auth.sql
│       └── init-user.sql
├── deep.md
├── docker-compose
│   └── api-gateway
│       ├── Dockerfile
│       ├── nginx.conf
│       └── proxy_params
├── docker-compose.health.yml
├── docker-compose.override.yml
├── docker-compose.yml
├── docker-compose.yml.backup
├── docs
├── k8s
├── kraft-server.properties
├── logs
│   └── kafka
│       ├── monitor.log
│       └── topics.log
├── monitoring
│   └── alerts
│       └── kafka-alerts.yml
├── package-lock.json
├── package.json
├── plan.md
├── read.md
├── scripts
│   ├── Actions.sh
│   ├── TESTING.md
│   ├── check-logs.sh
│   ├── check-resources.sh
│   ├── create-kafka-topics.sh
│   ├── kafka-topics.sh
│   ├── monitoring
│   │   └── alerts
│   │       └── kafka-alerts.yml
│   ├── run-full-test-suite.sh
│   ├── test-all-services.sh
│   ├── test-databases.sh
│   ├── test-integration.sh
│   ├── test-messaging.sh
│   └── test-network-full.sh
├── src
│   ├── auth-service
│   │   ├── Dockerfile
│   │   ├── jest.config.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── shared
│   │   │   ├── events
│   │   │   │   ├── package-lock.json
│   │   │   │   ├── package.json
│   │   │   │   ├── src
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── publishers
│   │   │   │   │   │   └── redis.publisher.ts
│   │   │   │   │   ├── types
│   │   │   │   │   │   └── events.ts
│   │   │   │   │   └── utils
│   │   │   │   │       └── event.utils.ts
│   │   │   │   └── tsconfig.json
│   │   │   └── kafka
│   │   │       ├── package-lock.json
│   │   │       ├── package.json
│   │   │       ├── src
│   │   │       │   ├── config
│   │   │       │   │   └── kafka.config.ts
│   │   │       │   ├── consumers
│   │   │       │   │   └── event.consumer.ts
│   │   │       │   ├── index.ts
│   │   │       │   ├── producers
│   │   │       │   │   └── event.producer.ts
│   │   │       │   └── types
│   │   │       │       └── events.ts
│   │   │       └── tsconfig.json
│   │   ├── src
│   │   │   ├── App.ts
│   │   │   ├── config
│   │   │   │   └── database-typeorm.ts
│   │   │   ├── controllers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── two-factor.controller.ts
│   │   │   ├── entities
│   │   │   │   └── User.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── models
│   │   │   ├── repositories
│   │   │   │   └── user.repository.ts
│   │   │   ├── routes
│   │   │   │   └── auth.routes.ts
│   │   │   ├── services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── event.service.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── password-reset.service.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── session.service.ts
│   │   │   │   ├── token.service.ts
│   │   │   │   └── two-factor.service.ts
│   │   │   ├── types
│   │   │   │   ├── environment.d.ts
│   │   │   │   └── user.ts
│   │   │   └── utils
│   │   ├── test-bcrypt.ts
│   │   ├── test-kafka-events.ts
│   │   ├── test-postgres-detailed.ts
│   │   ├── test-registration.ts
│   │   └── tsconfig.json
│   ├── bff-gateway
│   │   ├── Dockerfile
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── src
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── frontend
│   │   ├── ATTRIBUTIONS.md
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── guidelines
│   │   │   └── Guidelines.md
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── App.tsx
│   │   │   │   ├── components
│   │   │   │   │   ├── Chat.tsx
│   │   │   │   │   ├── ContentArea.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── LanguageSelector.tsx
│   │   │   │   │   ├── LoginModal.tsx
│   │   │   │   │   ├── PageLayout.tsx
│   │   │   │   │   ├── PageRouter.tsx
│   │   │   │   │   ├── RegisterModal.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── ThemeModeToggle.tsx
│   │   │   │   │   ├── figma
│   │   │   │   │   │   └── ImageWithFallback.tsx
│   │   │   │   │   ├── icons
│   │   │   │   │   │   ├── BuildingIcon.tsx
│   │   │   │   │   │   ├── HomeIcon.tsx
│   │   │   │   │   │   └── SettingsIcon.tsx
│   │   │   │   │   ├── pages
│   │   │   │   │   │   ├── Education.tsx
│   │   │   │   │   │   ├── Knowledge.tsx
│   │   │   │   │   │   ├── License.tsx
│   │   │   │   │   │   ├── MyCompany.tsx
│   │   │   │   │   │   ├── MyProjects.tsx
│   │   │   │   │   │   ├── MyStartups.tsx
│   │   │   │   │   │   ├── News.tsx
│   │   │   │   │   │   ├── Partnership.tsx
│   │   │   │   │   │   ├── PlatformNews.tsx
│   │   │   │   │   │   ├── Settings.tsx
│   │   │   │   │   │   └── Support.tsx
│   │   │   │   │   └── ui
│   │   │   │   │       ├── accordion.tsx
│   │   │   │   │       ├── alert-dialog.tsx
│   │   │   │   │       ├── alert.tsx
│   │   │   │   │       ├── aspect-ratio.tsx
│   │   │   │   │       ├── avatar.tsx
│   │   │   │   │       ├── badge.tsx
│   │   │   │   │       ├── breadcrumb.tsx
│   │   │   │   │       ├── button.tsx
│   │   │   │   │       ├── calendar.tsx
│   │   │   │   │       ├── card.tsx
│   │   │   │   │       ├── carousel.tsx
│   │   │   │   │       ├── chart.tsx
│   │   │   │   │       ├── checkbox.tsx
│   │   │   │   │       ├── collapsible.tsx
│   │   │   │   │       ├── command.tsx
│   │   │   │   │       ├── context-menu.tsx
│   │   │   │   │       ├── dialog.tsx
│   │   │   │   │       ├── drawer.tsx
│   │   │   │   │       ├── dropdown-menu.tsx
│   │   │   │   │       ├── form.tsx
│   │   │   │   │       ├── hover-card.tsx
│   │   │   │   │       ├── input-otp.tsx
│   │   │   │   │       ├── input.tsx
│   │   │   │   │       ├── label.tsx
│   │   │   │   │       ├── menubar.tsx
│   │   │   │   │       ├── navigation-menu.tsx
│   │   │   │   │       ├── pagination.tsx
│   │   │   │   │       ├── popover.tsx
│   │   │   │   │       ├── progress.tsx
│   │   │   │   │       ├── radio-group.tsx
│   │   │   │   │       ├── resizable.tsx
│   │   │   │   │       ├── scroll-area.tsx
│   │   │   │   │       ├── select.tsx
│   │   │   │   │       ├── separator.tsx
│   │   │   │   │       ├── sheet.tsx
│   │   │   │   │       ├── sidebar.tsx
│   │   │   │   │       ├── skeleton.tsx
│   │   │   │   │       ├── slider.tsx
│   │   │   │   │       ├── sonner.tsx
│   │   │   │   │       ├── switch.tsx
│   │   │   │   │       ├── table.tsx
│   │   │   │   │       ├── tabs.tsx
│   │   │   │   │       ├── textarea.tsx
│   │   │   │   │       ├── toggle-group.tsx
│   │   │   │   │       ├── toggle.tsx
│   │   │   │   │       ├── tooltip.tsx
│   │   │   │   │       ├── use-mobile.ts
│   │   │   │   │       └── utils.ts
│   │   │   │   ├── context
│   │   │   │   │   ├── AuthContext.tsx
│   │   │   │   │   ├── LanguageContext.tsx
│   │   │   │   │   └── ThemeContext.tsx
│   │   │   │   └── services
│   │   │   │       └── api.ts
│   │   │   ├── main.tsx
│   │   │   └── styles
│   │   │       ├── fonts.css
│   │   │       ├── index.css
│   │   │       ├── tailwind.css
│   │   │       └── theme.css
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── vite.config.ts
│   └── user-service
│       ├── Dockerfile
│       ├── index.ts
│       ├── package-lock.json
│       ├── package.json
│       ├── shared.d.ts
│       ├── src
│       │   ├── health.ts
│       │   ├── index.ts
│       │   └── shared-stub.ts
│       └── tsconfig.json
├── test-auth.html
├── test-event-listener.js
├── test-kraft-consumer.js
└── test-reports
    └── 20260115_230303
        ├── integration-test.log
        ├── logs-check.log
        ├── messaging-test.log
        ├── network-test.log
        ├── resources-check.log
        └── services-test.log

58 directories, 194 files
valery@MacBook-Pro-Valery platform-ecosystem % 

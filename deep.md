valery@MacBook-Pro-Valery platform-ecosystem % tree -I 'node_modules|dist|build|.git|.next|.cache' -L 7
.
├── 00_infrastructure
│   ├── api-gateway
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── nginx.production.conf:
│   │   ├── proxy_params
│   │   ├── sites-enabled
│   │   └── ssl
│   ├── databases
│   │   └── postgres
│   │       ├── create-db-users.sql
│   │       ├── init-auth.sql
│   │       ├── init-user.sql
│   │       └── setup-cleanup-jobs.sql
│   ├── k8s
│   └── monitoring
│       ├── alertmanager
│       │   └── alertmanager.yml
│       ├── alerts
│       │   ├── kafka-alerts.yml
│       │   └── service-alerts.yml
│       ├── exporters
│       │   └── postgres-queries.yaml
│       ├── grafana
│       │   ├── dashboards
│       │   │   ├── platform-ecosystem.json
│       │   │   └── platform-overview.json
│       │   └── provisioning
│       │       ├── dashboards
│       │       │   └── dashboards.yaml
│       │       └── datasources
│       │           └── datasources.yaml
│       └── prometheus
│           └── prometheus.yml
├── 01_frontend
│   ├── Dockerfile
│   ├── README.md
│   ├── guidelines
│   │   └── Guidelines.md
│   ├── healthcheck.cjs
│   ├── healthcheck.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   ├── src
│   │   ├── app
│   │   │   ├── App.tsx
│   │   │   ├── components
│   │   │   │   ├── Chat.tsx
│   │   │   │   ├── ContentArea.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── LanguageSelector.tsx
│   │   │   │   ├── LoginModal.tsx
│   │   │   │   ├── PageLayout.tsx
│   │   │   │   ├── PageRouter.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── RegisterModal.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── ThemeModeToggle.tsx
│   │   │   │   ├── icons
│   │   │   │   │   ├── BuildingIcon.tsx
│   │   │   │   │   ├── HomeIcon.tsx
│   │   │   │   │   └── SettingsIcon.tsx
│   │   │   │   ├── pages
│   │   │   │   │   ├── CompanyProfile.tsx
│   │   │   │   │   ├── Education.tsx
│   │   │   │   │   ├── ExpertProfile.tsx
│   │   │   │   │   ├── Knowledge.tsx
│   │   │   │   │   ├── LandingPage.tsx
│   │   │   │   │   ├── License.tsx
│   │   │   │   │   ├── MyCompany.tsx
│   │   │   │   │   ├── MyProjects.tsx
│   │   │   │   │   ├── MyStartups.tsx
│   │   │   │   │   ├── News.tsx
│   │   │   │   │   ├── Partnership.tsx
│   │   │   │   │   ├── PlatformNews.tsx
│   │   │   │   │   ├── Settings.tsx
│   │   │   │   │   ├── Support.tsx
│   │   │   │   │   └── UserProfile.tsx
│   │   │   │   └── ui
│   │   │   │       ├── accordion.tsx
│   │   │   │       ├── alert-dialog.tsx
│   │   │   │       ├── alert.tsx
│   │   │   │       ├── aspect-ratio.tsx
│   │   │   │       ├── avatar.tsx
│   │   │   │       ├── badge.tsx
│   │   │   │       ├── breadcrumb.tsx
│   │   │   │       ├── button.tsx
│   │   │   │       ├── calendar.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── carousel.tsx
│   │   │   │       ├── chart.tsx
│   │   │   │       ├── checkbox.tsx
│   │   │   │       ├── collapsible.tsx
│   │   │   │       ├── command.tsx
│   │   │   │       ├── context-menu.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       ├── drawer.tsx
│   │   │   │       ├── dropdown-menu.tsx
│   │   │   │       ├── form.tsx
│   │   │   │       ├── hover-card.tsx
│   │   │   │       ├── input-otp.tsx
│   │   │   │       ├── input.tsx
│   │   │   │       ├── label.tsx
│   │   │   │       ├── menubar.tsx
│   │   │   │       ├── navigation-menu.tsx
│   │   │   │       ├── pagination.tsx
│   │   │   │       ├── popover.tsx
│   │   │   │       ├── progress.tsx
│   │   │   │       ├── radio-group.tsx
│   │   │   │       ├── resizable.tsx
│   │   │   │       ├── scroll-area.tsx
│   │   │   │       ├── select.tsx
│   │   │   │       ├── separator.tsx
│   │   │   │       ├── sheet.tsx
│   │   │   │       ├── sidebar.tsx
│   │   │   │       ├── skeleton.tsx
│   │   │   │       ├── slider.tsx
│   │   │   │       ├── sonner.tsx
│   │   │   │       ├── switch.tsx
│   │   │   │       ├── table.tsx
│   │   │   │       ├── tabs.tsx
│   │   │   │       ├── textarea.tsx
│   │   │   │       ├── toggle-group.tsx
│   │   │   │       ├── toggle.tsx
│   │   │   │       ├── tooltip.tsx
│   │   │   │       ├── use-mobile.ts
│   │   │   │       └── utils.ts
│   │   │   ├── constants
│   │   │   │   └── routes.ts
│   │   │   ├── context
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── LanguageContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   └── services
│   │   │       └── api.ts
│   │   ├── main.tsx
│   │   └── styles
│   │       ├── fonts.css
│   │       ├── index.css
│   │       ├── tailwind.css
│   │       └── theme.css
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── 02_bff-gateway
│   ├── Dockerfile
│   ├── README.md
│   ├── healthcheck.js
│   ├── metrics
│   │   └── metrics.service.ts
│   ├── package.json
│   ├── src
│   │   ├── application
│   │   │   ├── services
│   │   │   │   ├── event-waiter.service.ts
│   │   │   │   └── kafka-event-waiter.service.ts
│   │   │   └── use-cases
│   │   │       ├── auth-user.use-case.ts
│   │   │       └── get-user-profile.use-case.ts
│   │   ├── domain
│   │   │   ├── aggregates
│   │   │   │   ├── dashboard.aggregate.ts
│   │   │   │   └── user-profile.aggregate.ts
│   │   │   ├── ports
│   │   │   │   ├── auth-client.port.ts
│   │   │   │   ├── cache.port.ts
│   │   │   │   └── user-client.port.ts
│   │   │   └── value-objects
│   │   │       └── api-response.vo.ts
│   │   ├── index.ts
│   │   ├── infrastructure
│   │   │   ├── cache
│   │   │   │   ├── in-memory-cache.adapter.ts
│   │   │   │   └── redis-cache.adapter.ts
│   │   │   ├── config
│   │   │   │   ├── bff.config.ts
│   │   │   │   └── environment.ts
│   │   │   └── http-clients
│   │   │       ├── auth-http.client.ts
│   │   │       ├── http-client.factory.ts
│   │   │       └── user-http.client.ts
│   │   ├── main.ts
│   │   ├── presentation
│   │   │   ├── controllers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── user.controller.ts
│   │   │   ├── middleware
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   └── validation.middleware.ts
│   │   │   └── routes
│   │   │       └── api.routes.ts
│   │   └── shared
│   │       └── validation
│   │           └── chemas.ts
│   └── tsconfig.json
├── 03_auth-service
│   ├── ARCHITECTURE.md
│   ├── Dockerfile
│   ├── README.md
│   ├── healthcheck.js
│   ├── logs
│   ├── package.json
│   ├── src
│   │   ├── application
│   │   │   ├── dto
│   │   │   │   └── user-response.dto.ts
│   │   │   └── use-cases
│   │   │       ├── LoginUser.use-case.ts
│   │   │       ├── RegisterUser.use-case.ts
│   │   │       └── TwoFactorUseCase.ts
│   │   ├── domain
│   │   │   ├── entities
│   │   │   │   └── User.ts
│   │   │   └── ports
│   │   │       ├── EventPublisher.port.ts
│   │   │       ├── TokenService.port.ts
│   │   │       ├── TwoFactorService.port.ts
│   │   │       ├── UserRepository.port.ts
│   │   │       └── cache.port.ts
│   │   ├── infrastructure
│   │   │   ├── cache
│   │   │   │   └── redis-cache.adapter.ts
│   │   │   ├── config
│   │   │   │   ├── database.config.ts
│   │   │   │   └── migration.config.ts
│   │   │   ├── event-publishers
│   │   │   │   ├── InMemoryEventPublisher.ts
│   │   │   │   └── OutboxEventPublisher.ts
│   │   │   ├── migrations
│   │   │   │   ├── 1700000000000-CreateInitialTables.ts
│   │   │   │   ├── 1700000000001-SyncUserSchema.ts
│   │   │   │   ├── 1700000000002-AddLoginAttempts.ts
│   │   │   │   └── 1700000000003-CreateUserSessions.ts
│   │   │   ├── persistence
│   │   │   │   ├── entities
│   │   │   │   │   ├── OutboxEvent.entity.ts
│   │   │   │   │   ├── Permission.entity.ts
│   │   │   │   │   ├── Role.entity.ts
│   │   │   │   │   ├── User.entity.ts
│   │   │   │   │   └── UserRole.entity.ts
│   │   │   │   └── repositories
│   │   │   │       ├── InMemoryUserRepository.ts
│   │   │   │       └── TypeORMUserRepository.ts
│   │   │   └── services
│   │   │       ├── JwtTokenService.ts
│   │   │       └── TwoFactorService.ts
│   │   ├── main.ts
│   │   ├── metrics
│   │   │   └── metrics.service.ts
│   │   ├── presentation
│   │   │   ├── controllers
│   │   │   │   └── AuthController.ts
│   │   │   ├── middleware
│   │   │   │   └── AuthMiddleware.ts
│   │   │   └── routes
│   │   │       └── index.ts
│   │   └── tests
│   │       └── unit
│   │           └── User.test.ts
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── 04_user-service
│   ├── Dockerfile
│   ├── Dockerfile.prodaction
│   ├── README.md
│   ├── api
│   │   └── openapi.yaml
│   ├── healthcheck.js
│   ├── logs
│   ├── ormconfig.ts
│   ├── package.json
│   ├── src
│   │   ├── app.module.ts
│   │   ├── application
│   │   │   ├── dto
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── user-registered-event.dto.ts
│   │   │   ├── mappers
│   │   │   │   └── user.mapper.ts
│   │   │   ├── use-cases
│   │   │   │   ├── create-user.use-case.ts
│   │   │   │   ├── delete-user.use-case.ts
│   │   │   │   ├── get-user.use-case.ts
│   │   │   │   ├── handle-user-registered-event.use-case.ts
│   │   │   │   ├── list-users.use-case.ts
│   │   │   │   └── update-user.use-case.ts
│   │   │   └── validators
│   │   │       └── event.validator.ts
│   │   ├── domain
│   │   │   ├── base
│   │   │   │   ├── aggregate-root.base.ts
│   │   │   │   ├── domain-event.base.ts
│   │   │   │   ├── entity.base.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── value-object.base.ts
│   │   │   ├── domain-events
│   │   │   │   └── domain-event.base.ts
│   │   │   ├── entities
│   │   │   │   └── user.entity.ts
│   │   │   └── ports
│   │   │       ├── event-publisher.port.ts
│   │   │       └── repositories
│   │   │           └── user.repository.port.ts
│   │   ├── infrastructure
│   │   │   ├── config
│   │   │   │   └── typeorm.config.ts
│   │   │   ├── kafka
│   │   │   │   └── kafka-bootstrap.service.ts
│   │   │   ├── logging
│   │   │   │   └── logging.config.ts
│   │   │   ├── messaging
│   │   │   │   └── outbox-event-publisher.service.ts
│   │   │   ├── metrics
│   │   │   │   └── metrics.service.ts
│   │   │   ├── migrations
│   │   │   │   ├── 1700000000001-CreateOutboxTable.ts
│   │   │   │   ├── 1700000000002-AddUserProfileFields.ts
│   │   │   │   ├── 1700000000002-FixOutboxTableConstraints.ts
│   │   │   │   ├── 1700000000003-AddMissingIndexes.ts
│   │   │   │   └── 1700000000004-PartitionOutbox.ts
│   │   │   └── persistence
│   │   │       ├── outbox-event.entity.ts
│   │   │       ├── user-profile.entity.ts
│   │   │       ├── user.entity.ts
│   │   │       └── user.typeorm.repository.ts
│   │   ├── main.ts
│   │   └── presentation
│   │       ├── controllers
│   │       │   ├── health.controller.ts
│   │       │   ├── metrics.controller.ts
│   │       │   └── user.controller.ts
│   │       ├── dto
│   │       │   └── user-response.dto.ts
│   │       └── middleware
│   │           └── metrics.middleware.ts
│   ├── tests
│   │   ├── e2e
│   │   ├── integration
│   │   │   └── api
│   │   │       └── user.e2e.test.ts
│   │   └── unit
│   │       └── user.entity.test.ts
│   └── tsconfig.json
├── 06_event-relay
│   ├── Dockerfile
│   ├── Dockerfile.production
│   ├── README.md
│   ├── healthcheck.js
│   ├── package.json
│   ├── src
│   │   ├── application
│   │   │   └── EventRelayApplication.ts
│   │   ├── domain
│   │   │   └── entities
│   │   │       └── OutboxEventEntity.ts
│   │   ├── infrastructure
│   │   │   ├── db
│   │   │   │   ├── DatabaseConfig.ts
│   │   │   │   └── OutboxReaderRepository.ts
│   │   │   ├── messaging
│   │   │   │   ├── CircuitBreaker.ts
│   │   │   │   └── KafkaProducerService.ts
│   │   │   └── metrics
│   │   │       └── metrics.service.ts
│   │   ├── main.ts
│   │   └── presentation
│   │       └── HealthController.ts
│   └── tsconfig.json
├── CONTRIBUTING.md
├── README.md
├── contracts
│   ├── package.json
│   ├── src
│   │   ├── api
│   │   │   ├── api-response.ts
│   │   │   └── index.ts
│   │   ├── auth
│   │   │   ├── auth-response.ts
│   │   │   ├── token-validation-result.ts
│   │   │   └── user-auth-data.ts
│   │   ├── events
│   │   │   ├── auth
│   │   │   │   └── user-registered.event.ts
│   │   │   ├── base
│   │   │   │   └── base-event.ts
│   │   │   ├── index.ts
│   │   │   └── user
│   │   │       └── user-created.event.ts
│   │   ├── index.ts
│   │   ├── infrastructure
│   │   │   ├── kafka
│   │   │   │   ├── CircuitBreaker.ts
│   │   │   │   ├── KafkaConsumer.service.ts
│   │   │   │   ├── KafkaProducer.service.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── kafka.config.ts
│   │   │   │   └── kafka.module.ts
│   │   │   └── shared
│   │   ├── metrics
│   │   │   ├── BaseMetricsService.ts
│   │   │   ├── constants.ts
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   └── types
│   │       ├── enums
│   │       │   └── index.ts
│   │       ├── errors
│   │       │   └── index.ts
│   │       ├── index.ts
│   │       └── primitives
│   │           ├── Email.ts
│   │           ├── ISO8601Date.ts
│   │           ├── Money.ts
│   │           ├── NonEmptyString.ts
│   │           ├── PhoneNumber.ts
│   │           ├── UserId.ts
│   │           └── index.ts
│   └── tsconfig.json
├── deep.md
├── docker-compose.health.yml
├── docker-compose.yml
├── docs
├── healthcheck-kafka-exporter.sh
├── healthcheck-node-exporter.sh
├── healthcheck-postgres-exporter.sh
├── healthcheck-redis-exporter.sh
├── logs
│   ├── auth
│   ├── auth-service.log
│   ├── user
│   └── user-service.log
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── promt.md
├── scripts
│   ├── backup-script.sh
│   ├── check-dependencies.sh
│   ├── check-events.sh
│   ├── check-infrastructure.sh
│   ├── check-metrics.sh
│   ├── cleanup-shared-packages.sh
│   ├── cleanup-simple.sh
│   ├── create-exporter-healthchecks.sh
│   ├── deploy-production.sh
│   ├── fix-remaining-imports.sh
│   ├── full-platform-test.sh
│   ├── nginx.test.conf
│   ├── package.json
│   ├── platform-health-check.sh
│   ├── restore-script.sh
│   ├── run-platform-basic.sh
│   ├── run-platform-quick.sh
│   ├── run-platform.sh
│   ├── test-infrastructure.sh
│   ├── test-registration-flow.sh
│   └── update-user-service-imports.sh
├── sequenceDiagram.mmd
├── templates
│   └── new-service-template.md
└── test-contracts.mjs

140 directories, 327 files
valery@MacBook-Pro-Valery platform-ecosystem % 

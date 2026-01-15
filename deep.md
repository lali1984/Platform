valery@MacBook-Pro-Valery platform-ecosystem % scripts/test-databases.sh

=== Проверка баз данных ===
1. PostgreSQL Auth (5432):  OK
OK
2. PostgreSQL User (5433):  OK
OK
3. Таблицы в auth_db:  public | users | table | admin
OK
4. Таблицы в user_db:  public | user_profiles | table | admin
OK
valery@MacBook-Pro-Valery platform-ecosystem % scripts/test-messaging.sh
=== Проверка Redis и Kafka ===
1. Redis подключение: OK
2. Redis тест записи: OK
3. Kafka статус: OK
4. Kafka создание топика: Created topic test-topic.
OK
5. Kafka отправка сообщения: OK
valery@MacBook-Pro-Valery platform-ecosystem % scripts/test-all-services.sh
=== Проверка всех сервисов через Gateway ===
1. Gateway health: OK
2. Auth Service health: OK
3. User Service health: OK
4. BFF Gateway health: OK
5. Frontend доступен: OK
6. Kafka UI доступен: OK
valery@MacBook-Pro-Valery platform-ecosystem % scripts/test-network-full.sh
=== Полная проверка сети ===
Список контейнеров:
NAMES           STATUS                   PORTS
api-gateway     Up 2 minutes (healthy)   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp
kafka-ui        Up 2 minutes             0.0.0.0:8081->8080/tcp, [::]:8081->8080/tcp
user-service    Up 4 minutes             0.0.0.0:3002->3000/tcp, [::]:3002->3000/tcp
auth-service    Up 2 minutes (healthy)   0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
kafka           Up 4 minutes (healthy)   0.0.0.0:29092->29092/tcp, [::]:29092->29092/tcp
postgres-auth   Up 2 minutes (healthy)   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp
postgres-user   Up 4 minutes (healthy)   0.0.0.0:5433->5432/tcp, [::]:5433->5432/tcp
redis           Up 4 minutes (healthy)   0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp
bff-gateway     Up 4 minutes             0.0.0.0:3003->3000/tcp, [::]:3003->3000/tcp
zookeeper       Up 4 minutes (healthy)   0.0.0.0:2181->2181/tcp, [::]:2181->2181/tcp
frontend        Up 4 minutes             0.0.0.0:5173->5173/tcp, [::]:5173->5173/tcp

=== Тестирование связей ===
Gateway -> auth-service (3000): OK
Gateway -> user-service (3000): OK
Gateway -> postgres-auth (5432): OK
Gateway -> postgres-user (5432): OK
Gateway -> redis (6379): OK
Gateway -> kafka (9092): OK

=== Проверка DNS разрешения ===
Server:         127.0.0.11
Address:        127.0.0.11:53

Non-authoritative answer:

Non-authoritative answer:
Name:   auth-service
Address: 172.18.0.11

Server:         127.0.0.11
Address:        127.0.0.11:53

Non-authoritative answer:

Non-authoritative answer:
Name:   kafka
Address: 172.18.0.8

valery@MacBook-Pro-Valery platform-ecosystem % test-integration.sh
zsh: command not found: test-integration.sh
valery@MacBook-Pro-Valery platform-ecosystem % scripts/test-integration.sh
=== Интеграционные тесты ===

1. Тест регистрации пользователя:
Response: {"message":"User registered (stub)","user":{"id":"stub-id","email":"integration@test.com"}}
✅ Успех

2. Тест логина:
Response: {"message":"Login successful (stub)","accessToken":"stub-jwt-token","refreshToken":"stub-refresh-token"}
✅ Успех

3. Тест BFF Gateway:
Response: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /api/test</pre>
</body>
</html>
❌ Ошибка
valery@MacBook-Pro-Valery platform-ecosystem % scripts/check-logs.sh
=== Проверка логов на ошибки ===

🔍 api-gateway:
✅ Ошибок не найдено

🔍 kafka-ui:
✅ Ошибок не найдено

🔍 user-service:
✅ Ошибок не найдено

🔍 auth-service:
✅ Ошибок не найдено

🔍 kafka:
Найдены ошибки:
  [2026-01-15 19:55:52,096] TRACE [Controller id=1 epoch=1] Received response UpdateMetadataResponseData(errorCode=0) for request UPDATE_METADATA with correlation id 0 sent to broker kafka:9092 (id: 1 rack: null) (state.change.logger)
  [2026-01-15 19:59:27,936] TRACE [Controller id=1 epoch=1] Received response LeaderAndIsrResponseData(errorCode=0, partitionErrors=[], topics=[LeaderAndIsrTopicError(topicId=IO1oR2rpSg6FAH1gStQ4uA, partitionErrors=[LeaderAndIsrPartitionError(topicName='', partitionIndex=0, errorCode=0)])]) for request LEADER_AND_ISR with correlation id 1 sent to broker kafka:9092 (id: 1 rack: null) (state.change.logger)
  [2026-01-15 19:59:27,942] TRACE [Controller id=1 epoch=1] Received response UpdateMetadataResponseData(errorCode=0) for request UPDATE_METADATA with correlation id 2 sent to broker kafka:9092 (id: 1 rack: null) (state.change.logger)

🔍 postgres-auth:
Найдены ошибки:
  2026-01-15 19:55:39.362 UTC [54] ERROR:  type "idx_user_id" does not exist at character 329

🔍 postgres-user:
✅ Ошибок не найдено

🔍 redis:
✅ Ошибок не найдено

🔍 bff-gateway:
✅ Ошибок не найдено

🔍 zookeeper:
✅ Ошибок не найдено

🔍 frontend:
✅ Ошибок не найдено
valery@MacBook-Pro-Valery platform-ecosystem % scripts/check-resources.sh
=== Проверка использования ресурсов ===
Использование памяти:
NAME            CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O
api-gateway     0.00%     10.46MiB / 7.653GiB   0.13%     10.2kB / 10.1kB   3MB / 4.1kB
kafka-ui        0.10%     363.9MiB / 7.653GiB   4.64%     198kB / 2.64MB    45.7MB / 209kB
user-service    0.00%     111.3MiB / 7.653GiB   1.42%     3.08kB / 1kB      24.6kB / 2.33MB
auth-service    0.00%     161.1MiB / 7.653GiB   2.06%     3.77kB / 4.28kB   369kB / 2.33MB
kafka           1.08%     373.6MiB / 7.653GiB   4.77%     32.3kB / 56.7kB   213kB / 1.11MB
postgres-auth   0.00%     24.78MiB / 7.653GiB   0.32%     2.11kB / 416B     0B / 225kB
postgres-user   0.97%     29.39MiB / 7.653GiB   0.38%     3.86kB / 350B     4.71MB / 54.2MB
redis           1.57%     20.89MiB / 7.653GiB   0.27%     4.11kB / 350B     12.2MB / 16.4kB
bff-gateway     0.00%     138.6MiB / 7.653GiB   1.77%     4.84kB / 1.71kB   28.5MB / 2.33MB
zookeeper       0.10%     104.2MiB / 7.653GiB   1.33%     25.7kB / 18.1kB   11.5MB / 463kB
frontend        0.28%     211.9MiB / 7.653GiB   2.70%     3.98kB / 1.3kB    37.2MB / 8.18MB

Использование диска:
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          10        10        17.8GB    17.8GB (100%)
Containers      11        11        7.447MB   0B (0%)
Local Volumes   14        14        562.3MB   0B (0%)
Build Cache     419       0         15.6GB    13.77GB

Размеры томов:
Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
4fbdf2544c91: Download complete 
0d38fd5b3194: Download complete 
Digest: sha256:865b95f46d98cf867a156fe4a135ad3fe50d2056aa3f25ed31662dff6da4eb62
Status: Downloaded newer image for alpine:latest
  0dc962c0c61c8a3e06b4710783abe75783041752b3da3ff3c85d62090a8cc4a4: 142.3M
  0fe979a7465b412a0588ca8edfd76b0408370a57fbe9d5aa94fbe27139379164: 4.0K
  5a5a2091455b6f61e94fec5e8993647bdc74f5441ac5479f29fbf1c0125c53e6: 4.0K
  05ff76c14ad823038a6104ee82b0361edf7cf551209a85c38d1bc10e8673dd7a: 37.8M
  7e41a48640fae30632086bb5fe929e88ef0ba0fbeab65997f6ede32c507584e5: 35.7M
  8c8652024525cb2b1ea7344fdb9afdbdf5c18368e390556b0c30f5e14a7d59f4: 428.9M
  848a005aab5e1033533edff3ed305a9c29c6532b9d1dc23e2c65b3dd2340da36: 20.0K
  ab5ed6e4e0d4159c8baea7a7c3b1411bc4767b2d44ee7a5fee901e05e2db9565: 12.0K
  platform-ecosystem_kafka_data: 36.0K
  platform-ecosystem_nginx_cache: 24.0K
  platform-ecosystem_nginx_logs: 4.0K
  platform-ecosystem_postgres_auth_data: 45.6M
  platform-ecosystem_postgres_user_data: 46.0M
  platform-ecosystem_redis_data: 20.0K
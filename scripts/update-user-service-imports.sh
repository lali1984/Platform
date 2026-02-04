#!/bin/bash

# Скрипт для обновления импортов в user-service
# Заменяет импорты из shared-domain на локальные реализации

set -e

echo "🚀 Начинаем обновление импортов в user-service..."

# Функция для замены импортов
replace_imports() {
  local file="$1"
  
  echo "📝 Обрабатываем файл: $file"
  
  # Временный файл
  local temp_file="${file}.tmp"
  
  # Заменяем импорты
  sed \
    -e "s|from '@platform/shared-domain'|from '../base/entity.base'|g" \
    -e "s|import { AggregateRoot, Email, Phone } from '@platform/shared-domain'|import { AggregateRoot } from '../base/aggregate-root.base'\nimport { Email } from '../value-objects/email.vo'\nimport { Phone } from '../value-objects/phone.vo'|g" \
    -e "s|import { DomainEvent } from '@platform/shared-domain'|import { DomainEvent } from '../base/domain-event.base'|g" \
    -e "s|import { EventPublisher, PlatformEvent } from '@platform/shared-domain'|// EventPublisher и PlatformEvent будут заменены локальными реализациями|g" \
    "$file" > "$temp_file"
  
  # Проверяем, были ли изменения
  if ! diff -q "$file" "$temp_file" > /dev/null; then
    mv "$temp_file" "$file"
    echo "✅ Файл обновлен: $file"
  else
    rm "$temp_file"
    echo "⚠️  Изменений не требуется: $file"
  fi
}

# Находим все TypeScript файлы в user-service
find "04_user-service/src" -name "*.ts" -type f | while read -r file; do
  # Пропускаем уже обновленные файлы
  if [[ "$file" == *"base/"* ]] || [[ "$file" == *"value-objects/"* ]]; then
    continue
  fi
  
  # Проверяем, содержит ли файл импорты из shared-domain
  if grep -q "@platform/shared-domain" "$file"; then
    replace_imports "$file"
  fi
done

# Обновляем package.json
echo "📦 Обновляем package.json..."
cd 04_user-service

# Удаляем зависимость от shared-domain
if grep -q '"@platform/shared-domain"' package.json; then
  # Для macOS используем специальный синтаксис sed
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' '/"@platform\/shared-domain":/d' package.json
  else
    sed -i '/"@platform\/shared-domain":/d' package.json
  fi
  echo "✅ Зависимость от shared-domain удалена из package.json"
else
  echo "⚠️  Зависимость от shared-domain не найдена в package.json"
fi

# Добавляем uuid как зависимость, если его нет
if ! grep -q '"uuid"' package.json; then
  # Для macOS
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' '/"dependencies": {/a\
    "uuid": "^13.0.0",' package.json
  else
    sed -i '/"dependencies": {/a\    "uuid": "^13.0.0",' package.json
  fi
  echo "✅ Добавлена зависимость от uuid"
fi

cd ..

echo "\n🎉 Обновление завершено!"
echo "\n📋 Следующие шаги:"
echo "1. Проверьте компиляцию TypeScript: cd 04_user-service && npm run build"
echo "2. Запустите тесты: cd 04_user-service && npm test"
echo "3. При необходимости исправьте оставшиеся ошибки компиляции"
echo "\n💡 Примечание: Некоторые файлы могут требовать ручной доработки,"
echo "особенно те, которые используют PlatformEvent и EventPublisher"
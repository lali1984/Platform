#!/bin/bash

# Простой скрипт для очистки shared packages

set -e

echo "🧹 Начинаем очистку shared packages..."

# 1. Удаляем shared packages если они существуют
if [ -d "05_packages" ]; then
  echo "📦 Найдены shared packages"
  BACKUP_DIR="shared-packages-backup-$(date +%Y%m%d_%H%M%S)"
  echo "💾 Создаем backup в $BACKUP_DIR"
  cp -r "05_packages" "$BACKUP_DIR"
  
  echo "🗑️  Удаляем shared packages..."
  rm -rf "05_packages"
  echo "✅ Shared packages удалены"
else
  echo "ℹ️  Shared packages не найдены"
fi

# 2. Обновляем корневой package.json
if [ -f "package.json" ]; then
  echo "📝 Обновляем корневой package.json..."
  
  # Удаляем workspace references к shared packages
  if grep -q '"05_packages/' "package.json"; then
    echo "  Удаляем workspace references..."
    # Для macOS
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' '/"05_packages\//d' "package.json"
    else
      sed -i '/"05_packages\//d' "package.json"
    fi
    echo "  ✅ Workspace references удалены"
  fi
  
  # Добавляем contracts в workspaces если их нет
  if ! grep -q '"contracts"' "package.json"; then
    echo "  Добавляем contracts в workspaces..."
    # Для macOS
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' '/"workspaces": \[/a\
    "contracts",' "package.json"
    else
      sed -i '/"workspaces": \[/a\    "contracts",' "package.json"
    fi
    echo "  ✅ Contracts добавлены в workspaces"
  fi
fi

# 3. Обновляем сервисы
SERVICES=("01_frontend" "02_bff-gateway" "03_auth-service" "04_user-service" "06_event-relay")

for SERVICE in "${SERVICES[@]}"; do
  if [ -d "$SERVICE" ]; then
    echo "\n🔧 Обновляем $SERVICE..."
    
    SERVICE_PACKAGE="$SERVICE/package.json"
    if [ -f "$SERVICE_PACKAGE" ]; then
      # Удаляем зависимости от @platform/shared-*
      if grep -q '@platform/shared-' "$SERVICE_PACKAGE"; then
        echo "  Удаляем shared dependencies..."
        # Для macOS
        if [[ "$(uname)" == "Darwin" ]]; then
          sed -i '' '/"@platform\/shared-/d' "$SERVICE_PACKAGE"
        else
          sed -i '/"@platform\/shared-/d' "$SERVICE_PACKAGE"
        fi
        echo "  ✅ Shared dependencies удалены"
      fi
    fi
  else
    echo "\n⚠️  Сервис $SERVICE не найден"
  fi
done

# 4. Устанавливаем и собираем contracts
if [ -d "contracts" ]; then
  echo "\n📦 Устанавливаем зависимости contracts..."
  cd contracts
  npm install --silent
  
  echo "🔨 Собираем contracts..."
  if npm run build 2>&1 | grep -q 'error'; then
    echo "⚠️  Ошибка сборки contracts"
  else
    echo "✅ Contracts собраны"
  fi
  cd ..
fi

echo "\n🎉 Очистка завершена!"
echo "\n📋 Итог:"
echo "1. Shared packages удалены"
echo "2. Package.json обновлены"
echo "3. Contracts добавлены в workspaces"
echo "4. Все сервисы обновлены"
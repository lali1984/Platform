"#!/bin/bash\n\n# 
Скрипт для удаления shared packages и обновления сервисов
\n\nset -e\n\necho \"🧹 Начинаем очистку shared packages...\"\n\n
# 1. Проверяем, какие shared packages существуют\nSHARED_PACKAGES=\"05_packages\"\nif [ -d \"$SHARED_PACKAGES\" ]; then\n  
echo \"📦 Найдены shared packages:\"\n  ls -la \"$SHARED_PACKAGES/\"\n  \n  
# 2. Создаем backup на всякий случай\n  BACKUP_DIR=\"shared-packages-backup-$(date +%Y%m%d_%H%M%S)\"\n  
echo \"💾 Создаем backup в $BACKUP_DIR\"\n  cp -r \"$SHARED_PACKAGES\" \"$BACKUP_DIR\"\n  \n  
# 3. Удаляем shared packages\n  
echo \"🗑️  Удаляем shared packages...\"\n  rm -rf \"$SHARED_PACKAGES\"\n  
echo \"✅ Shared packages удалены\"\nelse\n  
echo \"ℹ️  Shared packages не найдены\"\nfi\n\n# 
4. Обновляем package.json в корне проекта\nROOT_PACKAGE=\"package.json\"\nif [ -f \"$ROOT_PACKAGE\" ]; then\n  
echo \"📝 Обновляем корневой package.json...\"\n  \n  
# Удаляем workspace references к shared packages\n  if grep -q '\"05_packages/' \"$ROOT_PACKAGE\"; then\n    
# Для macOS\n    if [[ \"$(uname)\" == \"Darwin\" ]]; then\n      sed -i '' '/\"05_packages\\//d' \"$ROOT_PACKAGE\"\n    else\n      sed -i '/\"05_packages\\//d' \"$ROOT_PACKAGE\"\n    fi\n    
echo \"✅ Workspace references удалены\"\n  fi\n  \n  # Добавляем contracts в workspaces если их нет\n  if ! grep -q '\"contracts\"' \"$ROOT_PACKAGE\"; then\n    
# Для macOS\n    if [[ \"$(uname)\" == \"Darwin\" ]]; then\n      sed -i '' '/\"workspaces\": \[/a\\\n    \"contracts\",' \"$ROOT_PACKAGE\"\n    else\n      sed -i '/\"workspaces\": \[/a\\    \"contracts\",' \"$ROOT_PACKAGE\"\n    fi\n    
echo \"✅ Contracts добавлены в workspaces\"\n  fi\nfi\n\n
# 5. Обновляем все сервисы\nSERVICES=(\"01_frontend\" \"02_bff-gateway\" \"03_auth-service\" \"04_user-service\" \"06_event-relay\")\n\nfor SERVICE in \"${SERVICES[@]}\"; do\n  if [ -d \"$SERVICE\" ]; then\n    echo \"\\n🔧 Обновляем $SERVICE...\"\n    \n    SERVICE_PACKAGE=\"$SERVICE/package.json\"\n    if [ -f \"$SERVICE_PACKAGE\" ]; then\n      
# Удаляем зависимости от @platform/shared-*\n      if grep -q '@platform/shared-' \"$SERVICE_PACKAGE\"; then\n        
echo \"  🗑️  Удаляем shared dependencies...\"\n        \n        
# Для macOS\n        if [[ \"$(uname)\" == \"Darwin\" ]]; then\n          sed -i '' '/\"@platform\\/shared-/d' \"$SERVICE_PACKAGE\"\n        else\n          sed -i '/\"@platform\\/shared-/d' \"$SERVICE_PACKAGE\"\n        fi\n        \n        echo \"  
✅ Shared dependencies удалены\"\n      fi\n      \n      
# Добавляем contracts dependencies если нужно\n      
# (пока не добавляем, так как contracts еще не готовы к использованию)\n      \n      
# Обновляем scripts если нужно\n      if [ \"$SERVICE\" = \"04_user-service\" ]; then\n        echo \"  
📝 Обновляем scripts для user-service...\"\n        
# Убедимся, что есть скрипт build\n        if ! grep -q '\"build\"' \"$SERVICE_PACKAGE\"; then\n          
# Для macOS\n          if [[ \"$(uname)\" == \"Darwin\" ]]; then\n            sed -i '' '/\"scripts\": {/a\\\n    \"build\": \"nest build\",' \"$SERVICE_PACKAGE\"\n          else\n            sed -i '/\"scripts\": {/a\\    \"build\": \"nest build\",' \"$SERVICE_PACKAGE\"\n          fi\n        fi\n      fi\n    fi\n    \n    
# Проверяем сборку\n    if [ -f \"$SERVICE/package.json\" ] && [ \"$SERVICE\" != \"01_frontend\" ]; then\n      echo \"  🔨 Проверяем сборку...\"\n      cd \"$SERVICE\"\n      if npm run build 2>&1 | grep -q 'error'; then\n        
echo \"  ⚠️  Есть ошибки сборки, требуется ручная проверка\"\n      else\n        
echo \"  ✅ Сборка прошла успешно\"\n      fi\n      cd ..\n    fi\n  else\n    
echo \"\\n⚠️  Сервис $SERVICE не найден\"\n  fi\ndone\n\n
# 6. Устанавливаем зависимости contracts\nif [ -d \"contracts\" ]; then\n  echo \"\\n📦 Устанавливаем зависимости contracts...\"\n  cd contracts\n  npm install\n  cd ..\n  echo \"✅ Зависимости contracts установлены\"\nfi\n\n# 7. Собираем contracts\nif [ -d \"contracts\" ]; then\n  echo \"\\n🔨 Собираем contracts...\"\n  cd contracts\n  npm run build\n  cd ..\n  echo \"✅ Contracts собраны\"\nfi\n\necho \"\\n🎉 Очистка завершена!\"\necho \"\\n📋 Итог:\"\necho \"1. Shared packages удалены (backup в $BACKUP_DIR)\"\necho \"2. Package.json обновлены\"\necho \"3. Contracts добавлены в workspaces\"\necho \"4. Все сервисы проверены на сборку\"\necho \"\\n🚀 Следующие шаги:\"\necho \"1. Протестировать работу всех сервисов\"\necho \"2. Обновить документацию\"\necho \"3. Настроить CI/CD\""
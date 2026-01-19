import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testPostgresConnection() {
  console.log('🔍 Детальная проверка PostgreSQL...');
  
  const pool = new Pool({
  host: 'localhost', // Используем localhost, т.к. порт 5432 проброшен
  port: 5432,
  database: 'auth_db',
  user: 'admin',
  password: 'secret', // Нужен пароль
});

  try {
    // 1. Тест подключения
    const client = await pool.connect();
    console.log('✅ PostgreSQL подключен успешно');
    
    // 2. Проверка таблицы users
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Таблицы в базе данных:');
    tablesResult.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 3. Детальная проверка структуры users
    const usersColumns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Детальная структура таблицы users:');
    console.log('='.repeat(80));
    console.log('| Название колонки            | Тип данных          | NULL? | По умолчанию');
    console.log('='.repeat(80));
    
    usersColumns.rows.forEach((col: any) => {
      const name = col.column_name.padEnd(25);
      const type = col.data_type.padEnd(18);
      const nullable = (col.is_nullable === 'YES' ? 'YES' : 'NO').padEnd(5);
      const defaultValue = col.column_default || '';
      
      console.log(`| ${name} | ${type} | ${nullable} | ${defaultValue}`);
    });
    console.log('='.repeat(80));
    
    // 4. Проверка данных (сколько записей)
    const countResult = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`\n👥 Количество пользователей: ${countResult.rows[0].user_count}`);
    
    // 5. Проверка индексов
    const indexesResult = await client.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'users'
      ORDER BY indexname;
    `);
    
    console.log('\n🔍 Индексы таблицы users:');
    if (indexesResult.rows.length === 0) {
      console.log('  (нет индексов)');
    } else {
      indexesResult.rows.forEach((idx: any) => {
        console.log(`  - ${idx.indexname}`);
      });
    }
    
    // 6. Проверка нужных колонок из миграции
    const requiredColumns = [
      'is_active',
      'reset_password_token',
      'reset_password_expires',
      'is_two_factor_enabled',
      'two_factor_secret'
    ];
    
    console.log('\n✅ Проверка наличия необходимых колонок:');
    for (const column of requiredColumns) {
      const exists = usersColumns.rows.some((col: any) => col.column_name === column);
      console.log(`  - ${column}: ${exists ? '✅ Присутствует' : '❌ Отсутствует'}`);
    }
    
    // 7. Тестовая запись
    console.log('\n🧪 Тестовая запись в БД...');
    const testEmail = `test_${Date.now()}@example.com`;
    
    try {
      await client.query('BEGIN');
      
      const insertResult = await client.query(`
        INSERT INTO users (email, password_hash, is_active)
        VALUES ($1, $2, $3)
        RETURNING id, email, created_at
      `, [testEmail, '$2b$10$testhash', true]);
      
      console.log(`✅ Тестовая запись создана: ${insertResult.rows[0].email}`);
      
      const deleteResult = await client.query(
        'DELETE FROM users WHERE email = $1',
        [testEmail]
      );
      
      console.log(`✅ Тестовая запись удалена (${deleteResult.rowCount} row)`);
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      
      // Обработка ошибки с явным приведением типа
      if (error instanceof Error) {
        console.error('❌ Ошибка в транзакции:', error.message);
      } else {
        console.error('❌ Неизвестная ошибка в транзакции:', String(error));
      }
    }
    
    client.release();
    
  } catch (error) {
    // Обработка ошибки подключения с явным приведением типа
    if (error instanceof Error) {
      console.error('❌ Ошибка подключения к PostgreSQL:', error.message);
    } else {
      console.error('❌ Неизвестная ошибка подключения:', String(error));
    }
    
    console.error('\nПроверь:');
    console.error('1. Запущен ли контейнер с PostgreSQL: docker ps | grep postgres');
    console.error('2. Верные ли credentials в .env файле');
    console.error('3. Доступность базы данных auth_db');
  } finally {
    await pool.end();
  }
}

// Запуск
testPostgresConnection().catch((error: Error) => {
  console.error('❌ Фатальная ошибка при запуске теста:', error.message);
  process.exit(1);
});
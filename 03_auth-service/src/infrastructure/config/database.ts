import { DataSource } from 'typeorm';
import { UserEntity } from '../persistence/entities/User.entity';
import { OutboxEvent } from '../persistence/entities/outbox-event.entity';
import { RoleEntity } from '../persistence/entities/Role.entity';           
import { PermissionEntity } from '../persistence/entities/Permission.entity'; 
import { UserRoleEntity } from '../persistence/entities/user-role.entity';     

export const createDataSource = (): DataSource => {
  console.log('🔧 Creating DataSource...');
  console.log('📋 Environment variables:');
  console.log('  DATABASE_HOST:', process.env.DATABASE_HOST);
  console.log('  DATABASE_PORT:', process.env.DATABASE_PORT);
  console.log('  DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
  console.log('  DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '***' : 'not set');
  console.log('  DATABASE_NAME:', process.env.DATABASE_NAME);
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'not set');
  
  // Используем строку подключения
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DATABASE_USERNAME || 'admin'}:${process.env.DATABASE_PASSWORD || '***'}@${process.env.DATABASE_HOST || 'postgres-auth'}:${process.env.DATABASE_PORT || '5432'}/${process.env.DATABASE_NAME || 'auth_db'}?sslmode=disable`;
  
  console.log('🔌 Database connection string established (hidden for security)');
  
  const dataSourceConfig = {
    type: 'postgres' as const,
    url: connectionString,
    host: process.env.DATABASE_HOST || 'postgres-auth',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'admin',
    password: process.env.DATABASE_PASSWORD || 'secret',
    database: process.env.DATABASE_NAME || 'auth_db',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [
      UserEntity, 
      OutboxEvent,
      RoleEntity,        
      PermissionEntity,
      UserRoleEntity, ],
    migrations: [],
    subscribers: [],
    extra: {
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
      statement_timeout: 5000,
      family: 4, // Принудительно используем IPv4
    },
  };
  
  console.log('⚙️ DataSource config:', JSON.stringify({
    ...dataSourceConfig,
    password: '****',
    url: dataSourceConfig.url.replace(/:[^:]*@/, ':****@'),
  }, null, 2));
  
  return new DataSource(dataSourceConfig);
};

export const initializeDatabase = async (dataSource: DataSource): Promise<void> => {
  try {
    console.log('🔌 Initializing database connection...');
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('✅ Database connection established');
      
      // Проверяем подключение
      await dataSource.query('SELECT 1');
      console.log('✅ Database health check passed');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

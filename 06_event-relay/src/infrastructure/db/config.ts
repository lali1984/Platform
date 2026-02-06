import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export interface ServiceDatabaseConfig {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  outboxTable: string;
}

export class DatabaseConfig {
  private services: ServiceDatabaseConfig[] = [];
  private dataSources: Map<string, DataSource> = new Map();

  constructor() {
    this.loadServiceConfigs();
  }

  private validatePort(portStr: string): number {
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${portStr}`);
    }
    return port;
  }

  private loadServiceConfigs(): void {
    // Конфигурация auth-service
    try {
      this.services.push({
        name: 'auth-service',
        host: process.env.AUTH_DB_HOST || 'postgres-auth',
        port: this.validatePort(process.env.AUTH_DB_PORT || '5432'),
        username: process.env.AUTH_DB_USERNAME || 'admin',
        password: process.env.AUTH_DB_PASSWORD || 'secret',
        database: process.env.AUTH_DB_DATABASE || 'auth_db',
        outboxTable: 'outbox_events'
      });
    } catch (error) {
      console.error('❌ Invalid auth-service database configuration:', error);
      throw error;
    }

    // Конфигурация user-service
    try {
      this.services.push({
        name: 'user-service',
        host: process.env.USER_DB_HOST || 'postgres-user',
        port: this.validatePort(process.env.USER_DB_PORT || '5432'),
        username: process.env.USER_DB_USERNAME || 'admin',
        password: process.env.USER_DB_PASSWORD || 'secret',
        database: process.env.USER_DB_DATABASE || 'user_db',
        outboxTable: 'outbox_events'
      });
    } catch (error) {
      console.error('❌ Invalid user-service database configuration:', error);
      throw error;
    }

    console.log(`📊 Loaded ${this.services.length} service database configurations`);
  }

  private createDataSourceOptions(config: ServiceDatabaseConfig): DataSourceOptions {
    return {
      type: 'postgres',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      synchronize: false,
      logging: ['error'],
      entities: [], // Не регистрируем сущности, используем raw queries
      migrations: [],
      subscribers: [],
      extra: {
        max: 10,
        connectionTimeoutMillis: 5000,
      },
    };
  }

  public async initializeDataSources(): Promise<void> {
    console.log('🔌 Initializing database connections...');

    for (const service of this.services) {
      try {
        const options = this.createDataSourceOptions(service);
        const dataSource = new DataSource(options);

        await dataSource.initialize();
        this.dataSources.set(service.name, dataSource);

        console.log(`✅ Connected to ${service.name} database`);
      } catch (error) {
        console.error(`❌ Failed to connect to ${service.name} database:`, error);
        // Продолжаем с другими сервисами
      }
    }

    console.log(`✅ ${this.dataSources.size}/${this.services.length} database connections established`);
  }

  public getDataSource(serviceName: string): DataSource | undefined {
    return this.dataSources.get(serviceName);
  }

  public getServiceConfig(serviceName: string): ServiceDatabaseConfig | undefined {
    return this.services.find(s => s.name === serviceName);
  }

  public getAllServices(): ServiceDatabaseConfig[] {
    return [...this.services];
  }

  public async shutdown(): Promise<void> {
    console.log('🔻 Closing database connections...');

    for (const [name, dataSource] of this.dataSources) {
      try {
        if (dataSource.isInitialized) {
          await dataSource.destroy();
          console.log(`✅ Closed connection to ${name}`);
        }
      } catch (error) {
        console.error(`❌ Error closing connection to ${name}:`, error);
      }
    }

    this.dataSources.clear();
  }
}

export const databaseConfig = new DatabaseConfig();
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migrations',
});

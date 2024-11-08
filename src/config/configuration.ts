import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    dialect: process.env.DB_CONNECTION,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'test'
}));
const { DataSource } = require('typeorm')

require('dotenv').config()

const dataSource = new DataSource({
  type: process.env.name,
  host: process.env.host,
  port: process.env.port_ad,
  username: process.env.username,
  password: process.env.password,
  database: process.env.databaseName,
  entities: ['/home/sujatha/Downloads/file-upload-2-main-typeorm/file-upload-2-main/model/employee.js'],
  migrations: ['migrations/*.js'],
  migrationsTableName: 'postgres_migrations',
  cli: {
    entitiesDir: ['/home/sujatha/Downloads/file-upload-2-main-typeorm/file-upload-2-main/model/employee.js']
  },
  synchronize: true
})

//export module

module.exports = { dataSource }

module.exports = {
  db: {
    user: process.env.MYSQL_USER,
    host: process.env.APP_DB_HOST,
    password: process.env.MYSQL_PASSWORD,
    name: process.env.MYSQL_DATABASE,
    port: process.env.APP_DB_PORT,
    logging: !!process.env.APP_DB_LOGGING
  },
  app: {
    port: process.env.APP_PORT
  }
}

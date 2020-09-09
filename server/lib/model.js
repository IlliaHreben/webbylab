const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    dialect: 'mysql',
    host: 'localhost',
    charset: 'utf8',
    logging: process.env.DB_LOGGING ? console.log : false
  }
)

const Films = sequelize.define('films', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  releaseYear: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  format: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const Actors = sequelize.define('actors', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  surname: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

Films.belongsToMany(Actors, { through: 'FilmsActors' })
Actors.belongsToMany(Films, { through: 'FilmsActors' })

module.exports = { Films, Actors, sequelize }

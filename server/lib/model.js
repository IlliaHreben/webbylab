const Sequelize = require('sequelize')
const { db: config } = require('./config')

const sequelize = new Sequelize(
  config.name,
  config.user,
  config.password,
  {
    dialect: 'mysql',
    host: config.host,
    port: config.port,
    charset: 'utf8',
    logging: config.logging ? console.log : false
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

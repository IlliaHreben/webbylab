const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_ROOT_PASSWORD, {
  dialect: 'mysql',
  host: 'localhost',
  charset: 'utf8'
})

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



Films.belongsToMany(Actors, { through: 'filmsActors' })
Actors.belongsToMany(Films, { through: 'filmsActors' })


const syncModels = async () => {
  await sequelize.sync({force: true})
  console.log('Sucessfuly sync.')
}
module.exports = { Films, Actors, sequelize, syncModels }

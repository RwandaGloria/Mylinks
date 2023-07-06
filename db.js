require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const SQL_HOST = process.env.CKROACH_SQL_HOST;
const SQL_USER_NAME = process.env.CKROACH_USER_NAME;
const SQL_PASSWORD = process.env.CKROACH_USER_PASS;
const SQL_PORT = process.env.CKROACH_SQL_PORT;
const SQL_DB_NAME = process.env.CKROACH_DB_NAME;

const sequelize = new Sequelize(SQL_DB_NAME, SQL_USER_NAME, SQL_PASSWORD, {
  host: SQL_HOST,
  port: SQL_PORT,
  dialect: 'postgres', 
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false
    },
  },
});

function connect() {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection to DB has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
}

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.users = require("./models/user")(sequelize, DataTypes);
db.URLs = require("./models/URLs")(sequelize, DataTypes);
db.clickData = require("./models/clickdata")(sequelize, DataTypes);
db.tokens = require("./models/tokens")(sequelize, DataTypes);
db.URLs.belongsTo(db.users, { foreignKey: "user_id", as: "URLs" });

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch(err => {
    console.log('Unable to sync database & tables:', err);
  });

module.exports = { connect, db, sequelize };

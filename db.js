
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

const mysql = require('mysql');
const mysql2 = require('mysql2');


DB_USER = process.env.DB_USER;
DB_HOST=process.env.DB_HOST;
DB_PASSWORD=process.env.DB_PASSWORD;
DB_DIALECT=process.env.DB_DIALECT;
DB_NAME=process.env.DB_NAME;
DB_PORT = process.env.DB_PORT;


SQL_HOST = process.env.SQL_HOST;
SQL_USER_NAME = process.env.SQL_USER_NAME;
SQL_PASSWORD = process.env.SQL_PASSWORD;
SQL_PORT = 3306;
SQL_DB_NAME=process.env.SQL_DB_NAME




const connection = mysql.createConnection({

  host: SQL_HOST,
  user: SQL_USER_NAME,
  password: SQL_PASSWORD,
  PORT: SQL_PORT

})


const sequelize = new Sequelize(SQL_DB_NAME, SQL_USER_NAME, SQL_PASSWORD, {
host: SQL_HOST,
dialect: 'mysql'
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
const db = {}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require("./models/user")(sequelize, DataTypes);
db.URLs = require("./models/URLs")(sequelize, DataTypes);
db.clickData = require("./models/clickdata")(sequelize, DataTypes);
db.URLs.belongsTo(db.users, {foreignKey: "user_id", as: "URLs"});

db.sequelize.sync({ force: false })
    .then(() => {
        console.log('Database & tables synced');
    }).catch(err => {
        console.log('Unable to sync database & tables:', err);
    })

module.exports = {connect, db, sequelize}

const { DataTypes } = require("sequelize");

const bcrypt = require('bcrypt');
const saltRounds = 10;
const sequelize = require('../db')


module.exports = (sequelize, DataTypes) => {

const user = sequelize.define("user", {


    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type:DataTypes.DATE,
        defaultValue: new Date()
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
}, 

{Hooks: {

    beforeCreate: async (user) => {
        if (user.password) {
         const salt = await bcrypt.genSaltSync(10, 'a');
         user.password = bcrypt.hashSync(user.password, salt);
        }
       },
       beforeUpdate:async (user) => {
        if (user.password) {
         const salt = await bcrypt.genSaltSync(10, 'a');
         user.password = bcrypt.hashSync(user.password, salt);
        }
       }
      },
      instanceMethods: {
       validPassword: (password) => {
        return bcrypt.compareSync(password, this.password);
       }
      }, 
     
       
     
},
{
    tableName: 'user'
})

user.prototype.validPassword = async (password, hash) => {
    return await bcrypt.compareSync(password, hash);
   }
   
   
return user;


}
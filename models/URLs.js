const { DataTypes } = require("sequelize");

const bcrypt = require('bcrypt');
const saltRounds = 10;
const sequelize = require('../db')


module.exports = (sequelize, DataTypes) => {

const URLs = sequelize.define("URLs", {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true

    },

    longURL: {

        type: DataTypes.STRING, 
        allowNull: false
    },
    shortURL: {

        type: DataTypes.STRING,
        allowNull: false

    },
    createdAt: {
        type:DataTypes.DATE,
        defaultValue: new Date()
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    linkClickCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }, 
    QRCodeImage: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, 

{
    tableName: 'URLs'
})

   
   
return URLs;


}
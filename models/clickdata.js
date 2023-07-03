const { DataTypes } = require("sequelize");

const bcrypt = require('bcrypt');
const saltRounds = 10;
const sequelize = require('../db')


module.exports = (sequelize, DataTypes) => {

const clickData = sequelize.define("clickData", {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true

    },
    link_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },

    Country: {

        type:DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    clickTime: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    }


}, 

{
    tableName: 'clickdata'
})

   
   
return clickData;


}
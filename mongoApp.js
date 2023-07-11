require("dotenv").config();

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const mongoRoutes = require('./routes/mongo_routes');
const utils = require('./utils/utils');

const app = express();

app.use(cors());

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URL).then((result) => {
    app.listen(8099);
    console.log("Connected to DB");

    utils.client.connect().then(() => {
        console.log('redis is connected')
    })
}).catch((error) => {
    console.log(error);
});


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(mongoRoutes);

//Swagger definitions
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'URL Shortener(My links)',
        description: "This is Altschool capstone project",
        version: '1.0.0',
    },
};

const options = {
    swaggerDefinition,
    apis: ['./routes/mongo_routes.js'],
};

const swaggerSpec = swaggerJSDoc(options);
const swaggerUi = require('swagger-ui-express');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//Error message for wrong endpoint
app.use((req, res) => {
    const message = ({ "message": "You tapped the wrong endpoint" });

    res.json(message);

    res.end();
});
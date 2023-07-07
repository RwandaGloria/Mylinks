const joi = require('joi');

const validateCustomURLRoute = async(req, res, next) => {

    const body = req.body;
    try {
        const valid = await customURLValidator.validateAsync(body);
        next();
    }
    catch(err) {
        console.log(err);
        return res.status(406).send(err.details[0].message);
    }
}

const validateSignUp = async (req, res, next) => {

    const body = req.body;
    try {
        const valid = await signupValidator.validateAsync(body);
        next();
    }
    catch(err) {
        console.log(err);
        return res.status(406).send(err.details[0].message);
    }

}

const validateLogin = async (req, res, next) => {

    const body = req.body;

    try{

        const valid = await loginValidator.validateAsync(body);

    }
    catch(err) {
        return res.status(406).send(err.details[0].message);
    }
}

const validateEmailRoute = async (req, res, next) => {

    const body = req.body;
    try {
        const valid = await EmailValidator.validateAsync(body);
        next();
    }
    catch(err) {
        console.log(err);
        return res.status(406).send(err.details[0].message);
    }
}
const validateURLRoute = async (req, res, next) => {

    const body = req.body;

    try {
        const valid = await URLValidator.validateAsync(body);
        next();
    }
    catch(err) {
        console.log(err);
        return res.status(406).send(err.details[0].message);
    }
}
const URLValidator = joi.object({
    url: joi.string().required()
})
const EmailValidator = joi.object({
    email: joi.string().min(5).max(30).email().required()
});

const customURLValidator = joi.object({
    shortURL: joi.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/).required(),
    longURL: joi.string().required(),
  });


  const signupValidator = joi.object({

    password: joi.string().min(6).max(20),
    email: joi.string().email(),
    username: joi.string()
  });
  const loginValidator = joi.object({
    email: joi.string().email(),
    password: joi.string().min(6).max(20),
    confirmPassword: joi.string()
      .valid(joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Confirm password must match the password field',
        'any.required': 'Confirm password is required',
      }),
  });

module.exports = { validateEmailRoute, validateURLRoute, validateCustomURLRoute, validateSignUp, validateLogin }
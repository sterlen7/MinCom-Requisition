const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().required(),
    department: Joi.string().required(),
    email: Joi.string().email().regex(/@mincom\.gov\.gh$/).required(),
    password: Joi.string().required(),
});

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }
    next();
};

module.exports = validateUser;

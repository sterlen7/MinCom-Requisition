const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().required(),
    department: Joi.string().required(),
    email: Joi.string().email().regex(/^[a-zA-Z0-9._%+-]+@mincom\.gov\.gh$/).required().messages({
        'string.email': 'Please provide a valid email address',
        'string.pattern.base': 'Email must be from the mincom.gov.gh domain',
        'any.required': 'Email is required'
    }),
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

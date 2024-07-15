const Joi = require ('joi')

const merchSchema = Joi.object ({
    name:Joi.string().required(),
    color:Joi.string().required(),
    size:Joi.string().required(),
    description: Joi.string().required()
})

exports.validateMerch = (req,res,next) => {
    const {error} = merchSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }
    next();
}


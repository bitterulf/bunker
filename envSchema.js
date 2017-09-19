const Joi = require('joi');

const envSchema = Joi.object({
    BUNKER_PORT: Joi.number().integer().required(),
    BUNKER_ADMIN_USER: Joi.string().alphanum().required(),
    BUNKER_ADMIN_PASSWORD: Joi.string().required()
}).unknown(true);

module.exports = envSchema;

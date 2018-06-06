const Joi = require('joi')
const moment = require('moment')

/**
 * User validation schema (with Joi)
 * @author Alexandre Pereira <alex@blacksmith.studio>
 * @returns {Object} Joi schema
 */
module.exports = Joi.object().keys({
    id         : Joi.string().max(512),
    firstname  : Joi.string().max(128).optional(),
    lastname   : Joi.string().max(128).optional()
})

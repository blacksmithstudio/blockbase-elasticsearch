/**
 * User Example model
 * @namespace app.models.foo
 * @author Alexandre Pereira <alex@blacksmith.studio>
 * @param {Object} app - app namespace to update
 *
 * @returns {Object} model
 */
module.exports = (app) => {
    const Model = app.models._model
    const Config = app.config

    return class User extends Model {
        /**
         * main constructor
         * @param {Object} data - data to param the model
         */
        constructor(data) {
            super({ type: 'user', index : Config.elasticsearch.index })

            if (data)
                this.data = data
        }
    }
}

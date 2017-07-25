const _ = require('underscore')
const elasticsearch = require('elasticsearch')
const moment = require('moment')

/**
 * Blockbase Elasticsearch driver (app.drivers.elasticsearch)
 * @memberof app.drivers
 * @author Alexandre Pereira <alex@blacksmith.studio>
 * @param {Object} app - Application namespace
 *
 * @returns {Object} driver object containing public methods
 */
module.exports = (app) => {
    if(!app.config.has('elasticsearch'))
        return app.drivers.logger.error('Drivers', 'Can not init elasticsearch, no valid config')

    const config = app.config.get('elasticsearch')
    const client = new elasticsearch.Client({
        host: app.config.get('elasticsearch').host,
        log: 'info'
    })

    return {
        /**
         * Returns client
         * @alias client
         */
        client,

        /**
         * Create an object based on a Blockbase valid model
         * @param {Object} item - object compiled by the model
         * @param {function} cb - callback
         */
        create(item, cb){
            if(!item.valid()) return cb(item.validate().error, null)

            client.bulk({
                body: [
                    {
                        index: {
                            _index: item.params.index,
                            _type: item.params.type
                        }
                    },
                    item.body()
                ]
            }, (err, result) => {
                if (err) return cb(err)

                _.extendOwn(item.data, _.extendOwn({ _id: result.items[0].index._id }, result._source))

                if (cb) cb(null, item)
            })
        },

        /**
         * Read an object from the DB
         * @param {Object} item - object compiled by the model (needs _id)
         * @param {function} cb - callback
         */
        read(item, cb){
          if(!item.data._id) return cb(`Cannot process read, data._id missing on item`, null)

            client.get(Object.assign({
                id: item.data._id,
            }, item.params), (err, result) => {
                if (err) return cb(err)

                _.extendOwn(item.data, _.extendOwn({ _id: result._id }, result._source))

                if (cb) cb(null, item)
            })
        },

        /**
         * Update a valid object model
         * @param {Object} item - object compiled by the model
         * @param {function} cb - callback
         */
        update(item, cb){
            if(!item.valid()) return cb(item.validate().error, null)

            item.data.updated_at = moment().format()

            client.update(Object.assign({
                id: item.data._id,
                body: {
                  doc: item.body(),
                }
            }, item.params), (err, result) => {
                if (err) return cb(err)

                _.extendOwn(item.data, _.extendOwn({ _id: result._id }, result._source))
                if (cb) cb(null, item)
            })
        },

        /**
         * Delete an object
         * @param {Object} item - object compiled by the model
         * @param {function} cb - callback
         */
        delete(item, cb){
          if(!item.data._id) return cb(`Cannot process delete, data._id missing on item`, null)

          client.delete({
              index: item.params.index,
              type: item.params.type,
              id: item.data._id
          }, (err, result) => {
              if (err) return cb(err)

              if (cb) cb(null, true)
          })
        },

        /**
         * Save the object and execute the creation or update
         * @param {Object} item - object compiled by the model
         * @param {function} cb - callback
         */
        save(item, cb){
            if(!item.valid()) return cb(item.validate().error, null)

            if(item.data._id)
                this.update(item, cb)
            else
                this.create(item, cb)
        }
    }
}

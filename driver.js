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
        */
        async create(item, cb){            
            return new Promise((resolve, reject) => {
                if(!item.valid()) return reject(item.validate().error)

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
                }, (error, result) => {
                    if (error) return reject(error)
                    
                    _.extendOwn(item.data, _.extendOwn({ id: result.items[0].index.id }, result._source))
                    resolve(item)
                })    
            })
        },
        
        /**
        * Read an object from the DB
        * @param {Object} item - object compiled by the model (needs id)
        */
        async read(item, cb){
            return new Promise((resolve, reject) => {
                if(!item.data.id) return reject(`Cannot process read, data.id missing on item`)

                client.get(Object.assign({
                    id: item.data.id,
                }, item.params), (error, result) => {
                    if (error) return reject(error)
                    
                    _.extendOwn(item.data, _.extendOwn({ id: result.id }, result._source))
                    resolve(item)
                })
            })
        },
        
        /**
        * Update a valid object model
        * @param {Object} item - object compiled by the model
        */
        async update(item){
            return new Promise((resolve, reject) => {
                if(!item.valid()) return reject(item.validate().error)
                
                item.data.updated_at = moment().format()
                
                client.update(Object.assign({
                    id: item.data.id,
                    body: {
                        doc: item.body(),
                    }
                }, item.params), (error, result) => {
                    if (error) return reject(error)
                    
                    _.extendOwn(item.data, _.extendOwn({ id: result.id }, result._source))
                    resolve(item)
                })
            })
        },
        
        /**
        * Delete an object
        * @param {Object} item - object compiled by the model
        */
        async delete(item, cb){
            return new Promise((resolve, reject) => {
                if(!item.data.id) return reject(`Cannot process delete, data.id missing on item`)
                
                client.delete({
                    index: item.params.index,
                    type: item.params.type,
                    id: item.data.id
                }, (error, result) => {
                    if (error) return reject(error)
                    
                    resolve(true)
                })
            })
        },
        
        /**
        * Save the object and execute the creation or update
        * @param {Object} item - object compiled by the model
        */
        async save(item){
            if(!item.valid()) throw item.validate().error
            
            try{
                if(item.data.id)
                    return await this.update(item)
                else
                    return await this.create(item)
            } catch(error){ 
                throw e 
            }
        }
    }
}

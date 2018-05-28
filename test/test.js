process.env['NODE_CONFIG_DIR'] = __dirname + '/config'

const assert = require('assert')
const blockbase = require('@blacksmithstudio/blockbase')

describe('Initialization of tests', () => {
    it('ElasticSearch driver physical presence', () => {
        assert.equal('function', typeof require('../driver'))
    })
})

blockbase({ root : __dirname }, async (app) => {
    app.drivers.elasticsearch = require('../driver')(app)
    
    const Logger = app.drivers.logger
    const Elasticsearch = app.drivers.elasticsearch

    const User = app.models.user
    let user = new User({ firstname : 'John', lastname : 'Doe' })

    console.log(user)
    try{
        describe('App Architecture', () => {
            it('ElasticSearch driver presence', () => {
                assert.equal('object', typeof Elasticsearch)
            })
            it('ElasticSearch client presence', () => {
                assert.equal('object', typeof Elasticsearch.client)
            })
            it('ElasticSearch create presence', () => {
                assert.equal('function', typeof Elasticsearch.create)
            })
            it('ElasticSearch read presence', () => {
                assert.equal('function', typeof Elasticsearch.read)
            })
            it('ElasticSearch update presence', () => {
                assert.equal('function', typeof Elasticsearch.update)
            })
            it('ElasticSearch delete presence', () => {
                assert.equal('function', typeof Elasticsearch.delete)
            })
        })


    } catch(e){
        Logger.error('ES Tests', e)
    }
})
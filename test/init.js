process.env['NODE_CONFIG_DIR'] = __dirname + '/config'

const elasticsearch = require('elasticsearch')
const config = require('config')

/**
 * Init the ES Indice for test
 */
const es = new elasticsearch.Client({
    host: config.get('elasticsearch').host,
    log: 'info',
    requestTimeout : Infinity
})

/**
 * Delete first a possible old-indice
 */
es.indices.delete({
    index: config.get('elasticsearch').index
}, (err, results) => {
    if (err && err.statusCode !== 404) return console.error('error deleting :', err)

    // then create the new one
    es.indices.create({
      index: config.get('elasticsearch').index,
      body: {
        mappings: {
          user : {
            "properties": {
              "firstname": {
                "type": "text"
              },
              "lastname": {
                "type": "text"
              }
            }
          }      
        },
      },
    }, (err, resp) => {
      if(err) return console.error(err)
      console.log(resp)
    })
})


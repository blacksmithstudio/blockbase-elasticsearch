# Driver Elasticsearch for Blockbase
Compatible with Blockbase Framework

### Version
0.0.5 alpha

### How to install ?
```shell
$ npm i --save blockbase-elasticsearch
```

Then add to your config/{env}.yml the following instructions depending of your system
```yml
dbms : elasticsearch
elasticsearch :
    host : localhost:9200
    index : myindex
```

In your models, you just have to setup the type (refering to the type in ES) and the index from your config, example below :
``` js
module.exports = (app) => {
    const Model = app.models._model
    const Config = app.config

    return class User extends Model {
        /**
         * main constructor
         * @param {Object} data - data to param the model
         */
        constructor(data) {
            // for example I have myindex as index & user as type in ES
            super({ type: 'user', index : Config.elasticsearch.index })

            if (data)
                this.data = data
        }
    }
}
```

The use what you want in your usage as a classic Blockbase model.
For example here is an example controller from express, receiving data.
``` js
module.exports = (app) => {
    const User = app.models.user

    return {
        async create(req, res){
            const { firstname, lastname, email } = req.body

            let user = new User({ firstname, lastname, email })
            try{
                user = await user.save()
                console.log(user.data.id) // here you get your ES id
            }
        }
    }
}
```

### Unit tests
```shell
$ npm run test
```

License
----
(Licence [MIT](https://github.com/blacksmithstudio/blockbase-elasticsearch/blob/master/LICENCE))
Coded by [Blacksmith](https://www.blacksmith.studio)


**Free Software, Hell Yeah!**

[Node.js]:https://nodejs.org/en
[NPM]:https://www.npmjs.com

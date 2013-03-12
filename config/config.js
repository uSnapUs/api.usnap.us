module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'usnap.us'
      },
      db: 'mongodb://localhost/noobjs_dev',
    }
  , test: {
      db: 'mongodb://localhost/noobjs_test',
    }
  , production: {
     root: require('path').normalize(__dirname + '/..'),
     heroapp: {
        name: 'usnap.us'
      },
      db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb',
    }
}

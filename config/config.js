module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'usnap.us'
      },
      db: 'mongodb://localhost/noobjs_dev',
    }
  , test: {
      db: 'mongodb://localhost/noobjs_dev',
    }
  , production: {

    }
}

module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'usnap.us'
      },
      db: 'mongodb://localhost/noobjs_dev',
      aws:{
        key:'AKIAI2DV2LLOMN3ANUDA',
        secret:'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',
        bucket:'api.usnap.us.dev'
      }
    }
  , test: {
      db: 'mongodb://localhost/noobjs_test',
      aws:{
        key:'AKIAJ2HIO2X2PG5ZTMRA',
        secret:'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',
        bucket:'api.usnap.us.test'
      }
    }
  , stage: {
    db: 'monogodb://localhost/api_usnap_us_stage',
    aws:{
       key:'AKIAJ2HIO2X2PG5ZTMRA',
       secret:'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',
       bucket:'api.usnap.us.test'
    }
  }
  , production: {
     root: require('path').normalize(__dirname + '/..'),
     app: {
        name: 'usnap.us'
      },
      db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb',
      aws:{
          key:process.env.S3_KEY,
          secret:process.env.S3_SECRET
      }
    }
}

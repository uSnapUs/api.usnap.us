module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'usnap.us'
      },
      email_user:'',
      email_key:'',
      db: 'mongodb://localhost/usnap_us_dev',
      aws:{
        key:'AKIAI2DV2LLOMN3ANUDA',
        secret:'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',
        bucket:'api.usnap.us.dev'
      }
    }
  , test: {
     app: {
        name: 'usnap.us'
      },
      email_user:'',
      email_key:'',
      db: 'mongodb://localhost/usnap_us_test',
      aws:{
        key:'AKIAJ2HIO2X2PG5ZTMRA',
        secret:'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',
        bucket:'api.usnap.us.test'
      }
    }
  , stage: {
    db: 'mongodb://usnap_us_app:uPKR8eUMZZLixFRvLqjAJFwMhYw3udfwrxbQ@dharma.mongohq.com:10001/usnap_us_stage',
     app: {
        name: 'usnap.us'
      },
      email_user:'usnapus',
      email_key:'2oWo%#[66/4+Hm9)3G4k',
    aws:{
       key:'AKIAJ2HIO2X2PG5ZTMRA',
       secret:'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',
       bucket:'api.usnap.us.test'
    }
  }
  , production: {
     root: require('path').normalize(__dirname + '/..'),
     email_user:'usnapus',
      email_key:'2oWo%#[66/4+Hm9)3G4k',
     app: {
        name: 'usnap.us'
      },
      db: 'mongodb://usnap_us_app:QxFFvTrEtcVXCWLgko9XrBi7xFPWhGzTuurq@dharma.mongohq.com:10005/usnap_us',
      aws:{
          key:'AKIAJ2HIO2X2PG5ZTMRA',
       secret:'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',
       bucket:'api.usnap.us.test'
      }
    }
}

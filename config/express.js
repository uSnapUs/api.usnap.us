/**
 * Module dependencies.
 */



var express = require('express'),
  mongoStore = require('connect-mongo')(express),
  flash = require('connect-flash'),
  helpers = require('view-helpers'),
  winston = require('winston'),
  expressWinston = require('express-winston');
  require('winston-loggly');

//airbrake = require('airbrake').createClient("your api key");

module.exports = function(app, config, passport) {
  // app.error(airbrake.expressHandler());
  app.set('showStackError', true);
  // should be placed before express.static
  app.use(express.compress({
    filter: function(req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(express.static(config.root + '/public'));
  app.use(express.logger('dev'));

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  app.configure(function() {
    // dynamic helpers
    app.use(helpers(config.app.name));

    // cookieParser should be above session
    app.use(express.cookieParser());

    // bodyParser should be above methodOverride
    app.use(express.bodyParser());
    app.use(express.methodOverride());


    // connect flash for flash messages
    app.use(flash());

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());



    app.use(express.favicon());
    app.use(expressWinston.logger({
      transports: [
     

      new winston.transports.Loggly({
        json:true,
        inputToken:'19056e32-75ac-4be8-801b-a1c393f5d8d5',
        subdomain:'usnapus'
      })
      ]
    }));

    // routes should be at the last
    app.use(app.router);

    app.use(expressWinston.errorLogger({
      transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.Loggly({
        json:true,
        inputToken:'19056e32-75ac-4be8-801b-a1c393f5d8d5',
        subdomain:'usnapus'
      })]
    }));
    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next) {
      // treat as 404
      if (~err.message.indexOf('not found')) return next();

      // log it
      console.error(err.stack);

      // error page
      res.status(500).render('500', {
        error: err.stack
      });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next) {
      res.status(404).render('404', {
        url: req.originalUrl
      })
    });

  });
}
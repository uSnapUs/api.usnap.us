
var mongoose = require('mongoose')
  , async = require('async');
var device_controller = require('../controllers/device_controller');
var event_controller = require('../controllers/event_controller');
var photo_controller = require('../controllers/photo_controller');

module.exports = function (app, passport, auth,config) {
  	app.get('/ping',function(req,res){
		var Event = mongoose.model('Event');
		Event.count({}, function(err, count) {
				if(err){
					res.status(500);
        			res.send(err);
					return;
				}
				res.status(200);
        		res.send({status:"ok"});
        
			});
    });
 
   event_controller.setupRoutes(app,passport,auth,config);
   photo_controller.setupRoutes(app,passport,auth,config);
   device_controller.setupRoutes(app,passport,auth,config);
}

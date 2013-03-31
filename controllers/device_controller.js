/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var passport = require('passport');

exports.create = function(req, res,next) {
  passport.authenticate('basic', function(auth_err, usr, info) {
    var Device = mongoose.model('Device');
    var device = new Device(req.body);
    Device.findOne({
      guid: device.guid
    }, function(err, existing_device) {
      if (err || existing_device == null) {
        existing_device = device;
      } else {
        if(!usr||usr.guid!=existing_device.guid){
          res.status(401);
          res.send("unauthorised to update this device");
          return;
        }

        existing_device.name = device.name;
        existing_device.facebook_id = device.facebook_id;
      }
      existing_device.save(function(err, saved_device) {
        if (!err) {
          res.send(saved_device);
        } else {
          res.status(400);
          res.send(err);
        }
      });
    });
  })(req,res,next);
};
exports.delete = function(req,res,next){
  var Device = mongoose.model('Device');
  Device.remove({},function(){
     res.status(200);
     res.send({});     
  });
};
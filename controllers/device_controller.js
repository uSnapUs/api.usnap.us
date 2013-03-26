
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');


exports.register = function (req, res) {
    var Device = mongoose.model('Device');
    var device = new Device(req.body);
    Device.findOne({guid:device.guid},function(err,existing_device){
      if(err||existing_device==null)
      {
        existing_device = device;
      }
      else{
        existing_device.name = device.name;
        existing_device.facebook_id = device.facebook_id;
      }
      existing_device.save(function(err,saved_device){
    	   if(!err){
      		  res.send(saved_device);
  		  }
  		  else{
          res.status(400);
  			 res.send(err);
  		  }
      });
    });
    
    return;
};


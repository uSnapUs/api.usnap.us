
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');


exports.register = function (req, res) {
    var Device = mongoose.model('Device');
    var device = new Device(req.body);
    device.save(function(err){
    	if(!err){
      		res.send(device);
  		}
  		else{
        res.status(400);
  			res.send(err);
  		}
    });
    
    return;
};


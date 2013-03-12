

var mongoose = require('mongoose');
config = require("../config/config")['test'];

mongoose.connection.on('error', function(err){
	console.log('error connecting');
	console.log(err);
});


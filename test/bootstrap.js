var mongoose = require('mongoose');
//mongoose.set('debug', true);
config = require("../config/config")['test'];
process.env.NODE_ENV = "test";
mongoose.connection.on('error', function(err) {
	console.log('error connecting');
	console.log(err);
});
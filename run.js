
var options = {
  // time in ms when the event loop is considered blocked
  blockThreshold: 10
};

require('nodefly').profile(
    '1761c88c70889d64c85b26dbc2b16218',
    'uSnap.us_'+(process.env.NODE_ENV || 'development'),
    options
);

var app = require("./app"),
 http = require('http');
var port = process.env.PORT || 3000
  http.createServer(app).listen(port, function() {
    console.log("Express server listening on port " + port);
  });
var fs = require('fs');
var models_path = __dirname + '/controllers'
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
})

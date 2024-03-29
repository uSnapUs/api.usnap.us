desc('Install required npm modules');
task('install-npm-depends', [], function () {
	
	console.log("\n\n > Attempting to install dependencies via npm\n".blue);

	// Get the fs module
	var spawn = require('child_process').spawn;
	
	console.log("    Executing command:\n    $ npm install\n".grey);

	npm = spawn("npm", ["install","--production"]);
	
	npm.stdout.on('data', function (data) {
		process.stdout.write(("    " + data).grey);
	});

	npm.stderr.on('data', function (data) {
		process.stdout.write(("    " + data).grey);
	});

	npm.on('exit', function (code) {
		if (code === 0) {
			console.log("\n + npm installed dependencies successfully".green);
			complete();
		} else {
			throw new Error("npm exited with error code " + code);
		}
	});

}, true);

// Initialise properties
var properties = null,
		versionedPath = null,
		livePath = null;

desc('Loads in properties file');
task('load-props', ["install-npm-depends"], function() {

	console.log("\n\n > Attempting to read in build properties\n".blue);
	var branch = process.env.branch||"master";
	console.log(branch);
	var fs = require("fs");
	
	// Read in and parse build properties
	properties = JSON.parse(fs.readFileSync('config/'+branch+'.props.json'));
	
	// Print the properties to the console
	for (var p in properties) {
		if (properties.hasOwnProperty(p)) {
			console.log(("    " + p + " : " + properties[p]).grey);
		}
	}
	
	// Build some paths from properties for use later on
	versionedPath = properties.siteLocation + properties.state + "/.versions/" +
									properties.siteName + "@" + properties.version + "-" + new Date().getTime();
	livePath = properties.siteLocation + properties.state + "/" + properties.siteName;

	console.log("\n + Properties read successfully".green);

	complete();

}, true);

desc('Create versioned site directory');
task('create-versioned-dir', ["load-props"], function() {
	
	console.log("\n\n > Attempting to create versioned directory\n".blue);

	var exec = require('child_process').exec,
			mkdir;
	
	console.log(("    Executing command:\n    $ mkdir " + versionedPath + "\n").grey);
	// Create versioned directory
	mkdir = exec("mkdir " + versionedPath, function (error, stdout, stderr) {

		if (error !== null) {
			console.log(error.message);
			throw error;
		} else {
			console.log((" + Versioned directory created successfully").green);
			complete();
		}
	});

}, true);

desc('Move files to desired location');
task('move-files', ["load-props", "create-versioned-dir"], function() {

	console.log("\n\n > Attempting to moved files into desired location\n".blue);

	var exec = require('child_process').exec,
			rsync;

	console.log(("    Executing command:\n    $ rsync -a . " + versionedPath).grey);
	
	// Move files from temporary directory to versioned directory just created
	rsync = exec("rsync -a . " + versionedPath, function (error, stdout, stderr) {
		if (error !== null) {
			console.log(error.message);
			throw error;
		} else {
			console.log("\n + Files moved successfully".green);
			complete();
		}
	});

}, true);

desc('Symlink new version');
task('symlink-live', ["load-props", "create-versioned-dir", "move-files"], function() {

	console.log("\n\n > Attempting to make a symbolic link\n".blue);

	var exec = require('child_process').exec,
			ln;
	
	console.log(("    Executing command:\n    $ rm " + livePath + " && ln -s -v " + versionedPath + " " + livePath).grey);
	// Symlink to the versioned directory
	exec("rm "+livePath,function(error1,stdout1,stderr1){
		console.log(error1);
		console.log(stderr1);
		ln = exec("ln -s " + versionedPath + " " + livePath, function (error, stdout, stderr) {
			if (error !== null) {
				console.log(error);
				console.log(stderr);
				console.log(stdout);
				throw error;
			} else {
				console.log("\n + Symlink created".green);
				complete();
			}
		});
	});

}, true);

desc('Puts the site live');
task('default', ["load-props", "create-versioned-dir", "move-files", "symlink-live"], function() {
    
	console.log("\n\n > Attempting to put the site live\n".blue);

	var exec = require('child_process').exec,
			spawn = require('child_process').spawn,
			upstart;
	
	console.log(("    Executing command:\n    $ sudo svcadm disable " + properties.siteName + "-" + properties.state).grey);
	// Stop the old version of the app and start the new version with monit
	exec("sudo svcadm disable " + properties.siteName + "-" + properties.state, function (error, stdout, stderr) {

		if (error) {
			throw error;
		} else {
			console.log(("\n    Executing command:\n    $sudo svcadm enable " +
												properties.siteName + "-" + properties.state).grey);

			exec("sudo svcadm enable " + properties.siteName + "-" + properties.state, function (error, stdout, stderr) {

				console.log("\n + Old instance killed successfully\n".green);
				if (error) {
					console.log(" + New instance failed to be put live\n".red);
					throw error;
				} else {
					console.log(" + New instance is put live\n".green);
					complete();
				}
			});
		}

	});

});

function stylize(str, style) {
  var styles = {
  //styles
  'bold'      : [1,  22], 'italic'    : [3,  23],
  'underline' : [4,  24], 'inverse'   : [7,  27],
  //grayscale
  'white'     : [37, 39], 'grey'      : [90, 39],
	'black'     : [90, 39],
  //colors
  'blue'      : [34, 39], 'cyan'      : [36, 39],
	'green'     : [32, 39], 'magenta'   : [35, 39],
  'red'       : [31, 39],'yellow'    : [33, 39]
  };
  return '\033[' + styles[style][0] + 'm' + str + '\033[' + styles[style][1] + 'm';
}

['bold', 'underline', 'italic',
	'inverse', 'grey', 'yellow',
	'red', 'green', 'blue',
	'white', 'cyan', 'magenta'].forEach(function (style) {

  String.prototype.__defineGetter__(style, function () {
    return stylize(this, style);
  });

});
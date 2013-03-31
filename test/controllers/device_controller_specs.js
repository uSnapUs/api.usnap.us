var mongoose = require('mongoose');
require("../../models/device");
var Device = mongoose.model('Device');
var device_controller = require("../../controllers/device_controller");
var should = require('should');
var passport = require("passport"),
	BasicStrategy = require('passport-http').BasicStrategy;
describe('DeviceController', function() {
	before(function() {
		mongoose.connect(config.db);
	});
	describe('register with a new device (minimum fields)', function() {
		var _posted_model = {
			guid: 'guid',
			name: 'name'
		};
		var _result;
		var _status_code;
		before(function(done) {
			var req = {
				body: _posted_model,
				headers: []
			};
			var res = {
				status: function(status_code) {
					_status_code = status_code;
				},
				send: function(object) {
					_result = object;
					done();
				}
			};
			device_controller.create(req, res, function() {});
		});
		it("should create a new device", function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});

		it('should create device with correct guid', function(done) {
			Device.count({
				guid: _posted_model.guid
			}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		it('should save all the fields', function(done) {
			Device.findOne({
				guid: _posted_model.guid
			}, function(err, saved) {
				saved.guid.should.equal(_posted_model.guid);
				saved.name.should.equal(_posted_model.name);
				done();
			});
		});
		it('should return correct device', function(done) {
			Device.findOne({
				guid: _posted_model.guid
			}, function(err, saved) {
				_result.guid.should.equal(saved.guid);
				_result.id.should.equal(saved.id);
				_result.name.should.equal(saved.name);
				done();
			});
		});
		it('should return token', function() {
			_result.token.should.exist;
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});
	});

	describe('register with a new device (all fields)', function() {
		var _posted_model = {
			guid: 'guid',
			name: 'name',
			facebook_id: 'facebook_id'
		};
		var _result;
		var _status_code;
		before(function(done) {
			var req = {
				body: _posted_model,
				headers: []
			};


			var res = {
				status: function(status_code) {
					_status_code = status_code;
				},
				send: function(object) {
					_result = object;
					done();
				}
			};
			device_controller.create(req, res);
		});
		it("should create a new device", function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});

		it('should create device with correct guid', function(done) {
			Device.count({
				guid: _posted_model.guid
			}, function(err, count) {
				count.should.equal(1);
				done();
			});
		})
		it('should save all the fields', function(done) {
			Device.findOne({
				guid: _posted_model.guid
			}, function(err, saved) {
				saved.guid.should.equal(_posted_model.guid);
				saved.name.should.equal(_posted_model.name);
				saved.facebook_id.should.equal(_posted_model.facebook_id);
				done();
			});
		});
		it('should return correct device', function(done) {
			Device.findOne({
				guid: _posted_model.guid
			}, function(err, saved) {
				_result.guid.should.equal(saved.guid);
				_result.id.should.equal(saved.id);
				_result.name.should.equal(saved.name);
				_result.facebook_id.should.equal(saved.facebook_id);
				done();
			});
		});
		it('should return token', function() {
			_result.token.should.exist;
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});
	});

	describe('register with an existing guid', function() {
		var _posted_model = {
			guid: 'guid',
			name: 'name'
		};
		var _result;
		var _status_code;
		before(function(done) {


			var existing_device = new Device(_posted_model);
			existing_device.name = 'existing';
			existing_device.save(function() {
				var req = {
					body: _posted_model,
					headers: []
				};
				req.headers["authorization"] = "Basic " + new Buffer(existing_device.guid + ':' + existing_device.token).toString('base64')
				
				var res = {
					status: function(status_code) {
						_status_code = status_code;
					},
					send: function(object) {
						_result = object;
						done();
					}
				};
				device_controller.create(req, res, function() {});
			});
		});
		it("should not create a new device", function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		it('should return correct device', function(done) {
			Device.findOne({
				guid: _posted_model.guid
			}, function(err, saved) {
				_result.guid.should.equal(saved.guid);
				_result.id.should.equal(saved.id);
				_result.name.should.equal(saved.name);
				done();
			});
		});
		it('should not return token', function() {
			should.not.exist(_result.token);
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});
	});
	describe('register without specifying a guid', function() {
		var _posted_model = {
			name: 'name'
		};
		var _result;
		var _status_code;
		before(function(done) {
			var req = {
				body: _posted_model,
				headers: []
			};


			var res = {
				status: function(status_code) {
					_status_code = status_code;
				},
				send: function(object) {
					_result = object;
					done();
				}
			};
			device_controller.create(req, res);
		});
		it("should not create a new device", function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		it('should return an error', function() {
			_result.errors.guid.type.should.equal('required');
		});
		it('should return a 400 status code', function() {
			_status_code.should.equal(400);
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});

	});
	describe('register without specifying a name', function() {
		var _posted_model = {
			guid: 'guid'
		};
		var _result;
		var _status_code;
		before(function(done) {
			var req = {
				body: _posted_model,
				headers: []
			};


			var res = {
				status: function(status_code) {
					_status_code = status_code;
				},
				send: function(object) {
					_result = object;
					done();
				}
			};
			device_controller.create(req, res);
		});
		it("should not create a new device", function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		it('should return an error', function() {
			_result.errors.name.type.should.equal('required');
		});
		it('should return a 400 status code', function() {
			_status_code.should.equal(400);
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});

	});
	after(function(done) {
		Device.remove({}, function() {
			mongoose.disconnect(function() {
				done();
			});
		});

	});
});
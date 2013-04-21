var mongoose = require('mongoose');
require("../../models/event");
var Event = mongoose.model('Event');
var event_controller = require("../../controllers/event_controller");
var should = require('should');

describe('event controller', function() {
	before(function() {
		mongoose.connect(config.db);
	});
	var minimum_model = {
		name: "My New Event",
		location: {type:'Point',coordinates:[175.011968,-41.154469]},
		address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
		start_date: "2013-01-01T19:00:00",
		end_date: "2013-01-02T00:00:00"

	};
	describe('#create with basic event details', function() {

		var _status_code;
		var _result;
		before(function(done) {
			var req = {
				body: minimum_model

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
			event_controller.create(req, res);
		});
		it('should create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		it('should return an event with an id', function() {
			should.exist(_result.id);
		});
		it('should return the correct event', function() {
			_result.name.should.equal(minimum_model.name);
		});
		it('should save the correct details', function(done) {
			Event.findById(_result.id, function(err, ev) {
				ev.name.should.equal(minimum_model.name);
				ev.location.coordinates[0].should.eql(minimum_model.location.coordinates[0]);
				ev.location.coordinates[1].should.eql(minimum_model.location.coordinates[1]);
				should.exist(ev.createdAt);
				ev.is_public.should.be.false;
				should.exist(ev.code);
				_result.code.should.equal(ev.code);
				ev.address.should.equal(minimum_model.address);
				done();
			});
		});
		it('should mark event as private', function(){
			_result.is_public.should.be.false;
		});
		it('should create an event code', function () {
			should.exist(_result.code);
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			})
		});
	});
	describe('#create without location', function() {

		var _status_code;
		var _result;
		var _location = minimum_model.location;
		before(function(done) {
			var model = minimum_model;
			delete model.location;
			var req = {
				body: model
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
			event_controller.create(req, res);
		});
		it('should not create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		it('should return an error status code', function() {
			_status_code.should.equal(400);
		});
		it('should return an error on location', function() {
			_result.errors['location.coordinates'].type.should.equal('required');
		});
		after(function(done) {
			minimum_model.location = _location;
			Event.remove({}, function() {
				done();
			})
		});
	});
	describe('#create without name', function() {

		var _status_code;
		var _result;
		var _name = minimum_model.name;
		before(function(done) {
			var model = minimum_model;
			delete model.name;
			var req = {
				body: model
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
			event_controller.create(req, res);
		});
		it('should not create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		it('should return an error status code', function() {
			_status_code.should.equal(400);
		});
		it('should return an error on name', function() {

			_result.errors.name.type.should.equal('required');
		});
		after(function(done) {
			minimum_model.name = _name;
			Event.remove({}, function() {
				done();
			})
		});
	});
	describe('#create without start date', function() {

		var _status_code;
		var _result;
		var _start_date = minimum_model.start_date;
		before(function(done) {
			var model = minimum_model;
			delete model.start_date;
			var req = {
				body: model
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
			event_controller.create(req, res);
		});
		it('should not create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		it('should return an error status code', function() {
			_status_code.should.equal(400);
		});
		it('should return an error on start date', function() {

			_result.errors.start_date.type.should.equal('required');
		});
		after(function(done) {
			minimum_model.start_date = _start_date;
			Event.remove({}, function() {
				done();
			})
		});
	});
	describe('#create without end date', function() {

		var _status_code;
		var _result;
		var _end_date = minimum_model._end_date;
		before(function(done) {
			var model = minimum_model;
			delete model.end_date;
			var req = {
				body: model
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
			event_controller.create(req, res);
		});
		it('should not create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		it('should return an error status code', function() {
			_status_code.should.equal(400);
		});
		it('should return an error on end date', function() {

			_result.errors.end_date.type.should.equal('required');
		});
		after(function(done) {
			minimum_model.end_date = _end_date;
			Event.remove({}, function() {
				done();
			})
		});
	});
	describe('#get event by code',function(){
		
	});
	after(function(done) {
		Event.remove({}, function() {
			mongoose.disconnect(function() {
				done();
			});
		});

	});
});
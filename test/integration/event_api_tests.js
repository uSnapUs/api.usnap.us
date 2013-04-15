var app = require("../../app");
var request = require('supertest');
var mongoose = require('mongoose');
var should = require('should');
var http = require('http');
require("../../models/device");
require("../../models/event");
var Device = mongoose.model('Device');
var Event = mongoose.model('Event');
var nock = require('nock');
var querystring = require('querystring');

describe('event api', function() {

	var server;
	var result;
	var registered_device;
	before(function(done) {
		mongoose.connect(config.db);
		registered_device = new Device({
			name: "api test device",
			guid: "api_test_guid",
			email: "owen@usnap.us"
		});
		registered_device.save(function() {
			done();
		});
	});
	describe('post new event, authorised as a registered device', function() {
		var postParams, postParamsString;
		before(function(done) {
			var webApi = nock('https://sendgrid.com:443')
				.matchHeader('Content-Type', 'application/x-www-form-urlencoded')
				.filteringRequestBody(function(path) {
				postParamsString = path;
				postParams = querystring.parse(path);
				return '*';
			})
				.post('/api/mail.send.json', '*')
				.reply(200, {
				message: "success"
			});

			request(http.createServer(app))
				.post('/events')
				.set('Content-Type', 'application/json')
				.auth(registered_device.guid, registered_device.token)
				.send({
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.011968, -41.154469]
				},
				address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			})
				.end(function(err, res) {
				result = res;

				done();
			});
		});
		it('should return ok status', function() {

			result.statusCode.should.equal(200);
		});
		it('should create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		it('should send event created email',function(){
			postParams.subject.should.equal("New Event Created");
		});
		it('should email event code',function(){
			postParams.text.should.equal(JSON.stringify(result.body))
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			});
		});
	});
	describe('post new event, unauthorised', function() {
		before(function(done) {
			request(http.createServer(app))
				.post('/events')
				.set('Content-Type', 'application/json')
				.send({
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.011968, -41.154469]
				},
				address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			})
				.end(function(err, res) {
				result = res;
				done();
			});
		});
		it('should return unauthorised status', function() {
			result.statusCode.should.equal(401);
		});
		it('should not create a new event', function(done) {
			Event.count({}, function(err, count) {
				count.should.equal(0);
				done();
			});
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			});
		});
	});
	describe('get event with existing code, authorised', function() {
		var ev;
		before(function(done) {
			ev = new Event({
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.011968, -41.154469]
				},
				address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			});
			ev.save(function() {
				request(http.createServer(app))
					.get('/event/' + ev.code)
					.set('Content-Type', 'application/json')
					.auth(registered_device.guid, registered_device.token)
					.end(function(err, res) {
					result = res;
					done();
				});
			});

		});
		it('should return an ok status', function() {
			result.statusCode.should.equal(200);
		});
		it('should retun the event with the correct code', function() {
			result.body.code.should.equal(ev.code);
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			});
		});
	});
	describe('get event with non existing code, authorised', function() {
		before(function(done) {

			request(http.createServer(app))
				.get('/event/nocode')
				.set('Content-Type', 'application/json')
				.auth(registered_device.guid, registered_device.token)
				.end(function(err, res) {
				result = res;
				done();
			});
		});
		it('should return a not found status', function() {
			result.statusCode.should.equal(404);
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			});
		});
	});
	describe('get event with existing code, unauthorised', function() {
		var ev;
		before(function(done) {
			ev = new Event({
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.011968, -41.154469]
				},
				address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			});
			ev.save(function() {
				request(http.createServer(app))
					.get('/event/' + ev.code)
					.set('Content-Type', 'application/json')
					.auth(registered_device.guid, 'token')
					.end(function(err, res) {
					result = res;
					done();
				});
			});

		});
		it('should return an unauthorised status', function() {
			result.statusCode.should.equal(401);
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			});
		});
	});
	describe('get event near to location, authorised', function() {
		var events_saved;

		before(function(done) {
			events_saved = [{
				//at point
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.011968, -41.154469]
				},
				address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			}, {
				//outside
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.034179, -41.142984]
				},
				address: "Trentham Race Course, Trentham, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			}, {
				//inside
				name: "My New Event",
				location: {
					type: 'Point',
					coordinates: [175.011005, -41.147767]
				},
				address: "Silverstream Station, Silverstream, Upper Hutt, New Zealand",
				start_date: "2013-01-01T19:00:00",
				end_date: "2013-01-02T00:00:00"
			}];

			Event.create(events_saved, function(err, a, b, c) {
				events_saved = [a, b, c];
				request(http.createServer(app))
					.get('/events/by_location?latitude=-41.154469&longitude=175.011968')
					.set('Content-Type', 'application/json')
					.auth(registered_device.guid, registered_device.token)
					.end(function(err, res) {
					result = res;
					done();
				});
			});

		});
		it('should return an ok status', function() {
			result.statusCode.should.equal(200);
		});
		it('should retun two events', function() {
			result.body.length.should.equal(2);
		});
		it('should contain correct two events', function() {
			var codes = result.body.map(function(e) {
				return e.code;
			});
			codes.should.include(events_saved[0].code);
			codes.should.include(events_saved[2].code);
		});
		after(function(done) {
			Event.remove({}, function() {
				done();
			});
		});
	});

	after(function(done) {
		Event.remove({}, function() {
			Device.remove({}, function() {
				mongoose.disconnect(function() {
					done();
				});
			});
		});

	});

});
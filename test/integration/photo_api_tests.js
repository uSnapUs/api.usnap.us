var app = require("../../app");
var request = require('supertest');
var mongoose = require('mongoose');
var should = require('should');
var http = require('http');
require("../../models/device");
require("../../models/event");
var Device = mongoose.model('Device');
var Event = mongoose.model('Event');

describe('photo api', function() {

	var server;
	var result;
	var registered_device;
	var registered_event;
	before(function(done) {
		mongoose.connect(config.db);
		registered_device = new Device({
			name: "api test device",
			guid: "api_test_guid"
		});
		registered_event = new Event({
			name: "My New Event",
			location: {type:'Point',coordinates:[ 175.011968,-41.154469]},
			address: "36 Sunbrae Drive, Silverstream, Upper Hutt, New Zealand",
			start_date: "2013-01-01T19:00:00",
			end_date: "2013-01-02T00:00:00"
		});
		registered_device.save(function() {
			registered_event.save(function(err, ev) {
				done();
			});
		});
	});
	describe('post new photo, authorised as a registered device', function() {
		before(function(done) {
			request(http.createServer(app))
				.post('/event/' + registered_event.code + '/photos')
				.set('Content-Type', 'application/json')
				.auth(registered_device.guid, registered_device.token)
				.attach('photo', __dirname + '/../test_data/raw/house.jpg')
				.end(function(err, res) {
				result = res;
				done();
			});
		});
		it('should return ok status', function() {
			result.statusCode.should.equal(200);
		});
		it('should create a new photo on the existing event', function(done) {
			Event.findById(registered_event.id, function(err, ev) {
				ev.photos.length.should.equal(1);
				done();
			});
		});
		it('should save id for thumbnail and full image',function(done){
			Event.findById(registered_event.id, function(err, ev) {
				should.exist(ev.photos[0].thumbnail_url);
				should.exist(ev.photos[0].full_url)
				done();
			});
		});
		it('should save the correct extension for thumbnail image',function(done){
			Event.findById(registered_event.id, function(err, ev) {
				ev.photos[0].thumbnail_url.should.include('.png');
				done();
			});
		});
		it('should save the correct root url',function(done){
			Event.findById(registered_event.id, function(err, ev) {
				ev.photos[0].root_url.should.equal('https://s3.amazonaws.com/api.usnap.us.test')
				done();
			});
		});


		after(function(done) {
			registered_event.photos = [];
			registered_event.save(function() {
				done();
			});
		});
	});
	after(function(done) {
		Event.remove({}, function(err) {
			Device.remove({}, function(err) {
				mongoose.disconnect(function() {
					done();
				});
			});
		});
	});
});
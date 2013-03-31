var app = require("../../app");
var request = require('supertest');
var mongoose = require('mongoose');
var should = require('should');
var http = require('http');
require("../../models/device");
var Device = mongoose.model('Device');

describe('device api', function() {

	var server;
	var result;
	before(function() {
		mongoose.connect(config.db);
	});
	describe('post new device', function() {
		before(function(done) {
			request(http.createServer(app))
				.post('/devices')
				.send({
				name: 'test device',
				guid: 'testguid'
			})
				.end(function(err, res) {
				result = res;
				done();
			});
		});
		it('should return correct status', function() {
			result.statusCode.should.equal(200);
		});
		it('should create a new device', function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});
	});
	describe('post update to existing device authenticated', function() {
		var existing_device;
		before(function(done) {
			existing_device = new Device({
				name: "existing name",
				guid: "testguid"
			});
			existing_device.save(function() {
				request(http.createServer(app))
					.post('/devices')
					.auth(existing_device.guid, existing_device.token)
					.send({
					name: 'updated device',
					guid: 'testguid'
				})
					.end(function(err, res) {
					result = res;
					done();
				});

			})

		});
		it('should return correct status', function() {
			result.statusCode.should.equal(200);
		});
		it('should not create a new device', function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		it('should update existing device', function(done) {
			Device.findById(existing_device.id, function(err, device) {
				device.name.should.equal("updated device");
				done();
			});
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});
	});
	describe('post update to existing device unauthenticated', function() {
		var existing_device;
		before(function(done) {
			existing_device = new Device({
				name: "existing name",
				guid: "testguid"
			});
			existing_device.save(function() {
				request(http.createServer(app))
					.post('/devices')
					.send({
					name: 'updated device',
					guid: 'testguid'
				})
					.end(function(err, res) {
					result = res;
					done();
				});

			})

		});
		it('should return unauthorised status', function() {
			result.statusCode.should.equal(401);
		});
		it('should not create a new device', function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(1);
				done();
			});
		});
		it('should not update existing device', function(done) {
			Device.findById(existing_device.id, function(err, device) {
				device.name.should.equal("existing name");
				done();
			});
		});
		after(function(done) {
			Device.remove({}, function() {
				done();
			});
		});
	});
	describe('post update to existing device authenticated as wrong device', function() {
		var existing_device;
		var existing_device2;
		before(function(done) {
			existing_device = new Device({
				name: "existing name",
				guid: "testguid"
			});
			existing_device2 = new Device({
				guid: 'other_guid',
				name: 'other device'
			});
			existing_device2.save(function() {
				existing_device.save(function() {
					request(http.createServer(app))
						.post('/devices')
						.auth(existing_device2.guid, existing_device2.token)
						.send({
						name: 'updated device',
						guid: 'testguid'
					})
						.end(function(err, res) {
						result = res;
						done();
					});

				});
			});

		});
		
		it('should return unauthorised status', function() {
			result.statusCode.should.equal(401);
		});
		it('should not create a new device', function(done) {
			Device.count({}, function(err, count) {
				count.should.equal(2);
				done();
			});
		});
		it('should not update existing device', function(done) {
			Device.findById(existing_device.id, function(err, device) {
				device.name.should.equal("existing name");
				done();
			});
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
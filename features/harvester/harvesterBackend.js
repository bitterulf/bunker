'use strict';

const Datastore = require('nedb');
const harvesterDB = new Datastore({ filename: './store/harvester', autoload: true });

const harvesterBackend = {
    register: function (server, options, next) {

        server.route({
            method: 'GET',
            path: '/harvesterFrontend.js',
            handler: {
                file: './features/harvester/harvesterFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/harvester.css',
            handler: {
                file: './features/harvester/harvester.css'
            }
        });

        server.route({
            method: 'GET',
            path:'/harvester',
            handler: function (request, reply) {
                harvesterDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/harvester',
            handler: function (request, reply) {
                harvesterDB.insert([request.payload], function (err, newDocs) {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/harvester/{id}',
            handler: function (request, reply) {
                harvesterDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        next();
    }
};

harvesterBackend.register.attributes = {
    name: 'harvesterBackend',
    version: '1.0.0'
};

module.exports = harvesterBackend;

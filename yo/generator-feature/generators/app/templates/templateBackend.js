'use strict';

const Datastore = require('nedb');

const <%= name %>Backend = {
    register: function (server, options, next) {

        server.decorate('request', '<%= name %>DB', new Datastore({ filename: './store/<%= name %>', autoload: true }));

        server.route({
            method: 'GET',
            path: '/<%= name %>Frontend.js',
            handler: {
                file: './features/<%= name %>/<%= name %>Frontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/<%= name %>.css',
            handler: {
                file: './features/<%= name %>/<%= name %>.css'
            }
        });

        server.route({
            method: 'GET',
            path:'/<%= name %>',
            handler: function (request, reply) {
                request.<%= name %>DB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/<%= name %>',
            handler: function (request, reply) {
                request.<%= name %>DB.insert([request.payload], function (err, newDocs) {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/<%= name %>/{id}',
            handler: function (request, reply) {
                request.<%= name %>DB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        next();
    }
};

<%= name %>Backend.register.attributes = {
    name: '<%= name %>Backend',
    version: '1.0.0'
};

module.exports = <%= name %>Backend;

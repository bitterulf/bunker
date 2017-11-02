'use strict';

const Datastore = require('nedb');
const pressLineDB = new Datastore({ filename: './store/pressLine', autoload: true });
const pressQueryDB = new Datastore({ filename: './store/pressQuery', autoload: true });
const pressTemplateDB = new Datastore({ filename: './store/pressTemplate', autoload: true });

const pressBackend = {
    register: function (server, options, next) {

        server.route({
            method: 'GET',
            path: '/pressFrontend.js',
            handler: {
                file: './features/press/pressFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/press.css',
            handler: {
                file: './features/press/press.css'
            }
        });

        server.route({
            method: 'GET',
            path:'/press/lines',
            handler: function (request, reply) {
                pressLineDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/press/line',
            handler: function (request, reply) {
                pressLineDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/press/line/{id}',
            handler: function (request, reply) {
                pressLineDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/press/queries',
            handler: function (request, reply) {
                pressQueryDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/press/query',
            handler: function (request, reply) {
                pressQueryDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/press/query/{id}',
            handler: function (request, reply) {
                pressQueryDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/press/templates',
            handler: function (request, reply) {
                pressTemplateDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/press/template',
            handler: function (request, reply) {
                pressTemplateDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/press/template/{id}',
            handler: function (request, reply) {
                pressTemplateDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        next();
    }
};

pressBackend.register.attributes = {
    name: 'pressBackend',
    version: '1.0.0'
};

module.exports = pressBackend;

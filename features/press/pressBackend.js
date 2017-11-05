'use strict';

const Datastore = require('nedb');
const mingo = require('mingo');
const Handlebars = require('handlebars');

const pressBackend = {
    register: function (server, options, next) {

        server.decorate('request', 'pressLineDB', new Datastore({ filename: './store/pressLine', autoload: true }));
        server.decorate('request', 'pressQueryDB', new Datastore({ filename: './store/pressQuery', autoload: true }));
        server.decorate('request', 'pressTemplateDB', new Datastore({ filename: './store/pressTemplate', autoload: true }));

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
                request.pressLineDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/press/line',
            handler: function (request, reply) {
                request.pressLineDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/press/line/{id}',
            handler: function (request, reply) {
                request.pressLineDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/press/line/{id}',
            handler: function (request, reply) {
                request.pressLineDB.findOne({ _id: request.params.id }, {}, function (err, pressLineDoc) {
                    console.log('query', {scraperId: pressLineDoc.scraperId}, pressLineDoc);
                    server.harvesterResultsDB.find({scraperId: pressLineDoc.scraperId}, {}, function(err, docs) {
                        const query = new mingo.Query(pressLineDoc.query.query);

                        const template = Handlebars.compile(pressLineDoc.template.template);

                        reply(
                            docs.filter(function(doc) {
                                return query.test(doc);
                            }).map(function(doc) {
                                return template(doc.data);
                            }).join('')
                        );
                    });

                });
            }
        });

        server.route({
            method: 'GET',
            path:'/press/queries',
            handler: function (request, reply) {
                request.pressQueryDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/press/query',
            handler: function (request, reply) {
                request.pressQueryDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/press/query/{id}',
            handler: function (request, reply) {
                request.pressQueryDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/press/templates',
            handler: function (request, reply) {
                request.pressTemplateDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/press/template',
            handler: function (request, reply) {
                request.pressTemplateDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/press/template/{id}',
            handler: function (request, reply) {
                request.pressTemplateDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
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

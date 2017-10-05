'use strict';

const Datastore = require('nedb');
const harvesterDB = new Datastore({ filename: './store/harvester', autoload: true });
const unirest = require('unirest');
const cheerio = require('cheerio');

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

        server.route({
            method: 'GET',
            path:'/harvest/ready',
            handler: function (request, reply) {
                server.inject({
                    headers: {
                        authorization: request.headers.authorization
                    },
                    method: 'GET',
                    url: '/scraper/events'
                }, (res) => {
                    const result = {};

                    res.result.forEach(function(entry) {
                        if (!result[entry.scraperId]) {
                            result[entry.scraperId] = [];
                        }

                        result[entry.scraperId].push(entry);
                    });

                    reply(result);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/harvester/test',
            handler: function (request, reply) {
                unirest
                    .get(request.payload.link)
                    .end(function (response) {
                        const $ = cheerio.load(response.body);

                        const result = {};

                        request.payload.steps.forEach(function(step) {
                            const extraction = $(step.selector).text();
                            if (extraction) {
                                result[step.field] = extraction;
                            }
                        });

                        reply(result);
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

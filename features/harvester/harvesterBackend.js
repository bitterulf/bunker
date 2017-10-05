'use strict';

const Datastore = require('nedb');
const harvesterStepsDB = new Datastore({ filename: './store/harvesterSteps', autoload: true });
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
            path:'/harvester/steps',
            handler: function (request, reply) {
                harvesterStepsDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/harvester/steps',
            handler: function (request, reply) {
                console.log('tzzz', request);

                harvesterStepsDB.find({scraperId: request.payload.scraperId}, function (err, docs) {
                    if (!docs.length) {
                        return harvesterStepsDB.insert({ scraperId: request.payload.scraperId, steps:  request.payload.steps }, function (err, newDocs) {
                            reply({});
                        });
                    }

                    harvesterStepsDB.update({ scraperId: request.payload.scraperId }, { scraperId: request.payload.scraperId, steps:  request.payload.steps }, {}, function (err, numReplaced) {
                        reply({});
                    });
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

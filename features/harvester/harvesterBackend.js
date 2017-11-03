'use strict';

const Datastore = require('nedb');
const harvesterStepsDB = new Datastore({ filename: './store/harvesterSteps', autoload: true });
const harvesterEventsDB = new Datastore({ filename: './store/harvesterEvents', autoload: true });
const harvesterResultsDB = new Datastore({ filename: './store/harvesterResults', autoload: true });
const unirest = require('unirest');
const cheerio = require('cheerio');
const trim = require('trim');

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
                harvesterStepsDB.find({scraperId: request.payload.scraperId}, function (err, docs) {
                    if (!docs.length) {
                        return harvesterStepsDB.insert({ scraperId: request.payload.scraperId, steps:  request.payload.steps }, function () {
                            reply({});
                        });
                    }

                    harvesterStepsDB.update({ scraperId: request.payload.scraperId }, { scraperId: request.payload.scraperId, steps:  request.payload.steps }, {}, function () {
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
            path:'/harvester/harvest',
            handler: function (request, reply) {
                harvesterStepsDB.find({}, function (err, harvesterSteps) {
                    harvesterEventsDB.find({}, function (err, harvesterEvents) {
                        const harvestedScraperEventIds = [];

                        harvesterEvents.forEach(function(harvesterEvent) {
                            harvestedScraperEventIds.push(harvesterEvent.scraperEvent._id);
                        });

                        server.inject({
                            headers: {
                                authorization: request.headers.authorization
                            },
                            method: 'GET',
                            url: '/scraper/events'
                        }, (res) => {
                            const harvesterStepsByScraperId = {};

                            harvesterSteps.forEach(function(harvesterStepGroup) {
                                harvesterStepsByScraperId[harvesterStepGroup.scraperId] = harvesterStepGroup.steps;
                            });

                            const result = {};

                            res.result.forEach(function(entry) {
                                if (!result[entry.scraperId]) {
                                    result[entry.scraperId] = [];
                                }

                                result[entry.scraperId].push(entry);
                            });

                            const harvesterEvents = [];

                            Object.keys(result).forEach(function(scraperId) {
                                result[scraperId].forEach(function(scraperEvent) {
                                    if (scraperEvent.title && scraperEvent.link && harvestedScraperEventIds.indexOf(scraperEvent._id) == -1) {
                                        harvesterEvents.push({
                                            scraperEvent: scraperEvent,
                                            steps: harvesterStepsByScraperId[scraperId]
                                        });
                                    }
                                });
                            });

                            // at the end filter out other scrapes
                            // should be done at the start

                            const filteredEvents = harvesterEvents.filter(function(event) {
                                return event.scraperEvent.scraperId == request.payload.scraperId;
                            });

                            harvesterEventsDB.insert(filteredEvents, function () {
                                reply({
                                    processed: filteredEvents.length
                                });
                            });
                        });
                    });
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
                                result[step.field] = trim(extraction);
                            }
                        });

                        reply(result);
                    });
            }
        });

        server.route({
            method: 'GET',
            path:'/harvester/events',
            handler: function (request, reply) {
                const startIndex = (request.query.page - 1) * 10;

                harvesterResultsDB.find({}, function (err, harvesterResults) {
                    const harvestedEventIds = [];

                    harvesterResults.forEach(function(harvesterResult) {
                        harvestedEventIds.push(harvesterResult.harvesterEventId);
                    });

                    harvesterEventsDB.find({}, function (err, docs) {
                        const filtered = docs.filter(function(doc) {
                            return harvestedEventIds.indexOf(doc._id) == -1;
                        });

                        reply(filtered.slice(startIndex, startIndex + 10));
                    });
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/harvest/results',
            handler: function (request, reply) {
                const startIndex = (request.query.page - 1) * 10;

                harvesterResultsDB.find({}, function (err, harvesterResults) {
                    reply(harvesterResults.slice(startIndex, startIndex + 10));
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/harvest/results/scraperIds',
            handler: function (request, reply) {
                harvesterResultsDB.find({}, function (err, harvesterResults) {
                    const scraperIds = [];

                    harvesterResults.forEach(function(result) {
                        if (scraperIds.indexOf(result.scraperId) < 0) {
                            scraperIds.push(result.scraperId);
                        }
                    });

                    reply(scraperIds);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/harvester/collect',
            handler: function (request, reply) {
                harvesterEventsDB.findOne({_id: request.payload.id}, function (err, doc) {

                    unirest
                        .get(doc.scraperEvent.link)
                        .end(function (response) {
                            const $ = cheerio.load(response.body);

                            const result = {
                                harvesterEventId: doc._id,
                                link: doc.scraperEvent.link,
                                scraperId: doc.scraperEvent.scraperId,
                                scraperTime: doc.scraperEvent.time,
                                time: Date.now(),
                                data: {}
                            };

                            doc.steps.forEach(function(step) {
                                const extraction = $(step.selector).text();
                                if (extraction) {
                                    result.data[step.field] = trim(extraction);
                                }
                            });

                            harvesterResultsDB.insert(result, function (err, newDoc) {
                                reply(newDoc);
                            });
                        });
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

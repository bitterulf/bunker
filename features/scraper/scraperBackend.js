'use strict';

const Datastore = require('nedb');
const scraperDB = new Datastore({ filename: './store/scraper', autoload: true });
const scraperResultsDB = new Datastore({ filename: './store/scraperResults', autoload: true });

const scraperCacheDB = new Datastore({ filename: './store/scraperCache', autoload: true });

const scraperProcessedResultsDB = new Datastore({ filename: './store/scraperProcessedResults', autoload: true });

const scraperEventsDB = new Datastore({ filename: './store/scraperEvents', autoload: true });

const Xray = require('x-ray');
const md5 = require('md5');

const _ = require('lodash');

const processScraperResult = function(scraperResult) {
    scraperCacheDB.findOne({ hash: scraperResult.hash }, function (err, doc) {
        if (doc) {
            console.log('processing', scraperResult.scraperId);
            const enrichedDocs = doc.payload
                .filter(function(entry) { return entry.title && entry.link; })
                .map(function(entry) {
                    entry.hash = md5(entry.link);
                    entry.scraperId = scraperResult.scraperId;
                    entry.time = scraperResult.time;
                    return entry;
                });

            scraperEventsDB.find({}, function(err, scraperEvents) {
                const eventHashes = [];

                console.log('existing events', scraperEvents.length);

                scraperEvents.forEach(function(event) {
                    eventHashes.push(event.hash);
                });

                const filteredEnrichedDocs = enrichedDocs.filter(function(entry) {
                    return eventHashes.indexOf(entry.hash) == -1;
                });

                console.log('new events', filteredEnrichedDocs.length);

                filteredEnrichedDocs.forEach(function(event) {
                    console.log(event.title);
                });

                scraperEventsDB.insert(filteredEnrichedDocs, function () {
                });
            });
        }
    });
};

const processScraperResults = function() {
    scraperResultsDB.find({}, function(err, docs) {
        const usedHashes = [];
        const uniqueResults = [];

        const sortedDocs = docs.sort(function(a, b) {
            return a.time - b.time;
        });

        sortedDocs.forEach(function(doc) {
            if (usedHashes.indexOf(doc.hash) == -1) {
                usedHashes.push(doc.hash);
                uniqueResults.push(doc);
            }
        });

        scraperProcessedResultsDB.find({}, function(err, processedDocs) {
            const processedHashes = processedDocs.map(function(entry) {
                return entry.hash;
            });

            const unprocessedResults = [];

            uniqueResults.forEach(function(entry) {
                if (processedHashes.indexOf(entry.hash) == -1) {
                    unprocessedResults.push(entry);
                }
            });

            console.log('processing', unprocessedResults.length);

            unprocessedResults.forEach(function(entry) {
                processScraperResult(entry);
            });

            scraperProcessedResultsDB.insert(unprocessedResults, function () {
            });
        });
    });
};

const saveCache = function(hash, payload, cb) {
    scraperCacheDB.findOne({ hash: hash }, function (err, doc) {
        if (doc) {
            return cb();
        }
        else {
            const cacheDoc = {hash: hash, payload: payload, time: Date.now()};
            scraperCacheDB.insert(cacheDoc, function () {
                return cb();
            });
        }
    });
};

const scrapeDump = function(scraper, cb) {
    Xray()(scraper.url, scraper.selector, [scraper.fields])(function(err, result) {
        if (result) {
            const hash = md5(JSON.stringify({
                url: scraper.url,
                selector: scraper.selector,
                fields: scraper.fields,
                entries: result
            }));

            saveCache(hash, result, function() {
                const doc = {
                    hash: hash,
                    time: Date.now(),
                    scraperId: scraper._id
                };

                scraperResultsDB.insert([doc], function () {

                    return cb(null);
                });
            });
        }
    });
};

const scraperBackend = {
    register: function (server, options, next) {
        server.route({
            method: 'GET',
            path:'/scrapers',
            handler: function (request, reply) {
                scraperDB.find({}, function (err, scraperDocs) {
                    scraperResultsDB.find({}, function (err, scraperResults) {
                        const resultSet = {};

                        scraperResults.forEach(function(scraperResult) {
                            if (!resultSet[scraperResult.scraperId]) {
                                resultSet[scraperResult.scraperId] = [];
                            }

                            resultSet[scraperResult.scraperId].push(scraperResult);
                        });

                        const enrichedScraper = scraperDocs.map(function(scraper) {
                            scraper.results = resultSet[scraper._id] || [];

                            return scraper;
                        });

                        return reply(enrichedScraper);
                    });
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/scrapers/dump',
            handler: function (request, reply) {
                scraperDB.find({}, function (err, scraperDocs) {
                    return reply(scraperDocs.map(function(scraper) {
                        return _.pick(scraper, ['url', 'selector', 'fields']);
                    }));
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/scrapers/import',
            handler: function (request, reply) {
                scraperDB.insert(request.payload, function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/scrapers/cache',
            handler: function (request, reply) {
                scraperCacheDB.find({}, function (err, scraperCacheDocs) {
                    return reply(scraperCacheDocs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/scraper',
            handler: function (request, reply) {
                scraperDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/scraper/{id}',
            handler: function (request, reply) {
                scraperDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/scraper/{id}/scrape',
            handler: function (request, reply) {
                scraperDB.findOne({ _id: request.params.id }, function (err, doc) {
                    if (doc) {
                        scrapeDump(doc, function() {
                            return reply({});
                        });
                    }
                    else {
                        return reply({});
                    }
                });
            }
        });

        server.route({
            method: 'GET',
            path:'/scraper/events',
            handler: function (request, reply) {
                scraperEventsDB.find({}, function (err, scraperEvents) {
                    return reply(scraperEvents.sort(function(a, b) {
                        return a.time - b.time;
                    }));
                });
            }
        });

        server.route({
            method: 'GET',
            path: '/scraperFrontend.js',
            handler: {
                file: './features/scraper/scraperFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/scraper.css',
            handler: {
                file: './features/scraper/scraper.css'
            }
        });

        let activeScrapers = {};

        const scrapeJob = function() {
            scraperDB.find({}, function (err, scraperDocs) {
                scraperDocs.forEach(function(scraper) {
                    if (!activeScrapers[scraper._id]) {
                        activeScrapers[scraper._id] = Date.now();
                        scrapeDump(scraper, function() {
                            delete activeScrapers[scraper._id];
                        });
                    }
                });
            });
        };

        processScraperResults();

        setInterval(scrapeJob, 15 * 60 * 1000);
        scrapeJob();

        next();
    }
};

scraperBackend.register.attributes = {
    name: 'scraperBackend',
    version: '1.0.0'
};

module.exports = scraperBackend;

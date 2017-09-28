'use strict';

const Datastore = require('nedb');
const scraperDB = new Datastore({ filename: './store/scraper', autoload: true });
const scraperResultsDB = new Datastore({ filename: './store/scraperResults', autoload: true });

const scraperCacheDB = new Datastore({ filename: './store/scraperCache', autoload: true });

const Xray = require('x-ray');
const md5 = require('md5');

const _ = require('lodash');

const saveCache = function(hash, payload, cb) {
    scraperCacheDB.findOne({ hash: hash }, function (err, doc) {
        if (doc) {
            return cb();
        }
        else {
            const cacheDoc = {hash: hash, payload: payload, time: Date.now()};
            scraperCacheDB.insert(cacheDoc, function (err, newDocs) {
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

                scraperResultsDB.insert([doc], function (err, newDocs) {

                    return cb(null);
                });
            });
        }
    })
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
                scraperDB.insert(request.payload, function (err, newDocs) {
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
                scraperDB.insert([request.payload], function (err, newDocs) {
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

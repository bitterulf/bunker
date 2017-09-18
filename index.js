'use strict';
require('dotenv').config();

const Joi = require('joi');

const envSchema = Joi.object({
    BUNKER_PORT: Joi.number().integer().required()
}).unknown(true);

const envCheck = Joi.validate(process.env, envSchema);

if (envCheck.error) {
    envCheck.error.details.forEach(function(detail) {
        console.log(detail.message);
    });
    process.exit(1);
}

const Datastore = require('nedb');
const db = new Datastore({ filename: './store/db', autoload: true });

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    port: process.env.BUNKER_PORT || 8080
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello',
    handler: function (request, reply) {
        db.insert([{ random: Math.random() }], function (err, newDocs) {
            db.find({}, function (err, docs) {
                return reply(JSON.stringify(docs));
            });
        });
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
    console.log(process.memoryUsage());
});

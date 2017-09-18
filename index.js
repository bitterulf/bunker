'use strict';
require('dotenv').config();

const Joi = require('joi');

const envSchema = Joi.object({
    BUNKER_PORT: Joi.number().integer().required(),
    BUNKER_ADMIN_USER: Joi.string().alphanum().required(),
    BUNKER_ADMIN_PASSWORD: Joi.string().required()
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
    port: process.env.BUNKER_PORT
});

server.register(require('hapi-auth-basic'), (err) => {
    server.auth.strategy('simple', 'basic', { validateFunc: function(request, username, password, callback) {
        if (username != process.env.BUNKER_ADMIN_USER || password != process.env.BUNKER_ADMIN_PASSWORD) {
            return callback(null, false, {});
        }
        callback(null, true, { username: process.env.BUNKER_ADMIN_USER });
    } });

    // Add the route
    server.route({
        method: 'GET',
        path:'/hello',
        config: { auth: 'simple' },
        handler: function (request, reply) {
            db.insert([{ random: Math.random() }], function (err, newDocs) {
                db.find({}, function (err, docs) {
                    return reply(JSON.stringify(docs));
                });
            });
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
        console.log(process.memoryUsage());
    });

});

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
const notesDB = new Datastore({ filename: './store/notes', autoload: true });

const Path = require('path');
const Hapi = require('hapi');

// Create a server with a host and port

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.connection({
    port: process.env.BUNKER_PORT
});

server.register([require('hapi-auth-basic'), require('inert')], (err) => {
    server.auth.strategy('simple', 'basic', true, { validateFunc: function(request, username, password, callback) {
        if (username != process.env.BUNKER_ADMIN_USER || password != process.env.BUNKER_ADMIN_PASSWORD) {
            return callback(null, false, {});
        }
        callback(null, true, { username: process.env.BUNKER_ADMIN_USER });
    } });

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

    server.route({
        method: 'GET',
        path:'/notes',
        handler: function (request, reply) {
            notesDB.find({}, function (err, docs) {
                return reply(docs);
            });
        }
    });

    server.route({
        method: 'POST',
        path:'/note',
        handler: function (request, reply) {
            notesDB.insert([request.payload], function (err, newDocs) {
                reply({});
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true
            }
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

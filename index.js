'use strict';
require('dotenv').config();

const Joi = require('joi');
const envSchema = require('./envSchema.js');

const envCheck = Joi.validate(process.env, envSchema);

if (envCheck.error) {
    envCheck.error.details.forEach(function(detail) {
        console.log(detail.message);
    });
    process.exit(1);
}

const Path = require('path');
const Hapi = require('hapi');
const Primus = require('primus');
const fs = require('fs');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname)
            }
        }
    }
});

server.connection({
    port: process.env.BUNKER_PORT
});

const primus = new Primus(server.listener);

const createEmitter = function(featureName) {
    return function(eventName) {
        primus.forEach(function (spark, id, connections) {
            spark.emit(featureName+'-'+eventName);
        });
    };
};

const loadFeatures = function() {
    return fs.readdirSync('./features')
        .map(function(feature){
            return {
                register: require('./features/'+feature+'/'+feature+'Backend.js'),
                options: {
                    emit: createEmitter(feature)
                }
            }
        });
};

server.register(
    ([
        require('hapi-auth-basic'),
        require('inert'),
        require('./plugins/authPlugin.js')
    ])
    .concat(loadFeatures(), [
        require('./plugins/publicPlugin.js')
    ]), (err) => {

    primus.plugin('emit', require('primus-emit'));

    primus.on('connection', function (spark) {
        spark.emit('connectionSuccess');
    });

    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
        console.log(process.memoryUsage());
    });

});

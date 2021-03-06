'use strict';

const Datastore = require('nedb');

const notesBackend = {
    register: function (server, options, next) {

        server.decorate('request', 'notesDB', new Datastore({ filename: './store/notes', autoload: true }));

        server.route({
            method: 'GET',
            path:'/notes',
            handler: function (request, reply) {
                request.notesDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/note',
            handler: function (request, reply) {
                request.notesDB.insert([request.payload], function () {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/note/{id}',
            handler: function (request, reply) {
                request.notesDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'GET',
            path: '/notesFrontend.js',
            handler: {
                file: './features/notes/notesFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/notes.css',
            handler: {
                file: './features/notes/notes.css'
            }
        });

        next();
    }
};

notesBackend.register.attributes = {
    name: 'notesBackend',
    version: '1.0.0'
};

module.exports = notesBackend;

'use strict';

const Datastore = require('nedb');
const notesDB = new Datastore({ filename: './store/notes', autoload: true });

const notesPlugin = {
    register: function (server, options, next) {
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

        next();
    }
};

notesPlugin.register.attributes = {
    name: 'notesPlugin',
    version: '1.0.0'
};

module.exports = notesPlugin;

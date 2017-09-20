'use strict';

const memoryBackend = {
    register: function (server, options, next) {

        server.route({
            method: 'GET',
            path:'/memory',
            handler: function (request, reply) {
                reply(process.memoryUsage());
            }
        });

        server.route({
            method: 'GET',
            path: '/memoryFrontend.js',
            handler: {
                file: './features/memory/memoryFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/memory.css',
            handler: {
                file: './features/memory/memory.css'
            }
        });

        setInterval(function() {
            options.emit('update');
        }, 5000);

        next();
    }
};

memoryBackend.register.attributes = {
    name: 'memoryBackend',
    version: '1.0.0'
};

module.exports = memoryBackend;

'use strict';

const homeBackend = {
    register: function (server, options, next) {

        server.route({
            method: 'GET',
            path: '/homeFrontend.js',
            handler: {
                file: './features/home/homeFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/home.css',
            handler: {
                file: './features/home/home.css'
            }
        });

        next();
    }
};

homeBackend.register.attributes = {
    name: 'homeBackend',
    version: '1.0.0'
};

module.exports = homeBackend;

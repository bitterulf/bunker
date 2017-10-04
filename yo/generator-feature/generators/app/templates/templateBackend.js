'use strict';

const <%= name %>Backend = {
    register: function (server, options, next) {

        server.route({
            method: 'GET',
            path: '/<%= name %>Frontend.js',
            handler: {
                file: './features/<%= name %>/<%= name %>Frontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/<%= name %>.css',
            handler: {
                file: './features/<%= name %>/<%= name %>.css'
            }
        });

        next();
    }
};

<%= name %>Backend.register.attributes = {
    name: '<%= name %>Backend',
    version: '1.0.0'
};

module.exports = <%= name %>Backend;

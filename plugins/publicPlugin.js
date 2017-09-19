'use strict';

const publicPlugin = {
    register: function (server, options, next) {
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: './public',
                    redirectToSlash: true,
                    index: true
                }
            }
        });

        next();
    }
};

publicPlugin.register.attributes = {
    name: 'publicPlugin',
    version: '1.0.0'
};

module.exports = publicPlugin;

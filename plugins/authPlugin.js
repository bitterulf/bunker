'use strict';

const authPlugin = {
    register: function (server, options, next) {
        server.auth.strategy('simple', 'basic', true, { validateFunc: function(request, username, password, callback) {
            if (username != process.env.BUNKER_ADMIN_USER || password != process.env.BUNKER_ADMIN_PASSWORD) {
                return callback(null, false, {});
            }
            callback(null, true, { username: process.env.BUNKER_ADMIN_USER });
        } });

        next();
    }
};

authPlugin.register.attributes = {
    name: 'authPlugin',
    version: '1.0.0'
};

module.exports = authPlugin;

const Platform = function() {
    this.features = [];
};

Platform.prototype.register = function(featureName, featureRoute, featureCSS, featureComponent) {
    this.features.push({
        name: featureName,
        route: featureRoute,
        component: featureComponent,
        cssUrl: featureCSS
    });
};

Platform.prototype.bootstrap = function() {
    const routing = {
    };

    this.features.forEach(function(feature) {
        routing[feature.route] = feature.component;

        const link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = feature.cssUrl;
        link.media = 'all';

        document.head.appendChild(link);
    });

    m.route(document.body, '/', routing);
};

Platform.prototype.menu = function(activeEntry) {
    return m('div.menu', this.features.map(function(feature) {
        return m('a', {href: '#!'+feature.route, className: activeEntry == feature.name ? 'active' : ''}, feature.name);
    }));
};

Platform.prototype.title = function(title) {
    return m('h1', {}, title);
};

const platform = new Platform();

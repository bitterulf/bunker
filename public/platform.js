const Platform = function() {
    this.features = [];
};

Platform.prototype.register = function(featureName, featureRoute, featureComponent) {
    this.features.push({
        name: featureName,
        route: featureRoute,
        component: featureComponent
    });
};

Platform.prototype.bootstrap = function() {
    const routing = {
        '/': Home
    };

    this.features.forEach(function(feature) {
        routing[feature.route] = feature.component;
    });

    m.route(document.body, '/', routing);
};

Platform.prototype.menu = function(activeEntry) {
    return m('div.menu', [
        m('a', {href: '#!/', className: activeEntry == 'home' ? 'active' : ''}, 'home'),
        m('a', {href: '#!/notes', className: activeEntry == 'notes' ? 'active' : ''}, 'notes')
    ]);
};

Platform.prototype.title = function(title) {
    return m('h1', {}, title);
};

const platform = new Platform();

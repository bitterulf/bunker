const Platform = function() {
    this.features = [];
};

Platform.prototype.register = function(featureName, featureParts, featureCSS) {
    const that = this;

    featureParts.forEach(function(featurePart) {
        that.features.push({
            group: featureName,
            name: featurePart.name,
            route: featurePart.route,
            component: featurePart.component,
            cssUrl: featureCSS
        });
    });
};

Platform.prototype.listener = function(featureName, route) {
    const primus = this.primus;

    return function(eventName, cb) {
        return primus.on(featureName+'-'+eventName, function() {
            if (!route) {
                cb();
            }
            else if (route == m.route.get()){
                cb();
            }
        });
    };
};

Platform.prototype.bootstrap = function() {
    this.primus = Primus.connect();
    const features = this.features;

    this.primus.on('connectionSuccess', function() {
        const routing = {
        };

        features.forEach(function(feature) {
            routing[feature.route] = feature.component;

            const link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = feature.cssUrl;
            link.media = 'all';

            document.head.appendChild(link);
        });

        m.route(document.body, '/', routing);
    });
};

Platform.prototype.menu = function(activeEntry) {
    let itemGroups = {};

    this.features.forEach(function(feature) {
        if (!itemGroups[feature.group]) {
            itemGroups[feature.group] = [];
        }

        itemGroups[feature.group].push(m('div', m('a', {href: '#!'+feature.route, className: activeEntry == feature.name ? 'active' : ''}, feature.name)));
    });

    return m('div.menu', Object.keys(itemGroups).map(function(group) {
        return m('div', {style: 'display: inline-block; vertical-align: text-top;'}, itemGroups[group]);
    }));
};

Platform.prototype.title = function(title) {
    return m('h1', {}, title);
};

Platform.prototype.style = {
    button: {
        background: 'lightgrey',
        border: '1px solid black',
        'border-radius': '4px',
        margin: '2px',
        cursor: 'pointer'
    }
};

const platform = new Platform();

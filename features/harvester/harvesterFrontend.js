const harvestState = {
    ready: {}
};

const refreshHarvest = function() {
    return m.request({
        method: 'GET',
        url: '/harvest/ready',
        withCredentials: true,
    })
    .then(function(result) {
        harvestState.ready = result;
    })
};

const harvesterComponent = {
    oninit: function() {
        refreshHarvest();
    },
    view: function() {
        const renderReadyList = function() {
            const scraperIds = Object.keys(harvestState.ready);

            return m('div',
                scraperIds.map(function(scraperId) {
                    const entries = harvestState.ready[scraperId];
                    const limitedEntries = entries.length > 10 ? entries.slice(0, 10) : entries;

                    return [
                        m('div', scraperId + '( ' + limitedEntries.length + ' of ' + entries.length + ')'),
                        m('div',
                            limitedEntries.map(function(entry) {
                                return m('div', m('a', { href: entry.link }, entry.title));
                            })
                        )
                    ];
                })
             );
        }

        return  m('.harvesterFeature', [
            platform.title('harvester'),
            platform.menu('harvester'),
            renderReadyList(),
            m('button', {
                onclick: function() {
                    return m.request({
                        method: 'GET',
                        url: '/harvest/ready',
                        withCredentials: true,
                        data: {}
                    })
                    .then(function(result) {
                        console.log(result);
                    });
                }
            } ,'harvest')
        ]);
    }
};

platform.register('harvester', [{name: 'harvester', route: '/harvester', component: harvesterComponent}], '/harvester.css');

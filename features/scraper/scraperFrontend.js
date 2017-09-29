const scraperState = {
    scrapers: [],
    selected: null,
    importOpen: false,
    scraperDump: '',
    scraperEvents: []
};

const refreshScrapers = function() {
    refreshScrapersCache(function() {
        m.request({
            method: 'GET',
            url: '/scrapers',
            withCredentials: true,
        })
        .then(function(result) {
            scraperState.scrapers = result.sort(function(a, b) {
                return a.time - b.time;
            }).reverse();
        })
    })
};

const refreshScrapersCache = function(cb) {
    return m.request({
        method: 'GET',
        url: '/scrapers/cache',
        withCredentials: true,
    })
    .then(function(result) {
        scraperState.scrapersCache = {};

        result.forEach(function(entry) {
            scraperState.scrapersCache[entry.hash] = entry;
        });

        cb();
    })
};

const refreshScrapersDump = function(cb) {
    return m.request({
        method: 'GET',
        url: '/scrapers/dump',
        withCredentials: true,
    })
    .then(function(result) {
        scraperState.scraperDump = JSON.stringify(result);
    })
};

const refreshScraperEvents = function(cb) {
    return m.request({
        method: 'GET',
        url: '/scraper/events',
        withCredentials: true,
    })
    .then(function(result) {
        scraperState.scraperEvents = result;
    })
};

const Scraper = {
    oninit: function() {
        refreshScrapers();
    },
    view: function() {
        const renderScraper = function(scraper) {
            if (scraperState.selected != scraper._id) {
                return '';
            }

            return m('div',
                [
                    m('button', {
                        onclick: function() {
                            return m.request({
                                method: 'POST',
                                url: '/scraper/'+scraper._id+'/scrape',
                                withCredentials: true,
                            })
                            .then(function() {
                                refreshScrapers();
                            });
                        }
                    }, 'scrape'),
                    m('button', {
                        onclick: function() {
                            return m.request({
                                method: 'DELETE',
                                url: '/scraper/'+scraper._id,
                                withCredentials: true,
                            })
                            .then(function() {
                                refreshScrapers();
                            });
                        }
                    }, 'delete'),
                    renderResults(scraper)
                ]
            );
        };

        const renderSelector = function(scraper) {
            if (scraperState.selected != scraper._id) {
                return m('button', {
                    onclick: function() {
                        scraperState.selected = scraper._id;
                    }
                }, 'select');
            }

            return m('button', {
                    onclick: function() {
                        scraperState.selected = null;
                    }
                }, 'unselect');
        };

        const renderResults = function(scraper) {
            const results = scraper.results.sort(function(a, b) {
                return a.time - b.time;
            }).reverse();

            results.forEach(function(result, index) {
                if (results[index+1] && results[index+1].hash != results[index].hash) {
                    results[index].changed = true;
                }
                else if (!results[index+1]) {
                    results[index].changed = true;
                }
                else {
                    results[index].changed = false;
                }
            });

            return m('div', {}, results.map(function(result) {
                const entries = scraperState.scrapersCache[result.hash] ? scraperState.scrapersCache[result.hash].payload : [];

                return m('div', {
                    title: result.changed ? JSON.stringify(entries) : '',
                    style: result.changed ? 'background: red;' : ''
                },
                    (new Date(result.time)).toISOString()
                );
            }));
        };

        return  m('.scraperFeature', [
            platform.title('scraper'),
            platform.menu('scraper'),
            m('div', [m('button', {
                onclick: function() {
                    refreshScrapers();
                }
            }, 'refresh')]),
            m('input#scraperUrl', {placeholder: 'url'}),
            m('input#scraperSelector', {placeholder: 'selector'}),
            m('textarea#scraperFields', {placeholder: '{title: \'h1 a\'}'}),
            m('button', {
                onclick: function() {
                    const scraperUrl = document.querySelector('#scraperUrl');
                    const scraperSelector = document.querySelector('#scraperSelector');
                    const scraperFields = document.querySelector('#scraperFields');

                    return m.request({
                        method: 'POST',
                        url: '/scraper',
                        withCredentials: true,
                        data: {
                            time: Date.now(),
                            url: scraperUrl.value,
                            selector: scraperSelector.value,
                            fields: JSON.parse('{'+scraperFields.value+'}')
                        }
                    })
                    .then(function() {
                        scraperUrl.value = '';
                        scraperSelector.value = '';
                        scraperFields.value = '';
                        refreshScrapers();
                    });
                }
            }, 'send'),
            m('div', scraperState.scrapers.map(function(scraper) {
                return m('div', [
                    m('div', {title: JSON.stringify(scraper.fields)}, scraper.url+' - '+scraper.selector+' ['+scraper.results.length+']'),
                    renderSelector(scraper),
                    renderScraper(scraper)
                ]);
            }))
        ]);
    }
};

const ScraperDump = {
    oninit: function() {
        refreshScrapersDump();
    },
    view: function() {
        return m('.scraperFeature', [
            platform.title('scraper dump'),
            platform.menu('scraper dump'),
            m('div', scraperState.scraperDump)
        ]);
    }
};

const ScraperImport = {
    oninit: function() {
    },
    view: function() {
        return m('.scraperFeature', [
            platform.title('scraper import'),
            platform.menu('scraper import'),
            m('textarea#scraperImport', {placeholder: '{title: \'h1 a\'}'}),
            m('button', {onclick: function() {
                const scraperFields = document.querySelector('#scraperImport');
                let parsedData;
                try {
                    parsedData = JSON.parse(scraperFields.value);

                    return m.request({
                        method: 'POST',
                        url: '/scrapers/import',
                        withCredentials: true,
                        data: parsedData
                    }).then(function() {
                        refreshScrapers();
                        scraperFields.value = '';
                    });
                } catch (e) {
                    console.log(e);
                }

            }}, 'import!'),
        ]);
    }
};

const ScraperEvents = {
    oninit: function() {
        refreshScraperEvents();
    },
    view: function() {
        return m('.scraperFeature', [
            platform.title('scraper events'),
            platform.menu('scraper events'),
            m('div', scraperState.scraperEvents.map(function(event) {
                return m('div', m('a', { href: event.link }, event.scraperId + ' - ' + (new Date(event.time)).toISOString() + ': ' + event.title));
            }))
        ]);
    }
};

platform.register('scraper', [
    {name: 'scraper', route: '/scraper', component: Scraper},
    {name: 'scraper dump', route: '/scraper/dump', component: ScraperDump},
    {name: 'scraper import', route: '/scraper/import', component: ScraperImport},
    {name: 'scraper events', route: '/scraper/events', component: ScraperEvents}
], '/scraper.css');

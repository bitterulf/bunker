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
        }).then(function(result) {
            scraperState.scrapers = result.sort(function(a, b) {
                return a.time - b.time;
            }).reverse();
        });
    });
};

const refreshScrapersCache = function(cb) {
    return m.request({
        method: 'GET',
        url: '/scrapers/cache',
        withCredentials: true,
    }).then(function(result) {
        scraperState.scrapersCache = {};

        result.forEach(function(entry) {
            scraperState.scrapersCache[entry.hash] = entry;
        });

        cb();
    });
};

const refreshScrapersDump = function() {
    return m.request({
        method: 'GET',
        url: '/scrapers/dump',
        withCredentials: true,
    }).then(function(result) {
        scraperState.scraperDump = JSON.stringify(result);
    });
};

const refreshScraperEvents = function() {
    return m.request({
        method: 'GET',
        url: '/scraper/events',
        withCredentials: true,
    }).then(function(result) {
        scraperState.scraperEvents = result;
    });
};

const Scraper = {
    oninit: function() {
        refreshScrapers();
    },
    view: function() {
        const renderScraper = function(scraper) {
            return m('div',
                [
                    renderResults(scraper)
                ]
            );
        };

        const renderSelector = function(scraper) {
            if (scraperState.selected != scraper._id) {
                return m('button', {
                    style: platform.style.button,
                    onclick: function() {
                        scraperState.selected = scraper._id;
                    }
                }, '-');
            }

            return m('button', {
                style: platform.style.button,
                onclick: function() {
                    scraperState.selected = null;
                }
            }, 'x');
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

                return m('div',
                    {
                        title: (new Date(result.time)).toISOString() + (result.changed ? JSON.stringify(entries) : ''),
                        style: {
                            margin: '1px',
                            background: result.changed ? 'green' : 'lightgrey',
                            border: '1px solid grey',
                            width: '10px',
                            height: '10px',
                            display: 'inline-block'
                        }
                    }
                );
            }));
        };

        return  m('.scraperFeature', [
            platform.title('scraper'),
            platform.menu('scraper'),
            m('div', { style: 'display: inline-block' }, [

                m('input#scraperUrl', { style: 'display: block', placeholder: 'url'}),
                m('input#scraperSelector', { style: 'display: block', placeholder: 'selector'}),
                m('button', {
                    style: platform.style.button,
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
                        }).then(function() {
                            scraperUrl.value = '';
                            scraperSelector.value = '';
                            scraperFields.value = '';
                            refreshScrapers();
                        });
                    }
                }, 'send')

            ]),
            m('textarea#scraperFields', {placeholder: '"title":"a","link":"a@href"'}),
            m('div', scraperState.scrapers.map(function(scraper) {
                const scraperDomain = scraper.url.split('/')[2];

                return m('div', [
                    renderSelector(scraper),
                    m('button', {
                        style: platform.style.button,
                        onclick: function() {
                            return m.request({
                                method: 'POST',
                                url: '/scraper/'+scraper._id+'/scrape',
                                withCredentials: true,
                            }).then(function() {
                                refreshScrapers();
                            });
                        }
                    }, 'scrape'),
                    m('button', {
                        style: platform.style.button,
                        onclick: function() {
                            if (window.confirm('delete scraper?')) {
                                return m.request({
                                    method: 'DELETE',
                                    url: '/scraper/'+scraper._id,
                                    withCredentials: true,
                                }).then(function() {
                                    refreshScrapers();
                                });
                            }
                        }
                    }, 'delete'),
                    m('span', {title: scraper.url + ' ' + JSON.stringify(scraper.fields)}, scraperDomain + ' - '+scraper.selector+' ['+scraper.results.length+']'),
                    scraperState.selected == scraper._id ? renderScraper(scraper) : ''
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
            m('div', {
                style: {
                    background: 'white',
                    margin: '10px',
                    padding: '10px'
                }
            }, scraperState.scraperDump)
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
            m('button', {
                style: platform.style.button,
                onclick: function() {
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
                        // console.log(e);
                    }

                }
            }, 'import!'),
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
                const domain = event.link.split('/')[2];
                return m('div', [ m('span', domain + ': '), m('a', { href: event.link }, event.title) ]);
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

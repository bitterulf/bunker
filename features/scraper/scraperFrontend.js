const scraperState = {
    scrapers: [],
    selected: null
};

const refreshScrapers = function() {
    return m.request({
        method: 'GET',
        url: '/scrapers',
        withCredentials: true,
    })
    .then(function(result) {
        scraperState.scrapers = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
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

            return m('div', {}, scraper.results.map(function(result) {
                return m('div', [
                    result.time,
                    m('div', result.entries.map(function(entry) {
                        return m('div', JSON.stringify(entry));
                    }))
                ]);
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

platform.register('scraper', '/scraper', '/scraper.css', Scraper);

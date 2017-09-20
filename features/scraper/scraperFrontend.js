const scraperState = {
    scrapers: []
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
        return  m('.scraperFeature', [
            platform.title('scraper'),
            platform.menu('scraper'),
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
            m('div', scraperState.scrapers.map(function(note) {
                return m('div', [
                    m('button', {
                        onclick: function() {
                            return m.request({
                                method: 'DELETE',
                                url: '/scraper/'+note._id,
                                withCredentials: true,
                            })
                            .then(function() {
                                refreshScrapers();
                            });
                        }
                    }, 'delete'),
                    m('div', {title: JSON.stringify(note.fields)}, note.url+' - '+note.selector),
                    m('button', {
                        onclick: function() {
                            return m.request({
                                method: 'POST',
                                url: '/scraper/'+note._id+'/scrape',
                                withCredentials: true,
                            })
                            .then(function() {
                                refreshScrapers();
                            });
                        }
                    }, 'scrape'),
                ]);
            }))
        ]);
    }
};

platform.register('scraper', '/scraper', '/scraper.css', Scraper);

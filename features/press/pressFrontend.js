const pressState = {
    lines: [],
    queries: [],
    templates: [],
    scraperIds: []
};

const refreshScraperIds = function() {
    return m.request({
        method: 'GET',
        url: '/harvest/results/scraperIds',
        withCredentials: true,
    }).then(function(result) {
        pressState.scraperIds = result;
    });
};

const refreshPressLines = function() {
    return m.request({
        method: 'GET',
        url: '/press/lines',
        withCredentials: true,
    }).then(function(result) {
        pressState.lines = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
    });
};

const pressLineComponent = {
    oninit: function() {
        refreshPressLines();
        refreshPressQueries();
        refreshPressTemplates();
        refreshScraperIds();
    },
    view: function() {
        return  m('.pressFeature', [
            platform.title('press lines'),
            platform.menu('press lines'),
            m('select#querySelect', pressState.queries.map(function(query) {
                return m('option', {value: query._id}, query.name);
            })),
            m('select#templateSelect', pressState.templates.map(function(template) {
                return m('option', {value: template._id}, template.name);
            })),
            m('select#scraperSelect', pressState.scraperIds.map(function(scraperId) {
                return m('option', {value: scraperId}, scraperId);
            })),
            m('input#lineInput'),
            m('button', {
                onclick: function() {
                    const lineInput = document.querySelector('#lineInput');
                    const querySelect = document.querySelector('#querySelect');
                    const templateSelect = document.querySelector('#templateSelect');
                    const scraperSelect = document.querySelector('#scraperSelect');
                    const queryId = querySelect.children[querySelect.selectedIndex].value;
                    const templateId = templateSelect.children[templateSelect.selectedIndex].value;
                    const scraperId = scraperSelect.children[scraperSelect.selectedIndex].value;
                    const query = pressState.queries.find(function(query) { return query._id == queryId; });
                    const template = pressState.templates.find(function(template) { return template._id == templateId; });

                    return m.request({
                        method: 'POST',
                        url: '/press/line',
                        withCredentials: true,
                        data: {
                            name: lineInput.value,
                            time: Date.now(),
                            query: query,
                            template: template,
                            scraperId: scraperId
                        }
                    }).then(function() {
                        lineInput.value = '';
                        refreshPressLines();
                    });
                }
            }, 'send'),
            m('div', pressState.lines.map(function(line) {
                const deleteButton = m('button', {
                    onclick: function() {
                        return m.request({
                            method: 'DELETE',
                            url: '/press/line/'+line._id,
                            withCredentials: true,
                        }).then(function() {
                            refreshPressLines();
                        });
                    }
                }, 'delete');

                return m('div', [
                    m('span', line.name + ' : '),
                    m('span', { title: JSON.stringify(line.query.query) }, line.query.name + ' => '),
                    m('span', { title: line.template.template }, line.template.name),
                    m('span', line.scraperId),
                    m('a', { href: '/press/line/' + line._id }, line._id),
                    deleteButton
                ]);
            }))
        ]);
    }
};

const refreshPressQueries = function() {
    return m.request({
        method: 'GET',
        url: '/press/queries',
        withCredentials: true,
    }).then(function(result) {
        pressState.queries = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
    });
};

const pressQueryComponent = {
    oninit: function(vnode) {
        vnode.state.queryInput = {};
        refreshPressQueries();
    },
    view: function(vnode) {
        return  m('.pressFeature', [
            platform.title('press queries'),
            platform.menu('press queries'),
            m(QueryInput, {
                onChange: function(query) {
                    console.log(query);
                    vnode.state.queryInput = query;
                }
            }),
            m('div', JSON.stringify(vnode.state.queryInput)),
            m('input#queryNameInput'),
            m('button', {
                onclick: function() {
                    const queryNameInput = document.querySelector('#queryNameInput');

                    return m.request({
                        method: 'POST',
                        url: '/press/query',
                        withCredentials: true,
                        data: { name: queryNameInput.value, query: vnode.state.queryInput, time: Date.now() }
                    }).then(function() {
                        queryNameInput.value = '';
                        refreshPressQueries();
                    });
                }
            }, 'send'),
            m('div', pressState.queries.map(function(query) {
                const deleteButton = m('button', {
                    onclick: function() {
                        return m.request({
                            method: 'DELETE',
                            url: '/press/query/'+query._id,
                            withCredentials: true,
                        }).then(function() {
                            refreshPressQueries();
                        });
                    }
                }, 'delete');

                return m('div', [
                    m('span', { title: JSON.stringify(query.query) }, query.name),
                    deleteButton
                ]);
            }))
        ]);
    }
};

const refreshPressTemplates = function() {
    return m.request({
        method: 'GET',
        url: '/press/templates',
        withCredentials: true,
    }).then(function(result) {
        pressState.templates = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
    });
};

const pressTemplateComponent = {
    oninit: function(vnode) {
        vnode.state.templateInput = '';
        refreshPressTemplates();
    },
    view: function(vnode) {
        return  m('.pressFeature', [
            platform.title('press templates'),
            platform.menu('press templates'),
            m(RenderInput, {
                onChange: function(template) {
                    vnode.state.templateInput = template;
                }
            }),
            m('div', vnode.state.templateInput),
            m('input#templateNameInput'),
            m('button', {
                onclick: function() {
                    const templateNameInput = document.querySelector('#templateNameInput');

                    return m.request({
                        method: 'POST',
                        url: '/press/template',
                        withCredentials: true,
                        data: { name: templateNameInput.value, template: vnode.state.templateInput, time: Date.now() }
                    }).then(function() {
                        templateNameInput.value = '';
                        refreshPressTemplates();
                    });
                }
            }, 'send'),
            m('div', pressState.templates.map(function(template) {
                const deleteButton = m('button', {
                    onclick: function() {
                        return m.request({
                            method: 'DELETE',
                            url: '/press/template/'+template._id,
                            withCredentials: true,
                        }).then(function() {
                            refreshPressTemplates();
                        });
                    }
                }, 'delete');

                return m('div', [
                    m('span', { title: template.template }, template.name),
                    deleteButton
                ]);
            }))
        ]);
    }
};

platform.register('press', [
    {name: 'press lines', route: '/press/lines', component: pressLineComponent},
    {name: 'press queries', route: '/press/queries', component: pressQueryComponent},
    {name: 'press templates', route: '/press/templates', component: pressTemplateComponent}
], '/press.css');

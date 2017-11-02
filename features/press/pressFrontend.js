const pressState = {
    lines: [],
    queries: [],
    templates: []
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
    },
    view: function() {
        return  m('.pressFeature', [
            platform.title('press lines'),
            platform.menu('press lines'),
            m('input#templateInput'),
            m('button', {
                onclick: function() {
                    const templateInput = document.querySelector('#templateInput');

                    return m.request({
                        method: 'POST',
                        url: '/press/line',
                        withCredentials: true,
                        data: { template: templateInput.value, time: Date.now() }
                    }).then(function() {
                        templateInput.value = '';
                        refreshPressLines();
                    });
                }
            }, 'send'),
            m('div', pressState.lines.map(function(line) {
                return m('div', line.template);
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

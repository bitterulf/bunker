const harvestState = {
    ready: {},
    selectedScaperId: null,
    harvestSteps: [],
    harvestEvents: [],
    harvestEventsPage: 1
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

const refreshHarvestEvents = function() {
    return m.request({
        method: 'GET',
        url: '/harvester/events',
        withCredentials: true,
        data: {
            page: harvestState.harvestEventsPage
        }
    })
    .then(function(result) {
        harvestState.harvestEvents = result;
    })
};

const refreshHarveststeps = function() {
    return m.request({
        method: 'GET',
        url: '/harvester/steps',
        withCredentials: true,
    })
    .then(function(stepGroups) {
        const harvestSteps = [];

        stepGroups.forEach(function(stepGroup) {

            console.log('sg', stepGroup);

            stepGroup.steps.forEach(function(step) {
                harvestSteps.push({
                    scraperId: stepGroup.scraperId,
                    selector: step.selector,
                    field: step.field
                });
            });
        });

        harvestState.harvestSteps = harvestSteps;
    })
};

const renderHarvestEntry = function(scraperId, entries) {

    entries.sort(function(a, b) {
        return b.time  - a.time;
    });

    const limitedEntries = entries.length > 10 ? entries.slice(0, 10) : entries;

    return [
        m('button', {
            onclick: function() {
                if (!harvestState.selectedScaperId) {
                    harvestState.selectedScaperId = scraperId;
                }
                else {
                    harvestState.selectedScaperId = undefined;
                }
            }
        }, harvestState.selectedScaperId != scraperId ? 'select' : 'deselect' ),
        m('div', scraperId + '( ' + limitedEntries.length + ' of ' + entries.length + ')' ),
        m('div',
            limitedEntries.map(function(entry) {
                if (!harvestState.selectedScaperId) {
                    return m('div', [
                        m('a', { href: entry.link }, entry.time + ' ' + entry.title)
                    ]);
                }

                return m('div', [
                    m('a', { href: entry.link }, entry.time + ' ' + entry.title),
                    m('button', {
                        onclick: function() {
                            const harvestSteps = harvestState.harvestSteps.filter(function(step) {
                                return step.scraperId == harvestState.selectedScaperId;
                            });

                            if (harvestSteps.length) {
                                return m.request({
                                    method: 'POST',
                                    url: '/harvester/test',
                                    withCredentials: true,
                                    data: {
                                        link: entry.link,
                                        steps: harvestSteps
                                    }
                                })
                                .then(function(result) {
                                    console.log(result);
                                });
                            }
                        }
                    }, 'test')
                ]);
            })
        )
    ];
};

const renderHarvesterDefinition = function() {
    if (!harvestState.selectedScaperId) {
        return '';
    };

    const harvestSteps = harvestState.harvestSteps.filter(function(step) {
        return step.scraperId == harvestState.selectedScaperId;
    });

    return m('div', [
        harvestSteps.map(function(step, stepIndex) {
            return m('div', [
                step.scraperId + ' ' + step.selector + ' ' + step.field,
                m('button', {
                    onclick: function() {
                        const filtered = harvestState.harvestSteps.filter(function(harvestStep) {
                            return !(harvestStep.scraperId == step.scraperId && harvestStep.selector == step.selector && harvestStep.field == step.field);
                        });

                        harvestState.harvestSteps = filtered;
                    }
                }, 'remove step')
            ]);
        }),
        m('div', [
            m('input#harvestStepSelector', { placeholder: 'cssSelector' }),
            m('input#harvestStepOutputField', { placeholder: 'outputField' }),
            m('button', {
                onclick: function() {
                    const scraperId = harvestState.selectedScaperId;
                    const harvestStepSelector = document.querySelector('#harvestStepSelector').value;
                    const harvestStepOutputField = document.querySelector('#harvestStepOutputField').value;
                    if (scraperId && harvestStepSelector && harvestStepOutputField) {
                        harvestState.harvestSteps.push({
                            scraperId: scraperId,
                            selector: harvestStepSelector,
                            field: harvestStepOutputField
                        });
                    }
                }
            }, 'add harvest step')
        ]),
        m('button', {
            onclick: function() {
                return m.request({
                    method: 'POST',
                    url: '/harvester/steps',
                    withCredentials: true,
                    data: {
                        scraperId: harvestState.selectedScaperId,
                        steps: harvestSteps.map(function(step) { return { field: step.field, selector: step.selector } })
                    }
                })
                .then(function(result) {
                    console.log(result);
                });
            }
        } ,'sync')
    ]);
};

const harvesterComponent = {
    oninit: function() {
        refreshHarvest();
        refreshHarveststeps();
    },
    view: function() {
        const renderReadyList = function() {
            if (harvestState.selectedScaperId) {
                const scraperId = harvestState.selectedScaperId;
                return m('div', renderHarvestEntry(scraperId, harvestState.ready[scraperId]));
            }

            const scraperIds = Object.keys(harvestState.ready);

            return m('div',
                scraperIds.map(function(scraperId) {
                    const entries = harvestState.ready[scraperId];

                    return renderHarvestEntry(scraperId, entries);
                })
             );
        }

        return  m('.harvesterFeature', [
            platform.title('harvester'),
            platform.menu('harvester'),
            renderReadyList(),
            renderHarvesterDefinition(),
            m('button', {
                onclick: function() {
                    return m.request({
                        method: 'POST',
                        url: '/harvester/harvest',
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

const renderEventsList = function() {

    return [
        m('div', 'page ' + harvestState.harvestEventsPage),
        harvestState.harvestEvents.map(function(event) {
            return m('div', [
                m('span', { title: JSON.stringify(event.steps) }, event.scraperEvent.time + ' ' + event.scraperEvent.link),
                m('button', {
                    onclick: function() {
                        return m.request({
                            method: 'POST',
                            url: '/harvester/collect',
                            withCredentials: true,
                            data: {
                                id: event._id
                            }
                        })
                        .then(function(result) {
                            refreshHarvestEvents();
                        });
                    }
                }, 'collect')
            ]);
        }),
        m('button', {
            onclick: function() {
                harvestState.harvestEventsPage++;
                refreshHarvestEvents();
            }
        }, 'next')
    ];
};

const harvesterEventsComponent = {
    oninit: function() {
        refreshHarvestEvents();
    },
    view: function() {
        return  m('.harvesterFeature', [
            platform.title('harvester events'),
            platform.menu('harvester events'),
            renderEventsList()
        ]);
    }
};

platform.register('harvester', [
    {name: 'harvester', route: '/harvester', component: harvesterComponent},
    {name: 'harvester events', route: '/harvester/events', component: harvesterEventsComponent}
], '/harvester.css');

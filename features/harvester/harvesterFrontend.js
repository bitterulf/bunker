const harvestState = {
    ready: {},
    selectedScaperId: null,
    harvestSteps: []
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

const renderHarvestEntry = function(scraperId, entries) {
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
                        m('a', { href: entry.link }, entry.title)
                    ]);
                }

                return m('div', [
                    m('a', { href: entry.link }, entry.title),
                    m('button', {
                        onclick: function() {
                            const harvestSteps = harvestState.harvestSteps.filter(function(step) {
                                return step.scraperId == harvestState.selectedScaperId;
                            });

                            if (harvestSteps.length) {
                                console.log(entry._id, 'harvestSteps', harvestSteps);

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
        harvestState.harvestSteps.map(function(step) {
            return m('div', step.scraperId + ' ' + step.selector + ' ' + step.field);
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
        ])
    ]);
};

const harvesterComponent = {
    oninit: function() {
        refreshHarvest();
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

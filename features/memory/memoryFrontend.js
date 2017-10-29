const memoryState = {
    memory: {},
    refreshActive: false,
};

const refreshMemory = function() {
    return m.request({
        method: 'GET',
        url: '/memory',
        withCredentials: true,
    }).then(function(result) {
        memoryState.memory = result;
    });
};

const Memory = {
    oninit: function() {
        const memoryListener = platform.listener('memory', '/memory');

        if (!memoryState.refreshActive) {
            memoryState.refreshActive = true;
            memoryListener('update', function() {
                refreshMemory();
            });
        }

        refreshMemory();
    },
    view: function() {
        return  m('.memoryFeature', [
            platform.title('memory'),
            platform.menu('memory'),
            m('div', memoryState.memory.heapUsed ? memoryState.memory.heapUsed / 1000000 + ' MB' : '-')
        ]);
    }
};

platform.register('memory', [{name: 'memory', route: '/memory', component: Memory}], '/memory.css');

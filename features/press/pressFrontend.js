const pressState = {
    lines: []
};

const refreshLines = function() {
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

const pressComponent = {
    oninit: function() {
        refreshLines();
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
                        refreshLines();
                    });
                }
            }, 'send'),
            m('div', pressState.lines.map(function(line) {
                return m('div', line.template);
            }))
        ]);
    }
};

platform.register('press', [{name: 'press lines', route: '/press/lines', component: pressComponent}], '/press.css');

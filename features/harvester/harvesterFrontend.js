const harvesterComponent = {
    view: function() {
        return  m('.harvesterFeature', [
            platform.title('harvester'),
            platform.menu('harvester'),
            m('button', {
                onclick: function() {
                    return m.request({
                        method: 'POST',
                        url: '/harvest',
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

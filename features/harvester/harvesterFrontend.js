const harvesterComponent = {
    view: function() {
        return  m('.harvesterFeature', [
            platform.title('harvester'),
            platform.menu('harvester')
        ]);
    }
};

platform.register('harvester', [{name: 'harvester', route: '/harvester', component: harvesterComponent}], '/harvester.css');

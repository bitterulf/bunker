const <%= name %>Component = {
    view: function() {
        return  m('.<%= name %>Feature', [
            platform.title('<%= name %>'),
            platform.menu('<%= name %>')
        ]);
    }
};

platform.register('<%= name %>', [{name: '<%= name %>', route: '/<%= name %>', component: <%= name %>Component}], '/<%= name %>.css');

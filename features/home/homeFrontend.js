const Home = {
    view: function() {
        return  m('.homeFeature', [
            platform.title('home'),
            platform.menu('home')
        ]);
    }
};

platform.register('home', [{name: 'home', route: '/', component: Home}], '/home.css');

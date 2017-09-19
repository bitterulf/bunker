const Home = {
    view: function() {
        return  m('.homeFeature', [
            platform.title('home'),
            platform.menu('home')
        ]);
    }
};

platform.register('home', '/', '/home.css', Home);

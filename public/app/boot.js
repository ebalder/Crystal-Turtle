/*global requirejs, require*/

requirejs.config({
    baseUrl : '/app',
    paths : {
        lib : '/lib',
        project : '/app/studio/boot',
        models: '/app/studio/models',
        users: '/app/users',
        components: '/app/studio/components',
        studio : '/app/studio',
    },
    map: {
        '*': { 
            'lib/peer': 'lib/peer-wrapper',
            'lib/underscore': 'lib/lodash',
            'lib/jquery': 'jquery-loader',
        },
        'lib': {
            backbone: 'lib/backbone',
            peer: 'lib/peer-wrapper',
            underscore: 'lib/lodash',
            jquery: 'jquery-loader'
        },
        'jquery-loader':{
            'lib/jquery': 'lib/jquery'
        }
    }
});

requirejs(['lib/jquery','lib/jquery-ui','lib/underscore','lib/backbone',
    'lib/backbone.stickit','users/session', 'navigation'], 
    function($, ui, _, Backbone, 
        stickit, session, nav)
{ 
    'use strict';
    function _init(){  

        session.init();
        nav.init();

        // TODO: this doesn't handle network timeouts, only various
        // gateway timeouts.  This all probably should go into a
        // wrapper class instead that handles common errors, but it
        // must be reviewed how that interacts with Backbone.

        function retry(xhr, status /*, error */){
            /* jshint validthis:true */
            if(this.tryCount < this.maxTries){
                console.error('%s: %s... retrying', xhr, status);
                this.tryCount++;
                var self = this;
                setTimeout(function(){
                    $.ajax(self);
                }, 3000);
            }
            else{
                console.error("couldn't process request!");
                //ToDo: show some message dialog to the user
            }
        }

        /* If network timeout or internal server error, retry */
        $.ajaxSetup({
            tryCount: 0,
            maxTries: 3,
            statusCode: {
                408: retry,
                500: retry,
                504: retry,
                522: retry,
                524: retry,
                598: retry
            }
        });

        var router;
        var AppRouter = Backbone.Router.extend({
            routes: {
                "": 'home',
                "login(/)": 'login',
                "logout(/)": 'logout',
                "newProject(/)": 'newProject',
                "projects(/)": 'browseProjects',
                "studio(/)": 'studio',
                "projects/:id(/)": 'project',
                "signup(/)": 'signup',
                "users/:id(/)": 'profile',
            },
            home: function() {
                require(['home'], function(view) { view(router); });
            },
            login: function(){
                // require(['login'], function(view) { view(router); });
            },
            signup: function(){
                //require(['signup'])
            },
            studio: function(){
                require(['studio/boot'], function(view){ view(router); });
            }
        });

        router = new AppRouter();
        Backbone.history.start({pushState:true});

    }

    if(document.readyState === 'complete'){
        _init();
    } else {
        document.onready = _init;
    }

});


/*global requirejs, require*/

requirejs.config({
    baseUrl : '/app/modules',
    paths : {
        lib : '/lib',
        project : '/app/modules/studio/boot',
        models: '/app/modules/studio/models',
        users: '/app/modules/users',
        underscore: '/lib/lodash.custom',
        components: '/app/modules/studio/components',
        studio : '/app/modules/studio',
        'lib/jquery' : '/lib/jquery-2.0.3.min'
    },
    shim: {
        'lib/jquery-ui': {
            export: '$',
            deps: ['lib/jquery']
        },
    },
    map: { //only absolute paths work here
        /* override every call to jquery with jquery-wrapper */
        '*': { 
            'lib/jquery': 'lib/jquery-wrapper',
            'lib/peer': 'lib/peer-wrapper'
        }, 
        /* except for the one in jquery-private */
        'lib/jquery-wrapper': { 'lib/jquery': 'lib/jquery' },
        'lib/peer-wrapper': { 'lib/peer': 'lib/peer' },
        'lib': {
            backbone: 'lib/backbone'
        }
    }
});


requirejs(['lib/jquery','lib/jquery-ui','lib/backbone', 'users/session',
    'navigation'], 
    function($, ui, Backbone, session,
        nav)
{  
    'use strict';

    /* add backbone plugins */
    require(['lib/Backbone.ModelBinder']);

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
    }

    var router;
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": 'home',
            "login(/)": 'login',
            "logout(/)": 'logout',
            "newProject(/)": 'newProject',
            "projects(/)": 'browseProjects'
            "projects/:id(/)": 'project',
            "signup(/)": 'signup'
            "users/:id(/)": 'profile',
        },
        home: function() {
            require(['home'], function(view) { view(router); });
        },
        login: function(){
            // require(['login'], function(view) { view(router); });
        },
        signup: function(){
            require(['signup'])
        }
    });

    router = new AppRouter();
    Backbone.history.start({pushState:true});

    if(document.readyState === 'complete'){
        _init();
    } else {
        document.onready = _init;
    }

    return;
});


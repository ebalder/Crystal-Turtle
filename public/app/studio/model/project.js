/* global define */
'use strict';

define(['lib/jquery', 'lib/underscore'], 
    function($, _){

    function duplicate(dest){
    }
    function join(to){
    }
    function newScene(){
        
    }
    function preview(){
    }
    function save(){
    }
    function split(point){
    }

    var Project = function Project(name){
        this.clips = [];
        this.name = name;
        this.scenes = [];
        this.fps;
        // this.activeScene = this.scenes[0];
        this.end;
        this.length;
        this.index;
        this.reference;

        /* Constructor */
        // Scene.prototype.setParent(this);
        load();
    };

    Project.prototype = {
        create: function create(){
            this.scenes[0] = new Scene();
            this.length = new util.Timestamp(0);
            this.activeScene = this.scenes[0];
            this.fps = 30;
        },
        close: function close(){

        },
        duplicate: duplicate,
        join: join,
        load: function load(ts){

        },
        open: function open(){
        },
        preview: preview,
        save: save,
        split: split,
    };

    return Project;

});
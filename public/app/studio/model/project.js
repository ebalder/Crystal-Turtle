/* global define */
'use strict';

define(['lib/jquery','lib/underscore','util','model/scene'], 
    function($, _, util, Scene){

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
        this.activeScene;
        this.end;
        this.length = new util.Timestamp(0);
        this.index;
        this.reference;

        /* Constructor */
        // Scene.prototype.setParent(this);
    };

    Project.prototype = {
        create: function create(){
            this.scenes[0] = new Scene().create();
            this.activeScene = this.scenes[0];
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

    var proy = new Project();
    proy.create();

    return proy;

});
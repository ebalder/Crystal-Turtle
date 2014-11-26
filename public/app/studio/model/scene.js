/* global define */
'use strict';

define(['util', 'model/clip'], function(util, Clip){

    function create() {
    }
    function del(){
    }
    function duplicate(dest){
    }
    function join(to){
    }
    function load(ts){  
    }
    function newClip(){
        var clips = this.clips;
        var curr = clips.length;
        clips[curr] = new Clip();
        clips[curr].create;
        console.log(this);
    }
    function open (index) {
        
    }
    function preview(){
    }
    function save(){
    }
    function setParent (project) {
        parent = project;
    }
    function split(point){
    }

    var Scene = function Scene(){
        this.clips = [];
        this.activeClip;
        this.start;
        this.end;
        this.index;
        this.reference;

        Clip.prototype.setParent(this);
        /* load() from fs */
        var len = $('meta#fragCount').attr('count');
        for (var i = 0; i <= len; i++){
            this.clips.push(new Clip(i, this.start));
        }

        this.open(0); /* Open a Clip */
    };

    Scene.prototype = {
        cached: [],
        create: function create(){
            this.clips[0] = new Clip().create();
            this.activeClip = this.clips[0];
            this.length = new util.Timestamp(0);
            return this;
        },
        del: del,
        duplicate: duplicate,
        join: join,
        load: load,
        newClip: newClip,
        open: open,
        parent: parent,
        preview: preview,
        save: save,
        setParent: setParent,
        split: split,
    };

    return Scene;

})
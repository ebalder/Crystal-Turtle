
define(['util','model/frame'], function(util, FrameClass){

    //var fs = require('fs');

    var parent;
    
    function openFrame (index) {
        
    }
    function del(){
    }
    function duplicate(dest, linked){
    }
    function join(to){
    }
    function load(){
        $(this).trigger('loaded');
    }
    function move(dest){
    }
    function create(start, end, script){
    }
    function preview(){
    }
    function resize(len){
    }
    function save(){
    }
    function scribble(){
    }
    function setParent (scene) {
        parent = scene;
    }
    function split(point){
    }

    function Clip(index, base){
        this.end;
        this.activeFrame;
        this.frames = [];
        this.index = index;
        this.reference;
        this.script;
        this.start;
        this.timestamp = null;

    }

    Clip.prototype = {
        create: function create(){
            this.frames[0] = new FrameClass().create();
            this.activeFrame = this.frames[0];
            return this;
        },
        load: load,
        openFrame : openFrame,
        parent: parent,
        setParent: setParent
    };

    return Clip;
})
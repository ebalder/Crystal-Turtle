/* global define */
'use strict';

define([], function(){

    var Timestamp = function Timestamp(frames){
        this.hour;
        this.minute;
        this.second;
        this.frame;
        this.value;
        this.string;
    };

    Timestamp.prototype = {
        getFollowing: function getFollowing(){
        },
        isBetween: function isBetween(a, b) {
        },
        setFps: function setFps(fps){
            this.prototype.fps = fps;
        },
    };

    return {
        stopPropagation: function(ev){
            ev.stopPropagation();
            return true;
        },
        Timestamp: Timestamp
    }
});
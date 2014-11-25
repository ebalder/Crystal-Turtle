/* global define */
'use strict';

define([], function(){

    var Timestamp = function Timestamp(value){
        if (!value){
            this.hour = 0;
            this.minute = 0;
            this.second = 0;
            this.frame = 0;
            this.value = 0;
            this.string = '00:00:00.0'
        }
        else if (typeof value == 'string'){
            var values = value.split(':');
            this.hour = parseInt(values.shift());
            this.minute = parseInt(values.shift());
            values = values[0].split('.');
            this.second = parseInt(values.shift());
            this.frame = parseInt(values.shift());

            this.value = this.hour*this.fph 
                + this.minute*this.fpm
                + this.second*this.fps 
                + frame;
            this.string = value;
        }
        else if (typeof value == 'number'){
            var residual;

            this.hour = Math.floor(value/this.fph);
            residual = value - this.hour * this.fph;
            this.minute = Math.floor(residual/this.fpm);
            residual = residual - this.minute * this.fpm;
            this.second = Match.floor(mod/this.fps);
            this.frame = residual - this.second * this.fps;

            this.value = value;
            this.string = this.hour.toFixed(2) +':\
                '+ this.minute.toFixed(2) +':\
                '+ this.second.toFixed(2) +':\
                '+ this.frame;
        }
    };

    Timestamp.prototype = {
        getFollowing: function getTweens(a, b){
        },
        isBetween: function isBetween(a, b) {
        },
        setFps: function setFps(fps){
            /* ToDo: check for setPrototype() */
            this.__proto__.fps = fps;
            this.__proto__.fpm = fps * 60;
            this.__proto__.fph = fps * 3600;
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
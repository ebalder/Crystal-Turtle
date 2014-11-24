/* global define */

define([], function(){
    'use strict';

    var frame = {};
    frame.prototype = {

    };

    var timeline, self;

    timeline = self = {
        load: function load(project){
            self.loadClips(project.activeScene.clips);

        },
        loadClips: function loadClips(clips){
        },
        loadFrameHandles: function loadFrameHandles(frames){}
    };

    return timeline;
});
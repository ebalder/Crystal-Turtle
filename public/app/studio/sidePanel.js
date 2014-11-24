/* global define */

define(['lib/jquery', 'lib/jquery-ui','studio/pinboard', 'util'], function($,ui, pinboard, util){ 
    'use strict';

    var timestamp = "0:00:00.00";
    var cssShow = {'left' : '0%' , 'padding-left' : '10px'};
    var cssHide = {'left' : '-35%', 'padding-left': '20px'};

    var $panel = $('#panel');
    var panel, self;

    panel = self = {
        hide : function (){ 
            $('body').off('click', self.hide);
            $panel.css(cssHide);
            $('#panTab').one('click', self.show);
        },
        show : function(){
            $('#panTab').off('click', self.show);
            timestamp = pinboard.timestamp;
            $panel.css(cssShow); 
            $('body').one('click', self.hide);
            $('#panTab').one('click', self.hide);
        },
        init : function(){
            panel.hide();
            $panel.on('click', util.stopPropagation);
        },
        triggerHide : function(){
            $("#panTab").trigger('click');
        }
    };

    panel.init();
    
    $('.fragInfo').tabs({
        heightStyle: "fill",
        active: 0,
        event: 'mouseover'
    });
    
    return panel;
});
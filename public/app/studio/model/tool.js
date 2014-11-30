/* global define */
'use strict';

define(['require','lib/jquery','model/tool'], 
    function(require, $)
{

    var tools = {
        brush: {
            shape: 'circle'
        }
    };

    var tool = {
        active: tools.brush,
        color: 'rgba(0, 0, 0, 0)',
        size: 2,
        use: function(name, opt){
            this.active = tools[name];
        },
        ctx: null
    };

    return tool
});






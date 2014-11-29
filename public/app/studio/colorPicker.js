/* global define */
'use strict';

define(['require','lib/jquery','lib/colorjoe','model/tool',], 
    function(require, $, colorjoe, tool){

    var $colorPicker = $('<div></div>').attr('id', 'colorPicker');
    var colorPicker = $colorPicker[0]; //get native DOM element

    var joe = colorjoe.rgb(colorPicker, '#000000', [
        'currentColor', 'alpha', 'hex', [
            'fields', {
                space:'RGBA',
                limit: 255,
                fix: 0
            }
        ]
    ]);

    return $colorPicker;
});

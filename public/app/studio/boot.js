/* global define */
'use strict';

define(['require','lib/jquery','lib/popgen','studio/sidePanel',
    'studio/timeline',
    //'studio/canvas',
    'studio/panels',
    'model/project'], 
    function(require, $, popgen, panel, 
        timeline,
        // canvas,
        panels, 
        project)
{

    return function(router){
        function destroyDialog(event){
            $('.dialog').remove();
        }

        if(localStorage.openedProject){
            project.open(localStorage.openedProject);
        }

        $("#nIssue").on('click', issues.new);
        $('a.expand').on('click', function(ev){
            $('body').one('click', destroyDialog);
            var data = $(ev.target).parents('div:first').html();
            $('body').append('<div class="dialog">' + data + '</div>');
            return false;
        });
    };
});






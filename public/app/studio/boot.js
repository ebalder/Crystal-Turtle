/* global define */

define(['require','lib/jquery','lib/popgen','studio/sidePanel',
    'studio/carrousel',
    'model/project'], 
    function(require, $, popgen, panel, 
        carrousel, 
        Project)
{
    'use strict';

    return function(router){
        function destroyDialog(event){
            $('.dialog').remove();
        }

        var project = new Project();
        if(localStorage.openedProject){
            Project.open(localStorage.openedProject);
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






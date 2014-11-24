

define(function(require){
    var panel = require('studio/sidePanel');
    //var carrousel = require('studio/carrousel');

    
    return function(router){
        //Aquí no tiene efecto navigation.js, así que por ahora
        //Se deja aqui la funcion de destroyDialog para que los issues funcionen.
        /* ToDo: applicar navigation.js */
        function destroyDialog(event){
            $('.dialog').remove();
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






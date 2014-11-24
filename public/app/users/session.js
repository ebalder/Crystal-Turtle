/*global define*/
'use strict';

define(['lib/jquery'], function($){

    function _init(){
        /* ToDo: real session check */
        if(localStorage.sid != null || sessionStorage.sid != null){
            nav.login();
        } else {
            $('a[href="/logout"]').hide();
            $('a[href="/projectForm"]').hide();
        }
    }
    
    return {
        init: _init
    }
    
});

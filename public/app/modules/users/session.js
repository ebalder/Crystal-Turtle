/*global requirejs, require, define*/

define(['lib/jquery'], function(){
    'use strict';

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

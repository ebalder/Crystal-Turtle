/* global define */

define([], function(){
	'use strict';

	return {
		stopPropagation: function(ev){
			ev.stopPropagation();
			return true;
		}
	}
});
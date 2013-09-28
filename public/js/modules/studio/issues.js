define(function(){
	var issues = {
		new : function(){
			$.get('/newIssue', function(data){
				$('#issues').css("display", "none");
				$('#proyInfo').append(data);
				var editor = new TINY.editor.edit('editor',{
				    id:'issueWriter', // (required) ID of the textarea
				    width:584, 
				    height:175, 
				  	cssclass:'tinyeditor', // (optional) CSS class of the editor
				    controlclass:'tinyeditor-control', // (optional) CSS class of the buttons
				    rowclass:'tinyeditor-header', // (optional) CSS class of the button rows
				    dividerclass:'tinyeditor-divider', // (optional) CSS class of the button diviers
				    controls:[
				    	'bold', 'italic', 'underline', 'strikethrough', '|', 
				    	'orderedlist', 'unorderedlist', '|' ,
				    	'outdent' ,'indent', '|', 
				    	'leftalign', 'centeralign', 'rightalign', 'blockjustify', '|', 
				    	'unformat', '|', 
				    	'undo', 'redo', 'n', 'font', 'size', 'style', '|', 
				    	'image', 'hr', 'link', 'unlink'], 
				    footer:true, 
				    fonts:['Verdana','Arial','Georgia','Trebuchet MS'], 
				    xhtml:true, // (optional) generate XHTML vs HTML
				    //cssfile:'style.css', // (optional) attach an external CSS 
				    content:'starting content', // (optional) set the starting content else it will default to the textarea content
				    //css:'body{background-color:#ccc}', // (optional) attach CSS to the editor
				    bodyid:'editor', // (optional) attach an ID to the editor body
				    footerclass:'tinyeditor-footer', // (optional) CSS class of the footer
				    toggle:{text:'advanced',activetext:'basic',cssclass:'toggle'}, // (optional) toggle to markup view options
				    resize:{cssclass:'resize'} // (optional) display options for the editor resize
				});
				$('#submitIssue').one("click", function(){
					editor.post();
					var submit = {
						issue : $('#issueWriter').val(),
						title : $('#issueTitle').val(),
						sid : sessionStorage.sid
					};
					$.post('/submitIssue', submit, function(data){
						$('body').append(submit.issue);
					});
					$('#wysiwyg').remove();
					$('#issues').css('display', 'inline-block');
				})
			});
			return false;
		}
	}
	return issues;
});
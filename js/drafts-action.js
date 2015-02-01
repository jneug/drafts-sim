/*
Action Step API

"draft" Object Properties
content: The text content of the draft.
createdDate: Date the draft was created.
createdLatitude/createdLongitude: Location coordinates of draft creation.
modifiedDate: Date the content of the draft was last changed.
modifiedLatitude/modifiedLongitude: Location coordinates for last modification of draft content.
accessedDate: Date the draft was last opened, even if the content was not changed.
selectionStart: The location in the string where the last cursor selection in the editor started.
selectionLength: The length (in characters) of the last cursor selection in the editor.
archived: Boolean value to get/set whether the draft has been archived.
flagged: Boolean value to get/set the flagged status of the draft.

"draft" Object Functions
defineTag(tagName, tagString) : Define a custom template tag for use in action steps happening later in the same action. For example, a script step could calculate the number of words in a draft, then call "draft.defineTag("wordCount",100)". Action steps occurring after the script step in the same action would be able to use "[[wordCount]]" as a tag in their templates and have it evaluated to the value defined in the script step.

Other Utility Functions
commit(draft) : Persist changes made to the draft object to the database. By default, changes will only exist in the life span of the current action, calling commit() will permanently update the draft.
getClipboard(): Returns current contents of the system clipboard.
setClipboard(string): Set the system clipboard to the string passed.
alert(message) : Show message dialog with message, similar to standard Javascript browser alert.
stopAction() : Set a flag to stop further execution of steps after the current script step within the Action.  This can be used to validate inputs in a script, and cancel execution of the action if it does not fit the requirements.
markdown(string, useXHTML) : Returns string converted to HTML through the Markdown engine. If "useXHTML" is true, output will be XHTML complaint (useful for Evernote ENML compatibility), otherwise HTML5 output will be used.
*/
var tags = {};
var commit = function(draft) {
    $('#draft').val(draft.content);
    $('#draft').textrange('set', draft.selectionStart, draft.selectionLength);
}
var clipboard = "";
var getClipboard = function() {
    return clipboard;
}
var setClipboard = function(str) {
    clipboard = str;
}
var stopAction = function() {
    alert("stopAction() called: No further action steps will be executed.");
}
var markdown = function(string, useXHTML) {
    var converter = new Markdown.Converter();
    var html = converter.makeHtml(string);
    return html;
}

var DraftObj = function() {
    this.content = $('#draft').val();
    this.createdDate = new Date();
    this.modifiedDate = new Date();
    this.accessedDate = new Date();
    this.createdLatitude = "51.731803";
    this.createdLongitude = "8.735418";
    this.selectionStart = $('#draft').textrange('get', 'start');
    this.selectionLength = $('#draft').textrange('get', 'length');
    this.archived = false;
    this.flagged = false;

    this.defineTag = function(tagName, tagString) {
        tags[tagName] = tagString;

        var text = "";
        for (var name in tags) {
            text += "[[" + name + "]]: \"" + tags[name] + "\"\n";
        };
        $('#tags').val(text);
    }
}

$(function() {
	var editor = CodeMirror(document.getElementById("code"), {
		mode: "javascript",
		lineNumbers: true,
		theme: "cobalt"
	});

    $('#submit').click(function() {
        tags = {};
        $('#tags').val("");

        var draft = new DraftObj();

        var code = editor.getValue();
        eval(code);
    });

    $('#parse').click(function() {
        var url_prefix = "x-drafts4://x-callback-url/import_action?";
        var url = $('#url').val();
        if (url.substr(0, url_prefix.length) == url_prefix) {
            var params = url.substring(url_prefix.length);

            // If multiple script steps exist, the user may add a "step=no" param to url
            var whichStep = params.match(/step=(\d+)/);
            if (whichStep)
                whichStep = whichStep[1];
            else
                whichStep = 0;

            var script = "";
            var steps = params.match(/actionSteps=([^&]+)/);
            if (steps) {
                steps = steps[1];

                // steps = steps.replace(/\%[0-9a-f][0-9a-f]/ig, function(c) {
                // 	return String.fromCharCode(parseInt(c.substr(1),16));
                // });

                var decode = ["%21", "%27", "%28", "%29", "%2a"];
                var decoded = "!'()*";
                for (var i = 0; i < decode.length; i++) {
                    steps = steps.replace(decode[i], decoded[i], "g");
                };

                steps = eval(decodeURIComponent(steps));

                // Find applicable script step
                for (var i = 0; i < steps.length; i++) {
                    if (steps[i].actionStepType == "Script") {
                        if (whichStep == 0) {
                            //script = unescape(steps[i].scriptText);
                            script = steps[i].scriptText;
                            break;
                        } else {
                            whichStep--;
                        }
                    }
                };
            }

            if (script) {
                editor.setValue(script);
            } else {
                alert("Wrong URL format. Could not parse Action URL.")
            }
        }
    });
});
/*
Script Key API
getText() : Returns the full text currently being edited.
setText(string) : Replaces full text being edited with string.
getSelectedText() : Return only the selected text. If no text selection exists, this will return an empty string.
setSelectedText(string) : Replace only the current selected text range with the string. Also updates the selected range to match any change in length of the new string.
getTextInRange(start, length) : Return text in the request range.
setTextInRange(start, length, string) : Replace the text in the specified range with the value of string.
getSelectedLineRange() : Returns the range (start,length) of the full line based on the current cursor position
getSelectedRange() : Returns the current selected text range as an array with values [start, length].
setSelectedRange(start, length) : Set the selected range of text. Invalid ranges will be automatically adjusted, and this text selection will be applied after successful completion of the script.
getClipboard(): Returns current contents of the system clipboard.
setClipboard(string): Set the system clipboard to the string passed.
*/
var getText = function() {
    return $('#draft').val();
}
var setText = function(str) {
    $('#draft').val(str);
}
var getSelectedText = function() {
    return $('#draft').textrange('get', 'text');
}
var setSelectedText = function(str) {
    $('#draft').textrange('replace', str);
}
var getTextInRange = function(start, length) {
    var text = $('#draft').val();
    return text.substr(start, length);
}
var setTextInRange = function(start, length, str) {
    var text = $('#draft').val();
    var newText = text.substring(0, start) + str + text.substring(start + length);
    $('#draft').val(newText);
}
var getSelectedLineRange = function() {
    var text = $('#draft').val();
    var tr = $('#draft').textrange();

    var end = text.indexOf("\n", tr.end);
    if (end == -1)
        end = text.length;

    var start = text.substring(0, tr.start).lastIndexOf("\n") + 1;
    if (start <= 0)
        start = 0;

    var length = end - start;
    return [start, length];
}
var getSelectedRange = function() {
    var textrange = $('#draft').textrange();
    return [textrange.start, textrange.length];
}
var setSelectedRange = function(start, length) {
    $('#draft').textrange('set', start, length);
}
var clipboard = "";
var getClipboard = function() {
    return clipboard;
}
var setClipboard = function(str) {
    clipboard = str;
}

$(function() {
    var editor = CodeMirror(document.getElementById("code"), {
        mode: "javascript",
        lineNumbers: true,
        theme: "cobalt"
    });

    $('#submit').click(function() {
        var code = editor.getValue();
        eval(code);
    });

    $('#parse').click(function() {
        var url_prefix = "x-drafts4://x-callback-url/import_key?";
        var url = $('#url').val();
        if (url.substr(0, url_prefix.length) == url_prefix) {
            var params = url.substring(url_prefix.length);

            var keyType = params.match(/keyType=([^&]+)/);
            if (keyType)
                keyType = keyType[1];
            var script = params.match(/script=([^&]+)/);
            if (script)
                script = script[1];

            if (keyType && script) {
                editor.setValue(decodeURIComponent(script));
            } else {
                alert("Wrong URL format. Could not parse Script Key.")
            }
        }
    });

    $('#generate').click(function() {
        var url_prefix = "x-drafts4://x-callback-url/import_key?keyType=Script&shortcutText=Key&keyDescription=Generated%20Key&labelText=Key&script=";
        var script = editor.getValue();

        $('#install').attr('href', url_prefix+encodeURIComponent(script));
        $('#install').show();
    });
});
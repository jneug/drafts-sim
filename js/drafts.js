$(function() { 'use strict';
    // Initialize CodeMirror editor (see http://codemirror.net/doc/manual.html)
    var initialCode = $('#code').text().trim(); $('#code').text('');
    var editor = new CodeMirror(document.getElementById('code'), {
        value: initialCode,
        mode: 'javascript',
        lineNumbers: true,
        theme: 'cobalt'
    });
    window.editor = editor; // Add editor to global scope, useful for bookmarklets

    // Handle "Run" button
    $('#run').click(function() {
        var code = editor.getValue();

        if ($('#scope').val() == 'key') {
            keyScope(code);
        } else {
            actionScope(code);
        }
    });

    // Handle "Parse URL" button
    $('#parse').click(function() {
        var url = $('#url').val();

        if ($('#scope').val() == 'key') {
            parseKey(url);
        } else {
            parseAction(url);
        }
    });

    // Temp store for last saved draft
    var savedDraft = '';

    // Save current draft text in temp store
    $('#save').click(function(evt) {
        evt.preventDefault();
        savedDraft = $('#draft').val();
        // Do some fancy animations
        $('#save-icon').removeClass('out').addClass('in');
        window.setTimeout(function() {
            $('#save-icon').removeClass('in').addClass('out');
        }, 400);
    });
    $('#save').click(); // Save initial draft

    // Restore draft text from temp store
    $('#restore').click(function(evt) {
        evt.preventDefault();
        $('#draft').val(savedDraft);
        // Do some fancy animations
        $('#restore-icon').removeClass('out').addClass('in');
        window.setTimeout(function() {
            $('#restore-icon').removeClass('in').addClass('out');
        }, 400);
    });

    // Everything to handle Script Key code execution
    var keyScope = function(code) {
        /*  Script Key API
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
        };
        var setText = function(str) {
            $('#draft').val(str);
        };
        var getSelectedText = function() {
            return $('#draft').textrange('get', 'text');
        };
        var setSelectedText = function(str) {
            $('#draft').textrange('replace', str);
        };
        var getTextInRange = function(start, length) {
            var text = $('#draft').val();
            return text.substr(start, length);
        };
        var setTextInRange = function(start, length, str) {
            var text = $('#draft').val();
            var newText = text.substring(0, start) + str +
                    text.substring(start + length);
            $('#draft').val(newText);
        };
        var getSelectedLineRange = function() {
            var text = $('#draft').val();
            var tr = $('#draft').textrange();

            var end = tr.end;
            if (text.substr(tr.end - 1, 1) !== '\n') {
                end = text.indexOf('\n', tr.end);
                if (end == -1) {
                    end = text.length;
                } else {
                    end++;
                }
            }

            var start = text.substring(0, tr.start).lastIndexOf('\n') + 1;
            if (start <= 0) {
                start = 0;
            }

            var length = end - start;
            return [start, length];
        };
        var getSelectedRange = function() {
            var textrange = $('#draft').textrange();
            return [textrange.start, textrange.length];
        };
        var setSelectedRange = function(start, length) {
            $('#draft').textrange('set', start, length);
        };
        var clipboard = '';
        var getClipboard = function() {
            return clipboard;
        };
        var setClipboard = function(str) {
            clipboard = str;
        };

        eval(code);
    };

    // Everything to handle Action Step: Script execution
    var actionScope = function(code) {
        /*  Action Step API

        'draft' Object Properties
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

        'draft' Object Functions
        defineTag(tagName, tagString) : Define a custom template tag for use in action steps happening later in the same action. For example, a script step could calculate the number of words in a draft, then call 'draft.defineTag('wordCount',100)'. Action steps occurring after the script step in the same action would be able to use '[[wordCount]]' as a tag in their templates and have it evaluated to the value defined in the script step.
        getTag(tagName) : Get a previously define tag

        Other Utility Functions
        commit(draft) : Persist changes made to the draft object to the database. By default, changes will only exist in the life span of the current action, calling commit() will permanently update the draft.
        getClipboard(): Returns current contents of the system clipboard.
        setClipboard(string): Set the system clipboard to the string passed.
        alert(message) : Show message dialog with message, similar to standard Javascript browser alert.
        stopAction() : Set a flag to stop further execution of steps after the current script step within the Action.  This can be used to validate inputs in a script, and cancel execution of the action if it does not fit the requirements.
        markdown(string, useXHTML) : Returns string converted to HTML through the Markdown engine. If 'useXHTML' is true, output will be XHTML complaint (useful for Evernote ENML compatibility), otherwise HTML5 output will be used.
        */
        var commit = function(draft) {
            $('#draft').val(draft.content);
            $('#draft').textrange('set',
                    draft.selectionStart, draft.selectionLength);
            draft.modifiedDate = new Date();
            draft.accessedDate = new Date();
        };
        var clipboard = '';
        var getClipboard = function() {
            return clipboard;
        };
        var setClipboard = function(str) {
            clipboard = str;
        };
        var stopAction = function() {
            window.alert('stopAction() called: ' +
                    'No further action steps will be executed.');
        };
        var markdown = function(string, useXHTML) {
            var converter = new Markdown.Converter();
            var html = converter.makeHtml(string);
            return html;
        };

        var DraftObj = function() {
            this.content = $('#draft').val();
            this.createdDate = new Date();
            this.modifiedDate = new Date();
            this.accessedDate = new Date();
            this.createdLatitude = '51.731803';
            this.createdLongitude = '8.735418';
            this.selectionStart = $('#draft').textrange('get', 'start');
            this.selectionLength = $('#draft').textrange('get', 'length');
            this.archived = false;
            this.flagged = false;

            this.defineTag = function(tagName, tagString) {
                tags[tagName] = tagString;

                var text = '';
                for (var name in tags) {
                    text += '[[' + name + ']]: \'' + tags[name] + '\'\n';
                }
                $('#tags').val(text);
            };

            this.getTag = function(tagName) {
                if (typeof tags[tagName] !== undefined) {
                    return tags[tagName];
                } else {
                    return '';
                }
            };

            this.processTemplate = function(tplString) {
                var result = tplString;
                result = result.replace(/\[\[UUID\]\]/g, uuid);
                return result;
            };

            function generateUUID() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                          .toString(16)
                          .substring(1);
                }
                var uuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                return uuid.toUpperCase();
            }

            var uuid = generateUUID();
            var that = this;
        };

        var tags = {};
        $('#tags').val('');

        var draft = new DraftObj();
        eval(code);
    };

    // Parse a drafts action install url and set editor code
    var parseAction = function(url) {
        var urlPrefix = 'x-drafts4://x-callback-url/import_action?';
        if (url.substr(0, urlPrefix.length) == urlPrefix) {
            var params = url.substring(urlPrefix.length);

            // If multiple script steps exist, the user may add a 'step=no' param to url
            var whichStep = params.match(/step=(\d+)/);
            if (whichStep) {
                whichStep = whichStep[1];
            } else {
                whichStep = 0;
            }

            var script = '';
            var steps = params.match(/actionSteps=([^&]+)/);
            if (steps) {
                steps = steps[1];

                // steps = steps.replace(/\%[0-9a-f][0-9a-f]/ig, function(c) {
                //     return String.fromCharCode(parseInt(c.substr(1),16));
                // });

                var decode = ['%21', '%27', '%28', '%29', '%2a'];
                var decoded = '!\'()*';
                for (var i = 0; i < decode.length; i++) {
                    steps = steps.replace(decode[i], decoded[i], 'g');
                }

                steps = eval(decodeURIComponent(steps));

                // Find applicable script step
                for (i = 0; i < steps.length; i++) {
                    if (steps[i].actionStepType == 'Script') {
                        if (whichStep === 0) {
                            //script = unescape(steps[i].scriptText);
                            script = steps[i].scriptText;
                            break;
                        } else {
                            whichStep--;
                        }
                    }
                }
            }

            if (script) {
                editor.setValue(script);
            } else {
                window.alert('Wrong URL format. Could not parse Action URL.');
            }
        }
    };

    // Parse a drafts script key install url and set editor code
    var parseKey = function(url) {
        var urlPrefix = 'x-drafts4://x-callback-url/import_key?';
        if (url.substr(0, urlPrefix.length) == urlPrefix) {
            var params = url.substring(urlPrefix.length);

            var keyType = params.match(/keyType=([^&]+)/);
            if (keyType) {
                keyType = keyType[1];
            }
            var script = params.match(/script=([^&]+)/);
            if (script) {
                script = script[1];
            }
            if (keyType && script) {
                editor.setValue(decodeURIComponent(script));
            } else {
                window.alert('Wrong URL format. Could not parse Script Key.');
            }
        }
    };
});

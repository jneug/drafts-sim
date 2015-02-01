$(function() {
	$('#parse').click(function() {
		if( $('#scope').val() == 'key' ) {
			parse_key();
		} else {
			parse_action();
		}
	})

	parse_action = function() {
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
    }

	parse_key = function() {
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
    }
})
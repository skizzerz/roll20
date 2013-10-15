/**
 * Commands useful for GMs. A [GM] next to the command name indicates it can only be used by GMs.
 * To register yourself as a GM, insert your player id in the configuration script 2-Config.js
 * !playerid, Returns the player id of the current player
 * !eval [GM], Evaluates javascript code. Use the arguments array to access data passed in.
 *     - arguments[0] is the message object
 * !state [GM], Returns a JSON representation of the state variable or portion thereof.
 *     Example: !state players 0 attrs str to return the strength of player 0 if the state
 *         variable were to look like {players: [{attrs: {str: 10}}]}
 */
(function() {
	U.registerCommand('eval', true, function (argv, args) {
		try {
			var f = new Function(args[1]);
			f(this.msg);
		} catch (e) {
			U.chat('Server', this.msg.playerid, e.name + ': ' + e.message);
			var lines = e.stack.split("\n");
			for (var i in lines) {
				log(lines[i]);
			}
		}
	});

	U.registerCommand('state', true, function (argv) {
		var what = state;
		var a = _.rest(argv);
		for (var i in a) {
			if (_.has(what, a[i])) {
				what = what[a[i]];
			} else {
				U.chat('Server', this.msg.playerid, 'State variable not found');
				return;
			}
		}
		U.chat('Server', this.msg.playerid, JSON.stringify(state));
	});
	
	U.registerCommand('playerid', function (argv) {
		U.chat('Server', this.msg.playerid, '-' + this.msg.playerid);
	});
})();

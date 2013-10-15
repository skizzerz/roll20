Utility = function (obj) {
	var that = this;
	var _gms = [];
	var _cmds = {};
	
	on('chat:message', function (msg) {
		if (msg.type != 'api')
			return;
		
		var argv = msg.content.split(' ');
		var args = _.map(argv, function(e, i, a) { return _.rest(a, i).join(' '); });
		var cmd = argv[0].toLowerCase().substr(1).replace(/[^a-z0-9]/g, '');
		
		if (_.has(_cmds, cmd)) {
			if (_cmds[cmd].restricted && !U.isGM(msg.playerid)) {
				U.chat('Server', msg.playerid, 'You do not have permission to use !' + cmd);
				return;
			}
			
			var thisObj = {cmd: cmd, msg: msg, data: _cmds[cmd].data};
			_.bind(_cmds[cmd].callback, thisObj)(argv, args);
		} else {
			U.chat('Server', msg.playerid, 'Unknown command !' + cmd);
		}
	});
	
	return {
		extractJSON: function (str) {
			var s = decodeURIComponent(str);
			s = s.replace(/^SINGLESPACED!!/, '');
			s = s.replace(/<\/?[^>]+>/g, '');
			s = s.replace(/^.*?###/, '');
			return JSON.parse(s);
		},
		
		setGMs: function (gms) {
			if (_gms == []) {
				_gms = gms;
			}
		},
	  
		isGM: function (playerid) {
			for (var i in _gms) {
				if (_gms[i] == playerid)
					return true;
			}
			
			return false;
		},
		
		chat: function (from, to, msg) {
			var p = getObj('player', to);
			sendChat(from, '/w ' + p.get('_displayname') + ' ' + msg);
		},
		
		registerCommand: function (cmd, restricted, data, callback) {
			var cmdobj = {};
			if (_.isFunction(callback)) {
				cmdobj.restricted = (restricted === true) ? true : false;
				cmdobj.data = data;
				cmdobj.callback = callback;
			} else if (_.isFunction(data)) {
				cmdobj.restricted = (restricted === true) ? true : false;
				cmdobj.data = null;
				cmdobj.callback = data;
			} else if (_.isFunction(restricted)) {
				cmdobj.restricted = false;
				cmdobj.data = null;
				cmdobj.callback = restricted;
			}
			
			_cmds[cmd.toLowerCase()] = cmdobj;
		}
	};
};

U = new Utility();

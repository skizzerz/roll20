/**
 * Adds 3 commands related to lighting. A [GM] next to a command name means it is GM-only.
 * !light, to be used by players to set their token's light within defined boundaries
 * !flight [GM], to be used by GMs to change any token's light value arbitrarily
 * !todl [GM], to be used by GMs to move a token into the dynamic lighting layer so it
 *     can still provide light but the token itself is invisible to players
 */
(function () {
	U.registerCommand('light', false, false, doLight);
	U.registerCommand('flight', true, true, doLight);
	
	U.registerCommand('todl', true, function (argv) {
		var selected = this.msg.selected,
			playerid = this.msg.playerid;
		
		_.each(selected, function(obj) {
			if (obj._type != 'graphic') return; // only move graphics
			var tok = getObj('graphic', obj._id);
			if (tok.get('subtype') != 'token') return; // don't try to move cards
			
			// move to DL layer and make it so that all players can see light
			// can manage light level with !flight
			tok.set('layer', 'walls');
			tok.set('light_otherplayers', true);
		});
		
		U.chat('!todl', playerid, 'Success');
	});

	function doLight(argv) {
		var selected = this.msg.selected,
			playerid = this.msg.playerid,
			cmd = this.cmd,
			override = this.data;
		
		var lightRadius = isNaN(Math.abs(argv[1])) ? false : Math.abs(argv[1]);
		var lightDimRad = isNaN(Math.abs(argv[2])) ? false : Math.abs(argv[2]);
		if (!selected || lightRadius === false) {
			U.chat(cmd, playerid, '<br><i>Usage: ' + cmd +
				' &' + 'lt;light radius&' + 'gt; [start of dim light]</i><br>' +
				'Use with the token you wish to modify selected');
			return;
		}
		
		_.each(selected, function(obj) {
			var settings, tok, char;
			
			if (obj._type != 'graphic') return; // only light graphics
			
			tok = getObj('graphic', obj._id);
			if (tok.get('subtype') != 'token') return; // don't try to light cards
			
			if (tok.get('represents') != '') {
				char = getObj('character', tok.get('represents'));
				settings = U.extractJSON(char.get('gmnotes')) || {};
				var owners = char.get('controlledby');
				if (!U.isGM(playerid) && owners.indexOf(playerid) == -1) {
					return; // don't own this object
				}
			} else if (!override) {
				return; // players can't light non-character-tokens with this
			}
			
			// do limits if player (GM can do whatever)
			if (!override) {
				if (!settings.light_max && !settings.light_dim_max) {
					U.chat(cmd, playerid, 'You may not adjust light settings for this token');
					return;
				}
				
				if (lightDimRad !== false) {
					if (lightDimRad > settings.light_max) {
						U.chat(cmd, playerid, 'You may not set the dim radius to above ' + settings.light_max);
						return;
					}
					
					if (lightRadius > settings.light_dim_max) {
						U.chat(cmd, playerid, 'You may not set the light radius to above ' + settings.light_dim_max);
						return;
					}
				} else {
					if (lightRadius > settings.light_max) {
						U.chat(cmd, playerid,
							'You may not set the light radius to above ' + settings.light_max +
							' if you do not specify a dim radius');
						return;
					}
				}
			}
			
			tok.set('light_radius', lightRadius);
			
			if (lightDimRad !== false) {
				tok.set('light_dimradius', lightDimRad);
			} else {
				tok.set('light_dimradius', '');
			}
		});
	}
})();

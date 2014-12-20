var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var SunCalc = require('suncalc');

function wt(device, options) {
	options = options || {};
	this._options = options;
        this.configFile = "./suncalc.config";
        this.config = [];
        
	options.xplSource = options.xplSource || "bnz-suncalc."+os.hostname();

	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        _init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }

                        console.log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function() {
		if (!this._configuration.xplLog) {
			return;
		}
                
		console.log.apply(console, arguments);
	},

        _sendXpl: function(h, m, status, info){
                var self = this;
                self.xpl.sendXplTrig({
                        type:       'suncalc',
                        status:     status,
                        time:       h+':'+m,
                        info:       info
                }, 'suncalc.basic');
            
        },
        
        _solarNoon: function(times, h, m){
                if(h == times.solarNoon.getHours() && m == times.solarNoon.getMinutes()){
                        this._sendXpl(h, m, 'solarNoon', 'sun is in the highest position');
                }
        },

        _nadir: function(times, h, m){
                if(h == times.nadir.getHours() && m == times.nadir.getMinutes()){
                        this._sendXpl(h, m, 'nadir', 'darkest moment of the night, sun is in the lowest position');
                }
        },

        _sunrise: function(times, h, m){
                if(h == times.sunrise.getHours() && m == times.sunrise.getMinutes()){
                        this._sendXpl(h, m, 'sunrise', 'top edge of the sun appears on the horizon');
                }
        },

        _sunriseEnd: function(times, h, m){
                if(h == times.sunriseEnd.getHours() && m == times.sunriseEnd.getMinutes()){
                        this._sendXpl(h, m, 'sunriseEnd', 'bottom edge of the sun touches the horizon');
                }
        },
        
        _sunsetStart: function(times, h, m){
                if(h == times.sunsetStart.getHours() && m == times.sunsetStart.getMinutes()){
                        this._sendXpl(h, m, 'sunsetStart', 'bottom edge of the sun touches the horizon');
                }
        },
        
        _dawn: function(times, h, m){
                if(h == times.dawn.getHours() && m == times.dawn.getMinutes()){
                        this._sendXpl(h, m, 'dawn', 'morning nautical twilight ends, morning civil twilight starts');
                }
        },
        
        _dusk: function(times, h, m){
                if(h == times.dusk.getHours() && m == times.dusk.getMinutes()){
                        this._sendXpl(h, m, 'dusk', 'evening nautical twilight starts');
                }
        },
        
        _nauticalDawn: function(times, h, m){
                if(h == times.nauticalDawn.getHours() && m == times.nauticalDawn.getMinutes()){
                        this._sendXpl(h, m, 'nauticalDawn', 'morning nautical twilight starts');
                }
        },
        
        _nauticalDusk: function(times, h, m){
                if(h == times.nauticalDusk.getHours() && m == times.nauticalDusk.getMinutes()){
                        this._sendXpl(h, m, 'nauticalDusk', 'evening astronomical twilight starts');
                }
        },
        
        _nightEnd: function(times, h, m){
                if(h == times.nightEnd.getHours() && m == times.nightEnd.getMinutes()){
                        this._sendXpl(h, m, 'nightEnd', 'morning astronomical twilight starts');
                }
        },
        
        _night: function(times, h, m){
                if(h == times.night.getHours() && m == times.night.getMinutes()){
                        this._sendXpl(h, m, 'night', 'dark enough for astronomical observations');
                }
        },
        
        _goldenHourEnd: function(times, h, m){
                if(h == times.goldenHourEnd.getHours() && m == times.goldenHourEnd.getMinutes()){
                        this._sendXpl(h, m, 'goldenHourEnd', 'soft light, best time for photography');
                }
        },
        
        _goldenHour: function(times, h, m){
                if(h == times.goldenHour.getHours() && m == times.goldenHour.getMinutes()){
                        this._sendXpl(h, m, 'goldenHour', 'evening golden hour starts');
                }
        },
        
        sendSunlight: function(h, m){
            var self = this;
            if (typeof self.config !== 'undefined') {
                    var times = SunCalc.getTimes(new Date(), self.config.latitude, self.config.longitude);
                    self._solarNoon(times, h, m);
                    self._nadir(times, h, m);
                    self._sunrise(times, h, m);
                    self._sunriseEnd(times, h, m);
                    self._sunsetStart(times, h, m);
                    self._dawn(times, h, m);
                    self._dusk(times, h, m);
                    self._nauticalDawn(times, h, m);
                    self._nauticalDusk(times, h, m);
                    self._nightEnd(times, h, m);
                    self._night(times, h, m);
                    self._goldenHourEnd(times, h, m);
                    self._goldenHour(times, h, m);
            }
            else {
                self.sendNoConfig();
            }
        },
        
        sendConfig: function(body) {
                var self = this;                
                self.xpl.sendXplStat({
                        latitude:       body.latitude,
                        longitude:      body.longitude,
                        enable:         body.enable
                }, 'suncalc.config');
        },
        
        sendNoConfig: function() {
                var self = this;
                self.xpl.sendXplStat({
                        latitude:       '',
                        longitude:      '',
                        enable:         false
                }, 'suncalc.config');
        },
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                                self.sendNoConfig();
                        }
                        else {
                                self.config = JSON.parse(body);
                                self.sendConfig(self.config);
                        }
                });
        },
        
        writeConfig: function(body) {
                var self = this;
                fs.writeFile(self.configFile, JSON.stringify(body), function(err) {
                        if(err) {
                            self.sendNoConfig();
                        } else {
                            self.readConfig();
                        }
                }); 
        },
        
        validConfigSchema: function(body, callback) {
                var self = this;
                if (typeof(body.latitude) !== "string") {
                        return false;
                }
                if (typeof(body.longitude) !== "string") {
                        return false;
                }
                if (typeof(body.enable) !== "string") {
                        return false;
                }
                return true;
        }
        
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

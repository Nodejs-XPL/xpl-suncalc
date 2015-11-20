var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var SunCalc = require('suncalc');
var pjson = require('../package.json');

function wt(device, options) {	
	options = options || {};
	this._options = options;

	this.service_name = "bnz-suncalc."+os.hostname();
    this.schema = 'suncalc.config';
    
	options.xplSource = options.xplSource || this.service_name;
	
	this.xpl = new Xpl(options);
    this.hash =  {
            "config": {"version": pjson.version, "enable":true, "mode":"mono-instance", "lock":false, "nodemaster":"", "latitude": "45.441", "longitude": "4.39"},
            "data": []
	};
	
};

module.exports = wt;

var proto = {
    
        _init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }
                        self._sendXplTrig(self.hash.config, self.schema, '*'); // On informe les autres noeuds de ma présence
                        callback(null,  self.xpl);
                });

                // Send every minutes an xPL status message 
                setInterval(function(){
                        if(self.hash.config.enable) {
                                var date = new Date();
                                self.sendSunlight(date.getHours(), date.getMinutes());	
                        }
                }, 60 * 1000);
		
        },

        _log: function(log) {
            console.log('xpl-suncalc -', log);
        },

        _sendXplStat: function(body, schema, target) {
                var self = this;                
                self.xpl.sendXplStat(
                        body,
                        schema,
                        target
                );
        },
	
	   _sendXplTrig: function(body, schema, target) {
                var self = this;                
                self.xpl.sendXplTrig(
                        body,
                        schema,
                        target
                );
        },
        
        _send: function(h, m, status, info){
                var self = this;
                self.xpl.sendXplTrig({
                        type:       'suncalc',
                        status:     status,
                        time:       h+':'+m,
                        info:       info
                }, 'suncalc.basic', '*');
        },
        	
        /*
        * Un noeud maitr envoie une trame pour que je me reconfigure
        */	
        update_config_cmnd: function(message) {
            var self = this;
            self.hash.config.enable = (message.body.enable === "true") || (message.body.enable === true);
            self.hash.config.nodemaster = message.body.nodemaster;
            self.hash.config.latitude = message.body.latitude;
            self.hash.config.longitude = message.body.longitude;
            self._sendXplStat(self.hash.config, self.schema, message.header.source);
        },
	
        /*
         *  Plugin specifics functions
         */
        
        sendSunlight: function(h, m){
                var self = this;
                if (typeof self.hash.config !== 'undefined') {
                        var times = SunCalc.getTimes(new Date(), self.hash.config.latitude, self.hash.config.longitude);
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
        },
        
        _solarNoon: function(times, h, m){
                if(h == times.solarNoon.getHours() && m == times.solarNoon.getMinutes()){
                        this._send(h, m, 'solarNoon', 'sun is in the highest position');
                }
        },

        _nadir: function(times, h, m){
                if(h == times.nadir.getHours() && m == times.nadir.getMinutes()){
                        this._send(h, m, 'nadir', 'darkest moment of the night, sun is in the lowest position');
                }
        },

        _sunrise: function(times, h, m){
                if(h == times.sunrise.getHours() && m == times.sunrise.getMinutes()){
                        this._send(h, m, 'sunrise', 'top edge of the sun appears on the horizon');
                }
        },

        _sunriseEnd: function(times, h, m){
                if(h == times.sunriseEnd.getHours() && m == times.sunriseEnd.getMinutes()){
                        this._send(h, m, 'sunriseEnd', 'bottom edge of the sun touches the horizon');
                }
        },
        
        _sunsetStart: function(times, h, m){
                if(h == times.sunsetStart.getHours() && m == times.sunsetStart.getMinutes()){
                        this._send(h, m, 'sunsetStart', 'bottom edge of the sun touches the horizon');
                }
        },
        
        _dawn: function(times, h, m){
                if(h == times.dawn.getHours() && m == times.dawn.getMinutes()){
                        this._send(h, m, 'dawn', 'morning nautical twilight ends, morning civil twilight starts');
                }
        },
        
        _dusk: function(times, h, m){
                if(h == times.dusk.getHours() && m == times.dusk.getMinutes()){
                        this._send(h, m, 'dusk', 'evening nautical twilight starts');
                }
        },
        
        _nauticalDawn: function(times, h, m){
                if(h == times.nauticalDawn.getHours() && m == times.nauticalDawn.getMinutes()){
                        this._send(h, m, 'nauticalDawn', 'morning nautical twilight starts');
                }
        },
        
        _nauticalDusk: function(times, h, m){
                if(h == times.nauticalDusk.getHours() && m == times.nauticalDusk.getMinutes()){
                        this._send(h, m, 'nauticalDusk', 'evening astronomical twilight starts');
                }
        },
        
        _nightEnd: function(times, h, m){
                if(h == times.nightEnd.getHours() && m == times.nightEnd.getMinutes()){
                        this._send(h, m, 'nightEnd', 'morning astronomical twilight starts');
                }
        },
        
        _night: function(times, h, m){
                if(h == times.night.getHours() && m == times.night.getMinutes()){
                        this._send(h, m, 'night', 'dark enough for astronomical observations');
                }
        },
        
        _goldenHourEnd: function(times, h, m){
                if(h == times.goldenHourEnd.getHours() && m == times.goldenHourEnd.getMinutes()){
                        this._send(h, m, 'goldenHourEnd', 'soft light, best time for photography');
                }
        },
        
        _goldenHour: function(times, h, m){
                if(h == times.goldenHour.getHours() && m == times.goldenHour.getMinutes()){
                        this._send(h, m, 'goldenHour', 'evening golden hour starts');
                }
        }
        
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

var xplsuncalc = require("./lib/xpl-suncalc");

var wt = new xplsuncalc(null, {
	//xplSource: 'bnz-sysinfo.wiseflat'
});

wt._init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
        wt.readConfig();
        
        xpl.on("xpl:suncalc.config", function(evt) {
                if(evt.headerName == 'xpl-cmnd' && wt.validConfigSchema(evt.body)) wt.writeConfig(evt.body);
        }); 

        xpl.on("xpl:suncalc.request", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.readConfig();
        });

        /*xpl.on("xpl:suncalc.basic", function(evt) {
                if(evt.headerName == 'xpl-cmnd' && wt.validBasicSchema(evt.body)) wt.sendCommand(evt.body);
        });*/
        
        setInterval(function(){
                var date = new Date();
                wt.sendSunlight(date.getHours(), date.getMinutes());
        }, 60 * 1000);     
});


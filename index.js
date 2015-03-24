var xplsuncalc = require("./lib/xpl-suncalc");
var schema_Suncalcbasic = require('/etc/wiseflat/schemas/suncalc.basic.json');
var schema_Suncalcconfig = require('/etc/wiseflat/schemas/suncalc.config.json');

var wt = new xplsuncalc(null, {
	xplLog: false,
        forceBodySchemaValidation: false
});

wt._init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
	xpl.addBodySchema(schema_Suncalcbasic.id, schema_Suncalcbasic.definitions.body);
	xpl.addBodySchema(schema_Suncalcconfig.id, schema_Suncalcconfig.definitions.body);
	
        // Load config file into hash
        wt.readConfig();
        
        // Send every minutes an xPL status message 
        setInterval(function(){
                var date = new Date();
                wt.sendConfig();
                wt.sendSunlight(date.getHours(), date.getMinutes());
        }, 60 * 1000);
        
        xpl.on("xpl:suncalc.request", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.readConfig();
        });

        xpl.on("xpl:suncalc.config", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.writeConfig(evt.body);
        });

        xpl.on("xpl:suncalc.basic", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.sendSunlight(date.getHours(), date.getMinutes());
        });
});


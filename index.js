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

        xpl.on("xpl:suncalc.config", function(message) {
                if(message.headerName == 'xpl-cmnd') wt.update_config_cmnd(message);
        });
	
});


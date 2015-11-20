# xpl-suncalc

## Objective

Node JS layer to execute suncalc through xPL API

## Installation

    $ git clone https://github.com/wiseflat/xpl-suncalc.git
    $ npm update

## Usage

Start the service

    root@srv:~# node index.js

See the xPL message with a logger

    root@srv:~# xpl-logger -i eth0 -v --body class=suncalc
    Listening on 192.168.0.1:46881
    Sending on 192.168.0.255
    192.168.0.1:42764 [xpl-stat/suncalc.config: bnz-suncalc.srv -> * //false]
    suncalc.config
    {
    latitude=
    longitude=
    enable=false
    }

Send xpl-cmnd to add/update a configuration

    $ xpl-send -m cmnd -c suncalc.config latitude=45.429179 longitude=4.40272 enable=true

Then, xpl-suncalc write your configuration into a local json file and give you an answer with a suncalc.config schema
See the xPL message with a logger

    root@srv:~# xpl-logger -i eth0 -v --body class=suncalc
    Listening on 192.168.0.1:46881
    Sending on 192.168.0.255
    192.168.0.1:42764 [xpl-cmnd/suncalc.config: bnz-sender.srv -> * 45.429179/4.40272/true]
    suncalc.config
    {
    latitude=45.429179
    longitude=4.40272
    enable=true
    }
    192.168.0.1:42764 [xpl-stat/suncalc.config: bnz-suncalc.srv -> * 45.429179/4.40272/true]
    suncalc.config
    {
    latitude=45.429179
    longitude=4.40272
    enable=true
    }


Then, it returns an object with the following properties depending on your configuration file.

| Property        | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `sunrise`       | sunrise (top edge of the sun appears on the horizon)                     |
| `sunriseEnd`    | sunrise ends (bottom edge of the sun touches the horizon)                |
| `goldenHourEnd` | morning golden hour (soft light, best time for photography) ends         |
| `solarNoon`     | solar noon (sun is in the highest position)                              |
| `goldenHour`    | evening golden hour starts                                               |
| `sunsetStart`   | sunset starts (bottom edge of the sun touches the horizon)               |
| `sunset`        | sunset (sun disappears below the horizon, evening civil twilight starts) |
| `dusk`          | dusk (evening nautical twilight starts)                                  |
| `nauticalDusk`  | nautical dusk (evening astronomical twilight starts)                     |
| `night`         | night starts (dark enough for astronomical observations)                 |
| `nadir`         | nadir (darkest moment of the night, sun is in the lowest position)       |
| `nightEnd`      | night ends (morning astronomical twilight starts)                        |
| `nauticalDawn`  | nautical dawn (morning nautical twilight starts)                         |
| `dawn`          | dawn (morning nautical twilight ends, morning civil twilight starts)     |
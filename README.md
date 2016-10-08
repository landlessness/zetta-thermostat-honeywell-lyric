# Zetta Thermostat  Driver for Honeywell Lyric

## Install

```
$> npm install zetta-thermostat-honeywell-lyric-driver
```

## Usage

```javascript
var zetta = require('zetta');
var Thermostat = require('zetta-thermostat-honeywell-lyric-driver');

zetta()
  .use(Thermostat)
  .listen(1337)
```


var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var readline = serialport.parsers.readline;

var Xbee = module.exports = function (path, options, openImmediately, callback) {
  options = options || {};
  options.parser = readline("\r");
  return new SerialPort(path, options, openImmediately, callback);
};

Xbee.list = function () {
  serialport.list.apply(serialport, arguments);
};
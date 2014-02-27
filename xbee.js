var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var readline = serialport.parsers.readline;

var Xbee = module.exports = function (path, options, openImmediately, callback) {
  options = options || {};
  options.parser = readline("\r");
  var sp =  new SerialPort(path, options, openImmediately, callback);
  sp.once("open", function () {
    sp.write(new Buffer("Xbee on line!\n"));
  });
  return sp;
};

Xbee.list = function () {
  serialport.list.apply(serialport, arguments);
};
#!/usr/bin/env node
// hackerchat cli
var Xbee = require('./xbee')
var optimist = require("optimist");
var async = require("async");

/**
 * This program will setup an xbee 802.15.4 (series 1) to talk serially at 57600bps
 * which is the baud rate firmata likes. Currently it just prints system info.
 *
 * See http://www.ladyada.net/make/xbee/arduino.html
 * See http://ftp1.digi.com/support/documentation/90000982_L.pdf
 */

var args = optimist
  .alias("h", "help")
  .alias("h", "?")
  .options("portname", {
    alias: "p",
    describe: "Name of serial port."
  })
  .options("baud", {
    describe: "Baud rate.",
    default: 9600
  })
  .options("databits", {
    describe: "Data bits.",
    default: 8
  })
  .options("parity", {
    describe: "Parity.",
    default: "none"
  })
  .options("stopbits", {
    describe: "Stop bits.",
    default: 1
  })
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

if (!args.portname) {
  console.error("Serial port name is required. \n `-p /dev/PORTNAME` \n Use one of the following");
  Xbee.list(function(err, data){
    data.forEach(function(v){
      console.log("\t" + v.comName);
    });
    return process.exit(-1);
  });
  return;
}

var openOptions = {
  baudRate: args.baud,
  dataBits: args.databits,
  parity: args.parity,
  stopBits: args.stopbits
};

var port = new Xbee(args.portname, openOptions, false);
port.once("open", function () {
  console.log("connected to Xbee!");
});


// We get message, main screen turn on
port.on('data', function (buffer) {
  process.stdin.write("> " + buffer.toString());
});

process.stdin.on('data', function (message) {
  port.write(message);
});


port.open();


#!/usr/bin/env node
var dgram = require('dgram');

// Make a udp socket
var socket = dgram.createSocket('udp4');

// Listen on a port on all addresses.
socket.bind(31337, function () {
  socket.setBroadcast(true); // We intend to broadcast
});

// Let folks know what's up
socket.on('listening', function () {
  console.log("# Now listening on port 31337");
});

// We get message, main screen turn on
socket.on('message', function (buffer) {
  process.stdin.write("> " + buffer.toString());
});

process.stdin.write("# Sending messages to everyone port 31337\n");

process.stdin.on('data', function (message) {
  socket.send(message, 0, message.length, 31337, '255.255.255.255');
});
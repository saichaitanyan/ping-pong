/**
 * Main application file
 */

'use strict';

const express = require('express');
const config = require('../../environment/config');
const port = config.S1_PORT;
// Setup server
const app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
const server = require('http').Server(app);
const ioOut = require('socket.io-client');
const socket = ioOut.connect(`http://localhost:${config.MASTER_PORT}`);

socket.on('status', function (data) {
    console.log('>>>>', data);
    console.log('<<<<< Slave-1: Pong')
    sendPingMsg();
    socket.on('disconnected', () => {
        socket.emit('disconnect', { message: 'Slave-1' });
    });
});

const sendPingMsg = () => { socket.emit('reply', { message: 'Slave-1: Pong' }); }

// Start server
server.listen(port, function () {
    console.log('Slave-1 server listening on %d, in %s mode', port, app.get('env'));
});

// process.on('exit', () => {
//     console.log('S1 says Goodbye!');
//     sayGoodBye();
// });
if (process.platform === "win32") {
    require("readline")
        .createInterface({
            input: process.stdin,
            output: process.stdout
        })
        .on("SIGINT", function () {
            process.emit("SIGINT");
        });
}

process.on("SIGINT", function () {
    console.log('S1 says Goodbye!');
    // sayGoodBye();
    // graceful shutdown
    process.exit();
});

// process.on('SIGTERM', () => {
//     console.log('S1 says Goodbye!');
//     sayGoodBye();
// })

// Expose app
exports = module.exports = app;

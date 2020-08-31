/**
 * Main application file
 */

'use strict';

const express = require('express');
const logger = require('./logs');
const config = require('../../environment/config');
const port = config.MASTER_PORT;
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
const io = require('socket.io')(server);
const message = { message: 'Master: Ping' };
/** on connect to socket */
io.on('connection', function (socket) {
    // emti message to the connected sockets
    logger.info('>>>>', message);
    socket.emit('status', message);
    // listen for slaves health checks 
    socket.on('reply', (data) => {
        logger.info('<<<<' + JSON.stringify(data) + ' | socket ID ' + socket.id);
    });
    // listen for slave disconnet event
    socket.once('disconnect', () => {
        logger.info('/** Boom ' + socket.id + ' is disconnected **/');
    });
});

// Start server
server.listen(port, function () {
    logger.info('Master server listening on %d, in %s mode', port, app.get('env'));
    console.info('Master server listening on %d, in %s mode', port, app.get('env'));
});

/** on close server in windows */
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
/** close the process */
process.on("SIGINT", function () {
    logger.info('/** Master server is down! **/');
    process.exit();
});

// Expose app
exports = module.exports = app;

/* socket modules */

// import React from 'react';
import io from 'socket.io-client';

const socket = io.connect();

module.exports = {
	socket: socket,
};

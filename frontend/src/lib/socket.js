import { io } from 'socket.io-client'

let socket = null

function buildOptions(token) {
	const extraHeaders = token ? { Authorization: `Bearer ${token}` } : undefined
	return {
		transports: ['websocket'],
		autoConnect: true,
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
		auth: { token },
		extraHeaders
	}
}

export function getSocket() {
	if (socket) return socket
	const token = localStorage.getItem('token')
	socket = io('http://localhost:4000', buildOptions(token))
	// Helpful diagnostics
	socket.on('connect_error', (err) => {
		console.warn('Socket connect_error:', err?.message || err)
	})
	return socket
}

export function refreshSocketAuth() {
	if (!socket) return
	const token = localStorage.getItem('token')
	socket.auth = { token }
	if (socket.io && socket.io.opts) {
		socket.io.opts.extraHeaders = token ? { Authorization: `Bearer ${token}` } : undefined
	}
	if (socket.connected) {
		// Trigger a reconnect so server sees new auth
		socket.disconnect()
		socket.connect()
	}
}

export function disconnectSocket() {
	if (socket) {
		socket.disconnect()
		socket = null
	}
}



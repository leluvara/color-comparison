const os = require('os')

module.exports = {
	// local network IP of your device
	getIP: () => {
		const interfaces = os.networkInterfaces()
		for (const key in interfaces) {
			for (const a of interfaces[key]) {
				const IPv4 = typeof a.family === 'string' ? 'IPv4' : 4
				if (a.family === IPv4 && a.address !== '127.0.0.1' && !a.internal) {
					return a.address
				}
			}
		}
		return '0.0.0.0'
	},
	setPort: (argv) => {
		for (let flag of argv) {
			flag = flag.split('=')
			if (flag[0] === '--port') return flag[1]
		}
		return 8000
	}
}

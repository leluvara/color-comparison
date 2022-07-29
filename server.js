const path = require('path')
const express = require('express')
const WebSocketServer = require('ws').Server
const esbuild = require('esbuild')
const utils = require('./utils.js')

const app = express(),
	port = utils.setPort(process.argv),
	host = process.argv.includes('--host'),
	ws1 = new WebSocketServer({
		server: app.listen(port, 'localhost')
	}),
	ws2 = host
		? new WebSocketServer({
				server: app.listen(port, utils.getIP())
		  })
		: null

app.use(express.static(path.join(__dirname, 'public')))

esbuild
	.build({
		entryPoints: ['app.js'],
		outfile: 'public/index.js',
		bundle: true,
		target: 'es2015',
		watch: {
			onRebuild(error, result) {
				if (error) console.error('watch build failed:', error)
				else {
					console.log('watch build succeeded:', result)
					ws1.clients.forEach((client) => {
						if (client.readyState === 1) client.send()
					})
					if (host) {
						ws2.clients.forEach((client) => {
							if (client.readyState === 1) client.send()
						})
					}
				}
			}
		}
	})
	.then((result) => {
		console.log('esbuild watching...')
		console.log('---')
	})

console.log(`Server running at http://localhost:${port}`)
if (host) console.log(`Server running at http://${utils.getIP()}:${port}`)
console.log('---')

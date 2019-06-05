const http = require('http')
const serverHandle = require('../app')
const PORT = 8800

const server = http.createServer(serverHandle)

server.listen(PORT, () => {
	console.log(`server running at ${PORT}`)
})

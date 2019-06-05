const redis = require('redis')
const { REDIS_CONF } = require('../config/db')
const redisServer = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)

redisServer.on('error', err => {
	console.log(err)
})

function set(key, value) {
	if (typeof value === 'object') {
		value = JSON.stringify(value)
	}
	redisServer.set(key, value, redis.print)
}

function get(key) {
	return new Promise((resolve, reject) => {
		redisServer.get(key, (err, val) => {
			if (err) {
				console.log(err)
				reject(err)
				return
			}
			if (val == null) {
				resolve(null)
				return
			}
			try {
				resolve(JSON.parse(val))
			} catch (e) {
				resolve(val)
			}
		})
	})

}

module.exports = {
	set,
	get
}

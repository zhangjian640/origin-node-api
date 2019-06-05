const querystring = require('querystring')
const blogRouter = require('./src/router/blog')
const userRouter = require('./src/router/user')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')

const getCookieExpires = () => {
	const d = new Date()
	d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
	return d.toGMTString()
}
// 解析session
const SESSION_DATA = {}

// 处理post请求
const getPostData = req => {
	return new Promise((resolve, reject) => {
		if (req.method !== 'POST') {
			resolve({})
			return
		}
		if (req.headers['content-type'] !== 'application/json') {
			resolve({})
			return
		}
		let postData = ''
		req.on('data', chunk => {
			postData += chunk.toString()
		})
		req.on('end', () => {
			if (!postData) {
				resolve({})
				return
			}
			resolve(JSON.parse(postData))
		})
	})
}

const serverHandle = (req, res) => {
	// 记录access log
	access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

	// 设置返回数据格式
	res.setHeader('Content-type', 'application/json')

	// 将path挂载request上
	const url = req.url
	req.path = url.split('?')[0]

	// 解析query
	req.query = querystring.parse(url.split('?')[1])

	// 解析cookie
	req.cookie = {}
	const cookies = req.headers.cookie || ''
	cookies.split(';').forEach(item => {
		if (!item) {
			return
		}
		const arr = item.split('=')
		const key = arr[0].trim()
		const value = arr[1].trim()
		req.cookie[key] = value
	})

	// 解析cookie
	/*
	let needSetCookie = false
	let userId = req.cookie.userid
	if (userId) {
		if (!SESSION_DATA[userId]) {
			SESSION_DATA[userId] = {}
		}
	} else {
		needSetCookie = true
		userId = `${Date.now()}_${Math.random()}`
		SESSION_DATA[userId] = {}
	}
	req.session = SESSION_DATA[userId]
	*/
	let needSetCookie = false
	let userId = req.cookie.userid
	if (!userId) {
		needSetCookie = true
		userId = `${Date.now()}_${Math.random()}`
		// 初始化
		set(userId, {})
	}
	// 从redis获取session
	req.sessionId = userId
	get(req.sessionId).then(sessionData => {
		// resolve null 的情况
		if (sessionData == null) {
			set(req.sessionId, {})
			req.session = {}
		} else {
			req.session = sessionData
		}
		// 处理post data
		return getPostData(req)
	}).then(postData => {
		req.body = postData

		// 处理博客路由
		const blogResult= blogRouter(req, res)
		if (blogResult) {
			blogResult.then(blogData => {
				if (needSetCookie) {
					res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
				}
				res.end(JSON.stringify(blogData))
			})
			return
		}

		// 处理用户路由
		const userResult = userRouter(req, res)
		if (userResult) {
			userResult.then(userData => {
				if (needSetCookie) {
					res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
				}
				res.end(JSON.stringify(userData))
			})
			return
		}

		// 没有命中路由，返回404
		res.writeHead(404, {'Content-type': 'text/plain'})
		res.write('404 Not Found\n')
		res.end()
	})
}

module.exports = serverHandle


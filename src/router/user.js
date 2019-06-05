const {login, register} = require('../controller/user')
const {SuccessModel, ErrorModel} = require('../model/resModel')
const { set } = require('../db/redis')
const userRouter = (req, res) => {
	const method = req.method
	// 注册
	if (method === 'POST' && req.path === '/api/user/register') {
		const {username, password, realname} = req.body
		const result = register(username, password, realname)
		return result.then(loginData => {
			if (loginData.id) {
				// 设置session
				return new SuccessModel(loginData)
			}
			return new ErrorModel('该用户名已注册')

		})
	}

	// 登录
	if (method === 'POST' && req.path === '/api/user/login') {
		const {username, password} = req.body
		const result = login(username, password)
		return result.then(loginData => {
			if (loginData.username) {
				// 设置session
				req.session.username = loginData.username
				req.session.realname = loginData.realname
				// session存入redis
				set(req.sessionId, req.session)
				return new SuccessModel(loginData)
			}
			return new ErrorModel('用户名或密码错误')

		})
	}

	// 登录验证测试，测试cookie是否有username
	/*
	if (method === 'GET' && req.path === '/api/user/login-test') {
		if (req.session.username) {
			return Promise.resolve(new SuccessModel({
				session: req.session
			}))
		}
		return Promise.resolve(new ErrorModel('尚未登录'))
	}
	*/
}

module.exports = userRouter

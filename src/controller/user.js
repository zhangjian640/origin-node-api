const {exec, escape} = require('../db/mysql')
const { genPassword } = require('../utils/crypto')
function checkUser(username) {
	const sql = `select username from users where username=${username};`
	return exec(sql).then(rows => {
		return rows[0] || ''
	})
}

const register = (username, password, realname) => {
	username = escape(username)
	password = genPassword(password)
	password = escape(password)
	realname = escape(realname)
	return checkUser(username).then(res => {
		if (!res) {
			const sql = `insert into users (username, password, realname) values (${username}, ${password}, ${realname});`
			return exec(sql).then(res => {
				return {
					id: res.insertId
				}
			})
		} else {
			return Promise.resolve({id: ''})
		}
	})
}
const login = (username, password) => {
	// SQL注入攻击, 加入escape
	// var username = "lisi' --"
	username = escape(username)
	password = genPassword(password)
	password = escape(password)
	console.log(username)
	const sql = `select username, realname from users where username=${username} and password=${password};`
	return exec(sql).then(rows => {
		return rows[0] || {}
	})
}

module.exports = { login, register }

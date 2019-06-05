const { SuccessModel, ErrorModel } = require('../model/resModel')
const { getList, getDetail, newBlog, updateBlog, deleteBlog } = require('../controller/blog')

// 登录验证
const loginCheck = (req) => {
	if (!req.session.username) {
		return Promise.resolve(new ErrorModel('未登录'))
	}

}

const blogRouter = (req, res) => {
	const method = req.method
	const id = req.query.id || ''

	// 获取博客接口
	if (method === 'GET' && req.path === '/api/blog/list') {
		let author = req.query.author || ''
		const keyword = req.query.keyword || ''
		if (req.query.isadmin) {
			const loginCheckResult = loginCheck(req)
			if (loginCheckResult) {
				// 未登录
				return new ErrorModel('未登录')
			}
			author = req.session.username
		}
		const result = getList(author, keyword)
		return result.then(listData => {
			return new SuccessModel(listData)
		}).catch(err => {
			return new ErrorModel(err)
		})
	}

	// 获取博客详情
	if (method === 'GET' && req.path === '/api/blog/detail') {
		if (!id) {
			return new ErrorModel('id为空')
		}
		const loginCheckResult = loginCheck(req)
		if (loginCheckResult) {
			// 未登录
			return new ErrorModel('未登录')
		}
		const result = getDetail(id)
		return result.then(detailData => {
			return new SuccessModel(detailData)
		}).catch(err => {
			return new ErrorModel(err)
		})
	}

	// 新建博客
	if (method === 'POST' && req.path === '/api/blog/new') {
		const loginCheckResult = loginCheck(req)
		if (loginCheckResult) {
			// 未登录
			return new ErrorModel('未登录')
		}
		req.body.author = req.session.username
		const result = newBlog(req.body)
		return result.then(blogData => {
			return new SuccessModel(blogData)
		})
	}

	// 更新博客
	if (method === 'POST' && req.path === '/api/blog/update') {
		const loginCheckResult = loginCheck(req)
		if (loginCheckResult) {
			// 未登录
			return new ErrorModel('未登录')
		}
		const result = updateBlog(id, req.body)
		return result.then(res => {
			if (res) {
				return new SuccessModel()
			}
			return new ErrorModel('更新失败')
		})
	}

	// 删除博客
	if (method === 'POST' && req.path === '/api/blog/delete') {
		const loginCheckResult = loginCheck(req)
		if (loginCheckResult) {
			// 未登录
			return new ErrorModel('未登录')
		}
		const author = req.session.username
		const result = deleteBlog(id, author)
		return result.then(res => {
			if (res) {
				return new SuccessModel()
			}
			return new ErrorModel('删除失败')
		})
	}
}

module.exports = blogRouter

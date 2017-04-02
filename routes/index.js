var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var User = require('../models/user.js');

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登入');
		return res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/');
	}
	next();
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: '首页' });
});

router.post('/post', function(req, res, next) {
	res.render('index', { title: '首页' });
});

// registration
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
	res.render('reg', { title: '用户注册' });
});

router.get('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
	// check password input
	if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', '两次输入的口令不一致');
		return res.redirect('/reg');
	}

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password,
	});

	User.get(newUser.name, function(err, user) {
		if (user) {
			err = 'Username already exists.';
		}
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}

		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}

			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
});

// login
router.get('/login', checkNotLogin);
router.get('/login', function(req, res, next) {
	res.render('login', { title: '用户登入' });
});

router.get('/login', checkNotLogin);
router.post('/login', function(req, res, next) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('login');
		}
		if (user.password != password) {
			req.flash('error', '用户口令错误');
			return res.redirect('login');
		}
		req.session.user = user;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
});

// logout
router.get('/logout', checkLogin);
router.get('/logout', function(req, res, next) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
});

module.exports = router;

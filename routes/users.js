var express = require('express');
var router = express.Router();

var User = require('../models/user.js');
var Post = require('../models/post.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/:user', function(req, res, next) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}

		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			res.render('user',  {
				title: user.name,
				posts: posts,
			});
		});
	});
});

module.exports = router;

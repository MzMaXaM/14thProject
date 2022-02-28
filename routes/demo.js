const express = require('express'),
  bcrypt = require('bcryptjs'),
  db = require('../data/database'),
  router = express.Router(),
  log = (str, mod = 29) => {
    console.log(`\u001b[1;${mod}m ${str}` + "\u001b[0m")
    //mod codes
    //Text color
    //29-white, 30-grey, 31-red, 32-green, 33-yellow, 34-blue, 
    //35-purple,36-cyan
    //Bg color
    //39-white, 40-grey, 41-red, 42-green, 43-yellow, 44-blue, 
    //45-purple, 46-cyan

    //"\u001b[0m" would reset text
  }

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/signup', async function (req, res) {
  const
    userData = req.body,
    email = userData.email,
    confirmEmail = userData['confirm-email']
  password = userData.password

  if (
    !email ||
    !confirmEmail ||
    !password ||
    password.trim() < 5 ||
    email !== confirmEmail ||
    !email.includes('@')
  ) {
    log('Wrong data', 33)
    return res.redirect('/signup')
  }

  const
    hashPass = await bcrypt.hash(password, 5),
    user = {
      email: email,
      password: hashPass
    },
    userExist = await db.getDb().collection('users')
      .findOne({ email: email })

  if (userExist) {
    log('User with this email exists', 34)
    return res.redirect('/signup')
  }

  await db.getDb().collection('users').insertOne(user)

  res.redirect('/login')
});

router.post('/login', async function (req, res) {
  const
    userData = req.body,
    email = userData.email,
    password = userData.password,
    userExist = await db.getDb().collection('users')
      .findOne({ email: email })

  if (!userExist) {
    log(`Could not log in 
        user not found`, 33)
    return res.redirect('/login')
  }

  const passwordOk = await bcrypt.compare(
    password, userExist.password
  )

  if (!passwordOk) {
    log(`Could not log in 
        Password not correct!`, 33)
    return res.redirect('/login')
  }

  req.session.user = {
    id: userExist._id,
    email: userExist.email
  }
  req.session.isAuthenticated = true
  req.session.save(()=>{
    log('User authenticated', 36)
    res.redirect('/admin')
  })
});

router.get('/admin', function (req, res) {
  res.render('admin');
});

router.post('/logout', function (req, res) { });

module.exports = router;

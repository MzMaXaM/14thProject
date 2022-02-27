const express = require('express'),
  bcrypt = require('bcryptjs'),
  db = require('../data/database'),
  router = express.Router(),
  log = (str)=>{
    console.log(str)
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
    confirmEmail = userData['confirm-email'],
    password = userData.password,
    hashPass = await bcrypt.hash(password, 5),
    user = {
      email: email,
      password: hashPass
    }
  if (
    !email ||
    !confirmEmail ||
    !password ||
    password.trim() < 5 ||
    email !== confirmEmail ||
    !email.includes('@')
  ) {
    log('Wrong data')
    return res.redirect('/signup')
  }
  const userExist = await db.getDb().collection('users')
  .findOne({ email: email })
  if (userExist){
    log('User with this email exist')
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
        user not found`)
    return res.redirect('/login')
  }

  const passwordOk = await bcrypt.compare(
    password, userExist.password
  )

  if (!passwordOk) {
    log(`Could not log in 
        Password not correct!`)
    return res.redirect('/login')
  }

  log('User authenticated')
  res.redirect('/admin')
});

router.get('/admin', function (req, res) {
  res.render('admin');
});

router.post('/logout', function (req, res) { });

module.exports = router;
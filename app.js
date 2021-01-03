if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const methodOverride = require('method-override')
const flash = require('express-flash')
const session = require('express-session')
const initialisePassport = require('./passport-config')
initialisePassport(passport, email => {
  return users.find(user => user.email === email)
},
id => users.find(user => user.id === id )
)

const users = []



app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.get('/',checkAuthenticated,(req,res) => {
  res.render('index.ejs',
    {
      user: req.user.name
    }
  );
})

app.get('/login',checkNotAuthenticated, (req,res) => {
  res.render('login.ejs')
})

app.get('/register',checkNotAuthenticated, (req,res) => {
  res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated,async (req,res) => {
  try {
    const hashedPswd = await bcrypt.hash(req.body.password,10)
    users.push(
      {
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPswd
      }
    )
    res.redirect('/login')

  } catch{
    res.redirect('/register')
  }
  console.log(users);
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.delete('/logout',(req,res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  else{
    res.redirect('/login')
  }
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/')
  }
  else{
    next()
  }
}
app.listen(3000);

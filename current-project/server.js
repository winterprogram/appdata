if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const mongoose = require('mongoose')
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  mongoose.connect(process.env.DATABASE_URL , {useUnifiedTopology: true, useNewUrlParser: true })
  const db = mongoose.connection
  const { User } = require('./views/user')


  db.on('error',(error) => console.error(error))
  db.once('open',() => console.log("Connected"))
 

  
  app.set('view-engine', 'ejs')
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  mongoose.set('useCreateIndex', true)
  
  app.get('/', (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
  
  app.get('/login',  (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', (req , res )=>{
    try{
    User.findOne({'email':req.body.email}, (err , user)=> {
      if(!user) return res.json({message : 'login failed , user not found'})

      user.comparePassword(req.body.password , (err,isMatch)=> {
        if(err) throw err;
        if(!isMatch) return res.status(400).json({
          message:'Wrong password'
        });
        res.status(200).send('Logged in successfully')
      })
      
    })
  }catch{
    res.send('problem detected')
  }
  });
  
  app.get('/register', (req, res) => { 
    res.render('register.ejs')
  })
  
  app.post('/register', (req, res) => {
   
   const user = new User({
     name: req.body.name, 
     email: req.body.email,
     password: req.body.password
   }).save(/*(err , response)=>{
     if(err) res.status(400).send(err)
     res.status(200).redirect('/login')
     }*/).then(result=>{
       res.status(200).redirect('/login')
      /* res.status(200).json({
         message: 'user created'
       });*/
     }).catch(err =>{
       console.log(err);
       res.status(400).json({
         error: err
       });
     })
  })
  

  app.listen(3000)
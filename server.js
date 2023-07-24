const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

const database = {
    users: [
        {
            id : '123',
            name : 'John',
            email : 'john@gmail.com',
            password : 'Cookies@123',
            entries : 0,
            joined : new Date()
        },
        {
            id : '124',
            name : 'Sally',
            email : 'sally@gmail.com',
            password : 'bananas',
            entries : 0,
            joined : new Date()
        }
    ]
}

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,res) => {
    res.send(database.users);
})

app.post('/signin',(req,res) => {

    bcrypt.compare("pass", '$2a$10$.nAE0M/TSMzbhqJWK2lnsOPBF6Hj/PvCW6OC7UBeHbItTjrknS2By', function(err, res) {
        console.log('first guess', res);
    });
    bcrypt.compare("pass2", '$2a$10$v8ZFIGUCEYNHeERpEjbRsevWhyRW7ZeZTfJKVdhkxKi6g.4JizJcO', function(err, res) {
        console.log('second guess', res);
    });

    if (req.body.email === database.users[0].email && 
        req.body.password === database.users[0].password) {
      res.status(200).json('success');
    }
    else {
        res.status(400).json('error logging in');
    }
})

app.post('/register',(req,res) => {

    const {email , password , name} = req.body;

    bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash);
    });

    database.users.push({
        id : '125',
        name : name,
        email : email,
        entries : 0,
        joined : new Date()
    })
    res.json(database.users[database.users.length - 1])
})

app.get('/profile/:id', (req,res) => {

    const {id} = req.params;
    let found = false;

    database.users.forEach(user => {
       if(user.id === id) {
           found = true;
         return  res.json(user)
       }
    })
    if(!found) {
        res.status(400).json("user not found");
    }
})

app.put('/image', (req,res) => {

    const {id} = req.body;
    let found = false;

    database.users.forEach(user => {
       if(user.id === id) {
           found = true;
           user.entries++;
         return  res.json(user.entries);
       }
    })
    if(!found) {
        res.status(400).json("user not found");
    }
})

app.listen(3000);
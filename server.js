const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', 
      user : 'postgres', 
      password : 'password', 
      database : 'devclub' 
    }
});

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

    db.select('email' , 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid) {
            db.select('*').from('users')
            .where('email' , '=' , req.body.email)
            .then(user => {
                res.json('success login user')
            })
            .catch(err => res.status(400).json('unable to register user'))
        }
        else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))

})

app.post('/register',(req,res) => {

    const {email , password , name} = req.body;
    const hash = bcrypt.hashSync(password);
    
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
               email: loginEmail[0].email,
               name: name,
               joined: new Date()
           }).then((user => {
               res.json('success registering user')
           }))
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register user'))
})

app.get('/profile/:id', (req,res) => {

    const {id} = req.params;

    db.select('*').from('users').where({id})
    .then(user => {
        if(user.length) {
            res.json(user[0].id)
        }
        else {
            res.status(400).json('not found')
        }
    })
    .catch(err => res.status(400).json('error getting user'))
})


app.listen(3000);
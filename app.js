const express = require('express');
const mongoose = require('mongoose');
const app = express();

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')


const port = process.env.PORT || 5000;

//DB Config
const db = require('./config/keys').mongoURI;

//connect to mongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

//Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.get('/', (req, res) => {
    res.send('hello')
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})
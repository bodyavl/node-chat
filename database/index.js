
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
function connect()
{
    try {
        mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to mongodb')
    } catch (error) {
        console.log('Error occured: ', error.message);
    }
}

connect();
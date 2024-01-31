import { MongoClient } from 'mongodb';  //use to connect to database


let db;

async function connectToDb(cb) {
    const client = new MongoClient('mongodb://127.0.0.1:27017'); 
    await client.connect();
    db = client.db('react-blog-db'); // reference to database
    cb();
}

export {
    db,
    connectToDb,
}
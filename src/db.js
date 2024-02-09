import { MongoClient } from 'mongodb';  //use to connect to database


let db;

async function connectToDb(cb) {
    const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.pkriehl.mongodb.net/react-blog-db?retryWrites=true&w=majority`);
    await client.connect();
    db = client.db('react-blog-db'); // reference to database
    cb();
}

export {
    db,
    connectToDb,
}

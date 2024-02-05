import express from 'express';
import { db, connectToDb } from './db.js';

const app = express();

app.use(express.json());

// end point for loading article info from MongoDB
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;


    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.sendStatus(404);
    }
})


//Upvoting articles:
app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;

 
    await db.collection('articles').updateOne({ name }, {
        $inc: { upvotes: 1 },                              
    });
    
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send('The article doesn\'t exist.');
    }
});


// adding comments to articles: creating a new comment
app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { postedBy, text} = req.body;


    await db.collection('articles').updateOne({ name }, {
        $push: { comments: {postedBy, text} },
    })
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send('That article doesn\'t exist');
    }

})


// ensure server won't even start up until we have sccessfully connected to the database by wrapping app.listen in connectToDb()

connectToDb( () => {
    console.log('successfully connected to the database')
    app.listen(8000, () => {
        console.log('Server is listening on port 8000')
    });

})

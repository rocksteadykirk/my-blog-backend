import fs from 'fs';                  // to load credentials.json file
import admin from 'firebase-admin';
import express from 'express';
import { db, connectToDb } from './db.js';

// set up firebase admin package on server

// to load credentials.json file
const credentials = JSON.parse(                     
    fs.readFileSync('./credentials.json')
);

// use credentials to initialize firebase admin package on server and connect it to our firebase project
// Here we simply telling the firebase admin package what credentials to use to connect to our project
admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());

/* middleware function that is called before any other route handler.
It checks if the request has an auth_token in the header.
If it does, it verifies the token and adds the user to the request object. */
app.use(async (req, res, next) => {
    const { authtoken } = req.headers;
    if (authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        } catch (e) {
            return res.sendStatus(400);
        }
    }

    req.user = req.user || {};

    next();
});

// end point for loading article info from MongoDB
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;                   // id property on firebase users is called uid

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || [];                  // check if a user with this id has already updated this article.
        article.canUpvote = uid && !upvoteIds.includes(uid);
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

// add middleware that will apply to the pu and post route below
// Check if user exists and has include auth token with their request
app.use((req, res, next) => {
    if(req.user) {
        next();
    }else {
        res.sendStatus(401);
    }
});

//Upvoting articles:
app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || [];                  // check if a user with this id has already updated this article.
        const canUpvote = uid && !upvoteIds.includes(uid);
        
        if(canUpvote) {
            await db.collection('articles').updateOne({ name }, {
                $inc: { upvotes: 1 }, 
                $push: { upvoteIds: uid }                             
            });
        }
    
    const updatedArticle = await db.collection('articles').findOne({ name });

        res.json(updatedArticle);
    } else {
        res.send('The article doesn\'t exist.');
    }
});


// adding comments to articles: creating a new comment
app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const {text} = req.body;
    const { email } = req.user;


    await db.collection('articles').updateOne({ name }, {
        $push: { comments: {postedBy: email, text} },
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

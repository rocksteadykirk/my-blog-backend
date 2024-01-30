import express from 'express';

const app = express();

app.use(express.json());

// app.get('/hello/:name', (req, res) => {
//     const { name } = req.params;
//     res.send(`Hello ${name}!!`);
// })

// app.post('/hello', (req, res) => {
//     console.log(req.body);
//     res.send(`Hello ${req.body.name}`);
// })

let articlesInfo = [{
    name : 'learn-react',
    upvotes : 0,
},
{
    name : 'learn-node',
    upvotes : 0,
},
{
    name : 'learn-mongodb',
    upvotes : 0,
}]



//Upvoting articles:
app.put('/api/articles/:name/upvote', (req, res) => {
    const { name } = req.params;
    const article = articlesInfo.find(a => a.name === name);
    if (article) {
        article.upvotes += 1;
        res.send(`The ${name} article now has ${article.upvotes} upvotes.`)
    } else {
        res.send('The article doesn\'t exist.')
    }
});

app.listen(8000, () => {
    console.log('Server is listening on port 8000')
})


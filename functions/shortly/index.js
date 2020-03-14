const express = require('express')
const { Datastore } = require('@google-cloud/datastore');
const { base64encode, base64decode } = require('nodejs-base64')
const yearInTimeMillis = 31556952

// Creates a client
const datastore = new Datastore();

const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('app is listening')
})

app.use(express.json())

app.use(function (req, res, next) {
    console.log("before");
    next();
});


app.post("/shorturl", async (req, res, next) => {
    // The kind for the new entity
    const kind = 'ShortURL';

    // The name/ID for the new entity
    const name = base64encode(new Date().getTime()) + "";

    // The Cloud Datastore key for the new entity
    const surlKey = datastore.key([kind, name]);

    // Prepares the new entity
    const surl = {
        key: surlKey,
        data: {
            longurl: req.body.url,
            expireDate: new Date().getTime() + yearInTimeMillis,
            user: 'Unknown'
        },
    };

    try {
        // Saves the entity
        await datastore.save(surl);
        console.log(`Saved ${surl.key.name}: ${surl.data.longurl}`);
        req.surl = surl;
        res.status(201).send(surl)
    } catch (error) {
        console.log("error" + error)
        res.status(400).send()
    }
    next();
})

app.use(function (req, res, next) {
    console.log("after");
    console.log(req.surl)
    next();
});

module.exports = {
    app
};
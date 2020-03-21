
const express = require('express')
const { Datastore } = require('@google-cloud/datastore');
const { PubSub } = require('@google-cloud/pubsub');
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
    console.log("kind+name" + kind +"+"+name+"surlkey"+surlKey)
    // Prepares the new entity
    const surl = {
        key: surlKey,
        data: {
            longurl: req.body.url,
            shortURL: name,
            expireDate: new Date().getTime() + yearInTimeMillis,
            user: 'Unknown'
        },
    };
    console.log("surl=>"+surl)
    try {
        // Saves the entity
        await datastore.save(surl);
        console.log(`Saved ${surl.data.shortURL}: ${surl.data.longurl}`);
        req.surl = surl;
        res.status(201).send(surl.data)
    } catch (error) {
        console.log("error" + error)
        res.status(400).send()
    }
    next();
})

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

async function publishMessage(surl) {
  /**
   * TODO(developer): Uncomment the following lines to run the sample.
   */
const topicName = 'shorturl';

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(JSON.stringify(surl));

  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
}


app.use(function (req, res, next) {
    console.log("after");
    console.log(req.surl)
    publishMessage(req.surl).catch(console.error);
    next();
});

module.exports = {
    app
};

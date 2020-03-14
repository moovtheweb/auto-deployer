const express = require('express')
const { Datastore } = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();
console.log("DS connected => " + datastore);
const appred = express()
const port = process.env.PORT || 3000
console.log("port => " + port)
appred.listen(port, () => {
    console.log('app is listening')
})

appred.use(express.json())

appred.use(function (req, res, next) {
    console.log("before");
    next();
});

appred.get("/app/:shorturl",async (req,res,next)=>{
    console.log("shorturl ==> " + req.params.shorturl)
    const shorturl = req.params.shorturl

    try{
        //const surl = await ShortURL.findOne({shorturl:shorturl})
        const query = datastore.createQuery('ShortURL').filter('shortURL', '=', shorturl);
        const [surls] = await datastore.runQuery(query);
        console.log(surls+surls.length)
        if(!surls.length){
            return res.status(401).send()
        }
        console.log(surls[0].longurl)
        res.redirect("https://" + surls[0].longurl);
    } catch (e) {
        return res.status(500).send()
    }
    next();
})

appred.use(function (req, res, next) {
    console.log("after");
    console.log(req.surl)
    next();
});

module.exports = {
    appred
};

const express = require('express');
const app = express();
const dbQuery = require('./sql/query');
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
var url = require('./config.json');
const knox = require('knox');

app.use(require('body-parser').urlencoded({
    extended: false
}));

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }

});

const uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 20197152
    }
});




app.use(express.static(__dirname + '/public'));

app.get('/home', (req, res) => {


    dbQuery.getImages()
    .then((result) => {

        var dbImages = result.rows.map((item) => {
            item.image = url.s3Url + item.image;
            return item;
        });


        res.json({
            images: dbImages
        });
    }).catch((err) => {
        console.log(err);
    });
});


app.get('/home/:id', (req, res) => {
    console.log('getting');
    const imgID = req.params.id;
    console.log(imgID);

    dbQuery.getCommentsByImageId(imgID)
    .then((result) => {
        console.log(result.rows);
        res.json({
            comments: result.rows
        });

    })
    .catch((err) => {
        console.log(err);
    });

});


app.post('/home/:id', (req, res) => {

    const imgID = req.params.id;
    dbQuery.addComments(imgID, req.body.comment, req.body.username)
    .then(() => {
        return dbQuery.getCommentsByImageId(imgID);
    }).then((comments) => {
        console.log(comments);
        res.json({
            comments: comments.rows
        });

    }).catch((err) => {
        console.log(err);
    });
});


app.post('/upload', uploader.single('file'), uploadToS3, (req, res) => {

    if (req.file) {

        dbQuery.addImages(req.file.filename, req.body.username, req.body.title, req.body.description);

        res.json({
            success: true
        });
    } else {
        res.json({
            success: false
        });
    }
});

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets');
}
const client = knox.createClient({
    key: secrets.awsKey,
    secret: secrets.awsSecret,
    bucket: 'spicedling'
});

function uploadToS3(req, res, next) {

    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });


    const fs = require('fs');
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        res.json({
            success: wasSuccessful
        });

        if(wasSuccessful) {
            console.log(req.file.filename);
            next();
        }
    });

}



app.listen(8080, () => console.log('Listening'));

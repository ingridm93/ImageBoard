const spicedPg = require('spiced-pg');
const secrets = require('../secrets.json');

const db = spicedPg(`postgres:${secrets.dbuser}:${secrets.dbpassword}@localhost:5432/imageboard`);


module.exports.getImages = function (offset) {
    const select = `SELECT * FROM images ORDER BY created_at DESC`;
    const result  = db.query(select);
    return result;

};

module.exports.addImages = function (image, username, title, description) {
    console.log('adding images');
    const insert = `INSERT INTO images (image, username, title, description) VALUES ($1, $2, $3, $4)`;
    const result = db.query(insert, [image, username, title, description]);
    return result;

};


module.exports.addComments = function (image_id, comment, username) {
const insert = `INSERT INTO comments (image_id, comment, username) VALUES ($1, $2, $3)`;
const result = db.query(insert, [image_id, comment, username]);
return result;

};


module.exports.getImageById = function (id) {
    const select = `SELECT image ,username, title, description FROM images WHERE id = $1`;
    const result  = db.query(select, [id]);
    return result;

};

module.exports.getCommentsByImageId = function (image_id) {
    const select = `SELECT comment, username FROM comments WHERE image_id = $1`;
    const result = db.query(select, [image_id]);
    return result;
}

const mongoose = require('mongoose');
const db = require('./database');

const { Schema } = mongoose;

const listSchema = new Schema({
    pid: String,
    title: String,
    desc: String,
    preview: String,
    createTime: Number,
    updateTime: Number,
});

const ListModel = mongoose.model('list', listSchema);

module.exports = ListModel;

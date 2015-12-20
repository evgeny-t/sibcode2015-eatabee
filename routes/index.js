var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    fs = require('fs'),
    xmlParser = require('../modules/xml-parser.js');

var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var libxmljs = require("libxmljs");

var XmlStream = require('xml-stream');

var libxmljs = require("libxmljs");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/upload', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var file = files[Object.keys(files)[0]];

        fs.readFile(file.path, function(err, data) {
            xmlParser
                .parseXml(data.toString())
                .then(result => {
                    res.send(result);
                });
        });
        
        res.send('success');
    });
});

module.exports = router;
/* globals require, console, module, __dirname */

'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var uuid = require('uuid');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var _ = require('lodash');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use('/components',  express.static(__dirname + '/bower_components'));

app.use(logger('dev'));
app.use(cookieParser());

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var EatBeeParser = require('./parser/p.js');
var parser = new EatBeeParser();

app.post('/upload', multipartMiddleware, function (req, res) {    
  var file = req.files[Object.keys(req.files)[0]];
  // console.log(file);
  fs.readFile(file.path, function(err, content) {
    var i;
    var doc = new dom().parseFromString(content.toString());
    var nodes = xpath.select('//cell', doc);
    for (i = 0; i < nodes.length; ++i) {
      var values = xpath.select('value', nodes[i]);
      var data = values[0].firstChild.data.trim();
      if (data.startsWith('=')) {
        parser.addFormula(
          nodes[i].getAttribute('col') + nodes[i].getAttribute('row'), 
          data.substr(1));
      } else {
        parser.addValue(nodes[i].getAttribute('col') + 
          nodes[i].getAttribute('row'), data);
      }
    }

    for (i = 0; i < nodes.length; ++i) {
      var existed = xpath.select('displayedValue', nodes[i]);
      existed.forEach(e => {
        nodes[i].removeChild(e);
      });
      var ne = nodes[i].appendChild(doc.createElement('displayedValue'));
      var col = nodes[i].getAttribute('col');
      var row = nodes[i].getAttribute('row');
      ne.appendChild(doc.createTextNode(parser.compute(col + row)));
    }

    var id = uuid.v4();
    var result = doc.toString();
    fs.writeFile('/tmp/' + id, result, function(err) {
      if (err) {
        console.log(err);
      }
      res.send(id);
    });
  });
});

app.get('/download/:id', function(req, res) {
  fs.readFile('/tmp/' + req.params.id, function (err, data) {
    res.send(data);
  });
});

app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.get('/:id', function(req, res) {
  var context = { 
    title: 'Express',
    name: req.params.id,
  };
  res.render('table', context);
});

var DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function p2i(s) {
  var r=0;
  var c=1;
  for (var i=s.length-1; i>=0; i--) {
    r = r + DIGITS.indexOf(s[i])*c;
    c = c * 26;
  }
  return r;
}

app.get('/data/:id', function (req, res) {
  fs.readFile('/tmp/' + req.params.id, function (err, content) {
    var model = {};
    var doc = new dom().parseFromString(content.toString());
    var shs = xpath.select('//sheet', doc);
    shs.forEach(sheet => {
      var name = sheet.getAttribute('name');
      model[name] = {};
      var cc = [];
      var cells = xpath.select('cell', sheet);
      cells.forEach(cell => {
        var values = xpath.select('displayedValue', cell);
        var displayValue = values[0].firstChild.data.trim();
        values = xpath.select('value', cell);
        var actualValue = values[0].firstChild.data.trim();

        var col = p2i(cell.getAttribute('col'));
        var row = cell.getAttribute('row');
        cc.push({
          col: col, 
          row: row-1, 
          val: actualValue, 
          disp: displayValue 
        });
      });
      var maxcol = _.max(_.pluck(cc, 'col')) + 1;
      var maxrow = _.max(_.pluck(cc, 'row')) + 1;
      var rs=[];
      var actuals=[];
      _.times(maxrow, () => {
        var r=[];
        var actualRow=[];
        _.times(maxcol, () => {
          r.push('');
          actualRow.push(null);
        });
        rs.push(r);
        actuals.push(actualRow);
      });
      
      cc.forEach(cellinfo => {
        rs[cellinfo.row][cellinfo.col] = cellinfo.disp;
        actuals[cellinfo.row][cellinfo.col] = cellinfo.val;
      });

      model[name].data=rs;
      model[name].actuals=actuals;
    });

    res.send(model);
  });
});

module.exports = app;

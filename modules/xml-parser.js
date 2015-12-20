'use strict';

var xml2js = require('xml2js');
var EatBeeParser = require('../parser/p.js');

module.exports = {
	parseXml: parseXml
};

function parseXml (xmlObj) {
	return new Promise((resolve, reject) => {
	    var parser = new xml2js.Parser();

	    parser.parseString(xmlObj, function (err, result) {
	    	if (err) {
	    	    reject(err);
	    	}

	        modifyXmlObject(result);

	        var builder = new xml2js.Builder();

	        resolve(builder.buildObject(result));
	    });
	});
}

function modifyXmlObject (xmlObject) {
	var sheets = xmlObject.sheets.sheet;

	var cells = [];
	sheets.forEach(function (sheet) {
		sheet.cell.forEach(function (cell) {
			cells.push(cell);
		});
	});

	modifyCells(cells);
}

function modifyCells (cells) {
	var parser = new EatBeeParser();
	
	cells.forEach(function (cell) {
		let cellValue = cell.value[0];
		let cellKey = getCellKey(cell);

		if (cellValue.indexOf('=') === -1) {
		    parser.addValue(cellKey, cellValue);
		} else {
			parser.addFormula(cellKey, cellValue.substr(1,cellValue.length));
		}
	});

	cells.forEach(function (cell) {
		if (cell.displayValue) {
			cell.displayValue[0] = parser.compute(getCellValue(cell));
		} else {
			cell.displayValue = [parser.compute(getCellValue(cell))];		    
		}
	});
}

function getCellKey (cell) {
	return cell.$.col + cell.$.row;
}

function getCellValue (cell) {
	return cell.value[0].replace('=', '');
}
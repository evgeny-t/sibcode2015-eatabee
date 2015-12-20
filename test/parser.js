'use strict';

var xmlParser = require('../modules/xml-parser.js');
var assert = require('assert');
var fs = require('fs');

describe('parser', function() {

	describe('should parse whole exmple', () => {
		let xmlString;
	    	before(done => {
	    		fs.readFile('./test/examples/showcase.1.in.xml', function(err, data) {
	    			console.log(err);
	    		    xmlString = data.toString();
	    		    done();
	    		});
	    	});

	        it('should parse', () => {
	            return xmlParser.parseXml(xmlString);
	        });
	});

    describe('should parse no calculation elements', () => {
    	let xmlString;
    	let resultString;

    	before(done => {
    		fs.readFile('./test/examples/showcase.1.in _short.xml', function(err, data) {
    		    xmlString = data.toString();
    		    fs.readFile('./test/examples/showcase.1.out_short.xml', function(err, data) {
    		    	resultString = data.toString();
    		    	done();
    		    })
    		});
    	});

    	it('should parse', () => {
    	    return xmlParser
	    	    .parseXml(xmlString)
	    	    .then(res => {
	    	        assert(res, xmlString);
	    	    });
    	});
    });

    describe('should parse a little calculation elements', () => {
    	let xmlString;
    	let resultString;

    	before(done => {
    		fs.readFile('./test/examples/showcase.2.in.xml', function(err, data) {
    		    xmlString = data.toString();
    		    fs.readFile('./test/examples/showcase.2.out.xml', function(err, data) {
    		    	resultString = data.toString();
    		    	done();
    		    })
    		});
    	});

    	it('should parse', () => {
    	    return xmlParser
	    	    .parseXml(xmlString)
	    	    .then(res => {
	    	        assert(res, xmlString);
	    	    });
    	});
    });
});
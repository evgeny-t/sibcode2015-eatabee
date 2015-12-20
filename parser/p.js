'use strict';
/* globals require, module, console */

var re = /[A-Z]+\d+/g;
var _ = require('lodash');
// var util = require('util');
var vm = require('vm');
var esprima = require('esprima');
var escodegen = require('escodegen');

function findall(str) {
    var result = [];
    var myArray;
    while ((myArray = re.exec(str)) !== null) {
        result.push(myArray[0]);
    }
    return result;
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function makeFunc(value) {
    var vars = _.uniq(findall(value));
    console.log(`makeFunc: ${vars}`);
    vars.forEach(v => {
        value = replaceAll(value, v, `${v}()`);
    });
    return value;
}

function all(argument) {
    argument = argument.toLowerCase();
    var result = [];
    function _all(str, i) {
        if (i >= str.length) {
            result.push(str);
        } else {
            _all(str.substr(0, i) + str.charAt(i).toLowerCase() + str.substr(i + 1), i + 1);
            _all(str.substr(0, i) + str.charAt(i).toUpperCase() + str.substr(i + 1), i + 1);
        }
    }
    _all(argument, 0);
    return result;
}

var context = { 
    sqrt: x => Math.sqrt(x),
    sin: x => Math.sin(Math.PI / 180.0 * x),
    cos: x => Math.cos(Math.PI / 180.0 * x),
    abs: x => Math.abs(x),

    concat: (x,y) => x+y,
    equals: (x,y) => x===y?1:0,
    indexof: (x,y) => y.indexOf(x),
    substr: (x,start,len) => x.substr(start, len),
    replace: (where,what,rplcmnt) => replaceAll(where, what, rplcmnt),

    rand: () => Math.random(),
    degToRad: x => Math.PI / 180.0 * x,
    radToDeg: x => 180.0 / Math.PI * x,
    floor: x => Math.floor(x),
    ceil: x => Math.ceil(x),
};

// good enough for demo
var keys = _.keys(context);
keys.forEach(k => {
    var names = all(k);
    names.forEach(name => {
        context[name] = context[k];
    });
});

function EatBeeParser() {
    this._context = _.cloneDeep(context);
}



EatBeeParser.prototype.addFormula = function(name, value) {
    console.log(`adding formula ${name}='${value}'`);
    var that = this;

    var T = esprima.parse(value);
    value = escodegen.generate(walk(T.body[0].expression));

    value = makeFunc(value);
    console.log(`   '${value}'`);
    that._context[name] = () => {
        vm.runInContext(`__${name}=${value}`, that._context);
        return that._context[`__${name}`];
    };
};

EatBeeParser.prototype.addValue = function(name, value) {
    console.log(`adding value ${name}='${value}'`);
    var that = this;
    that._context[name] = () => value;
};

function walk (node) {
    // console.log('------------------------------');
    // console.log(node);
    if (node.type === 'BinaryExpression' && node.operator === '^') {
        return { 
            type: 'CallExpression',
            callee: 
            { 
                type: 'MemberExpression',
                computed: false,
                object: { type: 'Identifier', name: 'Math' },
                property: { type: 'Identifier', name: 'pow' } },
            arguments: [ 
                _.cloneDeep(walk(node.left)),
                _.cloneDeep(walk(node.right)) ] 
        };
    } else if (node.type === 'BinaryExpression') {
        return _.merge(node, {
            left: walk(node.left),
            right: walk(node.right)
        });
    } else if (node.type === 'CallExpression') {
        var newArgs = [];
        _.forEach(node.arguments, a => {
            newArgs.push(walk(a));
        });
        return _.merge(node, {
            arguments: newArgs
        });
    }

    return node;
}

EatBeeParser.prototype.compute = function(formula) {
    // console.log(`computing '${formula}'`);
    var that = this;

    var T = esprima.parse(formula);
    // console.log(T.body[0].expression);
    // return escodegen.generate(T.body[0].expression)
    formula = escodegen.generate(walk(T.body[0].expression));

    formula = makeFunc(formula);
    // console.log(`runInContext: ${formula}`);
    vm.createContext(that._context);
    vm.runInContext(`___=${formula}`, that._context);
    return that._context.___;
};

module.exports = EatBeeParser;

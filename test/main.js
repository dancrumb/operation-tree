'use strict';
var expect = require('chai').expect;
var logicTree = require('../src/main.js');
var _  = require('lodash');

var ops = {
    '+': function (a, b) {
        return a + '+' + b;
    },
    '.': function (a, b) {
        return a + '.' + b;
    },
    '!': function (a) {
        return '!' + a;
    },
    'bad': function (a, b, c) {
        return a+b+c;
    }
};
var vals = {
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'E': 'E'
};

/*
 var ops = {
 '+': function (a, b) {
 return a || b;
 },
 '.': function (a, b) {
 return a && b;
 },
 '!': function (a) {
 return !a;
 }
 };
 var vals = {
 'A': true,
 'B': false,
 'C': true,
 'D': false,
 'E': true
 };
 */

var testCases = [
    {
        actual: ['+',['A','B']],
        expected: 'A+B'
    },
    {
        actual: ['+',['A','C']],
        expected: 'A+C'
    },
    {
        actual: ['+',['D','B']],
        expected: 'D+B'
    },
    {
        actual: ['.',['A','B']],
        expected: 'A.B'
    },

    {
        actual: ['!',['+',['A','B']]],
        expected: '!A+B'
    },
    {
        actual: ['!',['A']],
        expected: '!A'
    },
    {
        actual: ['!', ['!', ['!',['A']]]],
        expected: '!!!A'
    },
    {
        actual: ['A'],
        expected: 'A'
    },
    {
        actual: ['+',['A','B','.',['C','D'],'E']],
        expected: 'A+B+C.D+E'
    },
    {
        actual: ['.',['A','A','A','B']],
        expected: 'A.A.A.B'
    },
    {
        actual: ['+',['A','.',['C','D']]],
        expected: 'A+C.D'
    },
    {
        actual: ['+',['.',['C','D'], 'A']],
        expected: 'C.D+A'
    }
];

describe('Converts nested array depictions of trees to RPN', function() {
    _.each(testCases, function (testCase) {
        it('correctly decodes ' + JSON.stringify(testCase.actual), function() {
            expect(logicTree.resolve(testCase.actual, ops, vals)).to.equal(testCase.expected);
        });
    });
});

describe('There are some limits to what this supports', function() {
    it('does not support ternary operations', function() {
        expect(function() {
            logicTree.resolve(['bad', ['A', 'B', 'C']], ops, vals);
        }).to.throw(/Only unary/);
    });
    it('only supports logical tree structures', function() {
        expect(function () {
            logicTree.resolve(['A', 'B'], ops, vals);
        }).to.throw(/Inconsistent tree structure/);
    })
});

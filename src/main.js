'use strict';
var _ = require('lodash');

var _decode;

var processUnaryOperator = function (op, rands, is, convert) {
    var decodeTree = _.partial(_decode, is, convert);
    var unaryRand = _.first(rands);

    if (is.operator(unaryRand)) {
        unaryRand = decodeTree([rands[0], rands[1]]);
    } else {
        if(!_.isEmpty(_.tail(rands))) {
            throw 'Too many operands passed to a unary operator!';
        }
        unaryRand = [convert(rands[0])];
    }
    return [op(unaryRand[0])];
};

var processBinaryOperator = function (op, rands, is, convert) {
    var decodeTree = _.partial(_decode, is, convert);

    return _.reduce(rands, function (result, rand) {
        if(result.length === 2  && is.operator(_.last(result))) {
            result = [_.first(result), decodeTree([_.last(result), rand])];
        } else {
            if(_.isArray(rand)) {
                result = result.concat([rand]);
            } else {
                result = result.concat(rand);
            }

        }

        while (result.length > 1 && !is.operator(_.last(result))) {
            var possibleOp = result[0];
            var possibleRands = result[1];
            if(is.operator(possibleOp)) {
                result = decodeTree([possibleOp, possibleRands]).concat(result.slice(2));
            } else {
                result = [op(decodeTree([possibleOp])[0], decodeTree([possibleRands])[0])];
            }
        }

        return result;

    }, []);
};

var handleOperator = function (tree, convert, is) {
    var op = convert(tree[0]);
    var rands = tree[1];
    var handler;

    if (op.length === 1) {
        handler = processUnaryOperator;
    } else if (op.length === 2) {
        handler = processBinaryOperator;
    } else {
        throw 'Only unary and binary operators are supported - ' + op;
    }

    return handler(op, rands, is, convert);
};


_decode = function (is, convert, tree) {
    if (tree.length === 1) {
        return [convert(tree[0])];
    } else if (tree.length === 2 && is.operator(tree[0])) {
        return handleOperator(tree, convert, is);
    } else {
        throw 'Inconsistent tree structure: ' + tree;
    }
};

var _reduceTree = function (tree, operations, values) {
    var is = {
        operator: function (opName) {
            return _.has(operations || {}, opName);
        },
        value: function (valName) {
            return _.has(values || {}, valName);
        }
    };

    var convert = function (value) {
        if(_.isString(value)) {
            if (is.operator(value)) {
                return operations[value];
            } else if (is.value(value)) {
                return values[value];
            } else {
                return value;
            }
        } else {
            return value;
        }
    };

    return _decode(is, convert, tree);

};

var _module = {
    resolve: function (tree, operations, values) {
        return _reduceTree(tree, operations, values)[0];
    }
};

module.exports = _module;

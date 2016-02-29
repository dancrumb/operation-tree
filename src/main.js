'use strict';
var _ = require('lodash');

var processUnaryOperator = function (unaryOperator, operands, is, convert) {
    var decodeTree = _.partial(_decode, is, convert);
    var unaryRand;

    if (is.operator(_.first(operands))) {
        unaryRand = decodeTree([_.first(operands), _.last(operands)]);
    } else {
        if(!_.isEmpty(_.tail(operands))) {
            throw 'Too many operands passed to a unary operator!';
        }
        unaryRand = decodeTree([_.first(operands)]);
    }
    return [unaryOperator(unaryRand[0])];
};

var reduceBinaryOperands = function (binaryOperator, result, is, decodeTree) {
    while (result.length > 1 && !is.operator(_.last(result))) {
        var possibleOp = result[0];
        var possibleoperands = result[1];
        if (is.operator(possibleOp)) {
            result = decodeTree([possibleOp, possibleoperands]).concat(result.slice(2));
        } else {
            result = [binaryOperator(decodeTree([possibleOp])[0], decodeTree([possibleoperands])[0])];
        }
    }
    return result;
};

var gatherOperands = function (result, is, decodeTree, operand) {
    if (result.length === 2 && is.operator(_.last(result))) {
        result = [_.first(result), decodeTree([_.last(result), operand])];
    } else {
        if (_.isArray(operand)) {
            result = result.concat([operand]);
        } else {
            result = result.concat(operand);
        }

    }
    return result;
};

var processBinaryOperator = function (binaryOperator, operandList, is, convert) {
    var decodeTree = _.partial(_decode, is, convert);

    return _.reduce(operandList, function (accumulator, operand) {
        var operands = gatherOperands(accumulator, is, decodeTree, operand);
        return reduceBinaryOperands(binaryOperator, operands, is, decodeTree);
    }, []);
};

var handleOperator = function (tree, convert, is) {
    var op = convert(tree[0]);
    var operands = tree[1];
    var handler;

    if(operands.length === 0) {
        throw 'Invalid tree structure';
    }
    if (op.length === 1) {
        handler = processUnaryOperator;
    } else if (op.length === 2) {
        handler = processBinaryOperator;
    } else {
        throw 'Only unary and binary operators are supported - ' + op;
    }

    return handler(op, operands, is, convert);
};


var _decode = function (is, convert, tree) {
    if (tree.length === 1 && !is.operator(tree[0])) {
        return [convert(tree[0])];
    } else if (tree.length === 2 && is.operator(tree[0])) {
        return handleOperator(tree, convert, is);
    } else {
        throw 'Invalid tree structure: ' + tree;
    }
};

var _reduceTree = function (tree, operations, values) {
    var is = {
        operator: function (opName) {
            return _.has(operations, opName);
        },
        value: function (valName) {
            return _.has(values, valName);
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

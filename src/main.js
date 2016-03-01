'use strict';
var _ = require('lodash');

var isOperator;

var processUnaryOperator = function (unaryOperator, operands, decode) {
    var unaryOperand;

    if (isOperator(_.first(operands))) {
        unaryOperand = decode([_.first(operands), _.last(operands)]);
    } else {
        if(!_.isEmpty(_.tail(operands))) {
            throw 'Too many operands passed to a unary operator!';
        }
        unaryOperand = decode([_.first(operands)]);
    }
    return unaryOperator(unaryOperand);
};

var canBeReduced = function (operands) {
    return _.isArray(operands) && operands.length > 1 && !isOperator(_.last(operands));
};

/*
 * Take a list of operands and apply the binary operator to it as many times as we can to reduce
 * that list as much as possible
 */
var reduceBinaryOperands = function (binaryOperator, operands, decode) {
    while (canBeReduced(operands)) {
        var possibleoperands = operands[1];
        if (isOperator(_.first(operands))) {
            operands = [decode([_.first(operands), possibleoperands])].concat(operands.slice(2));
        } else {
            if(operands.length > 2) {
                throw 'Invalid tree structure: ' + operands;
            }
            operands = binaryOperator(decode(_.first(operands)), decode(possibleoperands));
        }
    }
    return operands;
};



var gatherOperands = function (inOperands, operand, decode) {
    var outOperands;
    if(!_.isArray(inOperands)) {
        outOperands = [inOperands, operand];
    } else if (inOperands.length === 2 && isOperator(_.last(inOperands))) {
        outOperands = [_.first(inOperands), decode([_.last(inOperands), operand])];
    } else {
        if (_.isArray(operand)) {
            outOperands = inOperands.concat([operand]);
        } else {
            outOperands = inOperands.concat(operand);
        }
    }
    return outOperands;
};

var processBinaryOperator = function (binaryOperator, operandList, decode) {
    return _.reduce(operandList, function (accumulator, operand) {
        var operands = gatherOperands(accumulator, operand, decode);
        return reduceBinaryOperands(binaryOperator, operands, decode);
    }, []);
};

var getOperatorProcessor = function (opFunction) {
    var arity = opFunction.length;

    if (arity === 1) {
        return processUnaryOperator;
    } else if (arity === 2) {
        return processBinaryOperator;
    }

    throw 'Only unary and binary operators are supported - ' + opFunction;
};

var handleOperator = function (opName, operands, decode) {
    var opFunction = decode(opName);
    var processor = getOperatorProcessor(opFunction);
    return processor(opFunction, operands, decode);
};


var decodeTreeBranch = function (convert, opTreeBranch) {
    var head = _.first(opTreeBranch);
    var last = _.last(opTreeBranch);

    if(_.isString(opTreeBranch)) {
        return convert(opTreeBranch);
    } else if (opTreeBranch.length === 1 && !isOperator(head)) {
        return convert(head);
    } else if (opTreeBranch.length === 2 && isOperator(head)) {
        if(last.length === 0) {
            throw 'Invalid tree structure';
        }
        return handleOperator(head, last, _.partial(decodeTreeBranch, convert));
    } else {
        throw 'Invalid tree structure: ' + opTreeBranch;
    }
};

module.exports = {
    resolve: function (tree, operations, values) {

        isOperator = _.partial(_.has, operations);

        var convert = function (value) {
            if(_.isString(value)) {
                if (isOperator(value)) {
                    return operations[value];
                } else if (_.has(values, value)) {
                    return values[value];
                } else {
                    return value;
                }
            } else {
                return value;
            }
        };

        return decodeTreeBranch(convert, tree);
    }
};

# Operation Tree
[![npm package](https://nodei.co/npm/operation-tree.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/operation-tree/)

[![license](https://img.shields.io/npm/l/operation-tree.svg)](http://opensource.org/licenses/MIT)
[![github-issues](https://img.shields.io/github/issues/dancrumb/operation-tree.svg)](https://github.com/dancrumb/operation-tree/issues)
[![Build Status](https://travis-ci.org/dancrumb/operation-tree.svg?branch=master)](https://travis-ci.org/dancrumb/operation-tree)
[![Code Climate](https://codeclimate.com/repos/56d3cc59404c1a005f00e867/badges/3d219a32c90b3723e25d/gpa.svg)](https://codeclimate.com/repos/56d3cc59404c1a005f00e867/feed)
[![Test Coverage](https://codeclimate.com/repos/56d3cc59404c1a005f00e867/badges/3d219a32c90b3723e25d/coverage.svg)](https://codeclimate.com/repos/56d3cc59404c1a005f00e867/coverage)

So, sometimes, when you're working on a design, you end up with
a tree representation of a series of operations.

For instance, the expression `A || B || (C && D)` might be represented
as:

<pre>
or
|
+ - A
|
+ - B
|
+ - and
    |
    + - C
    |
    + - D
</pre>

From this graphical representation, we can make an array representation:

```
[ 'or', ['A', 'B', 'and', ['C', 'D']]]
```

This module provides a method `resolve`, which takes a tree array and resolves
it to a final value.

## Install

```sh
npm install operation-tree
```

## Usage
To keep things simple, operators are kept out of the tree. Values can also be kept
out of the tree, if desired.
As such, you need to pass in a map of operator and operand values. Any values
 that are not in the map can be placed in the tree explicitly.
For the tree above, you might use:

```
var tree = [ 'or', ['A', 'B', 'and', ['C', 'D']]];
var operators = {
    'and': function (a, b) {
        return a && b;
    },
    'or': function (a, b) {
        return a || b;
    }
};
var vals = {
    'A': true,
    'B': false,
    'C': false,
    'D': true
};

operationTree.resolve(tree, operators, values) === false;
```

## Caveats
Operator functions must explicitly declare their parameters, since that's the only
way for this module to determine if they are binary or unary operators.

## Author

Dan Rumney <dancrumb@gmail.com> https://github.com/dancrumb

## License

- **MIT** : http://opensource.org/licenses/MIT

## Contributing

Contributions are highly welcome!

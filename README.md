# Operation Tree

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

# Usage
To keep things simple, operators and operand values are kept out of the tree.
As such, you need to pass in a map of operator and operand values. Thus
for the tree above, you might use:

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

operationTree(tree, operators, values) === false;
```
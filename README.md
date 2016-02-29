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


# Threads! #
This is a WIP procedural art project written using Typescript and HTML 5 Canvas.
Webpack is used to bundle code and facilitate writing clean modules.

This projects implements the Wave Function Collapse algorithm on a hexagonal grid to generate line art.

You can access a live deployment at https://spinycucumber.github.io/threads2.

I've also compiled some cool-looking results in the [samples](samples) folder.

### Development ###
To set up the dev environment, run ```npm install```

The project can be ran locally by using ```npm run serve```

## How it (briefly) works ###
The input to the program is a set of "pieces," each of which define up to 6 connections and a relative frequency. 0 connections corresponds to the "empty" piece,
and 6 connections corresponds to a piece which is connected to all of its neighbors. A piece may only appear next to another piece only if they both have a connection
along the edge they share OR both do not have a connection. The set of pieces is converted into a set of tiles and adjacency rules, which are fed into the WFC algorithm.
The WFC algorithm also takes a set of "constraints" which apply additional restrictions to the grid. One use is disallowing outward-facing connections in cells at the
edge of the grid to make the border more obvious.

Rarely, the program will reach a state where it is impossible to complete the grid because a cell has no remaining possible tiles. (I.e. all possible tiles have been
disallowed by neighbors.) This is unfortunately the nature of the WFC algorithm. However, certain sets of pieces are much more stable than others, so these situations
are possible to mitigate. (I plan on making it more obvious when this happens in the future, but as of right now, only a console error is output.)
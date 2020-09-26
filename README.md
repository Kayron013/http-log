# HTTP Log Monitor

`by Angel Campbell`

Environment: node v12.18.2 -- typescript v4.0.3

## Instructions

Install Dependencies:

```bash
npm install
```

Run Tests:

```bash
npm run test
```

Build and run program:

```sh
npm start
```

## Reflection

I thought about whether using a linked list might be more efficient than an array since I wouldn't have to shift elements, but I believe an array is best, because the `Logger` performs index-based lookups more often than it has to shift the array of `Bucket`s.

I did a bit of data aggregation, but there's much more that could be done, such as displaying error codes and what path they occured on, as well as what paths might be being abused by excessive requestors.

I abstracted out a lot of the time-based logic, making it easy to set how many logs to track at a time (currently 2min), how to group logs for reports (currently 10sec) as well as what defines "excessive" for overall traffic and for requests from an IP. These variables are defined as static attributes, but could very well have been made configurable instance variables, via a constructor, to allow multiple `Logger`s to be used with different configurations.

Currently the program outputs information by directly printing to standard output. The output stream could be parameterized to fascilitate sending the output to other destinations.

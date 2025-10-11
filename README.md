# @3sln/bones

> [!WARNING]
> This is a work-in-progress project and is not yet ready for production use.

Bones is a "batteries" utility library for the [Dodo](https://github.com/3sln/dodo) virtual DOM engine. It provides a collection of configurable tools to accelerate the development of modern web applications.

The library is built with a factory-based architecture. Instead of importing pre-configured components, you "bake" them yourself by passing your application's `dodo` instance to a `bones` factory. This ensures that all components use the exact same `dodo` instance, eliminating potential versioning and state conflicts.

For a complete guide please check out our [card deck](https://bones.3sln.com).

## Installation

```bash
npm install @3sln/bones @3sln/dodo
```
or
```bash
bun add @3sln/bones @3sln/dodo
```
or
```bash
yarn add @3sln/bones @3sln/dodo
```
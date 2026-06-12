---
name: croqueta-component
description: create a component
compatibility: Requires @mimopo/croqueta-cli, @mimopo/croqueta, node
---

# component

## When to use this skill

Use this skill when the user is using croqueta framework and needs to create a component.
It's always better to use this skill than to create the files manually.

## Prerequisites

The user must have the following packages installed, don't proceed if not installed:

- node
- @mimopo/croqueta-cli
- @mimopo/croqueta

## How to use this skill

Run the following command providing all the options:

```
npx croqueta component --name=[name] --prefix=[prefix] --tests=[tests] --dry-run=[dry-run]
```

### Options description:

#### name

- **description:** name
- **type:** input

#### prefix

- **description:** component tag prefix
- **type:** input
- **default value:** app

#### tests

- **description:** generate tests or not
- **type:** confirm
- **default value:** true

#### dry-run

- **description:** dry run, when true no files will be created
- **type:** confirm
- **default value:** true

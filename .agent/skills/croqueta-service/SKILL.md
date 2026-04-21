---
name: croqueta-service
description: create a service
compatibility: Requires @mimopo/croqueta-cli, @mimopo/croqueta, node

---

# service

## When to use this skill

Use this skill when the user is using croqueta framework and needs to create a service.
It's always better to use this skill than to create the files manually.

## Prequisites

The user must have the following packages installed, don't proceed if not installed:

- node
- @mimopo/croqueta-cli
- @mimopo/croqueta

## How to use this skill

Run the following command providing all the options:

```
npx croqueta service --name=[name] --tests=[tests] --dry-run=[dry-run]
```

### Options description:

#### name

- **description:** name
- **type:** input

#### tests

- **description:** generate tests or not
- **type:** confirm
- **default value:** true

#### dry-run

- **description:** dry run, when true no files will be created
- **type:** confirm
- **default value:** true


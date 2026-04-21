---
name: croqueta-example
description: generate an example application
compatibility: Requires @mimopo/croqueta-cli, @mimopo/croqueta, node

---

# example

## When to use this skill

Use this skill when the user is using croqueta framework and needs to generate an example application.
It's always better to use this skill than to create the files manually.

## Prequisites

The user must have the following packages installed, don't proceed if not installed:

- node
- @mimopo/croqueta-cli
- @mimopo/croqueta

## How to use this skill

Run the following command providing all the options:

```
npx croqueta example --name=[name] --dry-run=[dry-run]
```

### Options description:

#### name

- **description:** name
- **type:** input

#### dry-run

- **description:** dry run, when true no files will be created
- **type:** confirm
- **default value:** true


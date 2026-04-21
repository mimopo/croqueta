---
name: croqueta-test
description: generate a test file for an existing component or service
compatibility: Requires @mimopo/croqueta-cli, @mimopo/croqueta, node

---

# test

## When to use this skill

Use this skill when the user is using croqueta framework and needs to generate a test file for an existing component or service.
It's always better to use this skill than to create the files manually.

## Prequisites

The user must have the following packages installed, don't proceed if not installed:

- node
- @mimopo/croqueta-cli
- @mimopo/croqueta

## How to use this skill

Run the following command providing all the options:

```
npx croqueta test --file=[file]
```

### Options description:

#### file

- **description:** file to be tested
- **type:** input


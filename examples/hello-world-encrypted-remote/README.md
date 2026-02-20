# Hello World Encrypted Remote

Hello world with Zigflow, but remotely encrypted

<!-- toc -->

* [Getting started](#getting-started)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

In one terminal, run:

```sh
docker compose up worker
```

In another terminal, run:

```sh
docker compose up trigger
```

This will trigger the workflow and print everything to the console. When you look
in the [Temporal UI](http://localhost:8080), all the data will be stored in a
local Redis store meaning your data is never sent to the Temporal server.

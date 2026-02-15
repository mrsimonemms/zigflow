# Zigflow: A Temporal DSL for Declarative Workflows

[![Zigflow](./designs/zigflow.png "Zigflow")](https://zigflow.dev?utm_source=github&utm_medium=readme&utm_campaign=header)

[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-green.svg?style=flat)](https://github.com/mrsimonemms/zigflow/issues)
[![Licence](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/mrsimonemms/zigflow/blob/master/LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/mrsimonemms/zigflow?label=Release)](https://github.com/mrsimonemms/zigflow/releases/latest)
[![Go Report Card](https://goreportcard.com/badge/github.com/mrsimonemms/zigflow)](https://goreportcard.com/report/github.com/mrsimonemms/zigflow)

**Zigflow is a Temporal DSL** — a domain-specific language for defining and running
[Temporal](https://temporal.io) workflows declaratively.

Zigflow provides a **simple and declarative way** to define and manage
[Temporal](https://temporal.io) workflows using a **Temporal DSL** built upon the
[CNCF Serverless Workflow](https://serverlessworkflow.io) specification.

---

## 🧠 What is a Temporal DSL?

A **Temporal DSL** is a domain-specific language that allows workflows to be
defined declaratively, rather than imperatively in application code.

Zigflow’s Temporal DSL compiles declarative workflow definitions into fully
featured Temporal workflows, giving you the reliability, retries, and state
management of Temporal without requiring SDK boilerplate.

---

## 🛟 Help

* [Homepage](https://zigflow.dev?utm_source=github&utm_medium=readme&utm_campaign=help)
* [Helm chart](https://github.com/mrsimonemms/zigflow/tree/main/charts/zigflow)
* [Documentation](https://zigflow.dev/docs?utm_source=github&utm_medium=readme&utm_campaign=help)
* [Slack Community](https://slack.zigflow.dev)

---

## ✨ Features

* ✅ **Temporal DSL** – declarative workflow definitions that compile to Temporal
  workflows
* ✅ **CNCF Standard** – fully aligned with Serverless Workflow v1.0+
* ✅ **Low-code & Visual-ready** – ideal for UI workflow builders and orchestration
  tools
* ✅ **Powered by Temporal** – battle-tested reliability, retries, and state management
* ✅ **Kubernetes-native** – includes a Helm chart for easy deployment
* ✅ **Open & Extensible** – customize, extend, and contribute easily

---

## ⚡️ ZigFlow?

Ziggy is a tardigrade and [Temporal's official mascot](https://temporal.io/blog/temporal-in-space).
They're a microscopic animal that is [basically indestructible](https://en.wikipedia.org/wiki/Environmental_tolerance_in_tardigrades).

Sound familiar?

---

## 🧩 Example

> [!TIP]
> There is a runnable version of this in [examples/hello-world](./examples/hello-world)

Below is an example workflow written using the Zigflow **Temporal DSL**:

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow # Mapped to the task queue
  name: hello-world # Workflow type
  version: 1.0.0
do:
  - set:
      output:
        as:
          data: ${ . }
      set:
        message: Hello from Ziggy
```

Run it through Zigflow:

```bash
zigflow -f ./path/to/workflow.yaml
```

This builds your Temporal workflow and runs the workers — no additional Go
boilerplate required.

You can now run it with any [Temporal SDK](https://docs.temporal.io/encyclopedia/temporal-sdks),
in the [Temporal UI](https://docs.temporal.io/web-ui#workflow-actions) or from
the [Temporal CLI](https://docs.temporal.io/cli/workflow#start).

* [**Task Queue**](https://docs.temporal.io/task-queue): `zigflow`
* [**Workflow Type**](https://docs.temporal.io/workflows#intro-to-workflows):
  `hello-world`

---

## 📈 Telemetry

Telemetry helps us understand if people are actually using Zigflow. Stars are
great, but a tiny bit of usage data gives us a clearer picture of what’s happening
out there.

Zigflow creates a UUID (stored in `~/.config/zigflow`) and sends just two things:

* that anonymous ID
* the Zigflow version you’re running

That's it.

Telemetry is optional and easy to turn off. You can disable it by setting the
environment variable:

```sh
DISABLE_TELEMETRY=true
```

or by running Zigflow with:

```sh
--disable-telemetry
```

---

## 🧭 Related Projects

Zigflow is an open-source **Temporal DSL** designed to make workflow authoring
simpler, more visual, and easier to share.

* [Temporal](https://temporal.io)
* [CNCF Serverless Workflow](https://serverlessworkflow.io)
* [Helm Chart Repository](./charts/zigflow)

---

## 🤝 Contributing

Contributions are welcome!

### Open in a container

* [Open in a container](https://code.visualstudio.com/docs/devcontainers/containers)

### Commit style

All commits must be done in the [Conventional Commit](https://www.conventionalcommits.org)
format.

```git
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## ⭐️ Contributors

<a href="https://github.com/mrsimonemms/zigflow/graphs/contributors">
  <img alt="Contributors"
    src="https://contrib.rocks/image?repo=mrsimonemms/zigflow&v=1769433596" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

[![Star History Chart](https://api.star-history.com/svg?repos=mrsimonemms/zigflow&type=date&legend=top-left)](https://www.star-history.com/#mrsimonemms/zigflow&type=date&legend=top-left)

---

## 🪪 License

Distributed under the [Apache-2.0](./LICENSE) license

© 2025 - 2026 [Zigflow authors](https://github.com/mrsimonemms/zigflow/graphs/contributors)

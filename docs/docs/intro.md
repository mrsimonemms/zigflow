---
sidebar_position: 1
---
# Introduction

⚡️ Zigflow provides a **simple and declarative way** to define and manage Temporal
workflows

✨ Powered by Temporal – battle-tested **reliability, retries, and state management**

💨 **Speed up your deployments** by focusing on what you want to achieve, without
having to learn Temporal

## Quick Start

### Install Zigflow

1. Find the binary for your computer from the [releases](https://github.com/mrsimonemms/zigflow/releases)
   page
2. Make it executable `chmod +x ./path/to/binary`

## Start a Temporal Server (optional)

Zigflow works with all Temporal server types. [Cloud](https://temporal.io/cloud)
is best for high-performance, production workflows and [Self-Hosted](https://docs.temporal.io/self-hosted-guide)
is great for smaller workflows and development/testing.

For ease, this example uses the development server bundled with the
[Temporal CLI](https://docs.temporal.io/cli)

```sh
temporal server start-dev
```

### Create a Workflow

This is a simple workflow that outputs some data. It doesn't really do anything,
but it demonstrates the principles of running a Zigflow workflow.

```yaml title="workflow.yaml"
document:
  dsl: 1.0.0
  namespace: zigflow
  name: simple-workflow
  version: 1.0.0
do:
  - set:
      export:
        as: data
      set:
        message: Hello from Ziggy
```

:::tip
The DSL schema follows the Serverless Workflow specification
:::

### Run

Run Zigflow with a reference to the workflow file

```sh
zigflow -f workflow.yaml
```

### Trigger the Workflow

Temporal supports [multiple languages through their SDKs](https://docs.temporal.io/encyclopedia/temporal-sdks).
If you want to trigger this through your application, refer to these docs to create
your script.

To run through the UI:
* Go to your [Temporal UI](http://localhost:8233)
* Select "Start Workflow"
* Enter these parameters:
  * **Workflow ID**: generate a random UUID
  * **Task Queue**: enter `zigflow`
  * **Workflow Type**: enter `simple-workflow`
* Click "Start Workflow" and then go to the running workflow

You you should see a workflow with the result:

```json
{
  "data": {
    "message": "Hello from Ziggy"
  }
}
```

🎉🎉🎉 Congratulations. You've just run your first Zigflow workflow 🎉🎉🎉

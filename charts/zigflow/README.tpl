# Zigflow

{{ template "chart.deprecationWarning" . }}

{{ template "chart.badgesSection" . }}

{{ template "chart.description" . }}

{{ template "chart.homepageLine" . }}

## TL;DR

Be sure to set `${ZIGFLOW_VERSION}` to `latest` or [your desired version](https://github.com/mrsimonemms/zigflow/pkgs/container/charts%2Fzigflow)

```sh
helm install myrelease oci://ghcr.io/mrsimonemms/charts/zigflow@${ZIGFLOW_VERSION}
```

{{ template "chart.maintainersSection" . }}

{{ template "chart.sourcesSection" . }}

{{ template "chart.requirementsSection" . }}

{{ template "chart.valuesSectionHtml" . }}

{{ template "helm-docs.versionFooter" . }}

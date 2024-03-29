# Customization
This document describes possibilities to customize the gardener dashboard
as deployed on Kubernetes. This can help in offering whitelabeling features
to customers.

We assume one deployment of the dashboard for each customized or whitelabeled
gardener-dashboard. We strive for minimal modifications needed in the source
code to allow for whitelabeling configurations.

## Theming
Gardener-Dashboard is using the Vue.js-Framework and allows for using the
Vue.js Theming options. For documentation see deployment/theming.md

## Logo
The logo is served at `/static/assets/logo.svg` and can be found in the
source at `/frontend/public/static/assets/logo.svg`. This is also changed
with by the theming capabilities.

## Customizing Product Name
You can customize some values by providing a custom `login-config.json`.
Available parameters are:
```json
{
  "productName": "PSKE",
  "productSlogan": "Managed Kubernetes at Scale",
  "documentationURL": "https://docs.plusserver.com",
  "supportURL": "https://www.plusserver.com/ueber-uns/plusserver-kontakt",
  "landingPageUrl": "https://plusserver.com/pske",
  "landingPageName": "Plusserver Kubernetes Engine",
  "customLandingPagePre": "Powered by",
  "loginTypes": ["token"]
}
```
This file is found at `frontend/public/login-config.json` and served
as `/login-config-json`. You can see all parameters in the source at
`frontend/src/views/Login.vue`.

To avoid uneccessary network latency, the `login-config.json` is fetched
by the Login-Page only and the values are then copied in the Browsers
sessionStorage. This means that during development you might have to
logout and login again to see the changes reflected on the rendered pages.
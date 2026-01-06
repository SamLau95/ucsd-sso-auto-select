# UCSD SSO Auto Select

This Firefox extension automatically selects the preferred authentication method
when you visit configured UCSD login pages. It looks for a `<select>` element
with `id="authtype"` and chooses:

1. `Active Directory`
2. `Business Systems`

If neither option exists, it does nothing. When it selects an option, it fires
`input` and `change` events to trigger any `onchange` handlers on the page.

## Configure URLs

Open the extension options page and add one URL or hostname per line. The
default is:

- `https://a5.ucsd.edu`

## Load in Firefox

1. Open `about:debugging`.
2. Click "This Firefox".
3. Click "Load Temporary Add-on".
4. Select `manifest.json` from this folder.

For a permanent install, package the folder as a ZIP and load it via
`about:addons` -> "Install Add-on From File".

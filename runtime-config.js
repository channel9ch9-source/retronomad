// Runtime configuration for the static/GitHub Pages build.
// Keep secrets OUT of this file.
//
// The account API remains disabled until the backend is deployed on a suitable
// same-site/custom-domain setup.
const config=Object.freeze({
  accountSyncEnabled:false,
  catalogueArtworkEnabled:false,
  apiBase:""
});
window.APP_CONFIG=config;
// Legacy alias retained so existing browser code keeps working during/after rebrands.
window.RETRONOMAD_CONFIG=config;

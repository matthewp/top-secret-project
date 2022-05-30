// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
import '@generic-components/components/tabs.js';
import './ui/ContentWindow.js';
import titlebar from'./ui/titlebar.js';

function appInit(rootNode) {

  /* View variables */
  let updateTitleBar = titlebar(document.querySelector('.titlebar'));

  /* Event listeners */
  function onCmdT(ev) {
    updateTitleBar({ newTab: true });
  }

  /* Init functionality */
  api.handleCmdOrCtrlT(onCmdT);

  
}

appInit(document.body);
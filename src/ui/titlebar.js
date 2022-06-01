import Tab from './tab.js';

const newTabTemplate = document.getElementById('new-tab-template');

function cloneNewTab() {
  return document.importNode(newTabTemplate.content, true);
}

function init(titlebarNode) {
  /* DOM variables */
  let addressFormNode = titlebarNode.querySelector('#addressform');
  let addressInputNode = titlebarNode.querySelector('#addressform input');

  /* State variables */
  let addressValue;
  let tabs = [], activeTab;

  /* DOM update functions */
  function setAddressBlur() {
    addressInputNode.blur();
  }

  function setAddressInputValue(value) {
    addressInputNode.value = value;
  }

  function setTitlebarSelected(value) {
    titlebarNode.selected = value;
  }

  /* State update functions */
  function setActiveTab(value, index) {
    if(activeTab !== value) {
      if(activeTab) {
        activeTab.removeEventListener('load', onActiveTabLoad);
      }
      activeTab = value;
      value.addEventListener('load', onActiveTabLoad);
      setTitlebarSelected(index);
    }
  }

  function setAddressValue(value) {
    if(addressValue !== value) {
      addressValue = value;
      setAddressInputValue(value);
    }
  }


  /* Event listeners */
  function onAddressSubmit(ev) {
    ev.preventDefault();
    let url = ev.target.elements.address.value;
    activeTab.update({ href: url });
    setAddressBlur();
    setAddressValue(url);
  }

  function onActiveTabLoad(ev) {
    setAddressValue(ev.detail.url);
  }

  function onAddressInputClick(ev) {
    ev.target.select();
  }

  function onNewTab() {
    let frag = cloneNewTab();
    let tab = new Tab(frag.firstElementChild, frag.firstElementChild.nextElementSibling);
    titlebarNode.append(frag);
    let index = tabs.length;
    tabs.push(tab);
    setActiveTab(tab, index);
    tab.addEventListener('close', onTabClose);
  }

  function onSelectedChanged(ev) {
    let panels = titlebarNode.querySelectorAll('[slot=panel]');
    let panel = panels[ev.detail];
    setAddressValue(panel.getAttribute('href'));
  }

  function onTabClose(ev) {
    let idx = tabs.indexOf(ev.detail);
    let tab = tabs[idx];
    tab.update({ teardown: true });
    tabs.splice(idx, 1);
    if(tabs.length) {
      let newIdx = idx === 0 ? 0 : idx - 1;
      setActiveTab(tabs[newIdx], newIdx);
    } else {
      window.close();
    }
  }

  /* Init functionality */
  addressFormNode.addEventListener('submit', onAddressSubmit);
  addressInputNode.addEventListener('click', onAddressInputClick);
  titlebarNode.addEventListener('selected-changed', onSelectedChanged);
  let initialTabContent = Array.from(titlebarNode.querySelectorAll('[slot=tab], [slot=panel]'));
  for(let i = 0; i < initialTabContent.length; i += 2) {
    let tab = new Tab(initialTabContent[i], initialTabContent[i + 1]);
    tabs.push(tab);
    tab.addEventListener('close', onTabClose);
  }
  setActiveTab(tabs[0], 0);


  function update(data = {}) {
    if(data.newTab) onNewTab();
  }

  return update;
}

export default init;
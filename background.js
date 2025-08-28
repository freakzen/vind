chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({editMode: false, textReplacements: {}});
  
  chrome.contextMenus.create({
    id: "vindEdit",
    title: "Edit with Vind",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  chrome.storage.local.get(['editMode'], function(result) {
    const newMode = !result.editMode;
    chrome.storage.local.set({editMode: newMode});
    
    chrome.tabs.sendMessage(tab.id, {action: "toggleEdit", mode: newMode});
  });
});
document.addEventListener('DOMContentLoaded', function() {
  const toggleEdit = document.getElementById('toggleEdit');
  const resetAll = document.getElementById('resetAll');
  
  chrome.storage.local.get(['editMode'], function(result) {
    toggleEdit.textContent = result.editMode ? 'Disable Editing' : 'Enable Editing';
  });
  
  toggleEdit.addEventListener('click', function() {
    chrome.storage.local.get(['editMode'], function(result) {
      const newMode = !result.editMode;
      chrome.storage.local.set({editMode: newMode});
      toggleEdit.textContent = newMode ? 'Disable Editing' : 'Enable Editing';
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleEdit", mode: newMode});
      });
    });
  });
  
  resetAll.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "resetAll"});
    });
    
    chrome.storage.local.set({textReplacements: {}});
    alert('All Vind changes have been reset!');
  });
});
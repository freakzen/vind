let editMode = false;
let originalTexts = new Map();
let currentlyEditing = null;

chrome.storage.local.get(['editMode', 'textReplacements'], function(result) {
  editMode = result.editMode || false;
  if (result.textReplacements) {
    applySavedChanges(result.textReplacements);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleEdit") {
    editMode = request.mode;
    if (editMode) {
      enableEditing();
    } else {
      disableEditing();
    }
  } else if (request.action === "resetAll") {
    resetAllChanges();
  }
});

function enableEditing() {
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);
  document.body.style.cursor = 'cell';
  showEditIndicator();
}

function disableEditing() {
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);
  document.body.style.cursor = 'default';
  hideEditIndicator();
  
  // Finish any ongoing editing
  if (currentlyEditing) {
    finishEditing(currentlyEditing);
    currentlyEditing = null;
  }
}

function handleClick(e) {
  if (!editMode) return;
  if (currentlyEditing) return; // Already editing something
  
  const element = e.target;
  
  // Try to find the actual text element
  const textElement = findTextElement(element);
  if (!textElement) return;
  
  // Don't prevent default on first click - let the normal click happen first
  setTimeout(() => {
    if (!originalTexts.has(textElement)) {
      originalTexts.set(textElement, textElement.textContent);
    }
    
    textElement.contentEditable = true;
    currentlyEditing = textElement;
    
    // Select all text for easy editing
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textElement);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Focus on the element
    textElement.focus();
  }, 50);
}

function handleKeyDown(e) {
  if (!currentlyEditing) return;
  
  // Finish editing on Enter or Escape
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    finishEditing(currentlyEditing);
    currentlyEditing = null;
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelEditing(currentlyEditing);
    currentlyEditing = null;
  }
}

function finishEditing(element) {
  element.contentEditable = false;
  saveChange(element);
}

function cancelEditing(element) {
  element.contentEditable = false;
  if (originalTexts.has(element)) {
    element.textContent = originalTexts.get(element);
  }
}

function findTextElement(element) {
  // If element itself has text, use it
  if (element.textContent && element.textContent.trim() && !element.isContentEditable) {
    return element;
  }
  
  // Check children for text content
  for (let child of element.children) {
    if (child.textContent && child.textContent.trim() && !child.isContentEditable) {
      return child;
    }
  }
  
  // Check for button, input[type="submit"], etc.
  if (element.tagName === 'BUTTON' || 
      (element.tagName === 'INPUT' && ['submit', 'button', 'reset'].includes(element.type)) ||
      element.tagName === 'A' ||
      element.classList.contains('btn')) {
    return element;
  }
  
  return null;
}

function saveChange(element) {
  const originalText = originalTexts.get(element) || element.textContent;
  const newText = element.textContent;
  
  if (originalText !== newText) {
    const key = generateElementKey(element);
    
    chrome.storage.local.get(['textReplacements'], function(result) {
      const replacements = result.textReplacements || {};
      replacements[key] = newText;
      chrome.storage.local.set({textReplacements: replacements});
    });
  }
}

// ... (keep the rest of your functions exactly as they were) 
// generateElementKey, applySavedChanges, findElementsByKey, 
// resetAllChanges, showEditIndicator, hideEditIndicator
// Function to get the full URL of the active tab
function getActiveTabUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
	  if (tabs.length > 0) {
		const activeTab = tabs[0];
		if (!activeTab.url || activeTab.url === "chrome://newtab/") {
		  console.log("Invalid tab URL.");
		  return;
		}
  
		const url = new URL(activeTab.url);
		const fullUrl = url.href; // Get the full URL
  
		chrome.storage.local.get(['urlList'], function(result) {
		  let urlList = result.urlList || [];
		  
		  // Check if the URL is already stored
		  const isAlreadyStored = urlList.some(item => item.url === fullUrl);
		  if (!isAlreadyStored) {
			urlList.push({
			  url: fullUrl,
			  timestamp: Date.now(),
			});
			chrome.storage.local.set({ 'urlList': urlList }, function() {
			  console.log("URL added to storage: ", fullUrl);
			});
		  }
		});
	  }
	});
  }
  
  // Listen for tab updates and trigger URL tracking
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete") {
	  getActiveTabUrl();
	}
  });
  
  // Listen for URL visit messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "checkVisited") {
	  const visitedUrl = message.url;
  
	  chrome.storage.local.get(['urlList'], function(result) {
		let urlList = result.urlList || [];
  
		// Check if URL has been visited before
		const visited = urlList.some(item => item.url === visitedUrl);
		sendResponse({ visited });
	  });
	  return true;
	}
  });
  
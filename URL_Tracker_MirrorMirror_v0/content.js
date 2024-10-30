const trackUrl = () => {
	const currentURL = window.location.href;
	chrome.runtime.sendMessage({
	  type: "checkVisited",
	  url: currentURL, // Send the full URL instead of just hostname
	});
  };
  
  // Intercept native pushState and replaceState to detect SPA changes
  (function(history) {
	const pushState = history.pushState;
	const replaceState = history.replaceState;
  
	history.pushState = function() {
	  const result = pushState.apply(history, arguments);
	  window.dispatchEvent(new Event("pushState"));
	  window.dispatchEvent(new Event("locationchange"));
	  return result;
	};
  
	history.replaceState = function() {
	  const result = replaceState.apply(history, arguments);
	  window.dispatchEvent(new Event("replaceState"));
	  window.dispatchEvent(new Event("locationchange"));
	  return result;
	};
  
	window.addEventListener("popstate", function() {
	  window.dispatchEvent(new Event("locationchange"));
	});
  })(window.history);
  
  // Listen for SPA navigations and track the URL
  window.addEventListener("locationchange", trackUrl);
  
  // Also track the initial page load
  trackUrl();
  
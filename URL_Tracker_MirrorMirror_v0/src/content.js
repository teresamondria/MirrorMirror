const currentURL = window.location.href;
const hostname = new URL(currentURL).hostname;

chrome.runtime.sendMessage(
	{ type: "checkVisited", url: hostname },
	(response) => {
		if (response.visited) {
			// The website has been visited, display a message
			const messageDiv = document.createElement("div");
			messageDiv.innerText = "You have visited this website before.";
			messageDiv.style.backgroundColor = "yellow";
			messageDiv.style.textAlign = "center";
			messageDiv.style.fontSize = "15px";
			messageDiv.style.fontWeight = "bold";
			messageDiv.style.color = "red";
			messageDiv.style.padding = "3px";
			messageDiv.style.position = "fixed";
			messageDiv.style.top = "0";
			messageDiv.style.left = "0";
			messageDiv.style.width = "100%";
			messageDiv.style.zIndex = "9999999999999";
			document.body.prepend(messageDiv);
		}
	}
);

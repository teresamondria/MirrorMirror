document.addEventListener('DOMContentLoaded', function () {
	var history = document.getElementById('urlList');
	var clearBtn = document.getElementById('clearBtn');
	var exportTxtBtn = document.getElementById('exportTxtBtn');
	var exportCsvBtn = document.getElementById('exportCsvBtn');
	var paginationSec = document.getElementById('pagination');

	chrome.storage.local.get(['urlList'], function (result) {
		var urlList = result.urlList;
		if (urlList === undefined) {
			urlList = [];
		}
		if (urlList.length == 0) {
			var span = document.createElement('span');
			span.classList.add('no-history');
			span.appendChild(document.createTextNode('No history'));
			history.appendChild(span);
			exportTxtBtn.disabled = true;
			exportCsvBtn.disabled = true;
			clearBtn.disabled = true;
			exportTxtBtn.classList.add('disabled');
			exportCsvBtn.classList.add('disabled');
			clearBtn.classList.add('disabled');
		} else {
			// sort by timestamp
			var sortedUrlList = urlList.sort(function (a, b) {
				return b.timestamp - a.timestamp;
			});
			if (sortedUrlList.length > 50) {
				sortedUrlList = sortedUrlList.slice(0, 50);
			}
			// paginate here
			var page = 1;
			var perPage = 10;
			var totalPage = Math.ceil(sortedUrlList.length / perPage);

			var paginationTopSpan = document.createElement('span');
			paginationTopSpan.classList.add('paginationTop');
			paginationTopSpan.innerHTML = 'Page ' + page + ' of ' + totalPage + ' pages | Total ' + sortedUrlList.length + ' records';

			var paginationActions = document.createElement('div');
			paginationActions.classList.add('pagination-actions');
			var prevBtn = document.createElement('button');
			prevBtn.appendChild(document.createTextNode('Prev'));
			prevBtn.classList.add('prev');
			prevBtn.addEventListener('click', function (e) {
				e.preventDefault();
				if (page > 1) {
					page--;
					var start = (page - 1) * perPage;
					var end = start + perPage;
					history.innerHTML = '';
					paginationTopSpan.innerHTML = 'Page ' + page + ' of ' + totalPage + ' pages | Total ' + sortedUrlList.length + ' records';
					sortedUrlList.slice(start, end).forEach(function (url) {
						var hostname = url.hostname;
						var li = document.createElement('li');
						var span = document.createElement('span');
						span.innerHTML = hostname + ' -- ' + new Date(url.timestamp).toLocaleString();
						span.classList.add('url');
						span.addEventListener('click', function (e) {
							e.preventDefault();
							console.log(hostname);
							chrome.tabs.create({ url: hostname });
						});
						var btn = document.createElement('button');
						btn.classList.add('delete');
						btn.appendChild(document.createTextNode('Delete'));
						btn.addEventListener('click', function (e) {
							e.preventDefault();
							var index = urlList.findIndex(function (e) { return e.hostname == url.hostname; });
							if (index !== -1) {
								urlList.splice(index, 1);

								chrome.storage.local.set({ 'urlList': urlList }, function () {
									li.remove();
								});
							}
						});
						li.classList.add('urlItem');
						li.appendChild(span);
						li.appendChild(btn);
						history.appendChild(li);
					});
				}
			});

			var nextBtn = document.createElement('button');
			nextBtn.appendChild(document.createTextNode('Next'));
			nextBtn.classList.add('next');
			nextBtn.addEventListener('click', function (e) {
				e.preventDefault();
				if (page < totalPage) {
					page++;
					var start = (page - 1) * perPage;
					var end = start + perPage;
					history.innerHTML = '';
					paginationTopSpan.innerHTML = 'Page ' + page + ' of ' + totalPage + ' pages | Total ' + sortedUrlList.length + ' records';
					paginationSec.appendChild(paginationTopSpan);
					sortedUrlList.slice(start, end).forEach(function (url) {
						var hostname = url.hostname;
						var li = document.createElement('li');
						var span = document.createElement('span');
						span.innerHTML = hostname + ' -- ' + new Date(url.timestamp).toLocaleString();
						span.classList.add('url');
						span.addEventListener('click', function (e) {
							e.preventDefault();
							console.log(hostname);
							chrome.tabs.create({ url: hostname });
						});
						var btn = document.createElement('button');
						btn.classList.add('delete');
						btn.appendChild(document.createTextNode('Delete'));
						btn.addEventListener('click', function (e) {
							e.preventDefault();
							var index = urlList.findIndex(function (e) { return e.hostname == url.hostname; });
							if (index !== -1) {
								urlList.splice(index, 1);

								chrome.storage.local.set({ 'urlList': urlList }, function () {
									li.remove();
								});
							}
						});
						li.classList.add('urlItem');
						li.appendChild(span);
						li.appendChild(btn);
						history.appendChild(li);
					});
				}
			});

			paginationActions.appendChild(prevBtn);
			paginationActions.appendChild(nextBtn);
			paginationSec.appendChild(paginationTopSpan);
			paginationSec.appendChild(paginationActions);


			clearBtn.addEventListener('click', function (e) {
				e.preventDefault();
				if (confirm('Are you sure you want to clear history?')) {
					chrome.storage.local.set({ 'urlList': [] }, function () {
						history.innerHTML = '';
						var span = document.createElement('span');
						span.classList.add('no-history');
						span.appendChild(document.createTextNode('No history'));
						history.appendChild(span);
						paginationTopSpan.innerHTML = 'Page 1 of 1 pages | Total 0 records';
						exportTxtBtn.disabled = true;
						exportCsvBtn.disabled = true;
						clearBtn.disabled = true;
						exportTxtBtn.classList.add('disabled');
						exportCsvBtn.classList.add('disabled');
						clearBtn.classList.add('disabled');

						chrome.browserAction.setBadgeText({ text: 'dfqwfqwqwqwf3' });

					});
				}
			});

			exportTxtBtn.addEventListener('click', function (e) {
				e.preventDefault();
				chrome.storage.local.get(['urlList'], function (result) {
					var urlList = result.urlList;
					if (urlList === undefined) {
						urlList = [];
					}
					var text = '';
					urlList.forEach(function (url) {
						text += url.hostname + ',' + url.timestamp + ',' + url.path + '\n';
					});
					var blob = new Blob([text], { type: 'text/plain' });
					var blobURL = URL.createObjectURL(blob);

					// Create an anchor element to trigger the download
					const anchor = document.createElement('a');
					anchor.href = blobURL;
					anchor.download = 'history.txt'; // Set the desired file name

					// Programmatically click the anchor element to initiate the download
					anchor.click();

					// Clean up by revoking the object URL
					URL.revokeObjectURL(blobURL);
				});
			});

			exportCsvBtn.addEventListener('click', function (e) {
				e.preventDefault();
				chrome.storage.local.get(['urlList'], function (result) {
					var urlList = result.urlList;
					if (urlList === undefined) {
						urlList = [];
					}
					var text = '';
					urlList.forEach(function (url) {
						text += url.hostname + ',' + url.timestamp + ',' + url.path + '\n';
					});
					var blob = new Blob([text], { type: 'text/csv' });
					var blobURL = URL.createObjectURL(blob);
					// chrome.downloads.download({
					// 	url: url,
					// 	filename: 'history.csv'
					// });

					// Create an anchor element to trigger the download
					const anchor = document.createElement('a');
					anchor.href = blobURL;
					anchor.download = 'history.csv'; // Set the desired file name

					// Programmatically click the anchor element to initiate the download
					anchor.click();

					// Clean up by revoking the object URL
					URL.revokeObjectURL(blobURL);
				});
			});

			var start = (page - 1) * perPage;
			var end = start + perPage;
			sortedUrlList.slice(start, end).forEach(function (url) {
				var hostname = url.hostname;
				var li = document.createElement('li');
				var span = document.createElement('span');
				span.innerHTML = hostname + ' -- ' + new Date(url.timestamp).toLocaleString();
				span.classList.add('url');
				span.addEventListener('click', function (e) {
					e.preventDefault();
					console.log(hostname);
					chrome.tabs.create({ url: hostname });
				});
				var btn = document.createElement('button');
				btn.classList.add('delete');
				btn.appendChild(document.createTextNode('Delete'));
				btn.addEventListener('click', function (e) {
					e.preventDefault();
					var index = urlList.findIndex(function (e) { return e.hostname == url.hostname; });
					if (index !== -1) {
						urlList.splice(index, 1);

						chrome.storage.local.set({ 'urlList': urlList }, function () {
							li.remove();
						});
					}
				});
				li.classList.add('urlItem');
				li.appendChild(span);
				li.appendChild(btn);
				history.appendChild(li);
			});
		}
	});
});

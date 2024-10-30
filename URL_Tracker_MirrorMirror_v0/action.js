document.addEventListener('DOMContentLoaded', function () {
    var history = document.getElementById('urlList');
    var clearBtn = document.getElementById('clearBtn');
    var exportTxtBtn = document.getElementById('exportTxtBtn');
    var exportCsvBtn = document.getElementById('exportCsvBtn');
    var paginationSec = document.getElementById('pagination');

    chrome.storage.local.get(['urlList'], function (result) {
        var urlList = result.urlList || [];
        
        if (urlList.length === 0) {
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
            // Sort by timestamp
            var sortedUrlList = urlList.sort(function (a, b) {
                return b.timestamp - a.timestamp;
            });
            if (sortedUrlList.length > 50) {
                sortedUrlList = sortedUrlList.slice(0, 50);
            }

            // Pagination setup
            var page = 1;
            var perPage = 10;
            var totalPage = Math.ceil(sortedUrlList.length / perPage);

            var paginationTopSpan = document.createElement('span');
            paginationTopSpan.classList.add('paginationTop');
            paginationTopSpan.innerHTML = `Page ${page} of ${totalPage} | Total ${sortedUrlList.length} records`;

            // Helper function for rendering URL history
            function renderHistory(start, end) {
                history.innerHTML = '';
                sortedUrlList.slice(start, end).forEach(function (url) {
                    var li = document.createElement('li');
                    var span = document.createElement('span');
                    span.innerHTML = `${url.url} -- ${new Date(url.timestamp).toLocaleString()}`;
                    span.classList.add('url');
                    span.addEventListener('click', function (e) {
                        e.preventDefault();
                        chrome.tabs.create({ url: url.url });
                    });

                    var btn = document.createElement('button');
                    btn.classList.add('delete');
                    btn.appendChild(document.createTextNode('Delete'));
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        var index = urlList.findIndex(e => e.url === url.url);
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

            renderHistory(0, perPage);

            // Pagination controls
            var paginationActions = document.createElement('div');
            paginationActions.classList.add('pagination-actions');

            var prevBtn = document.createElement('button');
            prevBtn.appendChild(document.createTextNode('Prev'));
            prevBtn.classList.add('prev');
            prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (page > 1) {
                    page--;
                    renderHistory((page - 1) * perPage, page * perPage);
                    paginationTopSpan.innerHTML = `Page ${page} of ${totalPage} | Total ${sortedUrlList.length} records`;
                }
            });

            var nextBtn = document.createElement('button');
            nextBtn.appendChild(document.createTextNode('Next'));
            nextBtn.classList.add('next');
            nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (page < totalPage) {
                    page++;
                    renderHistory((page - 1) * perPage, page * perPage);
                    paginationTopSpan.innerHTML = `Page ${page} of ${totalPage} | Total ${sortedUrlList.length} records`;
                }
            });

            paginationActions.appendChild(prevBtn);
            paginationActions.appendChild(nextBtn);
            paginationSec.appendChild(paginationTopSpan);
            paginationSec.appendChild(paginationActions);

            // Clear button event
            clearBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (confirm('Are you sure you want to clear history?')) {
                    chrome.storage.local.set({ 'urlList': [] }, function () {
                        history.innerHTML = '';
                        var span = document.createElement('span');
                        span.classList.add('no-history');
                        span.appendChild(document.createTextNode('No history'));
                        history.appendChild(span);
                        paginationTopSpan.innerHTML = 'Page 1 of 1 | Total 0 records';
                        exportTxtBtn.disabled = true;
                        exportCsvBtn.disabled = true;
                        clearBtn.disabled = true;
                    });
                }
            });

            // Export as text
            exportTxtBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var text = '';
                urlList.forEach(function (url) {
                    text += `${url.url},${url.timestamp},${url.url}\n`;
                });
                var blob = new Blob([text], { type: 'text/plain' });
                var blobURL = URL.createObjectURL(blob);

                // Create a link for download
                const anchor = document.createElement('a');
                anchor.href = blobURL;
                anchor.download = 'history.txt';
                anchor.click();
                URL.revokeObjectURL(blobURL);
            });

            // Export as CSV
            exportCsvBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var csv = 'URL, Timestamp\n';
                urlList.forEach(function (url) {
                    csv += `${url.url},${new Date(url.timestamp).toLocaleString()}\n`;
                });
                var blob = new Blob([csv], { type: 'text/csv' });
                var blobURL = URL.createObjectURL(blob);

                // Create a link for download
                const anchor = document.createElement('a');
                anchor.href = blobURL;
                anchor.download = 'history.csv';
                anchor.click();
                URL.revokeObjectURL(blobURL);
            });
        }
    });
});

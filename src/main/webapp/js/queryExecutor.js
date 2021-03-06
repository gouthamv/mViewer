YUI.add('query-executor', function(Y) {
    YUI.namespace('com.imaginea.mongoV');
    var MV = YUI.com.imaginea.mongoV;
    var successHandler, currentSelection;

    MV.loadQueryBox = function(keysUrl, dataUrl, selectedCollection, sHandler) {

        var cachedQueryParams = {};
        successHandler = sHandler;
        currentSelection = selectedCollection;

        /**
         * It sends request to get the keys from first 10 records only. Updates all key with another request.
         */
        Y.io(keysUrl, {
            method: "GET",
            data: 'allKeys=false',
            on: {
                success: function(ioId, responseObject) {
                    populateQueryBox(ioId, responseObject);
                    executeQuery(null);
                    // Now sending request to fetch all keys
                    populateAllKeys();
                },
                failure: function(ioId, responseObject) {
                    MV.hideLoadingPanel();
                    MV.showAlertMessage("Could not load the query Box", MV.warnIcon);
                    Y.log("Could not send the request to get the keys in the collection. Response Status: [0]".format(responseObject.statusText), "error");
                }
            }
        });

        /**
         *The function is an event handler for the execute query button. It gets the query parameters from UI components
         *and sends a request to get the documents
         */
        function executeQuery() {
            var queryParams = getQueryParameters(false);
            execute(queryParams);
        }

        /**
         *The function is an event handler for the execute query button. It gets the query parameters from cache
         *and sends a request to get the documents
         */
        function executeCachedQuery() {
            var queryParams = getQueryParameters(true);
            execute(queryParams);
        }

        function execute(queryParams) {
            var queryStr = "&query=[0]&limit=[1]&skip=[2]&fields=[3]&sortBy=[4]".format(
                encodeURIComponent(queryParams.query), queryParams.limit, queryParams.skip, queryParams.checkedFields, queryParams.sortBy);
            if (queryStr !== undefined) {
                MV.showLoadingPanel("Loading Documents...");
                Y.io(dataUrl, {
                    method: "GET",
                    data: queryStr,
                    on: {
                        success: function(request, response) {
                            var parsedResponse = Y.JSON.parse(response.responseText).response;
                            var result = parsedResponse.result, error = parsedResponse.error;
                            if (result && !error) {
                                //TotalCount may vary from request to request. so update the same in cache.
                                queryParams.totalCount = result.count;
                                setQueryParameters(queryParams);
                                //Update the pagination anchors accordingly
                                updateAnchors(result.count, result.editable);
                                successHandler(result);
                            } else {
                                MV.hideLoadingPanel();
                                MV.showAlertMessage(error.message, MV.warnIcon);
                            }
                        },
                        failure: function(request, response) {
                            MV.hideLoadingPanel();
                            MV.showAlertMessage(response.responseText, MV.warnIcon);
                        }
                    }
                });
            }
        }

        function populateAllKeys() {
            Y.io(keysUrl, {
                method: "GET",
                data: 'allKeys=true',
                on: {
                    success: function(ioId, responseObject) {
                        var parsedResponse = Y.JSON.parse(responseObject.responseText);
                        var keys = parsedResponse.response.result.keys;
                        if (keys !== undefined) {
                            var innerHTML = formatKeys(keys);
                            Y.one('#fields').set('innerHTML', innerHTML);
                        }
                    },
                    failure: function(ioId, responseObject) {
                        MV.hideLoadingPanel();
                        MV.showAlertMessage("Could not load the query Box", MV.warnIcon);
                        Y.log("Could not send the request to get the keys in the collection. Response Status: [0]".format(responseObject.statusText), "error");
                    }
                }
            });
        }

        /**
         *The function is success handler for the request of getting all the keys in a collections.
         *It parses the response, gets the keys and makes the query box. It also sends the request to load the
         *documents after the query box has been populated,
         * @param {Number} e Id
         * @param {Object} The response Object
         */
        function populateQueryBox(ioId, responseObject) {
            var parsedResponse, keys, count, queryForm, error;
            try {
                parsedResponse = Y.JSON.parse(responseObject.responseText);
                keys = parsedResponse.response.result.keys;
                count = parsedResponse.response.result.count;
                if (keys !== undefined || count !== undefined) {
                    document.getElementById('queryExecutor').style.display = 'block';
                    queryForm = Y.one('#queryForm');
                    queryForm.addClass('form-cont');
                    MV.clearHeader();
                    MV.mainBody.empty(true);
                    queryForm.set("innerHTML", getForm(keys, count));
                    MV.mainBody.set("innerHTML", paginatorTemplate.format(count < 25 ? count : 25, count));
                    initListeners();
                } else {
                    error = parsedResponse.response.error;
                    Y.log("Could not get keys. Message: [0]".format(error.message), "error");
                    MV.showAlertMessage("Could not load the query Box! [0]".format(MV.errorCodeMap(error.code)), MV.warnIcon);
                }
            } catch (e) {
                Y.log("Could not parse the JSON response to get the keys", "error");
                Y.log("Response received: [0]".format(responseObject.responseText), "error");
                MV.showAlertMessage("Cannot parse Response to get keys!", MV.warnIcon);
            }
        }

        var getForm = function(keys, count) {
            var checkList = "", selectTemplate = "";
            if (keys !== undefined) {
                selectTemplate = [
                    "<a id='selectAll' class='navigationRight' href='javascript:void(0)'>Select All</a>",
                    "<label> / </label>",
                    "<a id='unselectAll' href='javascript:void(0)'>Unselect All</a>"
                ].join('\n');
                checkList = "<div id='checkListDiv'><div class='queryBoxlabels'><label for='fields' >Attributes</label>" + selectTemplate + "</div><div><ul id='fields' class='checklist'>";
                checkList += formatKeys(keys);
                checkList += "</ul>";
                checkList += "</div>";
                checkList += "</div>";
            }
            return upperPartTemplate.format(currentSelection) + checkList + lowerPartTemplate;
        };

        function formatKeys(keys) {
            var checkList = "";
            for (var index = 0; index < keys.length; index++) {
                checkList += checkListTemplate.format(keys[index], keys[index], keys[index], keys[index]);
            }
            return checkList;
        }

        var upperPartTemplate = [
            "<div id='queryBoxDiv'>",
            "<div class='queryBoxlabels'>",
            "<label>Define Query</label>",
            "</div>",
            "<div>",
            "<textarea id='queryBox' name='queryBox' class='queryBox'>",
            "db.[0].find({\r\r})",
            "</textarea>",
            "</div>",
            "</div>"

        ].join('\n');

        var checkListTemplate = "<li><label for='[0]'><input id='[1]' name='[2]' type='checkbox' checked=true />[3]</label></li>";

        var lowerPartTemplate = [
            "<div id='parametersDiv'>",
            "<label for='skip'> Skip(No. of records) </label><br/><input id='skip' type='text' name='skip' value='0'/><br/>",
            "<label for='limit'> Max page size: </label><br/><span><select id='limit' name='limit'><option value='10'>10</option><option value='25'>25</option><option value='50'>50</option></select></span><br/>  ",
            "<label for='sort'> Sort by fields </label><br/><input id='sort' type='text' name='sort' value='_id:-1'/><br/><br/>",
            "<button id='execQueryButton' class='bttn'>Execute Query</button>",
            "</div>"
        ].join('\n');

        var paginatorTemplate = [
            "<div id='paginator'>",
            "<a id='first' href='javascript:void(0)'>&laquo; First</a>",
            "<a id='prev'  href='javascript:void(0)'>&lsaquo; Previous</a>",
            "<label>Showing</label>", "<label id='startLabel'> 1 </label>", "<label> - </label>",
            "<label id='endLabel'> [0] </label>", "<label> of </label>", "<label id='countLabel'> [1] </label>",
            "<a id='next' href='javascript:void(0)'>Next &rsaquo;</a>",
            "<a id='last' href='javascript:void(0)'>Last &raquo;</a>",
            "</div>"
        ].join('\n');

        function initListeners() {
            Y.on("click", executeQuery, "#execQueryButton");
            Y.on("click", handleSelect, "#selectAll");
            Y.on("click", handleSelect, "#unselectAll");
            Y.on("click", handlePagination, "#first");
            Y.on("click", handlePagination, "#prev");
            Y.on("click", handlePagination, "#next");
            Y.on("click", handlePagination, "#last");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                    executeQuery();
                }
            }, "#queryBox");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation on skip field
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                    executeQuery();
                }
            }, "#skip");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation on limit field
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                    executeQuery();
                }
            }, "#limit");
        }

        function handleSelect(event) {
            var id = event.currentTarget.get("id");
            var elements = Y.Selector.query('ul[id=fields] input');
            if (id === "selectAll") {
                Y.Array.each(elements, function(element) {
                    element.checked = true;
                });
            } else {
                Y.Array.each(elements, function(element) {
                    element.checked = false;
                });
            }
        }

        function handlePagination(event) {
            var href = event.currentTarget.get("href");
            if (href == null || href == undefined || href == "")
                return;
            var queryParameters = getQueryParameters(true);
            var skipValue = queryParameters.skip, limitValue = queryParameters.limit, countValue = queryParameters.totalCount;
            var id = event.currentTarget.get("id");
            if (id === "first") {
                skipValue = 0;
            } else if (id === "prev") {
                skipValue = (skipValue - limitValue) < 0 ? 0 : (skipValue - limitValue);
            } else if (id === "next") {
                skipValue = skipValue + limitValue;
            } else if (id === "last") {
                skipValue = countValue - limitValue;
            }
            //update skip value in the cache query parameters
            queryParameters.skip = skipValue;
            executeCachedQuery();
        }

        function updateAnchors(count, showPaginated) {
            var first = Y.one('#first'), prev = Y.one('#prev'), next = Y.one('#next'), last = Y.one('#last');
            var start = Y.one('#startLabel'), end = Y.one('#endLabel'), countLabel = Y.one('#countLabel');
            // Get the cached query parameter values
            var queryParameters = getQueryParameters(true);
            var skipValue = queryParameters.skip, limitValue = queryParameters.limit;
            if (skipValue == 0 || skipValue >= count || !showPaginated)
                disableAnchor(first);
            else
                enableAnchor(first);
            if (skipValue >= count || skipValue + limitValue <= limitValue || !showPaginated)
                disableAnchor(prev);
            else
                enableAnchor(prev);
            if (skipValue >= count - limitValue || !showPaginated)
                disableAnchor(next);
            else
                enableAnchor(next);
            if (skipValue + limitValue >= count || !showPaginated)
                disableAnchor(last);
            else
                enableAnchor(last);
            //Check if the skip value is greater than the totalCount of resultSet for the executedQuery
            if (skipValue < count) {
                var size = showPaginated ? skipValue + limitValue : count;
                start.set('text', count != 0 ? skipValue + 1 : 0);
                end.set('text', count <= size ? count : skipValue + limitValue);
                countLabel.set('text', count);
            } else {
                start.set('text', 0);
                end.set('text', 0);
                countLabel.set('text', 0);
            }
        }

        function enableAnchor(obj) {
            obj.setAttribute('href', 'javascript:void(0)');
            obj.setStyle('color', '#39C');
        }

        function disableAnchor(obj) {
            obj.removeAttribute('href');
            obj.setStyle('color', 'grey');
        }

        /**
         * Stores the query parameters in the cache.
         * @param queryParams
         */
        function setQueryParameters(queryParams) {
            cachedQueryParams = queryParams;
        }

        /**
         * This function gets the query parameters from the query box or cache.
         * @param fromCache fetches values from cache when true else from the query box
         * @returns {String} Query parameters
         *
         */
        function getQueryParameters(fromCache) {
            if (fromCache) {
                return cachedQueryParams;
            } else {
                var queryParameters = { query: "", limit: 0, skip: 0, checkedFields: [], sortBy: "", totalCount: 0};
                queryParameters.query = Y.one('#queryBox').get("value").trim();
                queryParameters.limit = parseInt(Y.one('#limit').get("value"));
                queryParameters.skip = parseInt(Y.one('#skip').get("value").trim());
                queryParameters.sortBy = "{" + Y.one('#sort').get("value") + "}";
                //populate checked keys of a collection from UI
                var fields = Y.all('#fields input'), item;
                for (var index = 0; index < fields.size(); index++) {
                    item = fields.item(index);
                    if (item.get("checked")) {
                        queryParameters.checkedFields.push(item.get("name"));
                    }
                }
                if (queryParameters.query === "") {
                    queryParameters.query = "{}";
                }
                return queryParameters;
            }
        }
    };

    MV.hideQueryForm = function() {
        var queryForm = Y.one('#queryForm');
        queryForm.removeClass('form-cont');
        queryForm.set("innerHTML", "");
        document.getElementById('queryExecutor').style.display = 'none';
    };

}, '3.3.0', {
    requires: ["json-parse", "node-event-simulate"]
});

ko.bindingHandlers.lazymselect = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        LazyMSelectUtil.log('ko.bindingHandlers.lazymselect init');
        var config = valueAccessor();
        var instance = new LazyMSelect({
            element: element,
            queryUrl: config.queryUrl,
            queryParams: config.queryParams,
            debug: true,
            selectedItems: config.selectedItems,
            templateHtmlUrl: 'lazymselect.template.html'
        });
        $(element).data('lazymselect', instance);
        $(element).click(function () {
            instance.render();
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        LazyMSelectUtil.log('ko.bindingHandlers.lazymselect update');
        var config = valueAccessor();
        var instance = $(element).data('lazymselect');
        instance.onQueryChanged.call(instance, config);
    }
};
var LazyMSelect = (function () {
    function LazyMSelect(options) {
        var _this = this;
        this.options = options;
        this.isRendered = false;
        this.latestQueryUrl = null;
        options.selector = options.selector || {
            queryInput: '.cy-multiselect-search'
        };
        this.$element = $(options.element);
        LazyMSelectUtil.debug = options.debug || false;
        this.updateDisplayElementLabel();
        this.options.selectedItems.subscribe(function () {
            _this.updateDisplayElementLabel();
        });
    }
    LazyMSelect.prototype.render = function () {
        var self = this;
        if (!self.isRendered) {
            self.data = new LazyMSelectDataViewModel();
            self.data.selectedItems = self.options.selectedItems;
            self.populateContainer().then(function () {
                self.populateCacheItems().then(function () {
                    self.renderCore();
                });
                self.showContainer();
            });
            self.isRendered = true;
        }
        else {
            self.showContainer();
        }
    };
    LazyMSelect.prototype.renderCore = function () {
        var self = this;
        for (var _i = 0, _a = self.data.selectedItems(); _i < _a.length; _i++) {
            var selectedItem = _a[_i];
            if (selectedItem.isChecked === undefined) {
                selectedItem.isChecked = true;
            }
            if (selectedItem.name === undefined
                && self.data.cachedItems
                && self.data.cachedItems[selectedItem.id]) {
                selectedItem.name = self.data.cachedItems[selectedItem.id].name || '';
            }
        }
        self.data.queryString.subscribe(function (newQueryString) {
            self.search(newQueryString);
        });
        ko.applyBindings(self, self.$container[0]);
    };
    LazyMSelect.prototype.populateCacheItems = function () {
        var self = this;
        var ready = $.Deferred();
        var currentQueryUrl = self.getQueryUrl();
        if (self.latestQueryUrl !== currentQueryUrl) {
            self.latestQueryUrl = currentQueryUrl;
            $.get(currentQueryUrl).then(function (rawData) {
                for (var _i = 0, rawData_1 = rawData; _i < rawData_1.length; _i++) {
                    var item = rawData_1[_i];
                    self.data.cachedItems[item.id] = item;
                }
                ready.resolve();
            });
        }
        else {
            ready.resolve();
        }
        return ready;
    };
    LazyMSelect.prototype.getQueryUrl = function () {
        var self = this;
        self.options.queryParams = self.options.queryParams || {};
        var url = self.options.queryUrl.indexOf('?') > 0
            ? self.options.queryUrl + '&' + $.param(self.options.queryParams)
            : self.options.queryUrl + '?' + $.param(self.options.queryParams);
        return url;
    };
    LazyMSelect.prototype.onQueryChanged = function (queryOptions) {
        LazyMSelectUtil.log('onQueryParamsChanged', queryOptions);
        var self = this;
        // after container render
        if (self.data) {
            self.options.queryUrl = queryOptions.queryUrl;
            self.options.queryParams = queryOptions.queryParams;
            self.data.selectedItems([]);
            self.data.unSelectedItems([]);
        }
    };
    LazyMSelect.prototype.changeChecked = function (item, fromSelected) {
        var self = this;
        if (fromSelected === true) {
            item.isChecked = false;
            self.data.unSelectedItems.push(item);
            self.data.selectedItems.remove(item);
        }
        else {
            item.isChecked = true;
            self.data.selectedItems.push(item);
            self.data.unSelectedItems.remove(item);
        }
    };
    LazyMSelect.prototype.search = function (newQueryString) {
        var self = this;
        self.removeUnSelectedItems();
        if (newQueryString.length < 1) {
            return;
        }
        self.populateCacheItems().then(function () {
            var _loop_1 = function (id) {
                var item = self.data.cachedItems[id];
                if (item.name && item.name.toLowerCase().indexOf(newQueryString.toLowerCase()) === 0) {
                    var inSelectedItems = _.some(self.data.selectedItems(), function (selectedItem) { return selectedItem.id === id; });
                    if (inSelectedItems) {
                        return "continue";
                    }
                    if (item.isChecked === undefined) {
                        item.isChecked = false;
                    }
                    self.data.unSelectedItems.push(self.data.cachedItems[id]);
                }
            };
            for (var id in self.data.cachedItems) {
                _loop_1(id);
            }
        });
    };
    LazyMSelect.prototype.clearQueryString = function () {
        var self = this;
        self.data.queryString('');
    };
    LazyMSelect.prototype.removeUnSelectedItems = function () {
        var self = this;
        self.data.unSelectedItems([]);
    };
    LazyMSelect.prototype.populateContainer = function () {
        var self = this;
        var ready = $.Deferred();
        function initContainerEvents() {
            LazyMSelectUtil.log('initContainerEvents');
            self.$container.click(function (e) {
                LazyMSelectUtil.log('$container click stopPropagation', e);
                // prevent hide container
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            self.$element.click(function (e) {
                LazyMSelectUtil.log('$element click stopPropagation', e);
                // prevent hide container
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            $(document).click(function (e) {
                LazyMSelectUtil.log('document click');
                self.hideContainer();
            });
        }
        if (self.$container == null) {
            $.get(self.options.templateHtmlUrl).then(function (rawHtml) {
                var div = document.createElement('div');
                div.setAttribute('class', 'lazymselect-suggestions');
                div.innerHTML = rawHtml;
                self.$element.after(div);
                self.$container = $(div);
                initContainerEvents();
                ready.resolve();
            });
        }
        else {
            ready.resolve();
        }
        return ready;
    };
    LazyMSelect.prototype.showContainer = function () {
        var self = this;
        self.$container.show();
        self.$container.find(self.options.selector.queryInput).focus();
    };
    LazyMSelect.prototype.hideContainer = function () {
        var self = this;
        self.$container.hide();
    };
    LazyMSelect.prototype.updateDisplayElementLabel = function () {
        var self = this;
        var count = self.options.selectedItems().length;
        var originDisplayTextKey = 'origin-text';
        var span = self.$element.children(':first')[0];
        var originDisplayText = self.$element.data(originDisplayTextKey);
        if (!originDisplayText) {
            originDisplayText = span.innerText;
            self.$element.data(originDisplayTextKey, originDisplayText);
        }
        if (count > 0) {
            span.innerText = originDisplayText + "(" + count + ")";
        }
        else {
            span.innerText = "" + originDisplayText;
        }
    };
    return LazyMSelect;
}());
var LazyMSelectUtil = (function () {
    function LazyMSelectUtil() {
    }
    LazyMSelectUtil.log = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (LazyMSelectUtil.debug === true) {
            console.log(message, optionalParams);
        }
    };
    return LazyMSelectUtil;
}());
LazyMSelectUtil.debug = true;
var LazyMSelectDataViewModel = (function () {
    function LazyMSelectDataViewModel() {
        this.queryString = ko.observable();
        this.cachedItems = {};
        this.unSelectedItems = ko.observableArray().extend({ deferred: true });
    }
    return LazyMSelectDataViewModel;
}());

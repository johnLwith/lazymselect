var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
   powerby: https://github.com/devbridge/jQuery-Autocomplete
*/
(function () {
    var LazyMSelect = (function () {
        function LazyMSelect(element, options) {
            this._hoverSuggestionIndex = -1;
            this._currentValue = "";
            this._visibleSuggestions = false;
            var self = this;
            self.configOptions(element, options);
            self.initialize();
            self.view = new LazyMSelectView({
                options: self.options,
                el: self.el,
                visibleSuggestions: self.visibleSuggestions,
                hoverSuggestionIndex: self.hoverSuggestionIndex,
                classes: self.classes,
                suggestions: self.suggestions,
                onContainerClick: self.onContainerClick.bind(self),
                onContainerMouseout: self.onContainerMouseout.bind(self),
                onContainerMouseover: self.onContainerMouseover.bind(self)
            });
        }
        LazyMSelect.prototype.configOptions = function (element, options) {
            var noop = $.noop, self = this, defaults = {
                ajaxSettings: {},
                url: null,
                width: '',
                minChars: 1,
                maxHeight: 300,
                deferRequestBy: 0,
                params: {},
                formatResult: LazyMSelectUtils.formatResult,
                delimiter: null,
                zIndex: 9999,
                type: 'GET',
                noCache: false,
                onSearchStart: noop,
                onSearchComplete: noop,
                onSearchError: noop,
                preserveInput: false,
                containerClass: 'lazymselect-suggestions',
                tabDisabled: false,
                dataType: 'text',
                currentRequest: null,
                triggerSelectOnValidInput: true,
                preventBadQueries: true,
                paramName: 'query',
                transformResult: function (response) {
                    return typeof response === 'string' ? $.parseJSON(response) : response;
                },
                showNoSuggestionNotice: false,
                noSuggestionNotice: 'No results',
                orientation: 'bottom',
                forceFixPosition: false
            };
            // Shared variables:
            self.el = $(element);
            self.suggestions = [];
            self.classes = {
                selected: 'lazymselect-selected',
                suggestion: 'lazymselect-suggestion',
                over: 'lazymselect-over'
            };
            self.options = $.extend({}, defaults, options);
        };
        LazyMSelect.prototype.initialize = function () {
            var self = this, suggestionSelector = '.' + self.classes.suggestion, selected = self.classes.selected, options = self.options;
            // Remove lazymselect attribute to prevent native suggestions:
            self.el[0].setAttribute('autocomplete', 'off');
            // html() deals with many types: htmlString or Element or Array or jQuery
            self.noSuggestionsContainer = $('<div class="lazymselect-no-suggestion"></div>')
                .html(this.options.noSuggestionNotice).get(0);
            self.attachEvents(suggestionSelector);
            $.extend(self.options, options);
            LazyMSelectUtils.isDebug = self.options.debug;
            self.options.orientation = LazyMSelectView.validateOrientation(options.orientation, 'bottom');
        };
        LazyMSelect.prototype.attachEvents = function (suggestionSelector) {
            var _this = this;
            var self = this;
            $(window).on('resize.lazymselect', function (e) {
                LazyMSelectUtils.debug("window resize");
            });
            self.el.on('change.lazymselect', function (e) {
                LazyMSelectUtils.debug("change");
            });
            self.el.on('input.lazymselect', function (e) {
                LazyMSelectUtils.debug("input");
            });
            self.el.on('focus.lazymselect', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var selection;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            LazyMSelectUtils.debug("focus");
                            self.view.fixPosition();
                            return [4 /*yield*/, self.populateSuggestions()];
                        case 1:
                            _a.sent();
                            self.visibleSuggestions = true;
                            selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, self.el.val());
                            self.hoverSuggestionIndex = !!selection ? selection.index : -1;
                            self.view.highlightSameSelection(self.el.val());
                            return [2 /*return*/];
                    }
                });
            }); });
            self.el.on('blur.lazymselect', function () {
                LazyMSelectUtils.debug("blur");
                self.visibleSuggestions = false;
                self.checkInputValue();
            });
            self.el.on('keydown.lazymselect', function (e) {
                LazyMSelectUtils.debug("keydown");
                self.onKeyDown(e);
            });
            self.el.on('keyup.lazymselect', function (e) {
                LazyMSelectUtils.debug("keyup");
                self.onKeyUp(e);
            });
        };
        LazyMSelect.prototype.onContainerMouseover = function (e) {
            var self = this;
            self.view.highlightOverIndex($(e).data(LazyMSelectUtils.PropIndex));
        };
        LazyMSelect.prototype.onContainerMouseout = function (e) {
            var self = this;
            self.view.highlightOverIndex(-1);
        };
        LazyMSelect.prototype.onContainerClick = function (e) {
            var self = this;
            self.currentValue = $(e).text();
        };
        LazyMSelect.prototype.onKeyDown = function (e) {
            var self = this;
            switch (e.which) {
                case LazyMSelectUtils.keys.UP:
                    if (self.hoverSuggestionIndex > 0) {
                        self.hoverSuggestionIndex = self.hoverSuggestionIndex - 1;
                    }
                    break;
                case LazyMSelectUtils.keys.DOWN:
                    if (self.hoverSuggestionIndex < self.suggestions.length - 1) {
                        self.hoverSuggestionIndex = self.hoverSuggestionIndex + 1;
                    }
                    break;
                case LazyMSelectUtils.keys.HOME:
                    self.hoverSuggestionIndex = 0;
                    break;
                case LazyMSelectUtils.keys.END:
                    self.hoverSuggestionIndex = self.suggestions.length - 1;
                    break;
                case LazyMSelectUtils.keys.RETURN:
                case LazyMSelectUtils.keys.TAB:
                    var suggestion = self.suggestions[self.hoverSuggestionIndex];
                    if (suggestion) {
                        self.currentValue = suggestion.name;
                        self.visibleSuggestions = false;
                    }
                case LazyMSelectUtils.keys.ESC:
                    self.visibleSuggestions = false;
                default:
                    self.visibleSuggestions = true;
                    break;
            }
        };
        LazyMSelect.prototype.onKeyUp = function (e) {
            var self = this;
            switch (e.which) {
                case LazyMSelectUtils.keys.UP:
                case LazyMSelectUtils.keys.DOWN:
                case LazyMSelectUtils.keys.RETURN:
                case LazyMSelectUtils.keys.TAB:
                case LazyMSelectUtils.keys.ESC:
                case LazyMSelectUtils.keys.HOME:
                case LazyMSelectUtils.keys.END:
                    return;
                default:
                    break;
            }
            var selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, self.el.val());
            self.hoverSuggestionIndex = !!selection ? selection.index : -1;
            self.view.highlightSameSelection(self.el.val());
        };
        LazyMSelect.prototype.populateSuggestions = function () {
            var self = this;
            var dataReady = $.Deferred();
            if (self.suggestions.length > 0) {
                dataReady.resolve();
            }
            else {
                var options_1 = self.options;
                var ajaxSettings = {
                    url: options_1.url,
                    data: options_1.params,
                    type: options_1.type,
                    dataType: options_1.dataType
                };
                $.extend(ajaxSettings, options_1.ajaxSettings);
                self.view.loding = true;
                $.ajax(ajaxSettings).then(function (rawData) {
                    var result = rawData;
                    if (options_1.transformResult) {
                        var result_1 = options_1.transformResult(rawData);
                        if ($.isArray(result_1)) {
                            self.suggestions = result_1 || [];
                            for (var i = 0; i < result_1.length; i++) {
                                self.suggestions[i].index = i;
                            }
                        }
                    }
                    self.view.loding = false;
                    dataReady.resolve();
                });
            }
            return dataReady;
        };
        LazyMSelect.prototype.showSuggestions = function () {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.showNoSuggestions();
                }
                else {
                    this.hideSuggestions();
                }
                return;
            }
            var self = this, options = self.options, groupBy = options.groupBy, formatResult = options.formatResult, value = self.currentValue, className = self.classes.suggestion, classSelected = self.classes.selected, container = self.view.getSuggestionsContainer(), noSuggestionsContainer = $(self.noSuggestionsContainer), beforeRender = options.beforeRender, html = '';
            // Build suggestions inner HTML:
            $.each(self.suggestions, function (i, suggestion) {
                var name = LazyMSelectUtils.htmlEncode(suggestion.name);
                var item = "<div data-" + LazyMSelectUtils.PropId + "=\"" + suggestion.id + "\"  \n                                 data-" + LazyMSelectUtils.PropIndex + "=\"" + i + "\"\n                                 class=\"" + self.classes.suggestion + "\" \n                                 title=\"" + name + "\">" + name + "</div>";
                html += item;
            });
            self.view.adjustContainerWidthInternal();
            noSuggestionsContainer.detach();
            container.html(html);
            if ($.isFunction(beforeRender)) {
                beforeRender.call(self.el[0], container, self.suggestions);
            }
            self.view.fixPosition();
            container.show();
        };
        LazyMSelect.prototype.hideSuggestions = function () {
            var self = this, container = self.view.getSuggestionsContainer();
            if ($.isFunction(self.options.onHide) && self.visibleSuggestions) {
                self.options.onHide.call(self.el[0], container);
            }
            // NOTICE: wait container 'click.lazyselct' event trigger.
            setTimeout(function () {
                self.view.getSuggestionsContainer().hide();
            }, 200);
        };
        LazyMSelect.prototype.showNoSuggestions = function () {
            LazyMSelectUtils.debug("noSuggestions");
            var self = this, container = self.view.getSuggestionsContainer(), noSuggestionsContainer = $(self.noSuggestionsContainer);
            self.view.adjustContainerWidthInternal();
            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);
            self.view.fixPosition();
            container.show();
        };
        Object.defineProperty(LazyMSelect.prototype, "hoverSuggestionIndex", {
            get: function () {
                var self = this;
                return self._hoverSuggestionIndex;
            },
            set: function (index) {
                var self = this;
                self._hoverSuggestionIndex = index;
                self.view.highlightSelectedIndex(index);
            },
            enumerable: true,
            configurable: true
        });
        LazyMSelect.prototype.checkInputValue = function () {
            var self = this;
            var selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, self.el.val());
            if (!selection) {
                // rollback
                LazyMSelectUtils.debug("rollback: from '" + self.el.val() + "' to '" + self.currentValue + "'");
                self.el.val(self.currentValue);
            }
            else {
                self.currentValue = selection.name;
            }
        };
        Object.defineProperty(LazyMSelect.prototype, "currentValue", {
            get: function () {
                return this._currentValue;
            },
            set: function (newValue) {
                var self = this;
                LazyMSelectUtils.debug("param: " + newValue + ", _currentValue:'" + this._currentValue + "'");
                var selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, newValue);
                if (self._currentValue !== newValue) {
                    self.el.val(selection.name || self._currentValue);
                }
                if (selection) {
                    LazyMSelectUtils.debug(selection);
                    (self.options.onSelect || $.noop)(selection);
                    self._currentValue = newValue;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LazyMSelect.prototype, "visibleSuggestions", {
            get: function () {
                return this._visibleSuggestions;
            },
            set: function (v) {
                if (v) {
                    this.showSuggestions();
                }
                else {
                    this.hideSuggestions();
                }
                this._visibleSuggestions = v;
            },
            enumerable: true,
            configurable: true
        });
        LazyMSelect.prototype.populateId = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                function doSetId() {
                    var selection = LazyMSelectUtils.findMatchSelectionById(self.suggestions, id);
                    if (selection) {
                        self.currentValue = selection.name;
                        self.hoverSuggestionIndex = selection.index;
                    }
                }
                var self;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            self = this;
                            return [4 /*yield*/, self.populateSuggestions()];
                        case 1:
                            _a.sent();
                            doSetId();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LazyMSelect.prototype.setPreviewName = function (name) {
            var self = this;
            self._currentValue = name;
            self.el.val(name);
        };
        return LazyMSelect;
    }());
    var LazyMSelectView = (function () {
        function LazyMSelectView(lazySelect) {
            this.lazySelect = lazySelect;
            this._suggestionsContainer = null;
        }
        LazyMSelectView.prototype.fixPosition = function () {
            // Use only when container has already its content
            var self = this;
            var lazySelect = self.lazySelect, $container = self.getSuggestionsContainer(), containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !lazySelect.options.forceFixPosition) {
                return;
            }
            // Choose orientation
            var orientation = lazySelect.options.orientation, containerHeight = $container.outerHeight(), height = lazySelect.el.outerHeight(), offset = lazySelect.el.offset(), styles = { 'top': offset.top, 'left': offset.left, 'width': null };
            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(), scrollTop = $(window).scrollTop(), topOverflow = -scrollTop + offset.top - containerHeight, bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);
                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }
            if (orientation === 'top') {
                styles.top += -containerHeight;
            }
            else {
                styles.top += height;
            }
            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                var opacity = $container.css('opacity'), parentOffsetDiff = void 0;
                if (!lazySelect.visibleSuggestions) {
                    $container.css('opacity', 0).show();
                }
                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;
                if (!lazySelect.visibleSuggestions) {
                    $container.css('opacity', opacity).hide();
                }
            }
            if (lazySelect.options.width === 'auto') {
                styles.width = lazySelect.el.outerWidth() + 'px';
            }
            $container.css(styles);
        };
        LazyMSelectView.validateOrientation = function (orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();
            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }
            return orientation;
        };
        LazyMSelectView.prototype.highlightSameSelection = function (val) {
            var self = this;
            var lazySelect = this.lazySelect, value = val.toLowerCase(), bestMatchSuggestion = null;
            self.getSuggestionsContainer().children().removeClass("lazymselect-suggestion-same");
            self.getSuggestionsContainer().children().show();
            if (value.trim().length > 0) {
                for (var _i = 0, _a = lazySelect.suggestions; _i < _a.length; _i++) {
                    var suggestion = _a[_i];
                    var foundMatch = suggestion.name.toLowerCase().indexOf(value) === 0;
                    if (!foundMatch) {
                        self.getSuggestionsContainer().children().eq(suggestion.index).hide();
                    }
                    else {
                        self.getSuggestionsContainer().children().eq(suggestion.index).addClass("lazymselect-suggestion-same");
                    }
                }
                ;
            }
        };
        LazyMSelectView.prototype.highlightSelectedIndex = function (index) {
            var self = this;
            var lazySelect = self.lazySelect;
            if (self.getSuggestionsContainer() === null || self.getSuggestionsContainer() === undefined) {
                return;
            }
            if (index === null || index === undefined) {
                index = -1;
            }
            var activeItem = self.highlightSelectedStyle(index);
            if (!activeItem) {
                return;
            }
            self.scrollToActiveItem(activeItem);
        };
        LazyMSelectView.prototype.scrollToActiveItem = function (activeItem) {
            var self = this, lazySelect = self.lazySelect, offsetTop, upperBound, lowerBound, heightDelta = $(activeItem).outerHeight();
            offsetTop = activeItem.offsetTop;
            upperBound = self.getSuggestionsContainer().scrollTop();
            lowerBound = upperBound + lazySelect.options.maxHeight - heightDelta;
            if (offsetTop < upperBound) {
                self.getSuggestionsContainer().scrollTop(offsetTop);
            }
            else if (offsetTop > lowerBound) {
                self.getSuggestionsContainer().scrollTop(offsetTop - lazySelect.options.maxHeight + heightDelta);
            }
        };
        LazyMSelectView.prototype.highlightSelectedStyle = function (index) {
            var self = this, selected = self.lazySelect.classes.selected, container = self.getSuggestionsContainer(), children = container.find('.' + self.lazySelect.classes.suggestion);
            container.find('.' + selected).removeClass(selected);
            var activeItem = children.get(index);
            if (activeItem) {
                $(activeItem).addClass(selected);
            }
            return activeItem;
        };
        LazyMSelectView.prototype.highlightOverIndex = function (index) {
            var self = this;
            var lazySelect = self.lazySelect;
            if (self.getSuggestionsContainer() === null || self.getSuggestionsContainer() === undefined) {
                return;
            }
            if (index === null || index === undefined) {
                index = -1;
            }
            self.highlightOverStyle(index);
        };
        LazyMSelectView.prototype.highlightOverStyle = function (index) {
            var self = this, overed = self.lazySelect.classes.over, container = self.getSuggestionsContainer(), children = container.find('.' + self.lazySelect.classes.suggestion);
            container.find('.' + overed).removeClass(overed);
            var activeItem = children.get(index);
            if (activeItem) {
                $(activeItem).addClass(overed);
            }
            return activeItem;
        };
        LazyMSelectView.prototype.adjustContainerWidthInternal = function () {
            var self = this, lazySelect = self.lazySelect, width, container = self.getSuggestionsContainer();
            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (lazySelect.options.width === 'auto') {
                width = lazySelect.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            }
        };
        Object.defineProperty(LazyMSelectView.prototype, "loding", {
            set: function (isLoading) {
                LazyMSelectUtils.debug("showLoading");
                var self = this;
                if (isLoading) {
                    self.lazySelect.el.addClass("lazymselect-loading-suggestion");
                }
                else {
                    self.lazySelect.el.removeClass("lazymselect-loading-suggestion");
                }
            },
            enumerable: true,
            configurable: true
        });
        LazyMSelectView.prototype.getSuggestionsContainer = function () {
            var self = this;
            var lazySelect = self.lazySelect;
            if (self._suggestionsContainer) {
                return self._suggestionsContainer;
            }
            var suggestionsContainer = LazyMSelectUtils.createNode(lazySelect.options.containerClass);
            document.body.appendChild(suggestionsContainer);
            self._suggestionsContainer = $(suggestionsContainer);
            // Only set width if it was provided:
            if (lazySelect.options.width !== 'auto') {
                self._suggestionsContainer.css('width', lazySelect.options.width);
            }
            // Adjust height, width and z-index:
            self._suggestionsContainer.css({
                'max-height': lazySelect.options.maxHeight + 'px',
                'width': lazySelect.options.width + 'px',
                'z-index': lazySelect.options.zIndex
            });
            var suggestionSelector = '.' + lazySelect.classes.suggestion;
            self._suggestionsContainer.on('mouseover.lazymselect', suggestionSelector, function (e) {
                // Listen for mouse over event on suggestions list:
                LazyMSelectUtils.debug("container mouseover.lazymselect:" + $(this).data(LazyMSelectUtils.PropId));
                self.lazySelect.onContainerMouseover(this);
            });
            self._suggestionsContainer.on('mouseout.lazymselect', suggestionSelector, function (e) {
                // Deselect active element when mouse leaves suggestions container:
                LazyMSelectUtils.debug("container mouseout.lazymselect");
                self.lazySelect.onContainerMouseout(this);
            });
            self._suggestionsContainer.on('click.lazymselect', suggestionSelector, function (e) {
                LazyMSelectUtils.debug("container click.lazymselect: " + $(this).text());
                self.lazySelect.onContainerClick(this);
                return false;
            });
            return this._suggestionsContainer;
        };
        return LazyMSelectView;
    }());
    var LazyMSelectUtils = (function () {
        function LazyMSelectUtils() {
        }
        LazyMSelectUtils.debug = function (message) {
            if (LazyMSelectUtils.isDebug === true && console.debug) {
                console.debug(message);
            }
        };
        LazyMSelectUtils.escapeRegExChars = function (value) {
            return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
        };
        LazyMSelectUtils.createNode = function (containerClass) {
            var div = document.createElement('div');
            div.className = containerClass;
            div.style.position = 'absolute';
            div.style.display = 'none';
            return div;
        };
        LazyMSelectUtils.formatResult = function (suggestion, currentValue) {
            // Do not replace anything if there current value is empty
            if (!currentValue) {
                return suggestion.name;
            }
            var pattern = '(' + LazyMSelectUtils.escapeRegExChars(currentValue) + ')';
            return suggestion.name
                .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
        };
        LazyMSelectUtils.htmlEncode = function (value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        };
        LazyMSelectUtils.findMatchSelectionByName = function (suggestions, val) {
            var self = this;
            for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
                var suggestion = suggestions_1[_i];
                var foundMatch = suggestion.name === val;
                if (foundMatch) {
                    return suggestion;
                }
            }
            return null;
        };
        LazyMSelectUtils.findMatchSelectionById = function (suggestions, id) {
            var self = this, fullMatchSuggestion = null;
            for (var _i = 0, suggestions_2 = suggestions; _i < suggestions_2.length; _i++) {
                var suggestion = suggestions_2[_i];
                var foundMatch = suggestion.id.toString() === id.toString();
                if (foundMatch) {
                    return suggestion;
                }
            }
            return null;
        };
        return LazyMSelectUtils;
    }());
    LazyMSelectUtils.keys = { ESC: 27, TAB: 9, RETURN: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, HOME: 36, END: 35 };
    LazyMSelectUtils.PREFIX = "lazymselect";
    LazyMSelectUtils.PropIndex = LazyMSelectUtils.PREFIX + '-index';
    LazyMSelectUtils.PropId = LazyMSelectUtils.PREFIX + '-id';
    $.fn.lazymSelect = function (options, args) {
        var dataKey = 'lazymselect';
        if (!arguments.length) {
            return this.first().data(dataKey);
        }
        return this.each(function () {
            var inputElement = $(this), instance = inputElement.data(dataKey);
            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            }
            else {
                instance = new LazyMSelect(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
})();

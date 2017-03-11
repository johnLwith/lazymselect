/**
   powerby: https://github.com/devbridge/jQuery-Autocomplete
*/
(function () {

    class LazyMSelect implements IHaveSuggestions, LazyMSelectInstance {
        
        public
        suggestions: LazyMSelectSuggestion[];

        private
        el: JQuery;
        noSuggestionsContainer: HTMLElement;
        onChange: Function;
        options: LazyMSelectOptions; classes: { selected: string, suggestion: string, over: string };
        view: LazyMSelectView;

        constructor(element: HTMLInputElement, options: LazyMSelectOptions) {
            let self = this;

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

        private configOptions(element: HTMLInputElement, options: LazyMSelectOptions) {
            let noop = $.noop,
                self = this,
                defaults = <LazyMSelectOptions>{
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
        }

        private initialize() {
            let self = this,
                suggestionSelector = '.' + self.classes.suggestion,
                selected = self.classes.selected,
                options = self.options;

            // Remove lazymselect attribute to prevent native suggestions:
            self.el[0].setAttribute('autocomplete', 'off');

            // html() deals with many types: htmlString or Element or Array or jQuery
            self.noSuggestionsContainer = $('<div class="lazymselect-no-suggestion"></div>')
                .html(<string>this.options.noSuggestionNotice).get(0);
            
            self.attachEvents(suggestionSelector);

            $.extend(self.options, options);
            LazyMSelectUtils.isDebug = self.options.debug;

            self.options.orientation = LazyMSelectView.validateOrientation(options.orientation, 'bottom');
        }

        private attachEvents(suggestionSelector: string) {
            let self = this;
            $(window).on('resize.lazymselect', function (e) {
                LazyMSelectUtils.debug("window resize");
            });
            
            self.el.on('change.lazymselect', function (e) {
                LazyMSelectUtils.debug("change");
            });
            self.el.on('input.lazymselect', function (e) {
                LazyMSelectUtils.debug("input");
            });
            self.el.on('focus.lazymselect', async (e) => {
                LazyMSelectUtils.debug("focus");

                self.view.fixPosition();
                await self.populateSuggestions();
                
                self.visibleSuggestions = true;
                let selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, self.el.val());
                self.hoverSuggestionIndex = !!selection ? selection.index : -1;
                self.view.highlightSameSelection(self.el.val());
             
            });
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
        }
        private onContainerMouseover(e: HTMLElement) {
            let self = this;
            self.view.highlightOverIndex($(e).data(LazyMSelectUtils.PropIndex));
        }
        private onContainerMouseout(e: HTMLElement) {
            let self = this;
            self.view.highlightOverIndex(-1);
        }
        private onContainerClick(e: HTMLElement) {
            let self = this;
            self.currentValue = $(e).text();
        }
        private onKeyDown(e: JQueryEventObject) {
            let self = this;
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
                    let suggestion = self.suggestions[self.hoverSuggestionIndex];
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
        }
        private onKeyUp(e: JQueryEventObject) {
            let self = this;

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

            let selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, self.el.val());
            self.hoverSuggestionIndex = !!selection ? selection.index : -1;
            self.view.highlightSameSelection(self.el.val());
        }

        private populateSuggestions(): JQueryDeferred<void> {
            let self = this;

            let dataReady = $.Deferred<void>();
            if (self.suggestions.length > 0) {
                dataReady.resolve();
            } else {
                let options = self.options;
                let ajaxSettings = {
                    url: options.url,
                    data: options.params,
                    type: options.type,
                    dataType: options.dataType
                };
                $.extend(ajaxSettings, options.ajaxSettings);
                self.view.loding = true;
                $.ajax(ajaxSettings).then(function (rawData: LazyMSelectSuggestion[]) {
                    let result = rawData;
                    if (options.transformResult) {
                        let result = options.transformResult(rawData);
                        if ($.isArray(result)) {
                            self.suggestions = result || [];
                            for (let i = 0; i < result.length; i++) {
                                self.suggestions[i].index = i;
                            }
                        }
                    }
                    self.view.loding = false;
                    dataReady.resolve();
                });
            }
            return dataReady;
        }

        private showSuggestions() {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.showNoSuggestions();
                } else {
                    this.hideSuggestions();
                }
                return;
            }

            let self = this,
                options = self.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = self.currentValue,
                className = self.classes.suggestion,
                classSelected = self.classes.selected,
                container = self.view.getSuggestionsContainer(),
                noSuggestionsContainer = $(self.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '';

            // Build suggestions inner HTML:
            $.each(self.suggestions, function (i, suggestion) {
                let name = LazyMSelectUtils.htmlEncode(suggestion.name);
                let item = `<div data-${LazyMSelectUtils.PropId}="${suggestion.id}"  
                                 data-${LazyMSelectUtils.PropIndex}="${i}"
                                 class="${self.classes.suggestion}" 
                                 title="${name}">${name}</div>`;
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
        }
        private hideSuggestions() {
            let self = this,
                container = self.view.getSuggestionsContainer();

            if ($.isFunction(self.options.onHide) && self.visibleSuggestions) {
                self.options.onHide.call(self.el[0], container);
            }

            // NOTICE: wait container 'click.lazyselct' event trigger.
            setTimeout(() => {
                self.view.getSuggestionsContainer().hide();
            }, 200);
        }
        private showNoSuggestions() {
            LazyMSelectUtils.debug("noSuggestions");

            let self = this,
                container = self.view.getSuggestionsContainer(),
                noSuggestionsContainer = $(self.noSuggestionsContainer);

            self.view.adjustContainerWidthInternal();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            self.view.fixPosition();

            container.show();
        }
        
        private _hoverSuggestionIndex: number = -1;
        private get hoverSuggestionIndex() {
            let self = this;
            return self._hoverSuggestionIndex;
        }
        private set hoverSuggestionIndex(index: number) {
            let self = this;
            self._hoverSuggestionIndex = index;
            self.view.highlightSelectedIndex(index);
        }

        private checkInputValue() {
            let self = this;
            let selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, self.el.val());
            if (!selection) {
                // rollback
                LazyMSelectUtils.debug(`rollback: from '${self.el.val()}' to '${self.currentValue}'`);
                self.el.val(self.currentValue);
            } else {
                self.currentValue = selection.name;
            }
        }
        private _currentValue: string = "";
        private set currentValue(newValue: string) {
            let self = this;
            LazyMSelectUtils.debug(`param: ${newValue}, _currentValue:'${this._currentValue}'`);
            let selection = LazyMSelectUtils.findMatchSelectionByName(self.suggestions, newValue);

            if (self._currentValue !== newValue) {
                self.el.val(selection.name || self._currentValue);
            }
            if (selection) {
                LazyMSelectUtils.debug(selection);
                (self.options.onSelect || $.noop)(selection);
                self._currentValue = newValue;
            }
        }
        private get currentValue() {
            return this._currentValue;
        }

        private _visibleSuggestions: boolean = false;
        private get visibleSuggestions() {
            return this._visibleSuggestions;
        }
        private set visibleSuggestions(v: boolean) {
            if (v) {
                this.showSuggestions();
            } else {
                this.hideSuggestions();
            }
            this._visibleSuggestions = v;
        }

        public async populateId(id: string) {
            let self = this;

            function doSetId() {
                let selection = LazyMSelectUtils.findMatchSelectionById(self.suggestions, id);
                if (selection) {
                    self.currentValue = selection.name;
                    self.hoverSuggestionIndex = selection.index;
                }
            }

            await self.populateSuggestions();
            doSetId();
        }

        public setPreviewName(name: string) {
            let self = this;
            self._currentValue = name; 
            self.el.val(name);
        }
    }

    class LazyMSelectView {

        constructor(private lazySelect: ILazyMSelectViewOptions) {

        }

        public fixPosition() {
            // Use only when container has already its content
            let self = this;
            let lazySelect = self.lazySelect,
                $container = self.getSuggestionsContainer(),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !lazySelect.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            let orientation = lazySelect.options.orientation,
                containerHeight = $container.outerHeight(),
                height = lazySelect.el.outerHeight(),
                offset = lazySelect.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left, 'width': null };

            if (orientation === 'auto') {
                let viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                let opacity = $container.css('opacity'),
                    parentOffsetDiff;

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
        }

        public static validateOrientation(orientation: string, fallback: "bottom" | "auto" | "top"): "bottom" | "auto" | "top" {
            orientation = $.trim(orientation || '').toLowerCase();

            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }

            return <any>orientation;
        }

        public highlightSameSelection(val: string) {
            let self = this;
            let lazySelect = this.lazySelect,
                value: string = val.toLowerCase(),
                bestMatchSuggestion: LazyMSelectSuggestion = null;

            self.getSuggestionsContainer().children().removeClass("lazymselect-suggestion-same");
            self.getSuggestionsContainer().children().show();
            if (value.trim().length > 0) {
                for (let suggestion of lazySelect.suggestions) {
                    let foundMatch = suggestion.name.toLowerCase().indexOf(value) === 0;
                    if (!foundMatch) {
                        self.getSuggestionsContainer().children().eq(suggestion.index).hide();
                    } else {
                        self.getSuggestionsContainer().children().eq(suggestion.index).addClass("lazymselect-suggestion-same");
                    }
                };
            }
        }
        
        public highlightSelectedIndex(index: number) {
            let self = this;
            let lazySelect = self.lazySelect;
            if (self.getSuggestionsContainer() === null || self.getSuggestionsContainer() === undefined) {
                return;
            }
            if (index === null || index === undefined) {
                index = -1;
            }
            
            let activeItem = self.highlightSelectedStyle(index);
            if (!activeItem) {
                return;
            }

           self.scrollToActiveItem(activeItem);
        }

        private scrollToActiveItem(activeItem: HTMLElement) {
            let self = this,
                lazySelect = self.lazySelect, 
                offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = self.getSuggestionsContainer().scrollTop();
            lowerBound = upperBound + lazySelect.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                self.getSuggestionsContainer().scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                self.getSuggestionsContainer().scrollTop(offsetTop - lazySelect.options.maxHeight + heightDelta);
            }
        }

        private highlightSelectedStyle(index: number) {
            let self = this,
                selected = self.lazySelect.classes.selected,
                container = self.getSuggestionsContainer(),
                children = container.find('.' + self.lazySelect.classes.suggestion);

            container.find('.' + selected).removeClass(selected); 

            let activeItem = children.get(index);
            if (activeItem) {
                $(activeItem).addClass(selected);
            }
            return activeItem;
        }

        public highlightOverIndex(index: number) {
            let self = this;
            let lazySelect = self.lazySelect;
            if (self.getSuggestionsContainer() === null || self.getSuggestionsContainer() === undefined) {
                return;
            }
            if (index === null || index === undefined) {
                index = -1;
            }

            self.highlightOverStyle(index);
        }

        private highlightOverStyle(index: number) {
            let self = this,
                overed = self.lazySelect.classes.over,
                container = self.getSuggestionsContainer(),
                children = container.find('.' + self.lazySelect.classes.suggestion);

            container.find('.' + overed).removeClass(overed);

            let activeItem = children.get(index);
            if (activeItem) {
                $(activeItem).addClass(overed);
            }
            return activeItem;
        }

        public adjustContainerWidthInternal() {
            let self = this,
                lazySelect = self.lazySelect,
                width,
                container = self.getSuggestionsContainer();

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (lazySelect.options.width === 'auto') {
                width = lazySelect.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            }
        }

        public set loding(isLoading: boolean) {
            LazyMSelectUtils.debug("showLoading");
            let self = this;
            if (isLoading) {
                self.lazySelect.el.addClass("lazymselect-loading-suggestion");
            } else {
                self.lazySelect.el.removeClass("lazymselect-loading-suggestion");
            }
        }

        private _suggestionsContainer: JQuery = null;
        public getSuggestionsContainer() {
            let self = this;
            let lazySelect = self.lazySelect;
            if (self._suggestionsContainer) {
                return self._suggestionsContainer;
            }

            let suggestionsContainer = LazyMSelectUtils.createNode(lazySelect.options.containerClass);
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

            let suggestionSelector = '.' + lazySelect.classes.suggestion;
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
                LazyMSelectUtils.debug(`container click.lazymselect: ${$(this).text()}`);
                self.lazySelect.onContainerClick(this); 
                return false;
            });
            
            return this._suggestionsContainer;
        }
    }

    interface ILazyMSelectViewOptions {
        options: LazyMSelectOptions;
        el: JQuery;
        visibleSuggestions: boolean;
        hoverSuggestionIndex: number;
        classes: { selected: string, suggestion: string, over: string };
        suggestions: LazyMSelectSuggestion[];
        onContainerMouseover(e: HTMLElement);
        onContainerMouseout(e: HTMLElement);
        onContainerClick(e: HTMLElement);
    }

    class /*static*/ LazyMSelectUtils {
        public static readonly keys = { ESC: 27, TAB: 9, RETURN: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, HOME: 36, END: 35 };

        public static isDebug: boolean;
        public static debug(message?: any) {
            if (LazyMSelectUtils.isDebug === true && console.debug) {
                console.debug(message);
            }
        }

        public static escapeRegExChars(value: string) {
            return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
        }

        public static createNode(containerClass: string) {
            let div = document.createElement('div');
            div.className = containerClass;
            div.style.position = 'absolute';
            div.style.display = 'none';
            return div;
        }

        public static formatResult(suggestion: LazyMSelectSuggestion, currentValue: string) {
            // Do not replace anything if there current value is empty
            if (!currentValue) {
                return suggestion.name;
            }

            let pattern = '(' + LazyMSelectUtils.escapeRegExChars(currentValue) + ')';

            return suggestion.name
                .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
        }

        public static htmlEncode(value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        }

        public static findMatchSelectionByName(suggestions: LazyMSelectSuggestion[], val: string): LazyMSelectSuggestion {
            let self = this;
            for (let suggestion of suggestions) {
                let foundMatch = suggestion.name === val;
                if (foundMatch) {
                    return suggestion;
                }
            }
            return null;
        }

        public static findMatchSelectionById(suggestions: LazyMSelectSuggestion[],id: string): LazyMSelectSuggestion {
            let self = this,
                fullMatchSuggestion: LazyMSelectSuggestion = null;

            for (let suggestion of suggestions) {
                let foundMatch = suggestion.id.toString() === id.toString();
                if (foundMatch) {
                    return suggestion;
                }
            }
            return null;
        }

        static readonly PREFIX = `lazymselect`;
        static readonly PropIndex = LazyMSelectUtils.PREFIX + '-index';
        static readonly PropId = LazyMSelectUtils.PREFIX + '-id';
    }
    
    interface IHaveSuggestions {
        suggestions: LazyMSelectSuggestion[]
    }
  
    $.fn.lazymSelect = function (options: string, args) {
        let dataKey = 'lazymselect';
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            let inputElement = $(this),
                instance: LazyMSelect = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                instance = new LazyMSelect(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
})();
// Type definitions for jQuery-Autocomplete 1.2.25
// Project: https://www.devbridge.com/sourcery/components/jquery-lazymselect/
// Definitions by: John Gouigouix <https://github.com/orchestra-ts/DefinitelyTyped/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface LazyMSelectSuggestion {
    index: number;
    id: string;
    name: string;
    disable?: boolean;
}

interface LazyMSelectOptions {
    debug?: boolean;
    // internal
    ignoreParams?: Object;
    containerClass?: string;


    //----------------o AJAX SETTINGS

    /**
     * Server side URL or callback function that returns serviceUrl string. Optional if local lookup data is provided.
     */
    url?: string;

    /**
     * Ajax request type to get suggestions.
     * @default "GET"
     */
    type?: string;

    /**
     * type of data returned from server. Either text, json or jsonp, which will cause the lazymselect to use jsonp.
     * You may return a json object in your callback when using jsonp.
     * @default "text"
     */
    dataType?: "text" | "json" | "jsonp";

    /**
     * The name of the request parameter that contains the query.
     * @default "query"
     */
    paramName?: string;

    /**
     * Additional parameters to pass with the request, optional.
     */
    params?: Object;

    /**
     * Number of miliseconds to defer ajax request.
     * @default 0
     */
    deferRequestBy?: number;

    /**
     * Any additional Ajax Settings that configure the jQuery Ajax request.
     */
    ajaxSettings?: JQueryAjaxSettings;


    //----------------o CONFIG SETTINGS

    /**
     * Boolean value indicating whether to cache suggestion results.
     * @default false
     */
    noCache?: boolean;

    /**
     * That splits input value and takes last part to as query for suggestions.
     * Useful when for example you need to fill list of coma separated values.
     */
    delimiter?: string | RegExp;

    /**
     * Called before ajax request. this is bound to input element.
     * @param query
     */
    onSearchStart?(query: string): void;

    /**
     * Called after ajax response is processed. this is bound to input element.
     * Suggestions is an array containing the results.
     * @param query
     * @param suggestions
     */
    onSearchComplete?(query: string, suggestions: LazyMSelectSuggestion[]): void;

    /**
     * Called if ajax request fails. this is bound to input element.
     * @param query
     * @param jqXHR
     * @param textStatus
     * @param errorThrown
     */
    onSearchError?(query: string, jqXHR: JQueryXHR, textStatus: string, errorThrown: any): void;

    /**
     * Called after the result of the query is ready. Converts the result into response.suggestions format.
     * @param response
     * @param originalQuery
     */
    transformResult?(suggestions: LazyMSelectSuggestion[]): LazyMSelectSuggestion[];

    onSelect?(suggestion: LazyMSelectSuggestion): void;
    
    /**
     * Boolean value indicating if select should be triggered if it matches suggestion.
     * @default true
     */
    triggerSelectOnValidInput?: boolean;

    /**
     * Boolean value indicating if it shoud prevent future ajax requests for queries with the same root if no results were returned.
     * E.g. if Jam returns no suggestions, it will not fire for any future query that starts with Jam.
     * @default true
     */
    preventBadQueries?: boolean;

    /**
     * If set to true, first item will be selected when showing suggestions.
     * @default false
     */
    autoSelectFirst?: boolean;

    /**
     * Called before container will be hidden
     * @param container
     */
    onHide?(container: any): void;


    //----------------o PRESENTATION SETTINGS

    /**
     * Called before displaying the suggestions. You may manipulate suggestions DOM before it is displayed.
     * @param container
     */
    beforeRender?(container: any): void;

    /**
     * Custom function to format suggestion entry inside suggestions container, optional.
     * @param suggestion
     * @param currentValue
     */
    formatResult?(suggestion: LazyMSelectSuggestion, currentValue: string): string;

    /**
     * Property name of the suggestion data object, by which results should be grouped.
     */
    groupBy?: string;

    /**
     * Maximum height of the suggestions container in pixels.
     * @default 300
     */
    maxHeight?: number;

    /**
     * Suggestions container width in pixels, e.g.: 300. takes input field width.
     * @default "auto"
     */
    width?: string | number;

    /**
     * 'z-index' for suggestions container.
     * @default 9999
     */
    zIndex?: number;


    /**
     * Suggestions are automatically positioned when their container is appended to body (look at appendTo option),
     * in other cases suggestions are rendered but no positioning is applied.
     * Set this option to force auto positioning in other cases.
     * @default false
     */
    forceFixPosition?: boolean;

    /**
     * Vertical orientation of the displayed suggestions, available values are auto, top, bottom.
     * If set to auto, the suggestions will be orientated it the way that place them closer to middle of the view port.
     * @default "bottom"
     */
    orientation?: "bottom" | "auto" | "top"

    /**
     * If true, input value stays the same when navigating over suggestions.
     * @default false
     */
    preserveInput?: boolean;

    /**
     * When no matching results, display a notification label.
     * @default false
     */
    showNoSuggestionNotice?: boolean;

    /**
     * Text or htmlString or Element or jQuery object for no matching results label.
     * @default "No results"
     */
    noSuggestionNotice?: string | Element | JQuery;
}

interface LazyMSelectInstance {
    populateId(id: string): Promise<void>;
    setPreviewName(name: string): void;
}

interface JQuery {
    /**
     * Create Autocomplete component via plugin alias
     */
    lazymSelect(options?: LazyMSelectOptions): JQuery;

    /**
     * Trigger non-specialized signature method
     * @param methodName
     * @param arg
     */
    lazymSelect(methodName: string, ...arg: any[]): any;

    /**
     * You may update any option at any time. Options are listed above.
     * @param methodName The name of the method
     * @param options
     */
    lazymSelect(methodName: "setOptions", options: LazyMSelectOptions): LazyMSelectInstance;

    /**
     * Clears suggestion cache and current suggestions suggestions.
     * @param methodName The name of the method
     */
    lazymSelect(methodName: "clear"): LazyMSelectInstance;

    /**
     * Clears suggestion cache.
     * @param methodName The name of the method
     */
    lazymSelect(methodName: "clearCache"): LazyMSelectInstance;

    /**
     * Deactivate lazymselect.
     * @param methodName The name of the method
     */
    lazymSelect(methodName: "disable"): LazyMSelectInstance;

    /**
     * Activates lazymselect if it was deactivated before.
     * @param methodName The name of the method
     */
    lazymSelect(methodName: "enable"): LazyMSelectInstance;

    /**
     * Hides suggestions.
     * @param methodName The name of the method
     */
    lazymSelect(methodName: "hide"): LazyMSelectInstance;

    /**
     * Destroys lazymselect instance. All events are detached and suggestion containers removed.
     * @param methodName The name of the method
     */
    lazymSelect(methodName: "dispose"): LazyMSelectInstance;

}

interface KnockoutBindingHandlers {
    lazymselect: KnockoutBindingHandler;
}

ko.bindingHandlers.lazymselect = {
    init: function(element: HTMLElement, valueAccessor: Function, allBindings?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) {
        LazyMSelectUtil.log('ko.bindingHandlers.lazymselect init');
        let config = <ILazyMSelectBindingOptions>valueAccessor();
        let instance = new LazyMSelect({
            element: element, 
            queryUrl: config.queryUrl,
            queryParams: config.queryParams,
            debug: true, 
            selectedItems: config.selectedItems,
            templateHtmlUrl: 'lazymselect.template.html'
         });
         $(element).data('lazymselect', instance);
         $(element).click(function(){
            instance.render();
         });
    },
    update: function(element: HTMLElement, valueAccessor: Function, allBindings?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) {
        LazyMSelectUtil.log('ko.bindingHandlers.lazymselect update');
        let config = <ILazySelectQueryChangeOptions>valueAccessor();
        let instance = <LazyMSelect>$(element).data('lazymselect');
        instance.onQueryChanged.call(instance, config);
    }
}

type ILazySelectQueryChangeOptions = Pick<ILazyMSelectBindingOptions, 'queryUrl'|'queryParams'>
interface ILazyMSelectBindingOptions {
    queryUrl: string;
    queryParams?: Object;
    selectedItems: KnockoutObservableArray<ILazyMSelectDataItemViewModel>;
}

class LazyMSelect {
    private data: LazyMSelectDataViewModel;
    private $element: JQuery;
    private $container: JQuery;
    constructor(private options: ILazyMSelectOptions){
       this.$element = $(options.element);
       LazyMSelectUtil.debug = options.debug || false;
       this.updateDisplayElementLabel();
       this.options.selectedItems.subscribe(()=>{
            this.updateDisplayElementLabel();
       });
    }

    public isRendered = false;
    public render(){
        let self = this;
        if(!self.isRendered){
           self.data = new LazyMSelectDataViewModel();
           self.data.selectedItems = self.options.selectedItems;
           self.populateContainer().then(()=>{
                self.populateCacheItems().then(()=>{
                    self.renderCore();
                });
                self.showContainer();
           });
           self.isRendered = true;
        }
        else{
           self.showContainer();
        }
    }

    private renderCore(){
        let self = this;
        for(let selectedItem of self.data.selectedItems()){
            if(selectedItem.isChecked === undefined){
                selectedItem.isChecked = true;
            }
            if(selectedItem.name === undefined
                && self.data.cachedItems 
                && self.data.cachedItems[selectedItem.id])
            {
                selectedItem.name = self.data.cachedItems[selectedItem.id].name || '';
            }
        }
        self.data.queryString.subscribe((newQueryString: string)=>{
            self.search(newQueryString);
        });
        ko.applyBindings(self, self.$container[0]);
    }

    private latestQueryUrl:string = null;
    private populateCacheItems(){
        let self = this;
        let ready = $.Deferred();
        let currentQueryUrl = self.getQueryUrl();
        if(self.latestQueryUrl !== currentQueryUrl){
            self.latestQueryUrl = currentQueryUrl;
            $.get(currentQueryUrl).then((rawData: ILazyMSelectDataItemViewModel[])=>{
                for(let item of rawData){
                    self.data.cachedItems[item.id] = item;
                }
                ready.resolve();
            });
        }
        else{
            ready.resolve();
        }
        return ready;
    }

    private getQueryUrl(){
        let self = this;
        self.options.queryParams = self.options.queryParams || {};
        let url = self.options.queryUrl.indexOf('?')>0
                    ? self.options.queryUrl + '&' + $.param(self.options.queryParams)
                    : self.options.queryUrl + '?' + $.param(self.options.queryParams);
        return url;
    }
    
    public onQueryChanged(queryOptions: ILazySelectQueryChangeOptions){
        LazyMSelectUtil.log('onQueryParamsChanged', queryOptions);
        let self = this;
        if(self.data){
            self.options.queryUrl = queryOptions.queryUrl;
            self.options.queryParams = queryOptions.queryParams;
            self.data.selectedItems([]);
            self.data.unSelectedItems([]);
        }
    }

    private changeChecked(item: ILazyMSelectDataItemViewModel, fromSelected: boolean){
        let self = this;
        if(fromSelected === true){
            item.isChecked = false; 
            self.data.unSelectedItems.push(item);
            self.data.selectedItems.remove(item);
        }
        else {
            item.isChecked = true;
            self.data.selectedItems.push(item);
            self.data.unSelectedItems.remove(item);
        }
    }

    private search(newQueryString: string){
        let self = this;
        self.removeUnSelectedItems();
        if(newQueryString.length < 1){
            return;
        }
        self.populateCacheItems().then(()=>{
            for(let id in self.data.cachedItems){
                let item = self.data.cachedItems[id];
                if(item.name && item.name.toLowerCase().indexOf(newQueryString.toLowerCase()) === 0){
                    let inSelectedItems = _.some(self.data.selectedItems(), (selectedItem)=>{ return selectedItem.id === id });
                    if(inSelectedItems){
                        continue;
                    }
                    if(item.isChecked === undefined){
                        item.isChecked = false;
                    }
                    self.data.unSelectedItems.push(self.data.cachedItems[id]);
                }
            }
        });
    }

    private clearQueryString(){
        let self = this;
        self.data.queryString('');
    }

    private removeUnSelectedItems(){
        let self = this;
        self.data.unSelectedItems([]);
    }

    private populateContainer(): JQueryDeferred<void>{
       let self = this;
       let ready = $.Deferred<void>();

       function initContainerEvents(){
           LazyMSelectUtil.log('initContainerEvents');
           self.$container.click(function(e){
               LazyMSelectUtil.log('$container click stopPropagation');
               e.stopPropagation();
               e.preventDefault();
               return false;
           });
           self.$element.click(function(e){
               LazyMSelectUtil.log('$element click stopPropagation');
               e.stopPropagation();
               e.preventDefault();
               return false;
           });
           $(document).click(function(e){
               LazyMSelectUtil.log('document click');
               self.hideContainer();
           });
       }

       if(self.$container == null){
            $.get(self.options.templateHtmlUrl).then((rawHtml)=>{
                    let div = document.createElement('div');
                    div.setAttribute('class', 'lazymselect-suggestions');
                    div.innerHTML = rawHtml;
                    self.$element.after(div);
                    self.$container = $(div);
                    initContainerEvents();
                    ready.resolve();
            });
       }
       else{
           ready.resolve();
       }
       return ready;
    }

    private showContainer(){
        let self = this;
        self.$container.show();
    }

    private hideContainer(){
        let self = this;
        self.$container.hide();
    }

    private updateDisplayElementLabel(){
        let self = this;
        let count = self.options.selectedItems().length;
        
        const originDisplayTextKey = 'origin-text';
        let span = self.$element.children(':first')[0];
        let originDisplayText = self.$element.data(originDisplayTextKey);
        if(!originDisplayText){
            originDisplayText = span.innerText;
            self.$element.data(originDisplayTextKey, originDisplayText)
        }
        if(count > 0){
            span.innerText = `${originDisplayText}(${count})`;
        }else{
            span.innerText = `${originDisplayText}`;            
        }
    }
}

class LazyMSelectUtil {
    public static debug = true;
    public static log(message?: any, ...optionalParams: any[]){
        if(LazyMSelectUtil.debug === true){
            console.log(message, optionalParams);
        }
    }
}

class LazyMSelectDataViewModel {
    queryString = ko.observable<string>();
    cachedItems: ILazyMSelectDataCacheModel = { };
    selectedItems: KnockoutObservableArray<ILazyMSelectDataItemViewModel>;
    unSelectedItems = ko.observableArray<ILazyMSelectDataItemViewModel>().extend({deferred: true});    
}
type ILazyMSelectDataCacheModel =  {[index:string]:ILazyMSelectDataItemViewModel};

interface ILazyMSelectDataItemViewModel{
    id: string;
    name?: string;
    isChecked?: boolean;
}
interface ILazyMSelectOptions{
    element: HTMLElement;
    debug: boolean;
    queryUrl: string;
    queryParams: Object;
    templateHtmlUrl: string;
    selectedItems: KnockoutObservableArray<ILazyMSelectDataItemViewModel>;
}
interface EventName extends String {
  _eventNameBrand: string; // so that EventName is not the same type as String  
}

export module EventManager {
  export interface IEventNames {
    loading: EventName,
    loaded: EventName
  }

  export interface IPageEvent extends CustomEvent {
    readonly detail: PageEventData;
    new(typeArg: string, eventInitDict?: PageEventData): CustomEvent;
  }

  export interface PageEventDetail {
    pageName: string,
    /* if pageName === '404', then missingPageName contains the name of the missing page */
    missingPageName: string,
    fullPageName(): string;
  }

  var PageEvent: IPageEvent = CustomEvent as IPageEvent;

  class PageEventData {
    detail: PageEventDetail;

    constructor(pageName: string, missingPageName?: string) {
      this.detail = {
        pageName: pageName,
        missingPageName: missingPageName,
        fullPageName: function(): string {
          if(missingPageName) { 
            return `${missingPageName} (${pageName})`;
          } else {
            return pageName;
          }
        }
      }
    }
  }

  export var EventNames: IEventNames = {
    loading: eventNameGenerator("page-loading"),
    loaded: eventNameGenerator("page-loaded")
  }

  export function Loading(pageName: string, missingPageName?: string): void {
    dispatchPageEvent(EventNames.loading, new PageEventData(pageName));
  }

  export function Loaded(pageName:string , missingPageName?: string): void {
    dispatchPageEvent(EventNames.loaded, new PageEventData(pageName, missingPageName));
  }

  function dispatchPageEvent(eventName: EventName, pageEventData: PageEventData): void {
    var pageChangeEvent = new PageEvent(<string>(eventName as any), pageEventData);
    document.dispatchEvent(pageChangeEvent);
  }

  function eventNameGenerator(name: string): EventName {
    return <EventName>(`cms-less:${name}` as any);
  }
}

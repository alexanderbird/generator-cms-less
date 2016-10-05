export interface EventName extends String {
    _eventNameBrand: string;
}
export declare module EventManager {
    interface IEventNames {
        loading: EventName;
        loaded: EventName;
    }
    interface IPageEvent extends CustomEvent {
        readonly detail: PageEventData;
        new (typeArg: string, eventInitDict?: PageEventData): CustomEvent;
    }
    interface PageEventDetail {
        pageName: string;
        missingPageName: string;
        fullPageName(): string;
    }
    class PageEventData {
        detail: PageEventDetail;
        constructor(pageName: string, missingPageName?: string);
    }
    var EventNames: IEventNames;
    function Loading(pageName: string, missingPageName?: string): void;
    function Loaded(pageName: string, missingPageName?: string): void;
}

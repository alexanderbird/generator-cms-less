import { CmsLessConfig } from "./cms_less_config";
import { EventManager } from "./event_manager";
export declare module Cache {
    class Result {
        html: string;
        code: number;
        constructor(html: string, code: number);
    }
    class CacheEntry {
        promise: JQueryPromise<Result>;
        constructor(pageName: string);
        then(handlePageContent: (result: Result) => void): void;
    }
    function EagerLoad(_pagesToLoad: string[]): void;
    function Get(pageName: string): CacheEntry;
    function Init(_config: CmsLessConfig, _eventDispatcher: EventManager.Dispatcher): void;
}

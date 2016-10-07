import { WildEmittable } from "./wildemitter";
export declare module EventManager {
    class PageData {
        name: string;
        nameOf404Page: string;
        fullName: string;
        constructor(name: string, nameOf404Page?: string);
    }
    interface EventList {
        [eventName: string]: Dispatchable;
    }
    interface PageEvents {
        loading: any;
        loaded: any;
    }
    interface CacheEvents {
        hit: any;
        miss: any;
    }
    class Dispatcher {
        emitter: WildEmittable;
        page: EventList & PageEvents;
        cache: EventList & CacheEvents;
        constructor(emitter: WildEmittable);
    }
    interface Dispatchable {
        (pageName: number, missingPageName?: string): void;
        eventName: string;
    }
}

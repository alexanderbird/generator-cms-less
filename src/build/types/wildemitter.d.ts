export declare type eventCallback = (payload?: any) => void;
export declare type wildcardEventCallback = (eventName: string, payload?: any) => void;
export interface WildEmittable {
    on(event: any, groupName: string, fn: eventCallback | wildcardEventCallback): any;
    on(event: any, fn: eventCallback | wildcardEventCallback): any;
}
export declare class WildEmitter {
    static mixin<T>(object: T): T & WildEmittable;
}

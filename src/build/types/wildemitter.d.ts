export declare type eventCallback = (payload?: any) => void;
export declare type wildcardEventCallback = (eventName: string, payload?: any) => void;
export interface WildEmittable {
    isWildEmitter: true;
    on(event: string, groupName: string, fn: eventCallback | wildcardEventCallback): any;
    on(event: string, fn: eventCallback | wildcardEventCallback): any;
    once(event: string, groupName: string, fn: eventCallback | wildcardEventCallback): any;
    once(event: string, fn: eventCallback | wildcardEventCallback): any;
    releaseGroup(groupName: string): any;
    off(event: string, fn?: Function): any;
    emit(event: string, ...payload: any[]): any;
}
export declare class WildEmitter {
    static mixin<T>(object: T): T & WildEmittable;
}

import { WildEmittable } from "./wildemitter"
export module EventManager {
  export class PageData {
    fullName: string;

    constructor(public name: string, public nameOf404Page?: string) {
      if(this.nameOf404Page) { 
        this.fullName = `${this.name} (${this.nameOf404Page})`;
      } else {
        this.fullName = this.name;
      }
    }
  }

  export interface EventList {
    [eventName: string]: Dispatchable;
  }

  export interface PageEvents { loading, loaded }

  export interface CacheEvents { hit, miss }

  export class Dispatcher {
    page: EventList & PageEvents= {
      loading: dispatchableFactory(this, "page:loading"),
      loaded: dispatchableFactory(this, "page:loaded"),
    }

    cache: EventList & CacheEvents = {
      hit: dispatchableFactory(this, "cache:hit"),
      miss: dispatchableFactory(this, "cache:miss")
    }

    constructor(public emitter: WildEmittable) { } 
  }

  export interface Dispatchable {
    (pageName: number, missingPageName?: string): void;
    eventName: string;  
  }

  function dispatchableFactory(dispatcher: Dispatcher, eventName: string): Dispatchable {
    let dispatchable: Dispatchable = function(pageName: string, missingPageName?: string) {
      dispatcher.emitter.emit(eventName, new PageData(pageName, missingPageName));        
    } as any;
    dispatchable.eventName = eventName;
    return dispatchable;
  }
}

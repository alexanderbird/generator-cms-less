class PageEventData {
  detail: { pageName: string, missingPageName: string }

  constructor(pageName, missingPageName?) {
    this.detail = {
      pageName: pageName,
      missingPageName: missingPageName
    }
  }
}

export module EventManager {
  export var EventNames: any = {
    loading: "cms-less:page-loading",
    loaded: "cms-less:page-loaded"
  }

  export function Loading(pageName, missingPageName?) {
    dispatchPageEvent(EventNames.loading, new PageEventData(pageName));
  }

  export function Loaded(pageName, missingPageName?) {
    dispatchPageEvent(EventNames.loaded, new PageEventData(pageName, missingPageName));
  }

  function dispatchPageEvent(eventName, pageEventData) {
    var pageChangeEvent = new CustomEvent(eventName, pageEventData);
    document.dispatchEvent(pageChangeEvent);
  }
}

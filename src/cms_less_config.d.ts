export interface CmsLessConfig {
    anchorDelimiter: string, /* default: '-'; ignore hash content to the right of delimiter */ 
    destinationSelector: string, /* default: '#cms-less-destination'; id of html element to fill with content */
    eagerLoadPages: string[], /* list of pages to eager load */

    /* load content from ( contentPath + pathSeparator + pageName + fileExtension ) */
    contentPath: string, /* default: 'cms-less-content'; directory name */
    pathSeparator: string, /* default: '/' */
    fileExtension: string, /* default: '.html' */

    indexPageName: string, /* default: 'index'; treat empty page name as indexPageName */
    notFoundPageName: string, /* default: '404'; load this page name if the actual page can't be found */
    redirects: { [pageName:string]: string }, /* if pageName is in redirects, change pageName to redirects[pageName] */
    serverErrorElement: string /* htmlString to show if the 404 page can't be found */
}

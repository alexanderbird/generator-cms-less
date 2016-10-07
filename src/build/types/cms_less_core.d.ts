import { CmsLessConfig } from "./cms_less_config";
import { ICmsLess } from "./i_cms_less";
export declare module CmsLessCore {
    function Init(this: ICmsLess, options: CmsLessConfig): void;
    function PageName(hash?: string): string;
}

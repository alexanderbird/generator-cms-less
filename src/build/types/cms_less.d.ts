import { CmsLessCore } from "./cms_less_core";
import { WildEmittable } from "./wildemitter";
declare type CmsLess = (typeof CmsLessCore) & WildEmittable;
declare var CmsLess: CmsLess;
export = CmsLess;

import { CmsLessCore } from "./cms_less_core"
import { WildEmitter, WildEmittable } from "./wildemitter"

declare type CmsLess = (typeof CmsLessCore) & WildEmittable;

var CmsLess: CmsLess = WildEmitter.mixin(CmsLessCore);

export = CmsLess;

import { CmsLessCore } from "./cms_less_core"
import { WildEmitter } from "./wildemitter"
import { ICmsLess } from "./i_cms_less"

var CmsLess: ICmsLess = WildEmitter.mixin(CmsLessCore);

export = CmsLess;

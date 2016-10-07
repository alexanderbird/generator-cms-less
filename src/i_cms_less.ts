import { CmsLessCore } from "./cms_less_core"
import { WildEmittable } from "./wildemitter"

export type ICmsLess = (typeof CmsLessCore) & WildEmittable;

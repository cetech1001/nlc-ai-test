import {ComponentType} from "react";

export interface MenuItem {
  icon: ComponentType<any>;
  label: string;
  path: string;
}

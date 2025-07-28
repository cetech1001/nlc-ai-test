import {ComponentType} from "react";

export interface MenuItem {
  icon: ComponentType<any>;
  label: string;
  path: string;
}

export interface MenuItemWithDropdown {
  icon: ComponentType<any>;
  label: string;
  dropdown: MenuItem[];
}

export type MenuItemType = MenuItem | MenuItemWithDropdown;

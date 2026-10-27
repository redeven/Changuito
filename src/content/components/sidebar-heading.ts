import { h } from "../../ui/element-builder";

export function sidebarHeading(title: string): HTMLElement {
  return h("div", { className: "sidebar-heading" }, [
    title,
    h("span", { className: "sidebar-heading-credit" }, ["por Changuito"]),
  ]);
}

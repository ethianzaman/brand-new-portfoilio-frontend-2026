import { createElement, type ElementType } from "react";
import {
  Code2,
  Database,
  Layers,
  LayoutTemplate,
  Monitor,
  Server,
  ShoppingCart,
  Webhook,
  Wrench,
} from "lucide-react";

const ICONS: Record<string, ElementType> = {
  code: Code2,
  code2: Code2,
  database: Database,
  layers: Layers,
  layout: LayoutTemplate,
  monitor: Monitor,
  server: Server,
  shoppingcart: ShoppingCart,
  webhook: Webhook,
  wrench: Wrench,
};

/**
 * A service's icon. Stored names come in two styles: the dashboard saves
 * "Monitor", while older records have "shopping-cart". Both find the same icon.
 */
export function ServiceIcon({
  icon,
  color,
  className,
}: {
  icon?: string;
  color?: string;
  className?: string;
}) {
  const key = (icon ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return createElement(ICONS[key] ?? Code2, { className, style: { color } });
}

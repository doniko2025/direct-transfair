//apps/backend/src/ui/layout/BottomNav.tsx
import React from "react";
import "../../layout/layout.css";

export type BottomNavItem = {
  href: string;
  label: string;
};

export function BottomNav(props: {
  items: BottomNavItem[];
  activeHref?: string;
}) {
  return (
    <nav className="bottomNav" aria-label="Navigation principale">
      <div className="bottomNavInner">
        {props.items.map((it) => {
          const active = props.activeHref === it.href;
          return (
            <a
              key={it.href}
              href={it.href}
              className={`navItem ${active ? "navItemActive" : ""}`}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

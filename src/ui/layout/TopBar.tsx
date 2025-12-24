//apps/backend/src/ui/layout/TopBar.tsx
import React from "react";
import "../layout/layout.css";

export function TopBar(props: {
  title?: string;
  right?: React.ReactNode;
}) {
  const title = props.title ?? "Direct Transf’air";

  return (
    <header className="topBar">
      <div className="topBarInner">
        <div className="brand">{title}</div>
        <div className="topActions">{props.right}</div>
      </div>
    </header>
  );
}

//apps/backend/src/ui/layout/Container.tsx
import React from "react";
import "../layout/layout.css";

export function Container(props: { children: React.ReactNode }) {
  return <div className="container">{props.children}</div>;
}

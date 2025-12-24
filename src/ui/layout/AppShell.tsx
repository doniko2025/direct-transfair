//apps/backend/src/ui/layout/AppShell.tsx
import React from "react";
import "../layout/layout.css";
import { useBreakpoint } from "./useBreakpoint";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppShell(props: {
  children: React.ReactNode;
  activeHref?: string;
}) {
  const bp = useBreakpoint();

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/send", label: "Envoyer" },
    { href: "/withdraw", label: "Retrait" },
    { href: "/history", label: "Historique" },
    { href: "/profile", label: "Profil" },
  ];

  return (
    <div className="appShell">
      {/* TopBar utile surtout desktop, mais OK partout */}
      <TopBar
        title="Direct Transf’air"
        right={<span className="chip">Bonjour Admin</span>}
      />

      <main className="mainArea">{props.children}</main>

      {/* BottomNav mobile-only (via CSS media query) */}
      <BottomNav items={navItems} activeHref={props.activeHref} />

      {/* Option: sur desktop, tu feras plutôt une sidebar plus tard */}
      {bp === "desktop" ? null : null}
    </div>
  );
}

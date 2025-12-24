//apps/backend/src/pages/Home.tsx
import React from "react";
import { AppShell } from "../ui/layout/AppShell";
import { Container } from "../ui/layout/Container";

export function Home() {
  return (
    <AppShell activeHref="/">
      <Container>
        <h1 style={{ margin: "8px 0 4px" }}>Bienvenue sur Direct Transf’air</h1>

        <section
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Actions rapides</h2>

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "1fr",
            }}
          >
            <a className="chip" href="/send" style={{ textAlign: "center" }}>
              ENVOYER DE L’ARGENT
            </a>
            <a className="chip" href="/beneficiaries" style={{ textAlign: "center" }}>
              BÉNÉFICIAIRES
            </a>
            <a className="chip" href="/transactions" style={{ textAlign: "center" }}>
              TRANSACTIONS
            </a>
          </div>
        </section>

        <div style={{ height: 12 }} />

        <section
          style={{
            background: "#fff3e6",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Espace administrateur</h2>
          <a className="chip" href="/admin/transactions" style={{ display: "block", textAlign: "center" }}>
            TRANSACTIONS DU TENANT
          </a>
        </section>
      </Container>

      {/* desktop: convertir la liste en 3 colonnes */}
      <style>{`
        @media (min-width: 900px) {
          section div[style*="grid-template-columns: 1fr"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </AppShell>
  );
}

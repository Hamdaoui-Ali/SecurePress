# Checklist de release — SecurePress Audit Lab

Date de vérification : **9 septembre 2026**<br>
Branche : `main`<br>
Node.js : `v24.12.0`<br>
npm : `11.6.2`

## Contrôles

- [x] `npm.cmd run typecheck`
- [x] `npm.cmd test` — 14 fichiers, 42 tests
- [x] `npm.cmd run build`
- [x] `npm.cmd run e2e` — scénario local, validation, guide, reset, accessibilité et responsive
- [x] `npm.cmd run audit:dist` — aucun appel réseau externe trouvé dans les assets distribués
- [x] `npm.cmd run release:check`
- [x] `npm.cmd run lint` — aucune erreur ; avertissements React existants documentés dans la sortie

## Environnement de démonstration

- Navigateur : Chromium via Playwright
- Résolutions vérifiées : 1440 × 900, 1024 × 768 et 390 × 844
- Serveur : `vite preview` sur `127.0.0.1:4173`
- Réseau : aucun hôte externe contacté par le scénario Playwright hors ligne
- Impression : rapport vérifié avec la feuille `src/styles/print.css`

## Répétition

Le parcours guidé comporte huit étapes, revient à 42/100 après réinitialisation et projette 82/100 après les remédiations guidées. Lors de la vérification du 9 septembre 2026, la suite E2E complète a duré 23,2 s et la suite Vitest 21,0 s ; le contrôle `release:check` a passé ces deux étapes, le build et l’audit hors ligne.

## Limites

Cette checklist vérifie le build local et ses appels réseau observables. Elle ne prouve pas l’état d’un WordPress réel, l’activation d’une extension sur cible ou un contre-audit dynamique.

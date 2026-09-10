# Contrôles d’accessibilité et de projection

Vérification effectuée le **9 septembre 2026** sur la build locale SecurePress Operations Workspace.

## Navigation clavier

- Le lien « Aller au contenu » est disponible dès le premier Tab et place le focus sur le contenu principal.
- Les liens de navigation, les actions du workspace et les boutons de la top bar utilisent des éléments HTML natifs.
- Le drawer d’un constat reçoit le focus sur son bouton de fermeture, accepte `Escape`, boucle le focus avec `Tab` et restitue le focus au constat qui l’a ouvert.
- Les dialogues de réinitialisation et de démarrage du parcours guidé reçoivent le focus sur « Annuler », acceptent `Escape`, bouclent le focus et restituent le focus à leur déclencheur.
- Les icônes décoratives sont masquées aux lecteurs d’écran ; les badges et états comprennent toujours un libellé textuel.

## Lisibilité et mouvement

- Le texte racine est réglé à 16 px minimum ; les paragraphes de lecture sont limités à une largeur raisonnable.
- Les contrôles interactifs présentent un contour de focus visible de 3 px.
- `prefers-reduced-motion: reduce` désactive le défilement fluide et réduit les transitions et animations.
- Le score de posture possède un nom accessible, par exemple « Security posture score: 42 out of 100 ».

## Responsive et projection

Le scénario Playwright `e2e/accessibility-layout.spec.ts` vérifie :

- 1440 × 900 pour la projection ;
- 1024 × 768 pour une fenêtre intermédiaire ;
- 390 × 844 pour un écran mobile ;
- l’absence de défilement horizontal global ;
- la visibilité de la barre de contexte workspace, des métriques, de la progression et de l’action guidée.

## Impression et limites de preuve

- La feuille `src/styles/print.css` masque la navigation, les boutons et la barre de contexte workspace à l’impression.
- Le rapport imprimable conserve sa provenance locale et le statut « Contre-audit dynamique externe — NON EXÉCUTÉ ».
- Ces contrôles portent sur une interface locale de workspace. Ils ne constituent pas un audit WCAG automatisé ni une validation de contraste par un outil spécialisé.

## Commande de vérification

```powershell
npm.cmd run e2e -- e2e/accessibility-layout.spec.ts
```

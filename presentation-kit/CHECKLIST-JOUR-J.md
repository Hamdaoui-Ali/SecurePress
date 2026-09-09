# Checklist du jour J

## Avant l’arrivée du jury

- [ ] Brancher l’alimentation et désactiver les notifications.
- [ ] Vérifier la résolution 1440 × 900 ou 1920 × 1080 et le zoom navigateur à 100 %.
- [ ] Vérifier que le navigateur peut ouvrir `http://127.0.0.1:4173` sans Internet.
- [ ] Garder une copie PC du dépôt et du dossier `presentation-kit`.
- [ ] Placer une copie complète sur la clé USB.
- [ ] Conserver une archive ZIP locale distincte.
- [ ] Vérifier que `presentation-kit/video/securepress-guided-demo.webm` et son fichier de sous-titres sont lisibles.

## Préparer la démo

```powershell
Set-Location securepress-demo
npm ci
npm run release:check
npm run present
```

- [ ] Ouvrir <http://127.0.0.1:4173>.
- [ ] Appuyer sur `F11`.
- [ ] Cliquer sur « Démarrer la démo guidée ».
- [ ] Vérifier que le premier écran affiche `42 / 100`.
- [ ] Vérifier que le bouton `Suivant` avance l’étape sans bloquer les clics.
- [ ] Vérifier que le rapport final affiche `82 / 100` et `NON EXÉCUTÉ` pour le contre-audit externe.
- [ ] Arrêter proprement avec `Ctrl+C` après la répétition.

## En cas de panne

1. Recharger la page et utiliser « Réinitialiser la démo ».
2. Si le terminal de développement échoue, lancer le build local de secours depuis une copie vérifiée.
3. Si le navigateur ou le réseau est indisponible, ouvrir les six captures et lire le script pendant que la vidéo de secours tourne.
4. Ne jamais présenter une validation simulée comme une preuve sur cible réelle.

## Après la soutenance

- [ ] Fermer le serveur avec `Ctrl+C`.
- [ ] Conserver les notes de durée et les questions reçues.
- [ ] Copier les captures ou le journal de répétition dans l’archive de projet.

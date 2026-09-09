# Lancement de SecurePress Audit Lab

Ce dossier contient le build local, les captures, la vidéo de secours et les notes de soutenance.

## Préparer la machine

Si Node.js n’est pas installé, installer une version LTS récente depuis le site officiel de Node.js, puis ouvrir un nouveau PowerShell. Dans le dépôt :

```powershell
Set-Location securepress-demo
npm ci
npm run build
```

La commande `npm ci` installe exactement les dépendances verrouillées par `package-lock.json`.

## Démarrer la démo

```powershell
npm run present
```

Ouvrir ensuite : <http://127.0.0.1:4173>

Pour la projection, passer le navigateur en plein écran avec **F11**, utiliser 100 % de zoom et garder une fenêtre 16:9 si possible. Cliquer sur « Démarrer la démo guidée » pour remettre l’état à zéro et suivre les huit étapes.

Arrêter le serveur avec **Ctrl+C** dans le terminal.

## Plan B local

Si le dépôt de développement ne peut pas être utilisé, conserver `presentation-kit/build` et les captures sur la copie de secours. Le build est autonome et l’audit `npm run audit:dist` vérifie l’absence de ressource externe distribuée.

## Ordre de présentation

1. Vue d’ensemble et score initial `42 / 100`.
2. Inventaire et distinction présence / activation / exploitabilité.
3. Audit et ouverture de F-001.
4. Remédiation avant/après.
5. Validation simulée et limites de preuve.
6. Rapport projeté `82 / 100` avec contre-audit dynamique non exécuté.

Le script détaillé se trouve dans `SCRIPT-SOUTENANCE.md`.

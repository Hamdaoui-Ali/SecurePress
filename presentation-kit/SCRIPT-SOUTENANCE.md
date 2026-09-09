# Script de soutenance — 5 min 30

Le parcours reprend les sept créneaux du design. Chaque bloc contient une phrase à dire, une action et le message à retenir.

## 0:00–0:30 — Vue d’ensemble

**À dire :** « Je présente une copie TELCO hors production : l’application montre ce qui est prouvé dans les fichiers, ce qui est simulé et ce qui doit encore être validé sur cible. »

**Action :** Afficher la vue d’ensemble et le score `42 / 100`, puis lancer le guide.

**À retenir :** le score est pédagogique, l’audit est statique et les limites restent visibles.

## 0:30–1:15 — Inventaire

**À dire :** « L’inventaire confirme la présence des extensions et thèmes dans la copie ; il ne déduit ni leur activation ni leur exploitabilité. »

**Action :** Cliquer sur l’étape Inventaire, lancer la simulation et montrer le tableau.

**À retenir :** présence, activation et exploitabilité sont trois affirmations différentes.

## 1:15–2:15 — Audit

**À dire :** « L’audit qualifie dix constats issus du scénario local, avec une sévérité, une preuve, une confiance et une limite. »

**Action :** Lancer l’audit statique simulé, montrer les filtres puis ouvrir F-001.

**À retenir :** on sépare le constat observé de l’hypothèse d’exploitation.

## 2:15–3:15 — F-001 puis F-003

**À dire :** « F-001 montre la décision de risque : preuve observée, exposition, impact et recommandation. F-003 rappelle que des clés d’exemple ne deviennent pas une preuve d’accès. »

**Action :** Parcourir le drawer de F-001, fermer avec `Escape`, puis revenir à la table.

**À retenir :** chaque finding possède une chaîne de preuve et une validation associée.

## 3:15–4:15 — Remédiation

**À dire :** « La remédiation relie le risque à une action technique et à un artefact. L’application visible ici modifie uniquement l’état local de la démo. »

**Action :** Montrer les diff avant/après, les aperçus d’artefacts et appliquer les remédiations guidées.

**À retenir :** préparé, appliqué et vérifié sont des statuts distincts.

## 4:15–5:00 — Validation

**À dire :** « Une correction n’est pas terminée sans test : ici, le blocage de connexion, la politique d’upload et les contrôles de durcissement sont rejouables hors ligne. »

**Action :** Lancer la validation, simuler cinq échecs puis montrer `shell.php` bloqué et les fichiers autorisés.

**À retenir :** sécurité et non-régression doivent être testées ensemble.

## 5:00–5:30 — Rapport

**À dire :** « Le rapport projette `82 / 100` après les remédiations guidées, mais quatre risques restent à confirmer. Le contre-audit dynamique externe n’a pas été exécuté. »

**Action :** Afficher la comparaison, la timeline et le panneau de risque résiduel ; conclure avec l’avertissement de preuve.

**À retenir :** développé, préparé, simulé et démontré sont quatre niveaux différents.

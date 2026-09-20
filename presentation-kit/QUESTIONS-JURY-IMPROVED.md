# Questions potentielles du jury — SecurePress

## Conseil général

Le jury cherchera probablement à vérifier trois choses :

1. si les conclusions sont techniquement justifiées ;
2. si vous maîtrisez les limites d’une analyse hors ligne ;
3. si les remédiations peuvent être validées sans créer de régression.

La réponse la plus solide commence par le périmètre réel, distingue le fait de l’hypothèse, puis indique le contrôle nécessaire. Évitez de présenter la copie locale comme la production et évitez d’affirmer qu’un composant est exploitable uniquement parce que sa version est ancienne.

---

## A. Périmètre et méthode

### 1. Pourquoi avoir choisi WordPress comme sujet de cybersécurité ?

WordPress possède un écosystème très extensible : cœur, thèmes, plugins, configuration serveur et interfaces d’administration. Cette richesse fonctionnelle augmente la surface de maintenance et rend nécessaire une démarche structurée d’inventaire, de qualification et de durcissement.

### 2. Quelle est la problématique principale de SecurePress ?

La problématique est de produire un diagnostic fiable à partir d’une copie locale documentée, en distinguant les observations confirmées, les risques potentiels et les contrôles qui nécessitent une validation sur la cible. Le projet cherche donc autant la qualité de la preuve que la liste des recommandations.

### 3. Pourquoi avoir travaillé sur une copie locale et hors ligne ?

Le périmètre fourni ne permettait pas de revendiquer un accès direct à la production. La copie locale permet de travailler de manière reproductible et sans risque pour le service, mais elle impose de déclarer clairement les éléments qui restent à confirmer sur la cible.

### 4. Pourquoi ne pas avoir réalisé un scan en direct ?

Un scan en direct nécessite une autorisation explicite, un périmètre défini, une fenêtre d’intervention et des mesures pour éviter les perturbations. Dans le cadre disponible, il était plus rigoureux de ne pas présenter un scan qui n’a pas réellement été exécuté et de préparer plutôt les contrôles à réaliser ultérieurement.

### 5. Qu’est-ce qui est réellement prouvé dans votre travail ?

Sont prouvés dans le périmètre local les éléments visibles dans les fichiers et les documents fournis : versions, répertoires, paramètres présents ou absents, code préparé et résultats des contrôles locaux. L’activation réelle, l’exposition réseau, l’état runtime de la base, le comportement de la production et l’absence historique de compromission nécessitent des preuves supplémentaires.

### 6. Quelle différence faites-vous entre présence, activation et exploitabilité ?

La présence signifie qu’un fichier ou un répertoire existe dans la copie. L’activation dépend de l’état de WordPress et de la base de données. L’exploitabilité dépend encore de la configuration, des rôles, de l’exposition et des protections serveur ; ces trois notions ne doivent donc pas être confondues.

### 7. Pourquoi une version ancienne ne prouve-t-elle pas une vulnérabilité exploitable ?

Une version ancienne peut correspondre à un risque connu, mais l’exploitabilité dépend du contexte réel : composant actif, fonctionnalité concernée, configuration, droits, réseau, protections et éventuels correctifs de l’environnement. La bonne formulation est donc “version à revoir et à valider”, et non “exploitation confirmée” sans test autorisé.

### 8. Que signifie l’absence de base de données ou d’export SQL complet ?

Cela limite la capacité à confirmer l’état runtime : plugins actifs, rôles, options, utilisateurs, réglages et historiques. Je peux analyser la configuration et les fichiers disponibles, mais je dois déclarer que les éléments dépendant de la base restent à vérifier.

### 9. Quand vous dites qu’aucun indicateur de compromission n’a été trouvé, que concluez-vous ?

Je conclus uniquement qu’aucun indicateur n’a été observé dans la copie examinée avec les sources disponibles. Cela ne prouve pas qu’une compromission n’a jamais eu lieu sur la production ; une conclusion historique nécessiterait des logs, des sauvegardes, des traces d’intégrité et une analyse de la cible.

### 10. Pourquoi vous être référé à OWASP et à NIST ?

OWASP Top 10 et OWASP WSTG fournissent des catégories et des pratiques adaptées à l’évaluation des applications web. NIST SP 800-115 apporte un cadre général pour planifier et documenter les tests techniques. Ces références structurent la démarche ; elles ne remplacent pas les preuves spécifiques à l’environnement étudié.

---

## B. Constats et priorisation

### 11. Pourquoi un compte de base de données root avec un mot de passe vide est-il préoccupant ?

Dans la copie examinée, cette configuration est un constat de sécurité sérieux, car elle réduit fortement la séparation des privilèges et peut aggraver l’impact d’une compromission applicative. La correction attendue est l’utilisation d’un compte applicatif dédié, avec des privilèges minimaux et un secret fort, puis une validation sur la cible.

### 12. Que recommandez-vous pour les clés et sels d’authentification ?

Il faut remplacer les valeurs d’exemple ou anciennes par des valeurs aléatoires fortes, puis prévoir une rotation maîtrisée. Cette action doit être accompagnée d’une procédure de sauvegarde et d’une vérification de l’impact sur les sessions et les utilisateurs.

### 13. Pourquoi l’absence de DISALLOW_FILE_EDIT est-elle importante ?

L’éditeur de fichiers intégré peut permettre à un compte administrateur compromis de modifier du code directement depuis l’interface WordPress. Le désactiver réduit une voie d’altération rapide ; cette mesure doit toutefois être complétée par une bonne gestion des comptes, des mises à jour et des accès serveur.

### 14. Pourquoi utiliser FORCE_SSL_ADMIN ?

Ce paramètre impose l’utilisation de HTTPS pour l’administration WordPress, ce qui protège les échanges d’authentification contre l’interception sur un réseau non fiable. Il doit être activé seulement après avoir confirmé que le TLS, les proxies éventuels et la configuration de la cible sont correctement opérationnels.

### 15. Quels contrôles associez-vous à XML-RPC, aux sauvegardes et aux permissions ?

Je les traite comme des points à confirmer côté cible, car leur risque dépend de l’exposition et de la configuration réelles. Les contrôles attendus portent notamment sur l’exposition de XML-RPC, l’accessibilité des fichiers de sauvegarde, les permissions des répertoires et l’interdiction d’exécuter du PHP dans les uploads.

### 16. Comment avez-vous déterminé les priorités ?

J’ai croisé quatre dimensions : la preuve disponible, l’impact potentiel, le contexte d’exposition et le niveau de confiance. Une action est prioritaire lorsqu’elle réduit un risque important avec une correction raisonnablement maîtrisable ; les éléments incertains sont conservés comme contrôles à planifier plutôt que présentés comme des faits.

### 17. Pourquoi ne pas afficher une note globale de sécurité ?

Une note unique peut masquer les différences entre un constat confirmé, une action préparée et une validation encore manquante. Le tableau de bord factuel indique directement ce qui est documenté, préparé, contrôlé localement ou à vérifier sur la cible.

### 18. Que faites-vous lorsqu’un risque est important mais que la preuve est incomplète ?

Je le conserve comme hypothèse ou contrôle prioritaire, en indiquant explicitement le niveau de confiance. Je ne le transforme pas en vulnérabilité confirmée avant d’avoir obtenu la preuve complémentaire.

---

## C. Remédiation et plugin must-use

### 19. Pourquoi avoir choisi un plugin must-use ?

Un plugin must-use est chargé automatiquement par WordPress et ne dépend pas de l’activation classique d’une extension. Il est donc adapté pour centraliser des contrôles transverses de durcissement, tout en restant versionnable et documentable dans le projet.

### 20. Quelles protections votre plugin couvre-t-il ?

Il prépare notamment une limitation des tentatives de connexion, une réduction de l’énumération des utilisateurs, une réduction des informations de version, une restriction de certains uploads dangereux et la désactivation de l’éditeur de fichiers. Ces comportements ont été étudiés et contrôlés dans le périmètre local.

### 21. Comment fonctionne la limitation des tentatives de connexion ?

Le scénario préparé prévoit cinq échecs avant un verrouillage simulé de quinze minutes. En production, il faudrait encore confirmer la persistance, le comportement derrière un proxy, la gestion des adresses partagées et le risque de bloquer des utilisateurs légitimes.

### 22. Le plugin must-use suffit-il à sécuriser WordPress ?

Non. Il réduit certaines surfaces de risque, mais il ne remplace ni les mises à jour, ni le moindre privilège, ni la sécurité serveur, ni le TLS, ni la surveillance, ni les sauvegardes testées. Il s’inscrit dans une défense en profondeur.

### 23. Comment éviter qu’une remédiation provoque une panne ?

Il faut sauvegarder avant intervention, préparer un plan de retour arrière, appliquer les changements progressivement et vérifier les fonctions critiques : connexion, administration, boutique, paiements éventuels, uploads et tâches planifiées. Chaque changement doit être associé à un contrôle de bon fonctionnement.

### 24. Pourquoi recommander WP-CLI ?

WP-CLI permet d’automatiser les mises à jour, les contrôles d’intégrité et certaines opérations répétables avec une meilleure traçabilité qu’une intervention manuelle. Il doit être utilisé dans un environnement autorisé, avec sauvegarde, contrôle des dépendances et procédure de rollback.

### 25. Les corrections ont-elles été déployées en production ?

Non, je ne revendique pas de déploiement de production dans le périmètre présenté. Les corrections sont développées ou préparées localement ; la mise en œuvre sur la cible nécessite une autorisation, une sauvegarde, une fenêtre d’intervention et une validation post-déploiement.

---

## D. Validation et qualité du travail

### 26. Quelle différence faites-vous entre “préparé”, “simulé” et “vérifié sur la cible” ?

“Préparé” signifie que le code, la procédure ou le contrôle est défini. “Simulé” signifie qu’un scénario contrôlé a été exécuté dans le périmètre local. “Vérifié sur la cible” signifie que le comportement a été confirmé dans l’environnement réel autorisé, avec une preuve datée et reproductible.

### 27. Quels contrôles restent à réaliser sur la cible ?

Il faut notamment confirmer l’état des plugins et des rôles, les réglages runtime de la base, la configuration TLS et des headers, l’exposition de XML-RPC, la protection des sauvegardes, les permissions, le comportement des uploads et l’absence ou la présence d’indicateurs dans les logs.

### 28. Comment prouver qu’une correction est efficace ?

Il faut définir avant l’intervention un résultat attendu, un test positif, un test négatif et une preuve conservée. Par exemple, après désactivation de l’éditeur de fichiers, l’accès à la fonction doit être refusé au rôle concerné et ce résultat doit être enregistré dans le rapport de validation.

### 29. Comment testez-vous les effets de bord ?

Je sépare les contrôles de sécurité des contrôles fonctionnels. Après une correction, je vérifie les parcours critiques de l’application, les tâches planifiées, les intégrations et les journaux d’erreur, puis je compare les résultats avec l’état avant modification.

### 30. Comment votre méthode est-elle reproductible ?

Les composants, les preuves, les hypothèses, les corrections et les validations attendues sont séparés et documentés. Une autre personne peut reprendre l’inventaire, relire la preuve, exécuter le contrôle local puis planifier la vérification cible selon le même cadre.

---

## E. Contribution personnelle et perspectives

### 31. Quelle est votre contribution personnelle dans ce projet ?

Ma contribution porte sur la structuration de la démarche, l’inventaire et la qualification des éléments, la préparation des remédiations, le plugin must-use, les contrôles locaux et la restitution factuelle. J’ai également porté une attention particulière à la distinction entre ce qui est démontré et ce qui reste à valider.

### 32. Quelle est la principale difficulté rencontrée ?

La difficulté principale était d’obtenir des conclusions utiles sans dépasser les preuves réellement disponibles. Il fallait être suffisamment concret pour proposer des corrections, tout en restant suffisamment prudent pour ne pas confondre une copie locale avec l’état de production.

### 33. Quelle amélioration feriez-vous si vous aviez plus de temps ?

Je compléterais la validation par un accès cible explicitement autorisé, un export contrôlé de la base, des tests dynamiques, une analyse des headers et du TLS, puis un contre-audit après remédiation. J’automatiserais également la collecte des versions et la conservation des preuves.

### 34. Comment SecurePress pourrait-il évoluer vers un outil industriel ?

Il faudrait formaliser les profils de contrôle, automatiser la collecte, gérer l’historique des preuves, intégrer les résultats dans un système de suivi et ajouter des contrôles de régression. L’outil devrait aussi gérer les permissions, les secrets, les logs et les différences entre environnement de test et production.

### 35. Quel est le message principal que vous voulez que le jury retienne ?

Un diagnostic de sécurité utile ne consiste pas à produire le plus grand nombre d’alertes, mais à produire des constats justifiés, hiérarchisés et vérifiables. SecurePress apporte précisément ce lien entre preuve, risque, correction et validation.

---

## F. Questions pièges — réponses courtes à mémoriser

### “Avez-vous trouvé une vulnérabilité exploitable ?”

« J’ai identifié des configurations et des versions qui justifient une correction ou une vérification prioritaire dans la copie étudiée. Je ne revendique pas une exploitation confirmée sans preuve d’activation, d’exposition et de test autorisé sur la cible. »

### “Votre site est-il sécurisé maintenant ?”

« Je peux confirmer les contrôles réalisés dans le périmètre local, mais pas certifier la sécurité de la production. La sécurité dépend encore du déploiement, de la configuration cible, des contrôles réseau et de la validation post-remédiation. »

### “Pourquoi ne pas avoir simplement installé un plugin de sécurité connu ?”

« Un plugin générique peut compléter la défense, mais il ne remplace pas l’inventaire ni la qualification du contexte. Le plugin must-use du projet répond à des contrôles ciblés et permet de relier chaque mesure à une preuve et à une validation attendue. »

### “Pourquoi votre présentation ne donne-t-elle pas de pourcentage ou de score ?”

« Parce qu’un score global donnerait une précision que les preuves disponibles ne permettent pas de justifier. Je préfère montrer l’état réel : constats documentés, actions préparées, contrôles locaux et validations encore à planifier. »

### “Que feriez-vous demain matin sur la vraie cible ?”

« Je commencerais par cadrer l’autorisation et sauvegarder l’état. Ensuite, je collecterais l’inventaire runtime, confirmerais les points dépendant de la base et du serveur, appliquerais les corrections prioritaires par étapes, puis je réaliserais les contrôles fonctionnels et de sécurité avec conservation des preuves. »

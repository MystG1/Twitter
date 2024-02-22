**Twitter**

**Table des matières**

**Introduction.......................................................................................................................**

**Présentation du site.........................................................................................................**

**l'interface...........................................................................................................................**

**partie technique**

**Le code global ...........................................................................................................**

**La base de données ....................................................................................................**

**Les outils utilisés .................................................................................................................**

**Introduction :**

Voici le **Clone de Twitter**, le **troisième** **projet** passerelle de la formation qui vise à mettre en place une réplique du réseau social **Twitter** avec la **création**, la **modification**, la **suppression** de tweets ainsi qu'un système **d'inscription** et de **connexion,** de **commentaires et autres fonctionnalités** présentessurlesiteofficiel

**Présentation du site :**

Le site comporte un système **d'inscription** et de **connexion** qui permet aux utilisateurs de **publier**, **d'aimer**, de **commenter** et de **supprimer** des tweets. La **création** de tweets comporte la possibilité d'insérer une **image**.

Il y a aussi un système de **followers** qui permet à l'utilisateur d'avoir une page **réservée** aux **tweets** des personnes qu'il **suit**.

Une fonctionnalité **d'édition** de profil est également disponible, avec la possibilité de modifier **l'image** de profil ainsi que le **pseudo**. Il est aussi possible de **consulter** le profil des **autres** **utilisateurs**

**.........................................................................................................................................**
**L'interface :**

**L'inscription** : l'utilisateur doit rentrer un **email** et un **mot** **de** **passe** valide (qui sera **crypté** par la suite) pour pouvoir **s'enregistrer** dans la base de données. Des **données** **supplémentaires** telles que **l'âge**, le **prénom**, le **nom** et autres sont demandées pour **finaliser** l'inscription. Des **vérifications** sont en place telles que **l'unicité** de **l'adresse mail et** lasaisied'un **âge** valide.

**La connexion :** une fois **inscrit**, l'utilisateur doit se servir de son **email** et son **mot** **de** **passe** pour se connecter. Une **vérification** est en place pour **indiquer** lorsque l'utilisateur n'a pas **renseigné** les **bonnes** **informations**.

La **création** de **tweets **: Elle s'effectue depuis la page **Home** ou depuis le **bouton** mis à disposition dans la **barre** **de** **navigation**. Il est possible d'insérer une **image** via un **URL.**

Les **commentaires** : il est possible de **commenter** tous les tweets ainsi que de les **supprimer**.

**L'édition** **du** **profil** : s'effectue depuis la page **Profil**, l'image doit être une **URL**

**.........................................................................................................................................**
**PARTIE TECHNIQUE**

**Le code de global :**

Le code est un composant **React** fonctionnel qui gère **l'affichage** et les **interactions** du site web. Il importe des **modules** pour la **gestion d'état**, les effets secondaires, les **animations** et les **composants React**. Le composant utilise des **hooks React** pour gérer l'état, effectue des effets secondaires pour interagir avec la **base de données**, et intègre des **animations** pour améliorer l'expérience utilisateur. Les fonctionnalités incluent **l'affichage de tweets**, les **interactions** avec les **utilisateurs**, les likes, les commentaires, etc..

**.........................................................................................................................................**
**La base de données :**

Ma **base** **de** **données** est **constituée** grâce à l'outil **Firebase** comme telle :

-Elle comporte **trois** **collections** : **Users**, **tweets** et **Comments**.

A chaque **interaction** avec le site (création de tweets, d'utilisateur ou de commentaire) un **document** avec un **ID** **unique** est **créé**. Tous ces documents se **relient** **entre** **eux** via le **userId**. Nous sommes capables de savoir **qui** a créé tel tweet ou tel commentaire **grâce** au **userId** qui est **inclus** dans **chaque** **document**.
**.........................................................................................................................................**

**Les outils utilisés :**

-Vite

-React

-Heroicons.com

-ChatGPT

les dépendances :

-firebase

-framer-motion

-react / react-dom

-react-hook-form

-react-icons

-react-router-dom

-react-spinners

-react-textarea-autosize

-react-toastify

-tailwind

-tailwind-scrollbar

**.........................................................................................................................................**

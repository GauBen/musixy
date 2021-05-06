# musixy

musixy est un projet scolaire de la matière Application Web.

## Todo

- [x] Setup de Eleventy, Parcel, ESLint
- [x] Mini-prototype de dessin
- [x] Affichage des chansons de la playlist
- [x] Refactor de la logique de dessin
  - [x] Normalisation des coordonnées
  - [x] Abstraction du dessin sur le canvas
- [x] Continuité : dessin, requête, affichage de la playlist générée
- [x] Commencer le design
- [x] Commencer à coder des animations
- [x] Concevoir la page de soumission des musiques
- [x] Rajouter le texte des axes
- [ ] Convertir la page de contribution en automate
- [ ] Refactor

## Récupérer les infos YouTube sans API key

- Les <meta og:> + <meta itemprop="duration">
- https://www.youtube.com/oembed?url=https%3A//youtube.com/watch%3Fv%3DhiOkMt7iJ7g&format=json
- https://noembed.com/

## Comment produire le code de prod

- Installer volta (`curl https://get.volta.sh | bash`)
- Relancer son shell
- Installer les dépendances (`yarn install`)
- Créer le dossier `_dist` (`yarn build`)

Pour lancer le server de développement :

- Tout ce qui se trouve avant
- `yarn start`

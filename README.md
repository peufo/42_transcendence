# Setup

## Node et Package manager

Au lieu d'installer directement `node`, il est préférable de passer par `volta` qui permet de choisir quelle version de node on veut utilisé:

A faire dans $HOME :
```sh
curl https://get.volta.sh | bash
```

A faire dans un nouveau terminal :
```sh
volta install node
```

On utilise pnpm au lieu npm. C'est plus rapide et plus éficient niveau stockage.
Vue que c'est un commande qu'on utilise souvent, on ajoute les alias `pn` -> `pnpm` et `px` -> `pnpx` dans .zshrc. (ou .bashrc si tu préfère).

```sh
npm install -g pnpm@latest
echo 'alias pn="pnpm"' >> ~/.zshrc
echo 'alias px="pnpx"' >> ~/.zshrc
source ~/.zshrc
```

Check:
```sh
node -v
pn -v
```

## VScode

L'extension `Biome` est utilisé comme linter et parser pour uniformiser le code.
Les settings de base sont définis dans `.vscode/settings.json`.
VScode devrait te proposer d'installer l'extension lors de l'ouverture du projet.

## Script du package.json

### Initialisation

Le fichier `.env` définit les variables d'environment utils à l'application. Vue qu'il peut contenir des infos sensible, il est ignorer par git.
Il faut copier `.env.example` dans `.env` et les mettre a jour si nécéssaire.

```sh
cp .env.example .env
```

Installation des dépendances et initalisation de la DB :
```sh
pn i
```

### Développement

Pour coder, on veut que le typescript et le css de tailwind soit compiler à chaque changement de la codebase:

```sh
pn dev
```

A faire quand les shemas de la DB définit dans `src/server/db/schema.ts` ont changer.
On demande a l'ORM drizzle de créer ou de mettre à jour la structure de la DB :
```sh
pn db:push
```

### Déploiement

Pour déployer, on peut compiler avec:
```sh
pn build
````

Puis lancer l'app avec:
```sh
pn start
```

TODO: Dockerfile pour le déploiement et pour le dev.


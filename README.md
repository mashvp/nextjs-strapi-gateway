<h1 style="text-align:center">
  Next.js <span style="color:#4945ff">⇌</span> Strapi<br>
  <span style="font-size:0.75em">Gateway</span>
</h1>

## Installation

### npm

```sh
npm i git+ssh://git@github.com:mashvp/nextjs-strapi-gateway.git
```

### yarn

```sh
yarn add ssh://git@github.com:mashvp/nextjs-strapi-gateway.git
```

### Installer une version spécifique

Avec `npm` ou `yarn`, ajoutez `#x.y.z` à la fin de l'URL du dépôt.

## Utilisation

### Configuration

Deux variables d'environnement sont à configurer dans votre application Next.js pour permettre à la gateway de fonctionner correctement :

| Nom                        | Description                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_STRAPI_API_URL | URL de base du serveur Strapi, sans le suffixe `/api`. Par défaut, la gateway essaiera de se connecter à `localhost:1337`, ce qui devrait fonctionner pendant le développement en local. |
| STRAPI_API_TOKEN           | Jeton d'accès à l'API Strapi. Vous pouvez en générer un depuis le back-office Strapi.                                                                                                    |

Ces variables doivent être renseignées dans les fichiers `*.env` de Next.js. Veuillez vous référer à la [documentation Next.js](https://nextjs.org/docs/basic-features/environment-variables) pour plus d'information.

### fetchAPI

Récupère les données d'un appel à l'API Strapi.

```ts
export type APICall = <T>(
  path: string,
  urlParamsObject?: Record<string, unknown>,
  options?: RequestInit
) => Promise<T>;

declare const fetchAPI: APICall;
```

Paramètres :

| Nom             | Type   | Description                                                                                                                                               |
| --------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| endpoint        | string | Terminaison de l'API à appeler (ex: `/page`)                                                                                                              |
| urlParamsObject | object | Paramètres envoyés en query string à l'API (`?param=value`)<br>Utile pour sélectionner les champs Strapi à inclure dans la réponse (`?populate=*`)        |
| options         | object | Options passées à l'appel `fetch`. Par défaut, un header contenant le token API est envoyé. Vous n'aurez probablement pas besoin d'utiliser ce paramètre. |

Valeur de retour :

Cette fonction retourne les données brutes récupérées depuis l'API Strapi au format JSON (converti en objet JavaScript).

> :warning: Cette fonction peut `throw` dans les cas où l'API :
>
> - ne peut pas être contactée (mauvais URL, API down...)
> - retourne une erreur (404 non trouvé, 401 non autorisé...)
> - retourne un contenu JSON non valide
>
> Lors d'un usage dans un `getStaticProps` ou autres fonctions de Next.js exécutées à la compilation, vous pouvez ne pas protéger l'appel avec un `try / catch`, de cette manière le build sera automatiquement avorté.

Exemple :

```ts
import { fetchAPI } from '@mashvp/nextjs-strapi-gateway';
// ...

interface MyFetchData {
  data: {
    something: string;
  };
}

export const getStaticProps: GetStaticProps = async () => {
  const result = await fetchAPI<MyFetchData>('/api-endpoint', {
    populate: ['seo.metaImage', 'seo.metaSocial.image'],
  });

  // ...

  return { props: result };
};
```

### wrappedFetchAPI

Récupère les données d'un appel à l'API Strapi, encapsulées dans la clé donnée.

```ts
declare const wrappedFetchAPI: <K extends string, V>(
  wrapperKey: K,
  args: [
    path: string,
    urlParamsObject?: Record<string, unknown> | undefined,
    options?: RequestInit | undefined
  ]
) => Promise<ObjectWithProp<K, V>>;
```

Le second paramètres `args` est un tableau contenant les paramètres à envoyer à `fetchAPI`. Mis à part ce point, le fonctionnement de cette fonction est identique à `fetchAPI`.

> :warning: Attention
> Les types génériques `K extends string` et `V` peuvent être omis, la syntaxe est valide, mais TypeScript ne pourra pas inférer le type des données retournées, qui sera donc `unknown`.
> Pour avoir un typage fort, vous devez spécifier le type de retour `V`, et donc incidemment, le type de la clé `K`.
> Cela crée une répétition `<'foo'>('foo')`, mais elle est inévitable.

Exemple :

```ts
import { wrappedFetchAPI } from '@mashvp/nextjs-strapi-gateway';
// ...

interface MyFetchData {
  data: {
    something: string;
  };
}

export const getStaticProps: GetStaticProps = async () => {
  const result = await wrappedFetchAPI<'myKey', MyFetchData>('myKey', [
    '/api-endpoint',
    { populate: ['seo.metaImage', 'seo.metaSocial.image'] },
  ]);

  // ...

  return { props: result };
};
```

#### Utilisation pour les appels globaux

Vous pouvez utiliser `wrappedFetchAPI` pour créer des appels API qui pourront être utilisés comme appels globaux. (voir [`createGlobalDataWrapper`](#createglobaldatawrapper))

Exemple :

```ts
import { wrappedFetchAPI } from '@mashvp/nextjs-strapi-gateway';

interface MyFetchData {
  data: {
    something: string;
  };
}

const myGlobalFetchCall = async () =>
  wrappedFetchAPI<'myKey', MyFetchData>('myKey', [
    '/api-endpoint',
    { populate: ['seo.metaImage', 'seo.metaSocial.image'] },
  ]);
```

### createGlobalDataWrapper

Cette fonction permet de créer un analogue à `fetchAPI` qui encapsule automatiquement des appels globaux. Cela vous permet de récupérer des données globales nécessaires partout dans le site sans avoir à écrire les requêtes manuellement à chaque fois. (par exemple, pour les données du menu, du footer…)
Vous pouvez ensuite utiliser votre fonction globale de la même manière que `fetchAPI`, les données globales seront contenues dans la clé `global` dans le résultat.

```ts
declare const createGlobalDataWrapper: <G>(
  ...globalCalls: APICallFunc<G>[]
) => <T>(
  fetchCall: APICallFunc<T>
) => Promise<T & Required<ObjectWithProp<'global', G>>>;
```

Exemple :

```ts
import {
  wrappedFetchAPI,
  createGlobalDataWrapper,
  type GlobalAPICallReturnType,
} from '@mashvp/nextjs-strapi-gateway';

interface FooData {
  something: string;
}

interface BarData {
  somethingElse: number;
}

const foo = async () => wrappedFetchAPI<'foo', FooData>('foo', ['/foo']);
const bar = async () => wrappedFetchAPI<'bar', BarData>('bar', ['/bar']);

type APIGlobals = GlobalAPICallReturnType<typeof foo> &
  GlobalAPICallReturnType<typeof bar>;

export const withGlobalData = createGlobalDataWrapper<APIGlobals>(foo, bar);
```

### getStrapiMediaURL

Retourne l'URL d'un média Strapi à partir des données de l'API.
Fonctionne pour les données globales d'une image, ou pour un format spécifique.

```ts
declare const getStrapiMediaURL: (
  mediaOrFormat: ImageMedia | ImageDataFormat
) => string;
```

Les données d'images retournées par Strapi sont au format :

```ts
/**
 * Données d'un format d'image
 *
 * name: nom du fichier image
 * hash: nom hashé du fichier (peut servir d'identifiant unique)
 * url: url du fichier (relatif si hébergé par Strapi, absolu sinon)
 * ext: extension du fichier
 * mime: type mime du fichier
 * width: largeur de l'image en pixels (number)
 * height: hauteur de l'image en pixels (number)
 */
export interface ImageDataFormat {
  name: string;
  hash: string;
  url: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
}

/**
 * Données d'une image
 *
 * Contenu :
 * - un format générique (format d'origine, hérité par le `extends`)
 * - un objet de formats (thumbnail, small, medium, large)
 * - un texte alt
 * - un code blurhash (si le plugin Strapi Blurhash est installé)
 */
export interface ImageData extends ImageDataFormat {
  alternativeText?: string;
  formats: { [key: string]: ImageDataFormat };
  blurhash?: string;
}

/**
 * Structure de données d'images retournées par l'API Strapi
 */
export interface ImageMedia {
  data: {
    id: number;
    attributes: ImageData;
  };
}
```

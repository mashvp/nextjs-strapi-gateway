# Nextjs-Strapi Gateway

[TOC]

## Installation

### npm

```sh

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

### Récupérer des données sur l'API

#### fetchAPI

Récupère les données d'un appel à l'API Strapi.

```ts
declare async function fetchAPI(
  endpoint: string,
  urlParamsObject: Record<string, unknown> = {},
  options: RequestInit = {}
);
```

Paramètres :

| Nom             | Type   | Description                                                                                                                                               |
| --------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| endpoint        | string | Terminaison de l'API à appeler (ex: "/page")                                                                                                              |
| urlParamsObject | object | Paramètres envoyés en query string à l'API (`?param=value`)<br>Utile pour sélectionner les champs Strapi à inclure dans la réponse (`?populate=*`)        |
| options         | object | Options passées à l'appel `fetch`. Par défaut, un header contenant le token API est envoyé. Vous n'aurez probablement pas besoin d'utiliser ce paramètre. |

Valeur de retour :

Cette fonction retourne les données brutes récupérées depuis l'API Strapi au format JSON (converti en objet JavaScript).

> :warning: Cette fonction peut `throw` dans les cas suivants :
>
> - L'API ne peut pas être contactée (mauvais URL, API down...)
> - L'API retourne une erreur (404 non trouvé, 401 non autorisé...)
> - L'API retourne un contenu JSON non valide
>
> Lors d'un usage dans un `getStaticProps` ou autres fonctions de Next.js exécutées à la compilation, vous pouvez ne pas protéger l'appel avec un `try / catch`, de cette manière le build sera automatiquement avorté.

Example :

```ts
import { fetchAPI } from '@mashvp/nextjs-strapi-gateway';

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

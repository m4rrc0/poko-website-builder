---
translationKey: cloudflare
lang: fr
createdAt: 2026-02-09T13:18:00.000Z
uuid: b295be3b6780
localizationKey: 364680cddfc8
name: Cloudflare
eleventyNavigation:
  title: ''
  parent: ''
  order: 10
metadata: null
preview: null
tags: []
status: ''
pageLayout: ''
generatePage: ''
vars: null
dataList: []
---

## Étape 3

On va maintenant héberger ton site web grâce à Cloudflare.

Commence par te créer un compte [ICI](https://www.cloudflare.com/fr-fr/lp/dg/brand/cloudflare-enterprise/?utm_medium=cpc&utm_source=google&utm_campaign=ao-fy-acq-emea_fr-connectivity-ge-txt-general-brand_product&utm_content=brand_umbrella_core&gclsrc=aw.ds&&utm_term=cloudflare%20internet_go_cmp-20730031191_adg-158772603721_ad-679237050671_kwd-1656775846248_dev-c_ext-_prd-_sig-CjwKCAiAkbbMBhB2EiwANbxtbVoUQb8syt_Jut_cBTxhqshbsnLjW-pQQP76vyD6jkROKGMrxer0RRoCM3MQAvD_BwE&gad_source=1&gad_campaignid=20730031191&gclid=CjwKCAiAkbbMBhB2EiwANbxtbVoUQb8syt_Jut_cBTxhqshbsnLjW-pQQP76vyD6jkROKGMrxer0RRoCM3MQAvD_BwE).

- A- Clique sur ce lien pour commencer: [Workers & Pages.](https://dash.cloudflare.com/234702a4576e337d12ae62cabd002e0c/workers-and-pages)
- B- Connecte-toi à ton compte  **1** , si ce n’est pas déjà fait.
- C- Clique sur "_Ajouter"_** 3**

{% image src="/_images/tutos/7-workes-pages.webp", width="600" %}

Sur cette page, tu pourras voir tous tes sites web hébergés sur Cloudflare via cet onglet "**2**"

- _D- Clique sur "Pages"_** 4**
- E- Clique sur "_Importer un référentiel Git existant"_** 5**

{% image src="/_images/tutos/8-importer-un-referentiel-github.webp", width="400" %}

- F- Clique dans le cadre _"Sélectionner un référentiel"_ **6** sur le nom de votre projet

{% image src="/_images/tutos/9-chois-du-compte.webp", width="600" %}

- G- Clique sur _"Commencer la configuration"_** 7**
(Il restera grisé temps que le projet ne sera pas sélectionné)

{% image src="/_images/tutos/10-commencer-la-configuration.webp", width="600" %}

- H- Vérifie que tu es bien sur _"main"_ **8**

{% image src="/_images/tutos/11-configurer-les-versions-et-les-deploiements.webp", width="600" %}

- I-
    - a) Dans _"Commande de version"_ écrit **_"bun run build"_ 9**
    - b) Puis dans _"Répertoire de sortie de version_ écrit **_"dist"_ 10**
- J- Clique sur _"Enregistrer et déployer"_** 11**

{% image src="/_images/tutos/12-configurer-les-versions-et-les-deploiements-2.webp", width="600" %}

- K) Patient un peu \~30s, tu devrais voir cette page s’afficher quand il a fini.

{% image src="/_images/tutos/13-operation-reussie.webp", width="400" %}

- L) Clique sur _" Continuer le projet "_ **12**

{% image src="/_images/tutos/14-modifier-ou-continuer.webp", width="600" %}

Si ça échoue, clique simplement sur _"Modifier les paramètres"_ **13**.
L’erreur la plus commune étant de se tromper sur _"Commande de version" et " Répertoire de sortie de version_ écrit" (voir étape 1).

Si ça ne marche toujours pas clique sur l’onglet Workers & Pages à gauche, clique sur les _"…"_ **14** du site créé puis sur _"Paramètre"_ **15**.

{% image src="/_images/tutos/15.webp", width="600" %}

Supprime-le, puis refais la manipulation depuis le début, en validant bien chaque étape.

Tu trouveras l'option de suppression tout en bas des paramètres **16**.

{% image src="/_images/tutos/16-suprimer.webp", width="600" %}

## Étape 4

Ton site est maintenant hébergé ;p

On doit maintenant accéder au CMS  pour pouvoir le configurer.

- Trouvez l'URL de ton projet **1** _"Cloudflare Pages"_. (par ex. https://project-name.pages.dev)
- Ouvrez l'URL dans ton navigateur et ajoutez _"/admin"_ juste à la fin (Par exemple: https://project-name.pages.dev/admin). Tu devrais voir l'écran de connexion CMS.

{% image src="/_images/tutos/17-cms-connection-admin.webp", width="500" %}

Clique sur _"Sign in with GitHub Using PAT"_ **2**.

{% image src="/_images/tutos/18-cms-connection-admin-2.webp", width="200" %}

Tu doit coller le TOKEN que tu as précieusement sauvegardé au début **3**.

{% image src="/_images/tutos/19-cms-connection-admin-token.webp", width="300" %}

Bienvenue sur ton CMS.

> _CMS: "Content managment system" est le système de gestion de ton site web._

Configure celui-ci pour que tu puisses enfin voir ton site prendre forme.

Commence par aller dans _"settings"_ **4**.

{% image src="/_images/tutos/20-cms-pages-d-accueil-vide.webp" %}

- A- Nomme ton site **5**
- B- Colle l’URL de ton site sans oublier le _"https://"_ et en enlevant tout ce qui a après _".dev"_ **6**

{% image src="/_images/tutos/21-cms-settings-url.webp", width="300" %}

- C- Ouvre le volet _"Languages"_ et choisi ta langue

{% image src="/_images/tutos/22-cms-settings-langue-1.webp", width="300" %}

{% image src="/_images/tutos/23-cms-settings-langue-2.webp", width="301" %}

Vérifie que tu as bien complété tous les champs contenant une astérisque _"**\***"_.

- E- Sauvegarde avec _" Save and Publish "_ que tu trouveras en haut à gauche de ta page

{% image src="/_images/tutos/24-cms-save-and-publish.webp", width="300" %}

- F- Attends le temps que Cloudflare valide la modification (ça peut prendre un peu de temps)

{% image src="/_images/tutos/25-cms-cloudflare-chargement.webp", width="500" %}

- G)- Une fois validé, rafraichi ta page web. Si tu as ce visuel, bravo, tu as fini la configuration de ton site

{% image src="/_images/tutos/26-cms-fin.webp", width="200" %}

Tu as maintenant accès à tous les outils pour faire ta mise en page et créé ton site internet personnaliser avec POKO.

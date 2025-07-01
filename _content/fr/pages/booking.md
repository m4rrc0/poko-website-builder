---
lang: fr
createdAt: 2025-06-17T19:40:00.000Z
uuid: 1c57dca44576
localizationKey: 056629ecb78c
name: Réservation
eleventyNavigation:
  title: ""
  parent: ""
  order: 6
metadata:
  title: ""
  description: ""
  image: ""
---

![Réservation](/_images/Main-clefs-ombre.webp)

# Réservation

Les demandes de réservation sont à envoyer par mail à {{ data.email | emailLink }}.  
Les disponibilités peuvent être consultées sur le calendrier ci-dessous.  
Le prix de la chambre est de 150€, petit-déjeuner pour 2 personnes inclus (+10€ par personne supplémentaire).

## Conditions de séjour

La durée de votre séjour parmi nous est de minimum 2 nuits.

Check-in: 15h

Check-out: 11h

Vos animaux sont les bienvenus sur demande.

## Table d'hôtes

Si vous souhaitez dîner sur place le soir de votre arrivée, merci de le mentionner dans votre demande de réservation.

N'oubliez pas de nous informer de vos éventuelles intolérances ou allergies alimentaires.

<section class="calendar-container">
  <h2>Calendrier</h2>
  <p class="callout">Ce calendrier présente les disponibilités actuelles. Les réservations sont confirmées par e-mail.</p>

{% include "calendar.njk" %}

</section>

<section class="center intrinsic">
  <a href="/fr/contact/" class="btn book">Réserver</a>
</section>

---
lang: it
createdAt: 2025-06-17T19:40:00.000Z
uuid: 126b5ac33d91
localizationKey: 056629ecb78c
name: Prenotazione
eleventyNavigation:
  title: ''
  parent: ''
  order: 6
metadata:
  title: ''
  description: ''
  image: ''
---
![Prenotazione](/_images/Main-clefs-ombre.webp)

# Prenotazione

Le richieste di prenotazione devono essere inviate via e-mail a {{ data.email | emailLink }}.  
Le disponibilità possono essere consultate nel calendario qui sotto.  
Il prezzo della camera è di 165€, colazione per 2 persone inclusa (+10€ per ogni persona aggiuntiva).

## Condizioni di soggiorno.

La durata minima del soggiorno è di 2 notti.

Check-in: 15:00
Check-out: 11:00

I vostri animali sono i benvenuti su richiesta.

## Tavola

Se desiderate cenare da noi la sera del vostro arrivo, vi preghiamo di indicarlo nella richiesta di prenotazione.

Non dimenticate di informarci di eventuali intolleranze o allergie alimentari.

<section class="calendar-container">
  <h2>Calendario</h2>
  <p class="callout">Questo calendario mostra le disponibilità attuali. Le prenotazioni sono confermate via email.</p>

{% include "calendar.njk" %}

</section>

<section class="center intrinsic">
  {{ data.email | emailLink({ text: "Prenota per e-mail", subject: "Prenotazione - Una Scelta", class: "btn book" }) }}
</section>

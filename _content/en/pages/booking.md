---
lang: en
createdAt: 2025-06-17T19:40:00.000Z
uuid: 2b0666b0cc22
localizationKey: 056629ecb78c
name: Booking
eleventyNavigation:
  title: ""
  parent: ""
  order: 6
metadata:
  title: ""
  description: ""
  image:
---

![Booking](/_images/Main-clefs-ombre.webp)

# Booking

Booking requests should be sent by email to {{ data.email | emailLink }}.  
Availability can be checked on the calendar below.  
The room rate is €150, including breakfast for 2 people (+€10 per additional person).

## Stay Conditions

The minimum stay is 2 nights.
Check-in: 3:00 PM
Check-out: 11:00 AM
Pets are welcome upon request.

## Dinner Option

If you would like to have dinner on-site on the evening of your arrival, please mention it in your booking request.
Don’t forget to let us know about any food intolerances or allergies.

<section class="calendar-container">
  <h2>Calendar</h2>
  <p class="callout">This calendar shows the current availability. Reservations are confirmed by email.</p>

{% include "calendar.njk" %}

</section>

<section class="center intrinsic">
  {{ data.email | emailLink({ text: "Book by email", subject: "Booking - Una Scelta", class: "btn book" }) }}
</section>

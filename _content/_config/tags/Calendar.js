import Markdoc from "@markdoc/markdoc";

export const Calendar = {
  inline: false,
  selfClosing: true,
  attributes: {
    primary: { type: Array, required: true },
  },
  transform: (node, config) => {
    const attributes = node.transformAttributes(config);
    // const attributes = node.attributes || {};
    const className = "calendar";
    const { lang, calendar: calendarBackup } = config.variables;
    const calendar = attributes.primary || calendarBackup;
    const weekDaysNames = [
      "2024-07-01",
      "2024-07-02",
      "2024-07-03",
      "2024-07-04",
      "2024-07-05",
      "2024-07-06",
      "2024-07-07",
    ].map((date) =>
      new Date(date).toLocaleString(lang, { weekday: "short" }).replace(".", "")
    );

    return new Markdoc.Tag(
      "ol",
      { role: "list", class: "calendar-list reel stack horizontal" },
      [
        ...calendar.map((monthData) => {
          const { month, year, weeks } = monthData;
          const monthName = new Date(year, month).toLocaleString(lang, {
            month: "long",
          });

          return new Markdoc.Tag("li", {}, [
            new Markdoc.Tag("table", { class: className }, [
              new Markdoc.Tag("caption", {}, [monthName + " " + year]),
              new Markdoc.Tag("thead", {}, [
                new Markdoc.Tag("tr", {}, [
                  ...weekDaysNames.map(
                    (day) => new Markdoc.Tag("th", { scope: "col" }, [day])
                  ),
                ]),
              ]),
              new Markdoc.Tag("tbody", {}, [
                ...weeks.map(
                  (week) =>
                    new Markdoc.Tag("tr", {}, [
                      ...week.map(
                        (day) =>
                          new Markdoc.Tag(
                            "td",
                            {
                              "data-booked": day?.booked,
                              "data-price": day?.price,
                            },
                            [day?.date]
                          )
                      ),
                    ])
                ),
              ]),
            ]),
          ]);
        }),
      ]
    );
  },
};

/* <section class="calendar-container">
  <table class="booking-calendar">
    <caption>Juin 2025</caption>
    <thead>
      <tr>
        <th scope="col">Lun</th>
        <th scope="col">Mar</th>
        <th scope="col">Mer</th>
        <th scope="col">Jeu</th>
        <th scope="col">Ven</th>
        <th scope="col">Sam</th>
        <th scope="col">Dim</th>
      </tr>
    </thead>
    <tbody>
      <!-- Week 1: May 26-Jun 1 -->
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="calendar-day available">
          <div class="date">1</div>
          <div class="price">100€</div>
        </td>
      </tr>
      <!-- Week 2: Jun 2-8 -->
      <tr>
        <td class="calendar-day available">
          <div class="date">2</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">3</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">4</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">5</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">6</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">7</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">8</div>
          <div class="price">100€</div>
        </td>
      </tr>
      <!-- Week 3: Jun 9-15 -->
      <tr>
        <td class="calendar-day available">
          <div class="date">9</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">10</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">11</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">12</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">13</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">14</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">15</div>
          <div class="price">100€</div>
        </td>
      </tr>
      <!-- Week 4: Jun 16-22 -->
      <tr>
        <td class="calendar-day available">
          <div class="date">16</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">17</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">18</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">19</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day booked">
          <div class="date">20</div>
          <div class="price">150€</div>
        </td>
        <td class="calendar-day booked">
          <div class="date">21</div>
          <div class="price">150€</div>
        </td>
        <td class="calendar-day booked">
          <div class="date">22</div>
          <div class="price">150€</div>
        </td>
      </tr>
      <!-- Week 5: Jun 23-29 -->
      <tr>
        <td class="calendar-day booked">
          <div class="date">23</div>
          <div class="price">150€</div>
        </td>
        <td class="calendar-day booked">
          <div class="date">24</div>
          <div class="price">150€</div>
        </td>
        <td class="calendar-day booked">
          <div class="date">25</div>
          <div class="price">150€</div>
        </td>
        <td class="calendar-day booked">
          <div class="date">26</div>
          <div class="price">150€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">27</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">28</div>
          <div class="price">100€</div>
        </td>
        <td class="calendar-day available">
          <div class="date">29</div>
          <div class="price">100€</div>
        </td>
      </tr>
      <!-- Week 6: Jun 30-Jul 6 -->
      <tr>
        <td class="calendar-day available">
          <div class="date">30</div>
          <div class="price">100€</div>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>
  
  <div class="calendar-legend">
    <div class="legend-item available">
      <span class="legend-color"></span>
      <span class="legend-text">Disponible</span>
    </div>
    <div class="legend-item booked">
      <span class="legend-color"></span>
      <span class="legend-text">Réservé</span>
    </div>
  </div>
</section> */

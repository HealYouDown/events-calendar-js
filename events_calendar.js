class EventsCalendar {
    /**
     * @typedef {{name: string, description: string, startDate: (string|Date), endDate: (string|Date), color: string}} event
     * @param {HTMLElement} element The calendar html element.
     * @param {{startsOnMonday: Boolean, startDate: Date, weekdaysShort: Array<string>[7], weekdaysLong: Array<string>[7], monthsShort: Array<string>[12], monthsLong: Array<string>[12], events: Array<event>, onDayClickEvent: function(Date, Array<event>)}} options A object with options.
     */
    constructor(element, options = {}) {
        this.element = element;

        // Default options
        this.options = {
            startsOnMonday: false,
            startDate: new Date(),
            weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            weekdaysLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            monthsLong: ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            events: [],
            onDayClickEvent: null,
        }

        this.state = {
            today: new Date(),
            current: this.options.startDate,
        }

        // Overwrite options with given 'options' object in constructor
        // Only arguments given in options will be merged.
        // Events are handled with a few extra lines, because date ranges are split
        // into individual events (e.g. 10.02 - 15.02 will be 5 different events)
        options.events.forEach((event) => {
            // Check if event start and end date are dates or strings
            if (typeof event.startDate === "string" || typeof event.endDate === "string") {
                // Convert to dates
                event.startDate = new Date(event.startDate);
                event.endDate = new Date(event.endDate);
            }

            // Compare just the days, not time to find out whether the event spans multiple days
            const startDay = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
            const endDay = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());

            if (startDay.getTime() === endDay.getTime()) {
                // Event only spans one day
                this.options.events.push(event);
            } else {
                // Convert events that span multiple days into events that only span one day
                const msPerDay = 1000 * 60 * 60 * 24
                const daysDifference = Math.floor((endDay - startDay) / msPerDay);
                
                for (let i = 0; i <= daysDifference; ++i) {
                    const date = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + i);
                    const eventCopy = Object.assign({}, event);
                    eventCopy.startDate = date;
                    eventCopy.endDate = date;

                    this.options.events.push(eventCopy);
                }
            }
        })

        // Remove from options so that the raw events are not re-assigned to this.options
        delete options.events;
        Object.assign(this.options, options);

        // Build calendar
        this._build();

        // Run function as if today date was clicked
        this.options.onDayClickEvent(this.state.today, this.getEventsForDate(this.state.today));
    }

    /**
     * Changes the current month by an offset and then rebuilds the calendar.
     * @param {number} value Offset for the current month, e.g. being in march 2021, -2 will result in january 2021.
     */
    _updateMonth(value) {
        // See: https://stackoverflow.com/questions/5645058/how-to-add-months-to-a-date-in-javascript
        this.state.current = new Date(this.state.current.setMonth(this.state.current.getMonth() + value))
        this._build();
    }

    /**
     * Returns the number of days in a given month.
     * @param {number} month Number of the month, 0-11
     * @param {number} year The year to check for, e.g. 2021.
     * @returns {number}
     */
    _getDaysOfMonth(year, month) {
        return new Date(year, month+1, 0).getDate();
    }

    /**
     * Builds the calendar elements for month and year defined in state.
     */
    _build() {
        // Clears the element
        this.element.innerHTML = "";

        this._buildHeader();
        this._buildWeekdayNameHeaders();
        this._buildDays();
    }

    /**
     * Builds the header with month, year and the two navigation buttons for the current date in state.
     */
    _buildHeader() {
        // Month and year header
        const monthYearHeaderWrapper = document.createElement("div");
        monthYearHeaderWrapper.classList.add("events-calendar-month-year-wrapper")
        this.element.appendChild(monthYearHeaderWrapper);

        // Left button
        const buttonLeftElement = document.createElement("button");
        buttonLeftElement.classList.add("events-calendar-month-button")
        buttonLeftElement.innerText = "<";
        buttonLeftElement.onclick = this._updateMonth.bind(this, -1);
        monthYearHeaderWrapper.append(buttonLeftElement)

        // month and year text
        const monthYearElement = document.createElement("span");
        monthYearElement.classList.add("events-calendar-month-year-label")
        monthYearHeaderWrapper.append(monthYearElement);

        const monthName = this.options.monthsLong[this.state.current.getMonth()];
        const year = this.state.current.getFullYear();
        monthYearElement.innerHTML = `${monthName}, <b>${year}</b>`;

        // right button
        const buttonRightElement = document.createElement("button");
        buttonRightElement.classList.add("events-calendar-month-button")
        buttonRightElement.innerText = ">";
        buttonRightElement.onclick = this._updateMonth.bind(this, +1);
        monthYearHeaderWrapper.append(buttonRightElement)
    }

    /**
     * Builds the weekday header (Sunday, Monday, ..) below the header for the current date in state.
     */
    _buildWeekdayNameHeaders() {
        // Weekday name headers
        const weekdayHeaderWrapper = document.createElement("div");
        weekdayHeaderWrapper.classList.add("events-calendar-weekday-names-wrapper")
        this.element.appendChild(weekdayHeaderWrapper);

        const weekdaysShortCopy = Object.assign([], this.options.weekdaysShort);
        if (this.options.startsOnMonday) {
            // Copys first day to last and removes first day, so that the first
            // element in the array is Monday, not Sunday.
            weekdaysShortCopy.push(weekdaysShortCopy[0]);
            weekdaysShortCopy.splice(0, 1);
        }

        weekdaysShortCopy.forEach((shortWeekday) => {
            const weekdayElement = document.createElement("abbr");
            weekdayElement.classList.add("events-calendar-weekday-name");
            weekdayElement.innerText = shortWeekday;
            weekdayHeaderWrapper.append(weekdayElement);
        })
    }

    /**
     * Builds the days element for the current date in state.
     */
    _buildDays() {
        // Wrapper element to add days to
        const weekdayWrapper = document.createElement("div");
        weekdayWrapper.classList.add("event-calendar-weekday-wrapper");
        this.element.appendChild(weekdayWrapper);
        
        // Get first day of the week to find out which day it is, so that we can
        // deduct the offset days from it
        const firstDayOfTheMonth = new Date(this.state.current.getFullYear(), this.state.current.getMonth(), 1);
        const offset = this.options.startsOnMonday ? (firstDayOfTheMonth.getDay() - 1) : (firstDayOfTheMonth.getDay());

        // Add days from the month before
        for (let i = 0; i < offset; ++i) {
            const date = new Date(new Date(firstDayOfTheMonth).setDate(firstDayOfTheMonth.getDate() - (offset - i)));

            const weekdayElement = this._createDayElement(date)
            weekdayElement.classList.add("before");

            weekdayWrapper.appendChild(weekdayElement);
        }

        // Add days that are non-empty
        let monthMaxDays = this._getDaysOfMonth(this.state.current.getFullYear(), this.state.current.getMonth());
        for (let i = 1; i <= monthMaxDays; ++i) {
            const date = new Date(this.state.current.getFullYear(), this.state.current.getMonth(), i);

            weekdayWrapper.appendChild(this._createDayElement(date));
        }
    }

    /**
     * @param {Date} date Number of the month, 0-11
     * @returns {HTMLElement}
     */
    _createDayElement(date) {
        let element = document.createElement("div");
        element.classList.add("event-calendar-weekday");

        // Check if element is today by comparing year, month and day
        const isToday = (
            date.getFullYear() === this.state.today.getFullYear()
            && date.getMonth() === this.state.today.getMonth()
            && date.getDate() === this.state.today.getDate()
        );

        if (isToday) {
            element.classList.add("today");
        }

        // Element that holds the number for the day
        const textDayElement = document.createElement("span");
        textDayElement.classList.add("event-calendar-weekday-day-number")
        textDayElement.innerText = date.getDate();
        element.appendChild(textDayElement);

        // Add function to be called when day is clicked
        if (this.options.onDayClickEvent !== null) {
            textDayElement.onclick = function() {
                this.options.onDayClickEvent(date, this.getEventsForDate(date))
            }.bind(this);
        }

        // Add events dots
        // eventsWrapperElement is appeneded, even if there are no events because otherwise
        // the numbers with events would be aligned differently than days without events.
        const events = this.getEventsForDate(date);

        const eventsWrapperElement = document.createElement("div");
        eventsWrapperElement.classList.add("event-calendar-weekday-event-wrapper");
        element.appendChild(eventsWrapperElement);

        events.forEach((event) => {
            const eventElement = document.createElement("span");
            eventElement.classList.add("event-calendar-weekday-event")
            eventElement.style = `background-color: ${event.color}`;
            eventsWrapperElement.appendChild(eventElement);
        })


        return element;
    }

    /**
     * Returns an array with all events for that given date day. Can be empty.
     * @param {Date} date The date that events should be returned for. Only day part will be matched.
     * @returns {Array<event>}
     */
    getEventsForDate(date) {
        return this.options.events.filter((event) => (
            event.startDate.getFullYear() === date.getFullYear()
            && event.startDate.getMonth() === date.getMonth()
            && event.startDate.getDate() === date.getDate())
        );
    }

    /**
     * Returns an array with all events.
     * @returns {Array<event>}
     */
    getAllEvents() {
        return this.options.events;
    }
}
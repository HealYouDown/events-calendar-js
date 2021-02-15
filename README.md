
# Events Calendar JS
![](/example/screenshot.png?raw=True)
Events Calendar is a small JavaScript class that implements a full functioning events calendar. It is written in plain JS and supports all major browsers. Internet Explorer is **not** supported.
It is up to the developer to implement a display for the events, the calendar only handles the date parts and adding a little dot to the day for each event.

A full example can be found in the `example` directory.

## Usage
First, you will have to include the `events_calendar.css` and `events_calendar.js` file in your html document.

Add a plain div to your document. This will be used to create the calendar. E.g. `<div id="calendar"></div>`.

After `events_calendar.js` include, you will have to initalize the calendar.
```js
const element = document.getElementById("#calendar");
const options = {};

const  calendar = new  EventsCalendar(element, options);
```
You will get returned a EventsCalendar object, which you can further use, if needed.

## Options
|Option|Description|Type|Default|Example|
|--|--|--|--|--|
|`startsOnMonday`|Whether the first column will be Monday. Defaults to Sunday|`bool`|`false`||
`startDate`|The date of the month that is first shown. Can be any date in the month.|`Date`|`new Date()`|This will start the calendar in February 2021: `new Date("01 Feb 2021")`|
|`weekdaysShort`|The short form of all 7 weekdays. First one has to be Sunday.|`array<string>[7]`|`["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]`||
|`weekdaysLong`|Full name of all 7 weekdays. Starting on Sunday as well.|`array<string>[7]`|`["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]`||
|`monthsShort`|Short form of all 12 months. Starts with January.|`array<string>[12]`|`["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]`||
|`monthsLong`|Long form of all 12 months. Starts with January as well.|`array<string>[12]`|`["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]`||
|`events`|An array with all events that should be rendered.|`array<event>`||See Events below.|
|`onDayClickEvent`|Function that will be run when a day number is clicked.|`Function(date, events)`||

## Events
An event is a JSON object which has the following keys
|Key|type|Description|
|--|--|--|
|`name`|`string`|The name of the Event|
|`description`|`string`|The description of the event|
|`startDate`|`string`, `Date`|The start date for the event. Events can span multiple days, if the `endDate` is different than `startDate`.
|`endDate`|`string`, `Date`|The end date for the event.
|`color`|`string`|The CSS-Color for the event dot. Examples: `blue`, `#ff0000`, ...

An event may look like this.
```js
{
	name: "Test event",
	description: "My test event!",
	startDate: new Date("2021-02-13"), // or "2021-02-13"
	endDate: new Date("2021-02-15"), // or "2021-02-15"
	color: "blue",
}
```

## Public functions
You can use the following functions on the EventsCalendar instance. For more information, have a look at the source code.
|Function|Description|
|--|--|
|`.getEventsForDate(date: Date)`|Returns an array with all events for that given date day. Can be empty.|
|`.getAllEvents()`|Returns an array with all events.|


# License
[MIT License](https://opensource.org/licenses/MIT)

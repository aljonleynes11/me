# FullCalendar with Alpine.js and Tailwind CSS

A modern calendar application built with FullCalendar, Alpine.js, and Tailwind CSS that allows you to manage events with PnL (Profit and Loss) tracking and notes.

## Features

- 📅 **FullCalendar Integration**: Complete calendar functionality with multiple views (month, week, day, list)
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 💾 **Local Storage**: All events are automatically saved to browser's localStorage
- 🔄 **Drag & Drop**: Move events by dragging them to different dates
- ✏️ **Edit Events**: Click on any event to edit its details
- 🗑️ **Delete Events**: Remove events with confirmation
- 🎯 **PnL Tracking**: Color-coded events based on profit/loss values
- 📝 **Notes**: Add detailed notes to each event

## Data Structure

Each event is stored with the following structure:

```javascript
{
  id: "unique_identifier",
  date: "YYYY-MM-DD",
  pnl: "number_value",
  note: "event_description"
}
```

## How to Use

1. **Open the Application**: Simply open `index.html` in your web browser
2. **Add Events**: 
   - Click the "Add Event" button, or
   - Click on any date in the calendar
3. **Edit Events**: Click on any existing event to edit its details
4. **Move Events**: Drag and drop events to different dates
5. **Delete Events**: Click on an event and use the delete button in the form

## Event Colors

- 🟢 **Green**: Positive PnL values
- 🔴 **Red**: Negative PnL values  
- ⚫ **Gray**: Zero PnL values

## Technologies Used

- [FullCalendar](https://fullcalendar.io/) - Calendar component
- [Alpine.js](https://alpinejs.dev/) - Reactive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Browser Compatibility

This application works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Local Storage API

## Local Development

No build process required! Simply:

1. Download all files to a folder
2. Open `index.html` in your browser
3. Start using the calendar

## Customization

You can easily customize the application by:

- Modifying the color scheme in `app.js` (see `getEventColor` function)
- Adjusting the Tailwind classes in `index.html`
- Adding new fields to the event form
- Changing the calendar views and options

## License

This project is open source and available under the MIT License. 
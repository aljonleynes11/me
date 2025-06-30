function calendarApp() {
    return {
        calendar: null,
        showOffcanvas: false,
        editingEvent: null,
        selectedTimezone: 'Asia/Manila',
        eventForm: {
            date: '',
            pnl: '',
            note: ''
        },
        events: [],

        // Computed properties for summary
        get totalWins() {
            return this.events
                .filter(event => parseFloat(event.pnl) > 0)
                .reduce((sum, event) => sum + parseFloat(event.pnl), 0)
                .toFixed(2);
        },

        get totalLosses() {
            return this.events
                .filter(event => parseFloat(event.pnl) < 0)
                .reduce((sum, event) => sum + Math.abs(parseFloat(event.pnl)), 0)
                .toFixed(2);
        },

        get netPnL() {
            return this.events
                .reduce((sum, event) => sum + parseFloat(event.pnl), 0)
                .toFixed(2);
        },

        init() {
            this.loadEvents();
            this.initCalendar();
        },

        initCalendar() {
            const calendarEl = document.getElementById('calendar');
            
            this.calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,listWeek'
                },
                timeZone: 'Asia/Manila',
                locale: 'en',
                editable: true,
                selectable: true,
                selectMirror: true,
                dayMaxEvents: true,
                weekends: true,
                fixedWeekCount: false,
                height: 800,
                events: this.events.map(event => ({
                    id: event.id,
                    title: event.note,
                    date: event.date,
                    backgroundColor: this.getEventColor(event.pnl),
                    borderColor: this.getEventColor(event.pnl),
                    extendedProps: {
                        pnl: event.pnl,
                        note: event.note
                    }
                })),
                
                // Add (+) button to each day cell
                dayCellDidMount: (arg) => {
                    const addButton = document.createElement('button');
                    addButton.innerHTML = '+';
                    addButton.className = 'add-event-btn w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors';
                    addButton.style.fontSize = '12px';
                    addButton.style.lineHeight = '1';
                    addButton.title = 'Add event';
                    
                    addButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent day selection
                        this.eventForm.date = arg.date.toISOString().split('T')[0];
                        this.editingEvent = null;
                        this.showOffcanvas = true;
                    });
                    
                    arg.el.appendChild(addButton);
                    
                    // Display PnL values on the day cell
                    this.displayPnLOnDay(arg);
                },
                
                // Handle date selection
                select: (info) => {
                    this.eventForm.date = info.startStr;
                    this.editingEvent = null;
                    this.showOffcanvas = true;
                },

                // Handle event click
                eventClick: (info) => {
                    this.editEvent(info.event);
                },

                // Handle event drop (drag and drop)
                eventDrop: (info) => {
                    const event = this.events.find(e => e.id === info.event.id);
                    if (event) {
                        event.date = info.event.startStr;
                        this.saveEventsToStorage();
                        this.refreshCalendar();
                    }
                },

                // Handle event resize
                eventResize: (info) => {
                    const event = this.events.find(e => e.id === info.event.id);
                    if (event) {
                        event.date = info.event.startStr;
                        this.saveEventsToStorage();
                        this.refreshCalendar();
                    }
                }
            });

            this.calendar.render();
        },

        loadEvents() {
            const stored = localStorage.getItem('calendarEvents');
            this.events = stored ? JSON.parse(stored) : [];
        },

        saveEventsToStorage() {
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        },

        refreshCalendar() {
            if (this.calendar) {
                this.calendar.removeAllEvents();
                this.calendar.addEventSource(this.events.map(event => ({
                    id: event.id,
                    title: event.note,
                    date: event.date,
                    backgroundColor: this.getEventColor(event.pnl),
                    borderColor: this.getEventColor(event.pnl),
                    extendedProps: {
                        pnl: event.pnl,
                        note: event.note
                    }
                })));
                
                // Refresh PnL display on all day cells
                this.refreshPnLDisplay();
            }
        },

        refreshPnLDisplay() {
            // Clear existing PnL displays
            document.querySelectorAll('.pnl-display').forEach(el => el.remove());
            
            // Re-add PnL displays for all day cells
            const dayCells = document.querySelectorAll('.fc-daygrid-day');
            dayCells.forEach(dayCell => {
                const dateAttr = dayCell.getAttribute('data-date');
                if (dateAttr) {
                    const date = new Date(dateAttr);
                    const arg = {
                        date: date,
                        el: dayCell
                    };
                    this.displayPnLOnDay(arg);
                }
            });
        },

        getEventColor(pnl) {
            const value = parseFloat(pnl);
            if (value > 0) return '#10B981'; // Green for positive
            if (value < 0) return '#EF4444'; // Red for negative
            return '#6B7280'; // Gray for zero
        },

        addEvent() {
            this.eventForm = {
                date: new Date().toISOString().split('T')[0],
                pnl: '',
                note: ''
            };
            this.editingEvent = null;
            this.showOffcanvas = true;
        },

        editEvent(event) {
            this.editingEvent = this.events.find(e => e.id === event.id);
            if (this.editingEvent) {
                this.eventForm = {
                    date: this.editingEvent.date,
                    pnl: this.editingEvent.pnl,
                    note: this.editingEvent.note
                };
                this.showOffcanvas = true;
            }
        },

        saveEvent() {
            if (!this.eventForm.date || !this.eventForm.pnl || !this.eventForm.note) {
                alert('Please fill in all fields');
                return;
            }

            if (this.editingEvent) {
                // Update existing event
                this.editingEvent.date = this.eventForm.date;
                this.editingEvent.pnl = this.eventForm.pnl;
                this.editingEvent.note = this.eventForm.note;
            } else {
                // Create new event
                const newEvent = {
                    id: Date.now().toString(),
                    date: this.eventForm.date,
                    pnl: this.eventForm.pnl,
                    note: this.eventForm.note
                };
                this.events.push(newEvent);
            }

            this.saveEventsToStorage();
            this.refreshCalendar();
            this.closeOffcanvas();
        },

        deleteEvent() {
            if (this.editingEvent && confirm('Are you sure you want to delete this event?')) {
                this.events = this.events.filter(e => e.id !== this.editingEvent.id);
                this.saveEventsToStorage();
                this.refreshCalendar();
                this.closeOffcanvas();
            }
        },

        closeOffcanvas() {
            this.showOffcanvas = false;
            this.editingEvent = null;
            this.eventForm = {
                date: '',
                pnl: '',
                note: ''
            };
        },

        changeTimezone() {
            if (this.calendar) {
                this.calendar.setOption('timeZone', this.selectedTimezone);
            }
        },

        displayPnLOnDay(arg) {
            const dateStr = arg.date.toISOString().split('T')[0];
            const dayEvents = this.events.filter(event => event.date === dateStr);
            
            if (dayEvents.length > 0) {
                // Create a container for PnL display
                const pnlContainer = document.createElement('div');
                pnlContainer.className = 'pnl-display absolute left-1 top-1 z-5';
                pnlContainer.style.fontSize = '10px';
                pnlContainer.style.fontWeight = 'bold';
                
                dayEvents.forEach((event, index) => {
                    const pnlValue = parseFloat(event.pnl);
                    const pnlElement = document.createElement('div');
                    pnlElement.className = 'mb-1 px-1 py-0.5 rounded text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity';
                    pnlElement.textContent = `${event.pnl}`;
                    pnlElement.title = `Click to edit: ${event.note}`;
                    
                    // Apply color-coded opacity based on PnL value
                    if (pnlValue > 0) {
                        pnlElement.style.backgroundColor = 'rgba(16, 185, 129, 0.8)'; // Green with opacity
                        pnlElement.style.color = 'white';
                    } else if (pnlValue < 0) {
                        pnlElement.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'; // Red with opacity
                        pnlElement.style.color = 'white';
                    } else {
                        pnlElement.style.backgroundColor = 'rgba(107, 114, 128, 0.8)'; // Gray with opacity
                        pnlElement.style.color = 'white';
                    }
                    
                    // Add click event to edit the event
                    pnlElement.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent day selection
                        this.editEventById(event.id);
                    });
                    
                    pnlContainer.appendChild(pnlElement);
                });
                
                arg.el.appendChild(pnlContainer);
            }
        },

        editEventById(id) {
            this.editingEvent = this.events.find(e => e.id === id);
            if (this.editingEvent) {
                this.eventForm = {
                    date: this.editingEvent.date,
                    pnl: this.editingEvent.pnl,
                    note: this.editingEvent.note
                };
                this.showOffcanvas = true;
            }
        }
    }
} 
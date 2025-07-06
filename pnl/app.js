function calendarApp() {
    return {
        calendar: null,
        showOffcanvas: false,
        editingEvent: null,
        selectedTimezone: 'Asia/Manila',
        eventForm: {
            date: '',
            time: '',
            pnl: '',
            note: '',
            image: ''
        },
        events: [],
        offcanvasMode: 'add', // 'add' or 'list'
        selectedDate: null,

        // Computed properties for summary
        get totalEarnings() {
            return this.events
                .filter(event => parseFloat(event.pnl) > 0)
                .reduce((sum, event) => sum + parseFloat(event.pnl), 0)
                .toFixed(2);
        },

        get totalExpenses() {
            return this.events
                .filter(event => parseFloat(event.pnl) < 0)
                .reduce((sum, event) => sum + Math.abs(parseFloat(event.pnl)), 0)
                .toFixed(2);
        },

        get netIncome() {
            return this.events
                .reduce((sum, event) => sum + parseFloat(event.pnl), 0)
                .toFixed(2);
        },

        init() {
            this.loadEvents();
            this.initCalendar();
            
            // Handle window resize for responsive calendar height
            window.addEventListener('resize', () => {
                if (this.calendar) {
                    const newHeight = window.innerWidth < 768 ? 600 : 800;
                    this.calendar.setOption('height', newHeight);
                }
            });
        },

        initCalendar() {
            const calendarEl = document.getElementById('calendar');
            
            this.calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next',
                    center: 'title',
                    right: window.innerWidth < 768 ? 'today dayGridMonth' : 'today dayGridMonth,listMonth'
                },
                timeZone: 'Asia/Manila',
                locale: 'en',
                editable: true,
                selectable: true,
                selectMirror: true,
                dayMaxEvents: true,
                weekends: true,
                fixedWeekCount: false,
                height: window.innerWidth < 768 ? 600 : 800,
                events: this.events.map(event => ({
                    id: event.id,
                    title: (event.time || '') + ' - ' + event.note,
                    date: event.date,
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    textColor: 'transparent',
                    extendedProps: {
                        pnl: event.pnl,
                        note: event.note,
                        time: event.time
                    }
                })),
                
                // Add day cell click handler and item count display
               dayCellDidMount: (arg) => {
                    // Add click handler to the entire day cell
                    arg.el.addEventListener('click', (e) => {
                        // Don't trigger if clicking on PnL items or add button
                        if (e.target.closest('.item-count-display') || e.target.closest('.add-event-btn')) {
                            return;
                        }
                        
                        this.selectedDate = arg.date.toISOString().split('T')[0];
                        const dayEvents = this.events.filter(event => event.date === this.selectedDate);
                        
                        // Always show add mode by default
                        this.offcanvasMode = 'add';
                        // Pre-fill the date field
                        this.eventForm.date = this.selectedDate;
                        this.eventForm.time = new Date().toTimeString().slice(0, 5); // HH:MM format
                        this.eventForm.pnl = '';
                        this.eventForm.note = '';
                        this.eventForm.image = '';
                        this.editingEvent = null;
                        
                        this.showOffcanvas = true;
                    });

                    // Display item count on the day cell
                    this.displayItemCountOnDay(arg);
                },

                
                // Handle date selection
                select: (info) => {
                    this.selectedDate = info.startStr;
                    const dayEvents = this.events.filter(event => event.date === this.selectedDate);
                    
                    // Always show add mode by default
                    this.offcanvasMode = 'add';
                    // Pre-fill the date field
                    this.eventForm.date = this.selectedDate;
                    this.eventForm.time = new Date().toTimeString().slice(0, 5); // HH:MM format
                    this.eventForm.pnl = '';
                    this.eventForm.note = '';
                    this.eventForm.image = '';
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
                    title: (event.time || '') + ' - ' + event.note,
                    date: event.date,
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    textColor: 'transparent',
                    extendedProps: {
                        pnl: event.pnl,
                        note: event.note,
                        time: event.time
                    }
                })));
                
                // Refresh item count display on all day cells
                this.refreshPnLDisplay();
            }
        },

        refreshPnLDisplay() {
            // Clear existing item count displays
            document.querySelectorAll('.item-count-display').forEach(el => el.remove());
            
            // Re-add item count displays for all day cells
            const dayCells = document.querySelectorAll('.fc-daygrid-day');
            dayCells.forEach(dayCell => {
                const dateAttr = dayCell.getAttribute('data-date');
                if (dateAttr) {
                    const date = new Date(dateAttr);
                    const arg = {
                        date: date,
                        el: dayCell
                    };
                    this.displayItemCountOnDay(arg);
                }
            });
        },



        addEvent() {
            this.eventForm = {
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5), // HH:MM format
                pnl: '',
                note: '',
                image: ''
            };
            this.editingEvent = null;
            this.showOffcanvas = true;
        },

        editEvent(event) {
            this.editingEvent = this.events.find(e => e.id === event.id);
            if (this.editingEvent) {
                this.eventForm = {
                    date: this.editingEvent.date,
                    time: this.editingEvent.time || new Date().toTimeString().slice(0, 5),
                    pnl: this.editingEvent.pnl,
                    note: this.editingEvent.note,
                    image: this.editingEvent.image || ''
                };
                this.showOffcanvas = true;
            }
        },

        saveEvent() {
            if (!this.eventForm.date || !this.eventForm.time || !this.eventForm.pnl || !this.eventForm.note) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Missing Information',
                    text: 'Please fill in all fields',
                    confirmButtonColor: '#3B82F6'
                });
                return;
            }

            if (this.editingEvent) {
                // Update existing event
                this.editingEvent.date = this.eventForm.date;
                this.editingEvent.time = this.eventForm.time;
                this.editingEvent.pnl = this.eventForm.pnl;
                this.editingEvent.note = this.eventForm.note;
                this.editingEvent.image = this.eventForm.image;
            } else {
                // Create new event
                const newEvent = {
                    id: Date.now().toString(),
                    date: this.eventForm.date,
                    time: this.eventForm.time,
                    pnl: this.eventForm.pnl,
                    note: this.eventForm.note,
                    image: this.eventForm.image
                };
                this.events.push(newEvent);
            }

            this.saveEventsToStorage();
            this.refreshCalendar();
            this.closeOffcanvas();
            
            Swal.fire({
                icon: 'success',
                title: this.editingEvent ? 'Updated!' : 'Saved!',
                text: this.editingEvent ? 'Event has been updated successfully.' : 'Event has been saved successfully.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#10B981',
                color: '#ffffff'
            });
        },

        deleteEvent() {
            if (this.editingEvent) {
                Swal.fire({
                    title: 'Delete Event',
                    text: 'Are you sure you want to delete this event?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#EF4444',
                    cancelButtonColor: '#6B7280',
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.events = this.events.filter(e => e.id !== this.editingEvent.id);
                        this.saveEventsToStorage();
                        this.refreshCalendar();
                        this.closeOffcanvas();
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Event has been deleted successfully.',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            background: '#10B981',
                            color: '#ffffff'
                        });
                    }
                });
            }
        },

        closeOffcanvas() {
            this.showOffcanvas = false;
            this.editingEvent = null;
            this.selectedDate = null;
            this.offcanvasMode = 'add';
            this.eventForm = {
                date: '',
                time: '',
                pnl: '',
                note: '',
                image: ''
            };
        },

        changeTimezone() {
            if (this.calendar) {
                this.calendar.setOption('timeZone', this.selectedTimezone);
            }
        },

        displayItemCountOnDay(arg) {
            const dateStr = arg.date.toISOString().split('T')[0];
            const dayEvents = this.events.filter(event => event.date === dateStr);
            
            if (dayEvents.length > 0) {
                // Calculate total PnL for the day
                const totalPnL = dayEvents.reduce((sum, event) => sum + parseFloat(event.pnl), 0);
                
                // Determine background color based on PnL
                let bgColor = 'bg-gray-500';
                if (totalPnL > 0) {
                    bgColor = 'bg-green-400';
                } else if (totalPnL < 0) {
                    bgColor = 'bg-red-400';
                }
                
                // Create a container for item count display
                const countContainer = document.createElement('div');
                countContainer.className = 'item-count-display absolute left-1 top-1 z-5';
                
                const countElement = document.createElement('div');
                countElement.className = `px-2 py-1 rounded-full text-xs font-bold text-white ${bgColor} hover:opacity-80 transition-colors cursor-pointer`;
                countElement.textContent = `${dayEvents.length} item${dayEvents.length > 1 ? 's' : ''}`;
                countElement.title = `Click to view ${dayEvents.length} item${dayEvents.length > 1 ? 's' : ''} for this day (Total: ${totalPnL.toFixed(2)})`;
                
                countContainer.appendChild(countElement);
                arg.el.appendChild(countContainer);
            }
        },

        // Get events for a specific date
        getEventsForDate(date) {
            return this.events.filter(event => event.date === date);
        },

        // Switch to add mode
        switchToAddMode() {
            this.offcanvasMode = 'add';
            this.eventForm.date = this.selectedDate;
            this.eventForm.time = new Date().toTimeString().slice(0, 5); // HH:MM format
            this.eventForm.pnl = '';
            this.eventForm.note = '';
            this.eventForm.image = '';
            this.editingEvent = null;
        },

        // Switch to list mode
        switchToListMode() {
            this.offcanvasMode = 'list';
        },

        editEventById(id) {
            this.editingEvent = this.events.find(e => e.id === id);
            if (this.editingEvent) {
                this.eventForm = {
                    date: this.editingEvent.date,
                    time: this.editingEvent.time || new Date().toTimeString().slice(0, 5),
                    pnl: this.editingEvent.pnl,
                    note: this.editingEvent.note,
                    image: this.editingEvent.image || ''
                };
                this.offcanvasMode = 'add';
                this.showOffcanvas = true;
            }
        },

        deleteEventById(id) {
            Swal.fire({
                title: 'Delete Event',
                text: 'Are you sure you want to delete this event?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.events = this.events.filter(e => e.id !== id);
                    this.saveEventsToStorage();
                    this.refreshCalendar();
                    
                    // If no more events for this date, switch to add mode
                    if (this.getEventsForDate(this.selectedDate).length === 0) {
                        this.switchToAddMode();
                    }
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Event has been deleted successfully.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: '#10B981',
                        color: '#ffffff'
                    });
                }
            });
        },

        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.eventForm.image = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },

        clearImage() {
            this.eventForm.image = '';
            // Clear the file input
            const fileInput = document.getElementById('image');
            if (fileInput) {
                fileInput.value = '';
            }
        },
    }
} 
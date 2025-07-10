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
        documentName: localStorage.getItem('documentName') || 'Basic Accounting',
        editingDocumentName: false,

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
            document.title = this.documentName;
            // Focus input if editing document name
            this.$nextTick(() => {
                if (this.editingDocumentName && this.$refs && this.$refs.docNameInput) {
                    this.$refs.docNameInput.focus();
                }
            });
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
                
                // Render event notes as HTML in all views
                eventContent: function(arg) {
                    // Only apply collapsible UI in list view
                    if (arg.view.type.startsWith('list')) {
                        const pnl = arg.event.extendedProps.pnl || '';
                        const noteHtml = arg.event.extendedProps.note || '';
                        const image = arg.event.extendedProps.image || '';
                        const time = arg.event.extendedProps.time || '';
                        const date = arg.event.startStr || '';
                        const id = arg.event.id;
                        // Color for PnL
                        let pnlClass = 'bg-gray-500';
                        if (parseFloat(pnl) > 0) pnlClass = 'bg-green-500';
                        else if (parseFloat(pnl) < 0) pnlClass = 'bg-red-500';
                        // Edit (pencil) icon SVG
                        const editIcon = `<button type=\"button\" class=\"p-1 rounded hover:bg-blue-100 transition-colors\" title=\"Edit event\" data-edit-id=\"${id}\"><svg class=\"w-4 h-4 text-blue-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z\" /></svg></button>`;
                        return {
                            html: `
                            <div x-data=\"{ open: false }\" class=\"bg-gray-50 rounded-lg border border-gray-200 my-2\">
                                <div class=\"flex items-center justify-between p-2\">
                                    <div class=\"flex items-center space-x-2 cursor-pointer\" @click=\"open = !open\">
                                        <span class=\"text-sm font-medium text-gray-600\">${date} ${time}</span>
                                        <span class=\"px-2 py-1 rounded-full text-xs font-bold text-white ${pnlClass}\">${pnl}</span>
                                        <svg :class=\"open ? 'transform rotate-90' : ''\" class=\"w-4 h-4 text-gray-400 transition-transform\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 5l7 7-7 7\" /></svg>
                                    </div>
                                    <div>${editIcon}</div>
                                </div>
                                <div x-show=\"open\" x-collapse>
                                    <div class=\"px-4 pb-4\">
                                        <div class=\"text-gray-800 text-sm\">${noteHtml}</div>
                                        ${image ? `<div class=\"mt-3\"><img src=\"${image}\" alt=\"Event image\" class=\"w-full h-32 object-cover rounded-lg border border-gray-300\"></div>` : ''}
                                    </div>
                                </div>
                            </div>
                            `
                        };
                    } else {
                        // For other views, just show nothing (or minimal)
                        return { html: '' };
                    }
                },
                
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
                        
                        // Show add mode by default
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
                    
                    // Show list mode by default
                    this.offcanvasMode = 'list';
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
                    // Only open offcanvas if the click was on the edit button
                    const editBtn = info.jsEvent.target.closest('[data-edit-id]');
                    if (editBtn) {
                        const id = editBtn.getAttribute('data-edit-id');
                        this.editEventById(id);
                    }
                    // Otherwise, do nothing (let expand/collapse work)
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
                this.$nextTick(() => {
                    if (window._quillNote) {
                        window._quillNote.root.innerHTML = this.eventForm.note || '';
                    }
                });
            }
        },

        saveEvent() {
            if (window._quillNote) {
                this.eventForm.note = window._quillNote.root.innerHTML;
            }
            const noteContent = this.eventForm.note.replace(/<(.|\n)*?>/g, '').trim();
            if (!this.eventForm.date || !this.eventForm.time || !this.eventForm.pnl || !noteContent) {
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
            // Reset form fields
            this.eventForm = {
                date: '',
                time: '',
                pnl: '',
                note: '',
                image: ''
            };
            if (window._quillNote) {
                window._quillNote.root.innerHTML = '';
            }
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
                countElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectedDate = dateStr;
                    this.offcanvasMode = 'list';
                    this.eventForm.date = dateStr;
                    this.eventForm.time = new Date().toTimeString().slice(0, 5);
                    this.eventForm.pnl = '';
                    this.eventForm.note = '';
                    this.eventForm.image = '';
                    this.editingEvent = null;
                    this.showOffcanvas = true;
                });
                
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
            this.$nextTick(() => {
                if (window._quillNote) {
                    window._quillNote.root.innerHTML = '';
                }
            });
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
                this.$nextTick(() => {
                    if (window._quillNote) {
                        window._quillNote.root.innerHTML = this.eventForm.note || '';
                    }
                });
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

        startEditingDocumentName() {
            this.editingDocumentName = true;
            this.$nextTick(() => {
                if (this.$refs && this.$refs.docNameInput) {
                    this.$refs.docNameInput.focus();
                }
            });
        },
        finishEditingDocumentName() {
            this.editingDocumentName = false;
            localStorage.setItem('documentName', this.documentName);
            document.title = this.documentName;
        },
    }
} 
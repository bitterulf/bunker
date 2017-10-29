const notesState = {
    notes: [],
    secret: '',
};

const refreshNotes = function() {
    return m.request({
        method: 'GET',
        url: '/notes',
        withCredentials: true,
    }).then(function(result) {
        notesState.notes = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
    });
};

const renderNote = function(note) {
    const deleteButton = m('button', {
        onclick: function() {
            return m.request({
                method: 'DELETE',
                url: '/note/'+note._id,
                withCredentials: true,
            }).then(function() {
                refreshNotes();
            });
        }
    }, 'delete');

    const decryptButton = m('button', {
        onclick: function() {
            alert(window.decrypt(note.message, notesState.secret));
        }
    }, 'decrypt');

    return m('div', [deleteButton, decryptButton], note.message);
};

const Notes = {
    oninit: function() {
        refreshNotes();
    },
    view: function() {
        return  m('.notesFeature', [
            platform.title('notes'),
            platform.menu('notes'),
            m('input#noteInput'),
            m('input#secretInput', {
                type: 'password',
                onkeyup: function(ev) {
                    notesState.secret = ev.target.value;
                }
            }),
            m('button', {
                onclick: function() {
                    const inputField = document.querySelector('#noteInput');

                    const saveNote = function(noteContent) {
                        return m.request({
                            method: 'POST',
                            url: '/note',
                            withCredentials: true,
                            data: { message: noteContent, time: Date.now() }
                        }).then(function() {
                            inputField.value = '';
                            refreshNotes();
                        });
                    };

                    if (notesState.secret.length >= 5) {
                        const encrypted = window.encrypt(inputField.value, notesState.secret);
                        saveNote(encrypted);

                    } else {
                        saveNote(inputField.value);
                    }

                }
            }, 'send'),
            m('div', notesState.notes.map(renderNote))
        ]);
    }
};

platform.register('notes', [{name: 'notes', route: '/notes', component: Notes}], '/notes.css');

const notesState = {
    notes: [],
    secret: '',
};

const ironOptions = JSON.parse(JSON.stringify(iron.defaults));

ironOptions.encryption.minPasswordlength = 5;
ironOptions.integrity.minPasswordlength = 5;

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
            iron.unseal(note.message, notesState.secret, ironOptions, function (err, unsealed) {
                if (!err) {
                    alert(unsealed.content);
                }
            });
        }
    }, 'decrypt');

    if (note.message.indexOf('Fe26.2**') > -1) {
        return m('div', [deleteButton, decryptButton], 'encrypted');
    }

    return m('div', [deleteButton], note.message);
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

                    console.log(notesState.secret, inputField.value);
                    if (notesState.secret.length >= 5) {
                        console.log('seal it');
                        console.log(ironOptions, iron);
                        iron.seal({ content: inputField.value }, notesState.secret, ironOptions, function (err, sealed) {
                            console.log('return', err, sealed);
                            if (!err) {
                                saveNote(sealed);
                            }
                        });
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

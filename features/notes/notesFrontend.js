const notesState = {
    notes: []
};

const refreshNotes = function() {
    return m.request({
        method: 'GET',
        url: '/notes',
        withCredentials: true,
    })
    .then(function(result) {
        notesState.notes = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
    })
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
            m('button', {
                onclick: function() {
                    const inputField = document.querySelector('#noteInput');

                    return m.request({
                        method: 'POST',
                        url: '/note',
                        withCredentials: true,
                        data: { message: inputField.value, time: Date.now() }
                    })
                    .then(function() {
                        inputField.value = '';
                        refreshNotes();
                    });
                }
            }, 'send'),
            m('div', notesState.notes.map(function(note) {
                return m('div', [m('button', {
                    onclick: function() {
                        return m.request({
                            method: 'DELETE',
                            url: '/note/'+note._id,
                            withCredentials: true,
                        })
                        .then(function() {
                            refreshNotes();
                        });
                    }
                }, 'delete')], note.message);
            }))
        ]);
    }
};

platform.register('notes', '/notes', '/notes.css', Notes);

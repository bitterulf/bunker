const refreshNotes = function() {
    return m.request({
        method: 'GET',
        url: '/notes',
        withCredentials: true,
    })
    .then(function(result) {
        state.notes = result.sort(function(a, b) {
            return a.time - b.time;
        }).reverse();
    })
};

const Notes = {
    oninit: function() {
        refreshNotes();
    },
    view: function() {
        return  [
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
            m('div', state.notes.map(function(note) {
                return m('div', note.message);
            }))
        ];
    }
};

platform.register('notesFeature', '/notes', Notes);

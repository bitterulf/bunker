const Button = {
    oninit: function(vnode) {
        vnode.state.valid = false;
        vnode.state.hover = false;
        vnode.state.pressed = false;
    },
    view: function (vnode) {
        let color = 'black';
        const highlightColor = 'blue';
        const pressColor = 'grey';

        if (vnode.state.hover) {
            color = highlightColor;
        }
        if (vnode.state.pressed) {
            color = pressColor;
        }

        return m('button', {
            style: {
                color: color,
                background: 'darkgrey',
                border: 'solid black 1px',
                cursor: 'pointer'
            },
            onmouseover: function() {
                vnode.state.hover = true;
            },
            onmouseout: function() {
                vnode.state.hover = false;
            },
            onmousedown: function() {
                vnode.state.pressed = true;
            },
            onmouseup: function() {
                vnode.state.pressed = false;
            },
        }, vnode.attrs.caption || '-');
    }
};

const TextInput = {
    oninit: function(vnode) {
        vnode.state.valid = false;
        vnode.state.hover = false;
        vnode.state.pressed = false;
    },
    oncreate: function(vnode) {
        const value = vnode.dom.querySelector('input').value;
        vnode.tag.validate(value, vnode);
        m.redraw();
    },
    validate: function(value, vnode) {
        if (vnode.attrs.validator) {
            vnode.attrs.validator(value, function(isInvalid) {
                vnode.state.isInvalid = isInvalid;
            });
        }
    },
    view: function (vnode) {
        let color = 'black';
        const highlightColor = 'blue';
        const pressColor = 'grey';

        if (vnode.state.hover) {
            color = highlightColor;
        }
        if (vnode.state.pressed) {
            color = pressColor;
        }

        return m('div', [
            m('input', {
                style: {
                    color: color,
                    background: 'white',
                    border: vnode.state.isInvalid ? 'solid red 1px' : 'solid black 1px',
                    cursor: 'pointer'
                },
                onkeyup: function() {
                    const value = this.value;
                    vnode.tag.validate(value, vnode);
                },
                onmouseover: function() {
                    vnode.state.hover = true;
                },
                onmouseout: function() {
                    vnode.state.hover = false;
                },
                onmousedown: function() {
                    vnode.state.pressed = true;
                },
                onmouseup: function() {
                    vnode.state.pressed = false;
                },
                placeholder: vnode.attrs.caption || '-'
            }),
            vnode.attrs.validator ? m('label', { style: { color: vnode.state.isInvalid ? 'red' : 'black' } }, vnode.state.isInvalid ? vnode.state.isInvalid : 'OK') : ''
        ]);
    }
};

const QueryInput = {
    oninit: function(vnode) {
        vnode.state.valid1 = false;
        vnode.state.lastValidObject1 = {};

        vnode.state.valid2 = false;
        vnode.state.lastValidObject2 = {};
    },
    oncreate: function(vnode) {
    },
    view: function (vnode) {
        let color = 'black';

        return [
            m('div', [
                m('textarea', {
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: vnode.state.valid1 ? 'green' : 'red',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    },
                    onkeyup: function() {
                        const value = this.value;
                        try {
                            const parsedValue = JSON.parse(value);
                            vnode.state.valid1 = true;
                            vnode.state.lastValidObject1 = parsedValue;
                        } catch (e) {
                            vnode.state.valid1 = false;
                        }
                    }
                }),
                m('textarea', {
                    readonly: true,
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: 'white',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    }
                }, JSON.stringify(vnode.state.lastValidObject1))
            ]),
            m('div', [
                m('textarea', {
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: vnode.state.valid2 ? 'green' : 'red',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    },
                    onkeyup: function() {
                        const value = this.value;
                        try {
                            const parsedValue = JSON.parse(value);
                            vnode.state.valid2 = true;
                            vnode.state.lastValidObject2 = parsedValue;
                        } catch (e) {
                            vnode.state.valid2 = false;
                        }
                    }
                }),
                m('textarea', {
                    readonly: true,
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: 'white',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    }
                }, JSON.stringify(vnode.state.lastValidObject2))
            ]),
            m('div', [
                m('button', { onclick: function() {
                    if (vnode.state.valid1 && vnode.state.valid2) {
                        const query = new mingo.Query(vnode.state.lastValidObject1);

                        alert(
                            query.test(vnode.state.lastValidObject2)
                        );
                    }
                }}, 'test')
            ])
        ];
    }
};

const RenderInput = {
    oninit: function(vnode) {
        vnode.state.valid1 = false;
        vnode.state.lastValidObject1 = {};
        vnode.state.templateValid = true;
        vnode.state.template = '';
        vnode.state.output = '';
    },
    oncreate: function(vnode) {
    },
    view: function (vnode) {
        let color = 'black';

        return [
            m('div', [
                m('textarea', {
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: vnode.state.valid1 ? 'green' : 'red',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    },
                    onkeyup: function() {
                        const value = this.value;
                        try {
                            const parsedValue = JSON.parse(value);
                            vnode.state.valid1 = true;
                            vnode.state.lastValidObject1 = parsedValue;
                        } catch (e) {
                            vnode.state.valid1 = false;
                        }
                    }
                }),
                m('textarea', {
                    readonly: true,
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: 'white',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    }
                }, JSON.stringify(vnode.state.lastValidObject1)),
                m('textarea', {
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        border: 'solid black 1px',
                        background: vnode.state.templateValid ? 'green' : 'red',
                        cursor: 'pointer'
                    },
                    onkeyup: function() {
                        const source = this.value;
                        try {
                            const template = Handlebars.compile(source);
                            vnode.state.template = source;
                            vnode.state.templateValid = true;
                            vnode.state.output = template(vnode.state.lastValidObject1);
                        } catch(e) {
                            vnode.state.templateValid = false;
                            vnode.state.output = '';
                        }
                    }
                }),
                m('textarea', {
                    readonly: true,
                    rows: 10,
                    cols: 20,
                    style: {
                        color: color,
                        background: 'white',
                        border: 'solid black 1px',
                        cursor: 'pointer'
                    }
                }, vnode.state.output),
                m('div', {
                    style: {
                        border: '1px dashed black'
                    }
                }, m.trust(vnode.state.output))
            ])
        ];
    }
};

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

const Button = {
    view: function (vnode) {
        const color = 'white';
        const highlightColor = 'red';
        const pressColor = 'yellow';

        return m('button', {
            style: {
                color: color,
                background: 'darkgrey',
                border: 'solid black 1px',
                cursor: 'pointer'
            },
            onmouseover: function() {
                this.style.color = highlightColor;
            },
            onmouseout: function() {
                this.style.color = color;
            },
            onmousedown: function() {
                this.style.color = pressColor;
            },
            onmouseup: function() {
                this.style.color = highlightColor;
            },
        }, vnode.attrs.caption || '-');
    }
};

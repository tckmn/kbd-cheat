var keyboard = {
    size: 60,
    init: function() {
        keyboard.ui().appendTo(document.body);
        keyboard.kbd = $('<div>').appendTo(document.body).css('font-family', 'sans-serif');
        [
            '`1234567890-=|bksp|1.7|',
            '|tab|1.7|qwertyuiop[]\\',
            '|caps|1.88|asdfghjkl;\'|enter|2|',
            '|shift|2.53*|zxcvbnm,./|shift|2.53*|',
            '|ctrl|1.4*||super|1.4*||alt|1.4*||space|7.56||alt|1.4*||menu|1.4||ctrl|1.4*|'
        ].forEach(function(row) {
            keyboard.addKeys(row);
        });
        keyboard.updateSizes();
        keyboard.addRow();
        keyboard.addRow('ctrl');
        keyboard.addRow(['alt', 'shift']);
    },
    ui: function() {
        return $('<div>')
            .append($('<div>')
                .text('Click any of the labels on the keys to edit the corresponding text field.')
            )
            .append($('<div>')
                .append($('<button>')
                    .text('+size')
                    .click(function() {
                        keyboard.updateSizes(keyboard.size + 5);
                        $('#size-input').val(keyboard.size);
                    })
                )
                .append($('<button>')
                    .text('-size')
                    .click(function() {
                        keyboard.updateSizes(keyboard.size - 5);
                        $('#size-input').val(keyboard.size);
                    })
                )
                .append($('<input>')
                    .attr('id', 'size-input')
                    .val(keyboard.size)
                    .keyup(function() {
                        keyboard.updateSizes(+$(this).val());
                    })
                )
            )
            .append($('<div>')
                .append($('<button>')
                    .text('add row')
                    .click(function() {
                        var modifiers = [].slice.call($('.addrow-chkbx')
                            .map(function() {
                                return this.checked ? this.id : '';
                            }))
                            .filter(function(x) {
                                return x !== '';
                            });
                        keyboard.addRow(modifiers);
                    })
                )
                .append($('<label>').text('Shift: '))
                .append($('<input>')
                    .attr({ type: 'checkbox', id: 'shift' })
                    .addClass('addrow-chkbx')
                )
                .append($('<label>').text(' Alt: '))
                .append($('<input>')
                    .attr({ type: 'checkbox', id: 'alt' })
                    .addClass('addrow-chkbx')
                )
                .append($('<label>').text(' Ctrl: '))
                .append($('<input>')
                    .attr({ type: 'checkbox', id: 'ctrl' })
                    .addClass('addrow-chkbx')
                )
            )
            .append($('<div>')
                .append($('<button>')
                    .text('delete row')
                    .click(function() {
                        keyboard.deleteRow(+$('#delete-row').val());
                    })
                )
                .append($('<input>')
                    .attr('id', 'delete-row')
                    .val(1)
                )
            )
            .append($('<div>')
                .append($('<button>')
                    .text('import')
                    .click(function() {
                        var load = JSON.parse($('#import-export').val());
                        while (keyboard.rows.length !== 0) keyboard.deleteRow(1);
                        load.rows.forEach(function(x) { keyboard.addRow(x); });
                        var data = load.data;
                        $('.data').each(function() {
                            $(this).val(load.data.shift());
                            $(this).height(this.scrollHeight);
                        });
                    })
                )
                .append($('<button>')
                    .text('export')
                    .click(function() {
                        $('#import-export').val(JSON.stringify({
                            rows: keyboard.rows,
                            data: [].slice.call($('.data').map(function() {
                                return $(this).val();
                            }))
                        }));
                    })
                )
                .append($('<textarea>')
                    .attr('id', 'import-export')
                    .focus(function() {
                        $(this).select();
                        // WebKit bugfix
                        setTimeout(function() { $(this).select(); }, 1);
                        // another WebKit bugfix
                        $(this).mouseup(function() {
                            $(this).off('mouseup');
                            return false;
                        });
                    })
                )
            );
    },
    addKey: function(k, w, mod) {
        return $('<div>')
            .addClass('key' + (mod ? ' mod' : ''))
            .css({
                float: 'left'
            })
            .data({
                key: k,
                width: +w || 1
            })
            .append($('<div>')
                .css('border', '1px solid black')
                .append($('<table>')
                    .css({
                        padding: '0px',
                        margin: '0px',
                        borderCollapse: 'collapse'
                    })
                )
            );
    },
    addKeys: function(keys, fmtChar) {
        if (fmtChar === undefined) fmtChar = '|';
        var f = '\\' + fmtChar,
            rgx = f + '[^' + f + ']*' + f + '[^' + f + ']*' + f + '|.';
        keys.match(new RegExp(rgx, 'g')).forEach(function(k) {
            if (k[0] === fmtChar) {
                var key = k.split(fmtChar)[1], width = k.split(fmtChar)[2];
                keyboard.kbd.append(keyboard.addKey(key, width.replace('*', ''),
                    width.indexOf('*') !== -1));
            } else {
                keyboard.kbd.append(keyboard.addKey(k));
            }
        });
        keyboard.kbd.append($('<br>').css('clear', 'both'));
    },
    updateSizes: function(newSize) {
        if (newSize) keyboard.size = newSize;
        $('.key').each(function() {
            $('>div', this).css({
                width: (keyboard.size * $(this).data('width')) + 'px',
                height: keyboard.size + 'px',
                margin: (keyboard.size / 25) + 'px',
                padding: (keyboard.size / 25) + 'px',
                fontSize: Math.floor(keyboard.size * 0.1) + 'pt'
            });
        });
        keyboard.updateRowSizes();
        $('.data').each(function() {
            $(this).height(0).height(this.scrollHeight);
        });
        // an ugly hack, which fixes a visual bug due to rounding
        var endPx = undefined;
        keyboard.kbd.find('>br').each(function() {
            var key = $(this).prev().find('>div');
            var thisPx = key.width() + key.offset().left;
            if (endPx !== undefined) {
                key.width(key.width() - (thisPx - endPx));
            } else {
                endPx = thisPx;
            }
        });
    },
    updateRowSizes: function() {
        $('.row').css({ height: (keyboard.size / $('.key:first tr').length) + 'px' })
        $('.row2').css({ height: keyboard.size + 'px' })
    },
    rows: [],
    addRow: function(modifiers) {
        if (typeof modifiers === 'undefined') modifiers = [];
        if (typeof modifiers === 'string') modifiers = [modifiers];
        var funcs = [];
        if (modifiers.indexOf('shift') !== -1) {
            funcs.push(function(k) {
                var idx;
                if ('abcdefghijklmnopqrstuvwxyz'.split('').indexOf(k) !== -1) {
                    return k.toUpperCase();
                } else if ((idx = '`1234567890-=[]\\;\',./'.split('').indexOf(k)) !== -1) {
                    return '~!@#$%^&*()_+{}|:"<>?'[idx];
                } else {
                    return 'S-' + k;
                }
            });
        }
        if (modifiers.indexOf('alt') !== -1) {
            funcs.push(function(k) { return 'A-' + k; });
        }
        if (modifiers.indexOf('ctrl') !== -1) {
            funcs.push(function(k) { return 'C-' + k; });
        }
        var transFunc = function(k) {
            funcs.forEach(function(f) { k = f(k); });
            return k;
        };
        keyboard.rows.push(modifiers);

        $('.key:not(.mod)').each(function() {
            $('table', this).append($('<tr>')
                .addClass('row')
                .append($('<td>')
                    .text(transFunc($(this).data('key')))
                    .css({
                        fontWeight: 'bold',
                        padding: '0px 5px 0px 0px',
                        whiteSpace: 'nowrap'
                    })
                    .click(function() {
                        $(this).parent().find('textarea').focus().select();
                    })
                ).append($('<td>')
                    .append($('<textarea>')
                        .val('-')
                        .addClass('data toFix')
                        .css({
                            border: 'none',
                            padding: '0px',
                            margin: '0px',
                            font: 'inherit',
                            width: '100%',
                            height: '0px',
                            overflow: 'hidden',
                            outline: 'none',
                            resize: 'none'
                        })
                        .attr('spellcheck', false)
                        .on('input', function() {
                            $(this).height(0).height(this.scrollHeight);
                        })
                    )
                )
            );
            $('.toFix').removeClass('toFix').each(function() {
                $(this).height(this.scrollHeight);
            });
        });
        $('.key.mod').each(function() {
            var tbl = $('table', this);
            if (tbl.children().length === 0) {
                tbl.append($('<tr>')
                    .addClass('row2')
                    .css('font-weight', 'bold')
                    .append($('<td>')
                        .text($(this).data('key'))
                    )
                );
            }
        });
        keyboard.updateRowSizes();
    },
    deleteRow: function(n) {
        $('.key:not(.mod) .row:nth-child(' + n + ')').remove();
        keyboard.rows.splice(n-1, 1);
        keyboard.updateRowSizes();
    }
};

$(keyboard.init);

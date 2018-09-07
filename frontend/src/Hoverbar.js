import { View } from './View';
import { Action, ActionTypes } from './Action';

export class Hoverbar extends View {

    onInit() {
        Action.on(ActionTypes.UPDATE_HOVERBAR, (e, data) => {
            this.onUpdate(data.node);
        });
    }

    onUpdate(node) {
        var data = node.data();

        let textIf = (what, title) => (what)? `<b>${title}:</b> ${what}` : '';

        try {
            let id = textIf(node.id(), 'ID');
            let oid = textIf(data.oid, 'OID');
            let meta = (data.is_instance && data.meta)? '<b>Meta:</b> ' + Object.keys(data.meta).filter(k => data.meta[k]).map(k => `${k}: ${data.meta[k]}`).join(', ')  : '';

            var html;
            if(data.is_instance) {
                html = '<b>Instance</b> '+ id +' '+ textIf(data.display, 'Label') +' '+ textIf(data.cls, 'Class') +' '+ oid +' '+ meta
                ;
            } else if(data.is_schema) {
                html = '<b>Class</b> ' + id + ' ' + textIf(data.name, 'Name') + ' ' + textIf(data.class_kind, 'Kind') + ' ' + oid;
            } else {
                // not instance and not schema? shouldn't happen
            }

            $( this.getContainer() ).html(html);
        } catch (err) {
            $( this.getContainer() ).text('Error: ' + err.message);
        }
    }

}

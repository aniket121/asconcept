import cytoscape from "cytoscape";
import { GraphService } from './GraphService';

export const tools = {
    // info about an Instance
    iinfo: function(inst) {
        return inst;
    },
    el_classes: function(eles) {
        return eles.map((x) => x._private.classes.toArray());
    }
};


import $ from 'jquery';
import { View } from './View';
import { Action, ActionTypes } from './Action';
import { UPLOAD_URL_BASE } from './config';
import './App.less';
//import  VisibilityService from './VisibilityService';

class PlaybookRule {
    constructor(ruleNode,visibilityService) {
        this.ruleNode = ruleNode;
        this.visibilityService = visibilityService;
        this.chosenAnswer = null;

    }

    getName() {
        return this.ruleNode.data().props.name;
    }

    getQuestion() {
        return this.ruleNode.data().props.questiontext;
    }

    getAction() {
        return this.ruleNode.data().props.actiontext;
    }

    hasAnswers() {
        return (this.getAnswers().length > 0);
    }

    getAnswers() {
        let answers = this.ruleNode.outgoers('edge[cls="IsAnswerFor"]').map( (edge) => edge.data().props.value ).sort();
        if(answers.length === 2 && answers[1].toLowerCase() === 'yes' && answers[0].toLowerCase() === 'no') {
            // if it's just yes/no, place yes first, because no/yes just feels wrong
            answers.reverse();
        }
        var set=new set(answers)
        var arr=new Array.from(set)
        return arr;
    }

    getAttachments() {
        let attachments = this.ruleNode.outgoers('edge[cls="HasAttachment"]').map( (edge) => edge.target() );
        return attachments;
    }

    getChosen() {
        return this.chosenAnswer;
       

    }

    choose(answer) {
        //alert(answer)
        console.log("answers",this.getAnswers())
        if($.inArray(answer, this.getAnswers()) !== -1) {
            this.chosenAnswer = answer;
            //alert(chosenAnswer)
            return new PlaybookRule( this._getNodeForAnswer(answer) );
        } else {
            console.error('PlaybookRule.choose(', answer, ')', 'No such answer!');
        }

    }

    _getNodeForAnswer(answer) {
        //alert(this.chosenAnswer)
        return this.ruleNode.outgoers('edge[cls="IsAnswerFor"]')
            .filter( (edge) => edge.data().props.value === answer )
            .map( (edge) => edge.target() )[0];
    }
}

export class PlaybookView extends View {
    constructor(container, graphService,visibilityService) {
        super(container);

        this.graphService = graphService;
         this.visibilityService = visibilityService;
        this.state = {
            currentRule: null,
            ruleHistory: [],
            playbookNode: null
        };

        
        // Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
        //     if(data.nodes.length === 1) {
        //         let n = graphService.instance.$id(data.nodes[0]);
        //         if(n.data().cls === 'Playbook') {
        //             Action.trigger(ActionTypes.SELECT_PLAYBOOK, { node: n.id() });
        //         }
        //     }
        // });
        

        Action.on(ActionTypes.SELECT_PLAYBOOK, (e, data) => {
            let n = graphService.instance.$id(data.node);
            if (this.isPlaybookOpen()) {
                this.closePlaybook();
            }

            this.showPlaybook(n);

        });

        Action.on(ActionTypes.PLAYBOOK_CLOSE, (e) => {
            this.closePlaybook();
        });
    }

    pushRule(rule) {
        //console.log("current rule===>",this.state.currentRule.ruleNode.outgoers('edge[[props][value]="yes"]]'))
        
        let expandRule = this.state.currentRule.ruleNode.outgoers('edge[cls="IsAnswerFor"]').filter( (edge) => edge.data().props.value ===this.state.currentRule.chosenAnswer).map( (edge) => edge.target() )[0];
        
        this.state.currentRule = new PlaybookRule(expandRule);
        this.state.ruleHistory.push(this.state.currentRule);
        this.visibilityService.toggleIncludeManualNodeId(this.state.currentRule.ruleNode[0].id())
        console.log("========this.state.ruleHistory====",this.state.ruleHistory)
        this.setCurrentRule(this.state.currentRule);
        
    }

    popRule(n) {
        if(n && n > 0) {
            while(n-- > 1) {

                this.state.ruleHistory.pop();
            }
        }

        console.log("before hsitory===",this.state.ruleHistory)
       
        //this.state.ruleHistory.pop()
        //this.setCurrentRule(this.state.ruleHistory[this.state.ruleHistory.length-1]);
    
        console.log("arrya lenght",this.state.ruleHistory.length)
         this.visibilityService.toggleIncludeManualNodeId(this.state.ruleHistory.pop().ruleNode.id())
        this.setCurrentRule(this.state.ruleHistory[this.state.ruleHistory.length-1])
        console.log("before hsitory===",this.state.ruleHistory)
        console.log("=====================popup rule====",this.state.currentRule)
       
        //console.log("last element",this.state.ruleHistory.slice(-1)[0]);
        //console.log("pop ==============element",this.state.ruleHistory)
        //this.visibilityService.onlyExpandedNodeId(this.state.playbookNode.id())
        //this.visibilityService.toggleExpandedNodeId(this.state.currentRule.ruleNode.id())
    }

    isPlaybookOpen() {
        return this.state.playbookNode != null;
    }

    closePlaybook() {
        console.log('closing playbook');
        this.state.playbookNode = null;
    }

    setCurrentRule(rule) {
        console.log("=================settingup ,",rule)
        this.state.currentRule = rule;
        this.reRender();
    }

     showPlaybook(playbookNode) {
        console.log('===============???=========',playbookNode)
        let firstRule = playbookNode.outgoers('node[cls="PlaybookRule"]');
        //let firstRule = playbookNode.incomers('node[cls="PlaybookRule"]');
        if (firstRule.length == 0) {
            console.log('no rules found for playbook', playbookNode);
            return;
        }
        
        console.log('showPlaybook', 'playbookNode=', playbookNode, 'firstRule=', firstRule);

        this.state.currentRule = new PlaybookRule(firstRule);
        this.state.ruleHistory=[]
        this.state.playbookNode = playbookNode;
        this.state.ruleHistory.push(this.state.currentRule) //line1
        
        this.reRender();
    }

    canBack() {
        //alert("can back")
        return (this.state.ruleHistory.length > 0);
        //this.visibilityService.resetExpandedNodes(this.state.currentRule.ruleNode.id())

    }

    back(n) {
        //alert("back")
        if(this.canBack()) {
            this.popRule(n);

        }
        this.reRender();
        
    }

    restart() {
        this.showPlaybook( this.state.playbookNode );
        this.visibilityService.resetIncludeManual(this.state.playbookNode.id())

    }

    choose(answer) {
        this.pushRule(this.state.currentRule.choose(answer) );
         //alert("select answers"+answer)
       
         //this.reRender();

         //this.visibilityService.onlyExpandedNodeId(this.state.currentRule.ruleNode.id()) 
    }

    render() {
        alert('render')
        if(this.state.currentRule !== null && this.state.playbookNode !== null) {
            let container = $('<div class="playbook-qa-container">');
            container.append( this.renderButtons() );
            container.append( this.renderBreadcrumbs() );
            container.append( this.renderCurrentRule(this.state.currentRule) );
            console.log("===========this.state.currentRule=================",this.state.currentRule)
            this.state.ruleHistory.slice().reverse().forEach((rule, idx) => {
                   if(rule.getName()!=this.state.currentRule.ruleNode.data().props.name)//lin 2
                    container.append( this.renderChosenRule(rule) );
              
                
            });

            return container;

        } else {
            return $('<div class="alert alert-info">')
                .append('<strong>Cannot display Playbook:</strong> No Playbook opened, or the opened Playbook has no PlaybookRules.')
                .append(this.renderCloseButton());
        }
    }

    renderCloseButton() {
        let closeBtn = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>').click((e) => {
            Action.trigger(ActionTypes.PLAYBOOK_CLOSE, {});
        });
        return closeBtn;
    }

    renderButtons() {
        let backBtn = $('<button class="btn btn-ms-red" type="button">Go Back</button>').click((e) => {
            this.back();
        });

        if(!this.canBack()) {
            backBtn.attr('disabled', 'disabled');
        }

        let restartBtn = $('<button class="btn btn-ms-red" type="button">Start Again</button>').click((e) => {
            this.restart();
        });


        return (
            $('<div class="row">').append(
                $('<div class="col-xs-12">').append([
                    $('<div class="btn-group" role="group">').append(backBtn, restartBtn),
                    $('<div class="pull-right">').append(this.renderCloseButton())
                ])
            )
        );
    }

    renderBreadcrumbs() {
        let playbookItem = $('<li><a href="#">Playbook ' + this.state.playbookNode.data().props.name + '</a></li>').click((ev) => {
            this.restart();
        });
        console.log("renderBreadcrumbs==========",this.state.ruleHistory)

        //let path = this.state.ruleHistory.concat([this.state.currentRule]);
        let path = this.state.ruleHistory //lin4
        let listItems = [playbookItem].concat(path.map(
            (rule, idx) => $('<li><a href="#">'+rule.getName()+'</a></li>').click((e) => {
                let numBack = path.length - idx - 1;
                if(numBack > 0) {
                    this.back(numBack);
                }
            })
        ));

        return (
            $('<div class="row">').append(
                $('<div class="col-xs-12">').append([
                    $('<ol class="breadcrumb">').append(
                        listItems
                    )
                ])
            )
        );
    }

    renderCurrentRule(rule) {
        return (
            $('<div class="row">').append(
                $('<div class="col-xs-12">').append(
                    // https://getbootstrap.com/docs/3.3/components/#panels
                    $('<div class="panel panel-default">').append(
                        $('<div class="panel-heading">').append(
                            $('<h3 class="panel-title">').text(rule.getName())
                        ),
                        $('<div class="panel-body">').append(
                            this.renderQuestionAction(rule.getQuestion(), rule.getAction()),
                            this.renderAnswersChoice(rule.getAnswers()),
                            this.renderAttachments(rule.getAttachments())
                        )
                    )
                )
            )
        );
    }

    renderChosenRule(rule) {
        return (
            $('<div class="row">').append(
                $('<div class="col-xs-12">').append(
                    // https://getbootstrap.com/docs/3.3/components/#panels
                    $('<div class="panel panel-default">').append(
                        $('<div class="panel-heading">').append(
                            $('<h3 class="panel-title">').text(rule.getName())
                        ),
                        $('<div class="panel-body">').append(
                            this.renderQuestionAction(rule.getQuestion(), rule.getAction()),
                            this.renderAnswersChosen(rule.getAnswers(), rule.getChosen())
                        )
                    )
                )
            )
        );

    }
    selectAttachmentNode(node) {
        console.log('going to select ', node, node.id());
        Action.triggerElement(this.getContainer(), ActionTypes.SELECT_INSTANCES, {
            "nodes": [ node.id() ]
        });
    }
     getFileContent(fileName){
       console.log("=========",fileName)
   var path={path: fileName.split("/")[1]};
   $.ajax({
        url: "http://localhost:8002/FileContent",
        type: "POST",
        data: JSON.stringify(path),
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        success: function(data) {
            
            //$("#editor1").css("display":"block");
            //CKEDITOR.replace('editor1')

            if (CKEDITOR.instances.editor1)
               {
                 CKEDITOR.instances.editor1.destroy();
                 CKEDITOR.replace("editor1");
                }
            else{
                CKEDITOR.replace("editor1");
            }
            CKEDITOR.instances['editor1'].setData(data.FileContent);
        
        },
        error: function(msg) {
            //alert('error')
           console.log("error occured");
           //$("#editor1").css("display":"none");
            CKEDITOR.instances.editor1.destroy();
            //$("#editor1").css("display":"none");
            
        }
       });
    }
    renderAttachmentItem(item) {
        let itemProps = item.data().props;
        let selectBtn = $('<a>').addClass('pull-right glyphicon glyphicon-hand-up').css('padding-left', '1em').attr('href', '#').on('click', (e) => { e.preventDefault(); console.log('clicked ', e); this.selectAttachmentNode(item); });
        selectBtn = selectBtn.data({toggle: "tooltip", placement: "bottom", title:"Show attachment node in graph"}).tooltip({trigger: 'hover'});
       let previewBtn = $('<a>').addClass('pull-right glyphicon glyphicon-eye-open').css('padding-left', '1em').attr('href', '#').text('').on('click', (e) => { this.getFileContent(itemProps.attachment); console.log('clicked ', e);});
       previewBtn =previewBtn.data({toggle: "tooltip", placement: "bottom", title:"Preview attached Document"}).tooltip({trigger: 'hover'});
        let downloadBtn;
        if (itemProps.attachment && itemProps.attachment !== '') {
            downloadBtn = $('<a target="_blank">').addClass('pull-right glyphicon glyphicon-download').css('padding-left', '1em').text('');
            if(itemProps.attachment.split("/")[1]==""){ 
            downloadBtn = downloadBtn.attr('href', itemProps.attachment);}
            else{
              downloadBtn = downloadBtn.attr('href',"http://localhost:8002/"+itemProps.attachment);

             // .on('click', (e) => { window.open( UPLOAD_URL_BASE + '/' + $(e.currentTarget).data('href'), '_blank');  });
            }
            downloadBtn = downloadBtn.data({toggle: "tooltip", placement: "bottom", title:"Download attached file"}).tooltip({trigger: 'hover'});
        } else {
            downloadBtn = $('<span>').addClass('glyphicon glyphicon-download').css('padding-left', '1em').text('download');
        }

        return $('<li>').addClass('list-group-item').append($('<span class="glyphicon glyphicon-paperclip" aria-hidden="true">'), ' ', itemProps.name, selectBtn, downloadBtn,previewBtn);
    }
    renderAttachments(attachments) {
        let container = $('<div>');

        if(attachments && attachments.length) {
            //            let attachLinks = attachments.map((att) => $('<a>').attr('href', att.data().props.file).text(att.data().props.name));
            let attachItems = attachments.map( (at) => this.renderAttachmentItem(at) );
            let attachList = $('<ul>').addClass('list-group').append(attachItems);
            // TODO: better rendering of items (with 'download' and 'select in graph' links conditional on having a valid document, etc.
            container.append(
                $('<div class="alert alert-info">').append(
                    $('<strong>Attachments: </strong>'),
                    attachList
                )
            );
        }
        return container;
    }
    renderQuestionAction(question, action) {
        let container = $('<div>');

        if(action) {
            container.append(
                $('<div class="alert alert-pb-action">').append(
                    $('<strong>Action: </strong>'),
                    $('<span>').text(action)
                )
            );
        }

        if(question) {
            container.append(
                $('<div class="alert alert-pb-question">').append(
                    $('<strong>Question: </strong>'),
                    $('<span>').text(question)
                )
            );
        }

        return container;
    }

    renderAnswersChoice(answers) {
            return $('<div>').addClass('list-group').append(
                    answers.length ? answers.map(
                        (answer) => $('<a href="#">').addClass('list-group-item').text(answer).click((ev) => {
                            ev.preventDefault();
                            this.choose(answer);
                        })
                    ) : []
            );

    }

    renderAnswersChosen(answers, chosen) {
            return $('<div>').addClass('list-group').append(
                answers.map( (answer) => {
                    let item = $('<a href="#">').addClass('list-group-item').text(answer);
                    if(answer === chosen) {
                        item.addClass('active');
                    } /*else {*/
                    item.addClass('disabled');
                    return item;
                })
            );

    }

    onDisplay() {
        this.reRender();
    }
}

import $ from 'jquery';
import { View } from './View';
import { Action, ActionTypes } from './Action';
import { UPLOAD_URL_BASE } from './config';
import './App.less';

class PlaybookRule {
    constructor(ruleNode) {
        this.ruleNode = ruleNode;
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
        return answers;
    }

    getAttachments() {
        let attachments = this.ruleNode.outgoers('edge[cls="HasAttachment"]').map( (edge) => edge.target() );
        return attachments;
    }

    getChosen() {
        return this.chosenAnswer;
    }

    choose(answer) {
        if($.inArray(answer, this.getAnswers()) !== -1) {
            this.chosenAnswer = answer;
            return new PlaybookRule( this._getNodeForAnswer(answer) );
        } else {
            console.error('PlaybookRule.choose(', answer, ')', 'No such answer!');
        }
    }

    _getNodeForAnswer(answer) {
        return this.ruleNode.outgoers('edge[cls="IsAnswerFor"]')
            .filter( (edge) => edge.data().props.value === answer )
            .map( (edge) => edge.target() )[0];
    }
}

export class PlaybookView extends View {
    constructor(container, graphService) {
        super(container);

        this.graphService = graphService;

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
        this.state.ruleHistory.push(this.state.currentRule);
        this.setCurrentRule(rule);
    }

    popRule(n) {
        if(n && n > 0) {
            while(n-- > 1) {
                this.state.ruleHistory.pop();
            }
        }
        this.setCurrentRule(this.state.ruleHistory.pop());
    }

    isPlaybookOpen() {
        return this.state.playbookNode != null;
    }

    closePlaybook() {
        console.log('closing playbook');
        this.state.playbookNode = null;
    }

    setCurrentRule(rule) {
        this.state.currentRule = rule;
        this.reRender();
    }

    showPlaybook(playbookNode) {
        let firstRule = playbookNode.outgoers('node[cls="PlaybookRule"]');
        //let firstRule = playbookNode.incomers('node[cls="PlaybookRule"]');
        if (firstRule.length == 0) {
            console.log('no rules found for playbook', playbookNode);
            return;
        }

        console.log('showPlaybook', 'playbookNode=', playbookNode, 'firstRule=', firstRule);

        this.state.currentRule = new PlaybookRule(firstRule);
        this.state.ruleHistory = [];
        this.state.playbookNode = playbookNode;
        this.reRender();
    }

    canBack() {
        return (this.state.ruleHistory.length > 0);
    }

    back(n) {
        if(this.canBack()) {
            this.popRule(n);
        }
    }

    restart() {
        this.showPlaybook( this.state.playbookNode );
    }

    choose(answer) {
        this.pushRule( this.state.currentRule.choose(answer) );
    }

    render() {
        if(this.state.currentRule !== null && this.state.playbookNode !== null) {
            let container = $('<div class="playbook-qa-container">');
            container.append( this.renderButtons() );
            container.append( this.renderBreadcrumbs() );
            container.append( this.renderCurrentRule(this.state.currentRule) );

            this.state.ruleHistory.slice().reverse().forEach((rule, idx) => {
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

        let path = this.state.ruleHistory.concat([this.state.currentRule]);

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

    renderAttachmentItem(item) {
        let itemProps = item.data().props;
        let selectBtn = $('<a>').addClass('pull-right').css('padding-left', '2em').attr('href', '#').text('select').on('click', (e) => { e.preventDefault(); console.log('clicked ', e); this.selectAttachmentNode(item); });
        selectBtn = selectBtn.data({toggle: "tooltip", placement: "bottom", title:"Show attachment node in graph"}).tooltip({trigger: 'hover'});

        let downloadBtn;
        if (itemProps.attachment && itemProps.attachment !== '') {
            downloadBtn = $('<a target="_blank">').addClass('pull-right').css('padding-left', '2em').text('download');
            downloadBtn = downloadBtn.attr('href', itemProps.attachment); // .on('click', (e) => { window.open( UPLOAD_URL_BASE + '/' + $(e.currentTarget).data('href'), '_blank');  });
            downloadBtn = downloadBtn.data({toggle: "tooltip", placement: "bottom", title:"Download attached file"}).tooltip({trigger: 'hover'});
        } else {
            downloadBtn = $('<span>').addClass('pull-right').css('padding-left', '2em').text('download');
        }

        return $('<li>').addClass('list-group-item').append($('<span class="glyphicon glyphicon-paperclip" aria-hidden="true">'), ' ', itemProps.name, selectBtn, downloadBtn);
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

import logging
LOG = logging.getLogger(__name__)

from knowledge import schema, graph
from knowledge.schema import Class, RelationClass, Instance, Topic, Action, Obligation, Actor, Document, Agreement, Term

_topics = {}
_roles = {}
_actions = {}
_actors = {}
_obligations = {}

def get_topic(tname):
    return _topics[tname]
#return next(t for t in _topics if t.name == tname)

# ================================================================
# UUIDs generated with:
#  perl -MUUID::Tiny=create_UUID_as_string -i.bak
#    -pe's/f75ab58f-d592-418e-9a23-15b0864a881d/create_UUID_as_string(UUID::Tiny::UUID_V4)/eg;' fixture.py
# ================================================================

def recreate_constraints(ns_suffix=''):
    LOG.debug('recreate_constraints()')
    cons = graph.get_constraints()
    LOG.debug('constraints={!r}'.format(cons))
    for c in cons:
        drop_query = 'DROP %s' % c
        ret = graph.query(drop_query)
        cons2 = graph.get_constraints()
        graph.add_unique_constraint('Thing%s' % ns_suffix, '_oid')
        graph.add_unique_constraint('Class', 'name')
        graph.add_unique_constraint('RelationClass', 'name')

    cons3 = graph.get_constraints()

    new_cons = list(set(cons3) - set(cons))
    if len(new_cons):
        LOG.debug("New constraints: {!r}".format(new_cons))

def destroy_and_refixture():
    LOG.debug('destroy_and_refixture()')
    #graph.db_handle().delete_all()

    recreate_constraints()

    LOG.debug(graph.query('match (n) return count(distinct n)'))
    create_classes()
    create_relationships()
    # LOG.debug('classes#={!r}'.format(graph.query('match (c:Class) return count(distinct c)')))
    # LOG.debug('relationclasses#={!r}'.format(graph.query('match (rc:RelationClass) return count(distinct rc)')))
    graph.dump_info()
    graph.schema_check()

def build_field_defs(_name=True, _desc=True, _literal=False, **kwargs):
    name = {'label': 'Name', 'type': 'str', 'required': True, 'unique': True}
    desc = {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False}
    literal = {'label': 'Literal Text', 'type': 'str-long', 'required': False, 'unique': False}
    ret = {}
    if _name:
        ret.update({'name': name})
    if _desc:
        ret.update({'desc': desc})
    if _literal:
        ret.update({'literal': literal})
    ret.update(kwargs)
    return ret

def create_classes():
    """
    LOG.debug('create_classes()')
    anycls = Class(_oid='6b1c3ee8-078b-4eef-92cb-c951a72558ee',
                   name='Any', desc='Super-class of everything', scope=[], supercls=None)
    anycls.create(_global=True)

    rolecls = Class(_oid='a6e6a288-4f77-44c0-8120-349e92054a30',
                    name='Role', scope=['admin'], supercls='Any', colour='#ff0000',
                    fields=build_field_defs(_name=True, _desc=True),
                    desc='Denotes a conceptual role an :Actor can perform within an :Agreement.')
    rolecls.create(_global=True)

    firstptyrolecls = Class(_oid='1da43fbf-43a5-496f-bf57-9c88a3f35420',
                            name='FirstPartyRole', scope=['admin'],
                            supercls='Role', colour="#f68100",
                            desc=':Actor who is a direct party to an :Agreement.',
                            keywords=['role', 'party', 'first', 'firstparty'])
    firstptyrolecls.create(_global=True)

    thirdptyrolecls = Class(_oid='140e9b5f-8bd0-4d24-bc59-beb0b719328d',
                            name='ThirdPartyRole', scope=['admin'],
                            supercls='Role', colour="#eabe34",
                            desc=':Actor who is indirectly involved in an :Agreement')
    thirdptyrolecls.create(_global=True)

    actorcls = Class(_oid='80566019-ce2e-418f-8a23-0bc5287510a6',
                     name='Actor', scope=['editor', 'admin'],
                     supercls='Any', colour="#336600",
                     desc='Represents an individual, business, or other Legal Entity.',
                     fields={
                         'email': {'label': 'Email', 'type': 'email', 'required': False, 'unique': True},
                         'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True}
                     })

    actorcls.create(_global=True)

    actioncls = Class(_oid='101a813a-7508-4b7e-970e-6e98cc83330c',
                      name='Action', scope=['admin'], supercls='Any',
                      desc='The required or prohibited actions dictated to a :Role by a :Term::Obligation.',
                      fields={
                          'text': {'label': 'Content', 'type': 'str-long', 'required': True, 'unique': False},
                          'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                      })
    actioncls.create(_global=True)

    termcls = Class(_oid='91ad97cb-38bc-4073-a82b-13a16beccd41',
                    name='Term', scope=['admin'], supercls='Any',
                    desc='A generic clause or provision within an :Agreement',
                    colour='#55b8ea',
                    fields=build_field_defs(_name=True, _desc=True, _literal=True, attachment={'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True}))
    termcls.create(_global=True)

    oblcls = Class(_oid='03be611c-451f-46f0-a156-dd1b762e19ec',
                   name='Obligation', scope=['admin'],
                   supercls='Term', colour="#663300",
                   desc='A kind of :Term which confers an obligation to a :Role',
                   fields={
                       'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                       'attachment': {'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True},
                   })
    oblcls.create(_global=True)

    condcls = Class(_oid='27f7b8db-01e2-40f1-ab1b-4729373f283a',
                    name='ConditionalTerm', scope=['admin'],
                    supercls='Term', colour="#663300",
                    desc='A kind of :Term which confers a general condition on some or all of an :Agreement.',
                    fields={
                        'text': {'label': 'Condition', 'type': 'str-long',
                                 'required': False, 'unique': False},
                        'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True },
                        'attachment': {'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True},
                    })

    condcls.create(_global=True)

    condpreccls = Class(_oid='67685543-94df-4d4f-955a-eb39cfdc0dc5', name='ConditionPrecedent', scope=['admin'], supercls='ConditionalTerm',
                        colour="#e88619", desc='A kind of :Term which defines the conditions under which other :Terms come into force within an :Agreement.')
    condpreccls.create(_global=True)

    condsubscls = Class(_oid='5aac3ab5-e204-49c4-b18b-e609a4495269', name='ConditionSubsequent', scope=['admin'],
                        supercls='ConditionalTerm', colour="#4f19e8",
                        desc='A kind of :Term which defines the conditions under which other :Terms within an :Agreement are lapsed.')
    condsubscls.create(_global=True)

    bindingcls = Class(_oid='476bae65-91c9-4fe4-8c13-d83b3015ddec', name="Binding", scope=['editor', 'admin'], supercls='Any', desc='An explicit or implicit connection of an :Actor, an :Agreement, and the :Role which they undertake')
    bindingcls.create(_global=True)
    doccls = Class(_oid='68ad0552-370c-40a5-9367-3a5d3691b5bf', name="Document", scope=['admin', 'editor'],
                   supercls='Any', colour="#990099",
                   desc='Represents a single tangible document.',
                   fields={
                       'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                       'desc': {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False},
                       'attachment': {'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True},
                   })

    doccls.create(_global=True)

    assestcls = Class(_oid='68ad0552-370c-40a5-9357-3a5d3691b5cd', name="Asset", scope=['admin', 'editor'],
                   supercls='Any', colour="#990099",
                   desc='Represents a asset.',
                   fields={
                       'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                       'desc': {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False},
                       'attachment': {'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True},
                   })

    assestcls.create(_global=True)


   


    absagreecls = Class(_oid='cf95b5d1-e380-47fc-ad08-34bfe19443c9',
                        name="Agreement", supercls='Document', colour="#00F",
                        desc='A kind of :Document describing a legal agreement as a collection of :Terms')
    absagreecls.create(_global=True)
    ndacls = Class(_oid='298b6584-8fc7-40c2-a334-5118593911ff',
                   name="NDA", supercls='Agreement', colour='#009999',
                   desc='A Non-Disclosure :Agreement')
    ndacls.create(_global=True)
    salescls = Class(_oid='d887013d-2dae-4b2e-ace2-9a54ad4d1575',
                     name="SalesContract", supercls='Agreement',
                     desc='A contract relating to a sale or purchase', colour='#c5c30e')
    salescls.create(_global=True)
    guidancecls = Class(_oid='fb4600cf-6318-453c-a13a-05534c5a0ab3',
                        name="Guidance", supercls='Document', colour="#00F",
                        desc='A document describing a workflow for a specific task, comprising a collection of :Rules')
    guidancecls.create(_global=True)
    infopackcls = Class(_oid='7f485a50-2e85-43d0-bfe8-4890532e715d',
                        name="InfoPack", supercls='Document', colour="#00F",
                        desc='A document providing informational material on one or more :Topics')
    infopackcls.create(_global=True)
    playbookcls = Class(_oid='3b32ec77-ea30-47ac-b7b6-61e8671b2cac',
                        name="Playbook", supercls='Document', colour='#00d',
                        desc='A document providing a workflow to answer a specific question')
    playbookcls.create(_global=True)

    topiccls = Class(_oid='bae83b3d-9060-4d1d-a6d3-89a9eb36dbbb',
                     name="Topic", scope=['admin', 'editor'],
                     supercls='Any', colour="#00FF00",
                     desc='A heading or category for grouping related concepts and classes.',
                     fields={
                         'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                         'desc': {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False},
                         'keywords': {'label': 'Keywords', 'type': 'token', 'required': False, 'unique': False},
                     })
    topiccls.create(_global=True)
    playrulecls = Class(_oid='3cd6d7c3-1979-40e1-86a0-4b2cca316282', name='PlaybookRule', scope=['admin'],
                        supercls='Any', colour='#12cc34',
                        desc='A clarifying question or statement of action belonging to a Playbook workflow.',

                        fields={
                            'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                            'desc': {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False},
                            'questiontext': {'label': 'Question', 'type': 'str-long', 'required': False, 'unique': False},
                            'actiontext': {'label': 'Action', 'type': 'str-long', 'required': False, 'unique': False},
                        })
    playrulecls.create(_global=True)
    
    testcls = Class(_oid='68ad0571-370c-40a5-9357-3a5d5691b5cd', name="testing", scope=['admin', 'editor'],
                   supercls='Any', colour="#990099",
                   desc='Represent.',
                   fields={
                       'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                       'desc': {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False},
                       'attachment': {'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True},
                   })

    testcls.create(_global=True)
    assestcls = Class(_oid='68ad0552-370c-40a5-9357-3a5d3691b5cd', name="Asset", scope=['admin', 'editor'],
                   supercls='Any', colour="#990099",
                   desc='Represents a asset.',
                   fields={
                       'name': {'label': 'Name', 'type': 'str', 'required': True, 'unique': True},
                       'desc': {'label': 'Description', 'type': 'str-long', 'required': False, 'unique': False},
                       'attachment': {'label': 'Attachment', 'type': 'file', 'required': False, 'unique': True},
                   })

    assestcls.create(_global=True)
    """
    


def create_relationships():
    LOG.debug('create_relationships()')
    relatedtorel = RelationClass(_oid='f63adbe9-5624-40e3-ab71-f0051d9a4b12', name='RelatedTo', supercls=None, domain='Any', range='Any', desc='The Top superclass for all relationships', scope=[])
    relatedtorel.create(_global=True)
    subtopicofrel = RelationClass(_oid='c60d3986-beea-4048-9fb4-92b36aa4e1e3', name='HasSubTopic', scope=['admin'],
                                  desc='Indicates a child :Topic of the given :Topic',
                                  range='Topic', domain='Topic', supercls='RelatedTo')
    subtopicofrel.create(_global=True)


    hastopicrel = RelationClass(_oid='b5e8d580-ea57-44d4-aa11-6a4d46ec370e', name='HasTopic', scope=['admin', 'editor'],
                                desc='Denotes that the linked item relates to the given :Topic',
                                range='Topic', domain='Any', supercls='RelatedTo')
    hastopicrel.create(_global=True)

    objectrel = RelationClass(_oid='19b9a973-cbf5-49b9-9abb-456b8bf687b5', name='ObjectOf', scope=['admin', 'editor'],
                              desc='Relates an :Obligation to the :Action it requires.',
                              range='Action', domain='Term', supercls='RelatedTo')
    objectrel.create(_global=True)


    IsSubjectTorel = RelationClass(_oid='19b9a973-cbf5-49b9-9abb-456b8bf667b5', name='IsSubjectTo', scope=['admin', 'editor'],
                              desc='IsSubjectTo.',
                              range='Term', domain='Asset', supercls='RelatedTo')
    IsSubjectTorel.create(_global=True)

    IsRelatedTorel = RelationClass(_oid='19c9b973-cbf5-49b9-9abb-456b8bf667b5', name='IsRelatedTo', scope=['admin', 'editor'],
                              desc='IsRelatedTo.',
                              range='Document', domain='Asset', supercls='RelatedTo')
    IsRelatedTorel.create(_global=True)

    IsHigherRiskrel = RelationClass(_oid='19c9b975-cb65-49b9-9abb-456b8bf607l5', name='IsHigherRisk', scope=['admin', 'editor'],
                              desc='IsHigherRisk.',
                              range='Document', domain='Asset', supercls='RelatedTo')
    IsHigherRiskrel.create(_global=True)
    
    BeneficiaryOfrel = RelationClass(_oid='19c9b975-cb05-49b9-9abb-456b8b9667b5', name='BeneficiaryOf', scope=['admin', 'editor'],
                              desc='IsRelatedTo.',
                              range='Actor', domain='Asset', supercls='RelatedTo')
    BeneficiaryOfrel.create(_global=True)


    subjectrel = RelationClass(_oid='306f6271-d828-4ecf-a2ba-21e481a18977', name='SubjectOf', scope=['admin', 'editor'],
                               desc='Relates an :Obligation to the :Role it is imposed upon.',
                               range='Role', domain='Term', supercls='RelatedTo')
    subjectrel.create(_global=True)

    bindsrolerel = RelationClass(_oid='70b53ee3-b73d-4a9a-9c4d-647c9719b249', name='BindsRole', scope=['admin', 'editor'],
                                 desc='Links a :Role to a :Binding',
                                 range='Role', domain='Binding', supercls='RelatedTo')
    bindsrolerel.create(_global=True)

    definedinrel = RelationClass(_oid='02cc1e2d-23c7-43a8-8290-36e7925b8c10', name='DefinedIn', scope=['admin', 'editor'],#TODO: revert this.
                                 desc='Links a :Binding to a specific :Agreement',
                                 range='Agreement', domain='Binding', supercls='RelatedTo')
    definedinrel.create(_global=True)

    boundtorel = RelationClass(_oid='0c0100ec-10c1-4790-ae7d-e1b859c78232', name='BoundTo', scope=['admin', 'editor'],
                               desc='Links an :Actor to a :Binding representing their participation in an :Agreement with a given :Role',
                               range='Actor', domain='Binding', supercls='RelatedTo')
    boundtorel.create(_global=True)

    hastermrel = RelationClass(_oid='d0e26d30-4acc-485c-bcfe-4e09b3c8d18b', name='HasTerm', scope=['admin', 'editor'],
                               desc='Denotes an :Agreement having a particular :Term',
                               range='Term', domain='Agreement', supercls='RelatedTo')
    hastermrel.create(_global=True)

    embodyrel = RelationClass(_oid='c034780b-253c-482c-913b-f88ea3259574', name='Embodies', scope=['admin', 'editor'],
                              desc='Links an :Agreement to a tangible :Document which embodies it physically.',
                              range='Agreement', domain='Document', supercls='RelatedTo')
    embodyrel.create(_global=True)

    moreonerousrel = RelationClass(_oid='fee46e22-e29d-4fac-a385-f2eb4614fffc', name='IsMoreOnerous', scope=['admin', 'editor'],
                                   desc='Indicates that the target :Obligation is more onerous than the originating :Obligation.',
                                   range='Term', domain='Term', supercls='RelatedTo')
    moreonerousrel.create(_global=True)

    morebeneficialrel = RelationClass(_oid='05bc49c2-e2d7-4a55-9a4b-d9bf4dd43c1f', name='IsMoreBeneficial', scope=['admin', 'editor'],
                                      desc='Indicates that the target :Obligation is more beneficial than the originating :Obligation.',
                                      range='Term', domain='Term', supercls='RelatedTo')
    morebeneficialrel.create(_global=True)

    conditionalonrel = RelationClass(_oid='5b448119-e2fc-4e8c-8433-c6d2722aa169', name='ConditionalOn', scope=[],
                                     desc='Indicates that the target :Term is conditional on the originating :Term holding true.',
                                     range='ConditionalTerm', domain='Term', supercls='RelatedTo')
    conditionalonrel.create(_global=True)
    # TODO: flip direction of htis.
    conditionalprecrel = RelationClass(_oid='8d74e3d3-c075-4b59-9122-a856a2c6178f', name='ConditionalPrecedentOn',
                                       scope=['admin', 'editor'], supercls='ConditionalOn',
                                       desc='Indicates that the target :Term is conditional precedent on the originating :Term.', range='ConditionPrecedent', domain='Term')
    conditionalprecrel.create(_global=True)

    conditionalsubsrel = RelationClass(_oid='dff96751-8a32-44e7-853c-8ecd984fe05e', name='ConditionalSubsequentOn',
                                       scope=['admin', 'editor'], supercls='ConditionalOn',
                                       desc='Indicates that the target :Term is conditional subsequent on the originating :Term.', range='ConditionSubsequent', domain='Term')
    conditionalsubsrel.create(_global=True)

    pbhasrulerel = RelationClass(_oid='609e4c16-e529-49e1-9215-ce9c2e8931e0', name='HasPlaybookRule', supercls='RelatedTo', scope=['admin'], desc='Connects a :PlaybookRule to :Playbook', range='PlaybookRule', domain='Playbook')
    pbhasrulerel.create(_global=True)
    pbanswerforrel = RelationClass(_oid='6329ebdf-f48b-4c9d-8e30-0fb6b3cc38b1', name='IsAnswerFor', supercls='RelatedTo', scope=['admin'], desc='Indicates a valid answer for a question posed in a Rule, leading to followup questions or actions', range='PlaybookRule', domain='PlaybookRule', fields={'value': {'label': 'Value', 'type': 'str', 'required': True, 'unique': False}})
    # TODO: needs fieldspec here to specify/require a .value property
    pbanswerforrel.create(_global=True)

    pbattachmentrel = RelationClass(_oid='7545f6fe-64b4-4e35-b591-a308ebd48a54', name='HasAttachment', supercls='RelatedTo', scope=['admin'], desc='References a :Document or subclass from a :PlaybookRule', range='Document', domain='PlaybookRule')
    pbattachmentrel.create(_global=True)

def create_roles():
    LOG.debug('create_roles()')
    recparty = Instance(_oid='626b2d35-4115-44c1-aeb6-bd9e9fb118cb', class_name='FirstPartyRole', name='receivingParty', desc='A role in :NDAs representing the party receiving confidential information or materials')
    recparty.create()
    _roles['receivingParty'] = recparty
    discparty = Instance(_oid='d88dae59-a20a-468f-b861-6463da9016b4', class_name='FirstPartyRole', name='disclosingParty', desc='A role in :NDAs representing the party disclosing or providing information.')
    discparty.create()
    _roles['disclosingParty'] = discparty

    sellerparty = Instance(_oid='bc457374-74c5-4977-89e6-3f8f3cee812f', class_name='FirstPartyRole', name='sellingParty', desc='A role in :SaleContract representing the party offering goods or services for sale.')
    sellerparty.create()
    _roles['sellingParty'] = sellerparty
    buyerparty = Instance(_oid='4b8b9ed6-db41-4e6e-ae2f-87a3f9a230eb', class_name='FirstPartyRole', name='buyingParty', desc='A role in :SaleContract representing the party purchasing goods or services from the :sellingParty.')
    buyerparty.create()
    _roles['buyingParty'] = buyerparty

def create_topics():
    LOG.debug('create_topics()')
    alltopic = Topic(_oid="ee4c49bc-d1a6-4fa5-9298-12fe61860b69", name='All Topics')
    alltopic.create()
    _topics['All Topics'] = alltopic

    salestopic = Topic(_oid="c3bad80f-69cd-4019-9295-7b951ddef08b", name='Sales')
    salestopic.create()
    _topics['Sales'] = salestopic
    alltopic.add_subtopic(salestopic)

    nda_topic = Topic(_oid="9b45c629-2db7-454b-9476-33736548edf5", name='NDA')
    nda_topic.create()
    _topics['NDA'] = nda_topic
    alltopic.add_subtopic(nda_topic)

    disc_topic = Topic(_oid="1c31a974-fcd4-4fd4-83a2-de72b2eab66d", name='Disclosure')
    disc_topic.create()
    _topics['Disclosure'] = disc_topic
    nda_topic.add_subtopic(disc_topic)

    discsafe_topic = Topic(_oid="7bbf71ba-c46a-4639-b8de-ab564ae0a764", name='Disclosure Safeguards')
    discsafe_topic.create()
    _topics['Disclosure Safeguards'] = discsafe_topic
    disc_topic.add_subtopic(discsafe_topic)

    confunder_topic = Topic(_oid="d528c252-144d-4ee5-b4ef-1c78b13c9de7", name='Confidentiality Undertakings')
    confunder_topic.create()
    _topics['Confidentiality Undertakings'] = confunder_topic
    nda_topic.add_subtopic(confunder_topic)

def create_action(name, **action_props):
    action = Action(name=name, **action_props)
    action.create()
    _actions[name] = action
    return action

def create_actions():
    LOG.debug('create_actions()')
    a = create_action(_oid='5a30889a-0272-451b-828e-e63037a75d9e', name='Action1', text='Will not tell a thing')
    a2 = create_action(_oid='54e30bdd-755d-4def-afc4-c3b403018363', name='Action2', text='Will not lose the thing')
    a2.add_hastopic_rel(_topics['Disclosure Safeguards'])

    act3 = create_action(_oid='1ef969b7-d20d-4fa1-8125-6d4a6ea3d280', name='Action3',
                         text="Will make sure that someone doesn't disclose something")
    act3.add_hastopic_rel(_topics['Confidentiality Undertakings'])

    act4 = create_action(_oid='31787675-e705-4abc-bfc2-d280dd0be7aa', name='Action4', text='Will do some other thing')

    act5 = create_action(_oid='7710e9ba-43c1-4b94-9040-4e6ded358a94', name='SupplyGoods', text='Will supply the specified goods')

def create_terms():
    # ob1..ob4
    LOG.debug('create_terms()')
    obl1 = Obligation(_oid="98bd9ca0-257e-4c3e-8c82-ae881739c94b", role=_roles['receivingParty'], action=_actions['Action1'])
    obl1.create()
    _obligations['obl1'] = obl1

    obl2 = Obligation(_oid="e1191e1e-afb1-437b-a669-dcd58d1c43c1", role=_roles['disclosingParty'], action=_actions['Action1'])
    obl2.create()
    _obligations['obl2'] = obl2

    obl3 = Obligation(_oid="50534f2b-da65-420d-bc34-b5a83170ed68", role=_roles['disclosingParty'], action=_actions['Action2'])
    obl3.create()
    _obligations['obl3'] = obl3

    obl4 = Obligation(_oid="92e0d338-b391-44e7-a987-7df9c7422496", role=_roles['receivingParty'], action=_actions['Action3'])
    obl4.create()
    _obligations['obl4'] = obl4

    obl5 = Obligation(_oid="11126bff-85a9-4a19-b362-600bb490f74c", role=_roles['sellingParty'], action=_actions['SupplyGoods'])
    obl5.create()
    _obligations['obl5'] = obl5

    condp_paid = Term(_oid="e23608e3-6887-4298-ac20-4d3712216a51", class_name='ConditionPrecedent', text="When payment has been received")
    condp_paid.create(_global=True)


    condp_paid.add_relation(obl5, condp_paid, 'ConditionalPrecedentOn')
    _obligations['obl_condpaid'] = condp_paid

def create_parties():
    LOG.debug('create_parties()')
    p1 = Actor(_oid="856fddf2-a93b-4577-9672-a1bf449c2d40", name='Alpha')
    p1.create(_global=True)
    _actors['alpha'] = p1
    p2 = Actor(_oid="fee77426-e348-4610-b3e8-4c12eb99ef60", name='Beta')
    p2.create(_global=True)
    _actors['beta'] = p2
    p3 = Actor(_oid="df2ef0bc-b2c5-4146-b735-3838527eb5fd", name='Gamma')
    p3.create(_global=True)
    _actors['gamma'] = p3
    p4 = Actor(_oid="56a30751-585c-4ccb-8b83-1d72c721d64d", name='Delta')
    p4.create(_global=True)
    _actors['delta'] = p4

def create_documents():
    LOG.debug('create_documents()')
    nda1 = Agreement(_oid="4f806049-cb26-4a78-9860-102c6b669f6e", name='NDA1', desc='Between A/B', class_name='NDA')
    nda1.create(_global=True)
    nda1.add_hasterm_rel(_obligations['obl1'])
    nda1.add_hasterm_rel(_obligations['obl2'])
    nda1.add_binding(role=_roles['receivingParty'], actor=_actors['beta'])
    nda1.add_binding(role=_roles['disclosingParty'], actor=_actors['alpha'])

    nda3 = Agreement(_oid="36df5cca-e7f3-489e-868c-6e827113a776", name='NDA3',
                     desc='Between Beta/Gamma', class_name='NDA')
    nda3.create(_global=True)

    nda3.add_hasterm_rel(_obligations['obl1'])
    nda3.add_hasterm_rel(_obligations['obl2'])
    nda3.add_binding(role=_roles['receivingParty'], actor=_actors['beta'])
    nda3.add_binding(role=_roles['disclosingParty'], actor=_actors['gamma'])

    nda2 = Agreement(_oid="fd287b33-dc98-40cd-aa90-f68be1865b6c", name='NDA3',
                     desc='Between Delta/Gamma', class_name='NDA')
    nda2.create()
    nda2.add_hasterm_rel(_obligations['obl2'])
    nda2.add_hasterm_rel(_obligations['obl3'])
    nda2.add_hasterm_rel(_obligations['obl4'])
    nda2.add_binding(role=_roles['receivingParty'], actor=_actors['delta'])
    nda2.add_binding(role=_roles['disclosingParty'], actor=_actors['gamma'])

    sale1 = Agreement(_oid="5ed0d17f-0490-42af-8388-367e45115dcb", name='Sale1',
                      desc='sales agreement between Alpha/Gamma', class_name='SalesContract')
    sale1.create()
    sale1.add_hasterm_rel(_obligations['obl5'])
    sale1.add_hasterm_rel(_obligations['obl_condpaid'])
    sale1.add_binding(role=_roles['sellingParty'], actor=_actors['alpha'])
    sale1.add_binding(role=_roles['buyingParty'], actor=_actors['gamma'])

def create_demo_playbook():
    pb1 = Instance(_oid='7f9c9df2-ec8b-4c0c-8895-ccab79438f15', class_name='Playbook', name='DeliveryOfAdvice', desc='things relating to delivering advice.')
    pb1.create()
    doaq1 = Instance(_oid='748d625c-d06b-4b19-afc0-5838a331816c', class_name='PlaybookRule', name='qAnyAdditionalPoints', desc='', questiontext="Are there are any additional points of which the business ought to be aware in the current NDA?")
    doaq1.create()
    pb1.add_relation(pb1, doaq1, 'HasPlaybookRule')

    doaq1n = Instance(_oid='b0231b67-7df0-4e02-8f2b-532448cdfd41', class_name='PlaybookRule', name='noAnyAdditionalPoints', desc='', actiontext="state 'no additional points' in email to client")
    doaq1n.create()
    doaq1y = Instance(_oid='8909344b-9836-48cd-939f-f7c34d36601b', class_name='PlaybookRule', name='yesAnyAdditionalPoints', desc='', actiontext="email client with a summarised list of additional points to consider.")
    doaq1y.create()

    pb1.add_relation(doaq1, doaq1n, 'IsAnswerFor', {'value': 'no'})
    pb1.add_relation(doaq1, doaq1y, 'IsAnswerFor', {'value': 'yes'})

    sale1 = Agreement(_oid="86dc5f96-aa4c-457c-9594-9c8adf18a14f", name='Sale1',
                      desc='sales agreement between Alpha/Gamma', class_name='SalesContract')
    sale1.create()
    Instance.add_relation(doaq1y, sale1, 'HasAttachment', {})
    doc2 = Document(_oid="a3bf25b4-8f59-49fe-b385-c603547473f0", name='SomeDocument',
                    desc='some document referenced from a playbook rule')
    doc2.create()
    Instance.add_relation(doaq1y, doc2, 'HasAttachment', {})

def destroy_instances():
    graph.query("MATCH (x:Instance) DETACH DELETE x;")
    graph.query("MATCH (x:RelationInstance) DETACH DELETE x;")

def create_instances():
    LOG.debug('create_instances()')

    LOG.debug('create_instances() deleting existing global instances')
    graph.query("MATCH (x:Global:Instance) DETACH DELETE x;")
    graph.query("MATCH (x:Global:RelationInstance) DETACH DELETE x;")

    create_roles()
    create_topics()

    create_actions()
    create_terms()

    create_parties()
    create_documents()
    create_demo_playbook()

    graph.schema_check()

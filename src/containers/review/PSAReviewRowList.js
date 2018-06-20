/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Pagination } from 'react-bootstrap';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { CenteredContainer } from '../../utils/Layout';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';


type Props = {
  scoreSeq :Immutable.Seq,
  hideCaseHistory? :boolean,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    updateScoresAndRiskFactors :(values :{
      scoresEntitySetId :string,
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>,
      riskFactorsEntitySetId :string,
      riskFactorsId :string,
      riskFactorsEntity :Immutable.Map<*, *>,
      dmfEntitySetId :string,
      dmfId :string,
      dmfEntity :Object,
      dmfRiskFactorsEntitySetId :string,
      dmfRiskFactorsId :string,
      dmfRiskFactorsEntity :Object
    }) => void,
    changePSAStatus :(values :{
      scoresEntitySetId :string,
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>
    }) => void,
    updateNotes :(value :{
      notes :string,
      entityId :string,
      entitySetId :string,
      propertyTypes :Immutable.List<*>
    }) => void,
    checkPSAPermissions :() => void,
    submit :(value :{ config :Object, values :Object}) => void,
    clearForm :() => void,
  },
  psaNeighborsById :Immutable.Map<*, *>,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
  readOnlyPermissions :boolean
}

type State = {
  start :number
}

const MAX_RESULTS = 10;

class PSAReviewRowList extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      start: 0
    };
  }

  componentDidMount() {
    this.props.actions.checkPSAPermissions();
  }

  componentWillUnmount() {
    this.props.actions.clearForm();
  }

  updateNotes = (notes, entityId, entitySetId, propertyTypes) => {
    this.props.actions.updateNotes({
      notes,
      entityId,
      entitySetId,
      propertyTypes
    });
  }

  renderRow = (scoreId, scores) => {
    const neighbors = this.props.psaNeighborsById.get(scoreId, Immutable.Map());
    const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
    const caseHistory = this.props.caseHistory.get(personId, Immutable.List());
    const manualCaseHistory = this.props.manualCaseHistory.get(personId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personId, Immutable.Map());
    const manualChargeHistory = this.props.manualChargeHistory.get(personId, Immutable.Map());
    const sentenceHistory = this.props.sentenceHistory.get(personId, Immutable.Map());
    const ftaHistory = this.props.ftaHistory.get(personId, Immutable.Map());
    return (
      <PSAReviewRow
          neighbors={neighbors}
          scores={scores}
          entityKeyId={scoreId}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          updateScoresAndRiskFactors={this.props.actions.updateScoresAndRiskFactors}
          changePSAStatus={this.props.actions.changePSAStatus}
          updateNotes={this.updateNotes}
          submitData={this.props.actions.submit}
          caseHistory={caseHistory}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          sentenceHistory={sentenceHistory}
          ftaHistory={ftaHistory}
          readOnly={this.props.readOnlyPermissions}
          key={scoreId}
          hideCaseHistory={this.props.hideCaseHistory} />
    );
  }

  updatePage = (start) => {
    this.setState({ start });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  renderPagination = (numResults) => {
    const { start } = this.state;

    if (start + MAX_RESULTS >= numResults) return null;
    const numPages = Math.ceil(numResults / MAX_RESULTS);
    const currPage = (start / MAX_RESULTS) + 1;
    return (
      <CenteredContainer>
        <Pagination
            prev
            next
            ellipsis
            boundaryLinks
            items={numPages}
            maxButtons={5}
            activePage={currPage}
            onSelect={page => this.updatePage((page - 1) * MAX_RESULTS)} />
      </CenteredContainer>
    );
  }

  render() {
    const { scoreSeq } = this.props;
    const { start } = this.state;

    const items = scoreSeq.slice(start, start + MAX_RESULTS);
    const numItems = scoreSeq.length || scoreSeq.size;
    return (
      <div>
        {this.renderPagination(numItems)}
        {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
        {this.renderPagination(numItems)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    psaNeighborsById: review.get('psaNeighborsById'),
    caseHistory: review.get('caseHistory'),
    manualCaseHistory: review.get('manualCaseHistory'),
    chargeHistory: review.get('chargeHistory'),
    manualChargeHistory: review.get('manualChargeHistory'),
    sentenceHistory: review.get('sentenceHistory'),
    ftaHistory: review.get('ftaHistory'),
    readOnlyPermissions: review.get('readOnly')
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSAReviewRowList);

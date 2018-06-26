/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Pagination } from 'react-bootstrap';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import { CenteredContainer } from '../../utils/Layout';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';


type Props = {
  scoreSeq :Immutable.Seq,
  sort? :?string,
  hideCaseHistory? :boolean,
  hideProfile? :boolean,
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
  readOnlyPermissions :boolean,
  loadingPSAData :boolean
}

type State = {
  start :number
}

const MAX_RESULTS = 10;

class PSAReviewRowList extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false,
    hideProfile: false
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
          hideCaseHistory={this.props.hideCaseHistory}
          hideProfile={this.props.hideProfile} />
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

    if (numResults <= MAX_RESULTS) return null;
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

  sortItems = () => {
    const { sort, scoreSeq, psaNeighborsById } = this.props;
    if (!sort) return scoreSeq;
    const sortFn = sort === SORT_TYPES.DATE ? sortByDate : sortByName;
    return scoreSeq.sort(([id1], [id2]) => sortFn(
      [id1, psaNeighborsById.get(id1, Immutable.Map())], [id2, psaNeighborsById.get(id2, Immutable.Map())]
    ));
  }

  render() {
    const { scoreSeq, loadingPSAData } = this.props;
    const { start } = this.state;

    if (loadingPSAData) {
      return <LoadingSpinner />;
    }

    const items = this.sortItems(scoreSeq).slice(start, start + MAX_RESULTS);
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
    readOnlyPermissions: review.get('readOnly'),
    loadingPSAData: review.get('loadingPSAData')
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

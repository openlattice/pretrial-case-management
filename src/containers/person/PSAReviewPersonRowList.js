/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


import CustomPagination from '../../components/Pagination';
import PSAReviewPersonRow from '../../components/review/PSAReviewPersonRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

const StyledCenteredContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  text-align: center;
  padding: 30px;

  .pagination {
    display: inline-block;

    .active a {
      background-color: #6124e2;
      border-radius: 2px;
      color: white;
    }

    .disabled {
      visibility: hidden;
    }
  }

  .pagination a {
    color: #555e6f;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    }
  }
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'OpenSans', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #555e6f;
`;

const ReviewCount = styled.div`
  height: fit-content;
  padding: 0px 10px;
  margin-left: 10px;
  border-radius: 10px;
  background-color: #f0f0f7;
  font-size: 12px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #8e929b;
`;

const ReviewRowListWrapper = styled.div`
  width: 100%;
`
type Props = {
  scoreSeq :Immutable.Seq,
  sort? :?string,
  hideCaseHistory? :boolean,
  hideProfile? :boolean,
  onStatusChangeCallback? :() => void,
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
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    clearSubmit :() => void,
  },
  psaNeighborsById :Immutable.Map<*, *>,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
  hearings :Immutable.List<*>,
  psaIdsRefreshing :Immutable.Set<*>,
  readOnlyPermissions :boolean,
  loadingPSAData :boolean,
  submitting :boolean
}

type State = {
  start :number
}

const MAX_RESULTS = 5;

class PSAReviewRowList extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false,
    hideProfile: false,
    onStatusChangeCallback: () => {}
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
    this.props.actions.clearSubmit();
  }

  renderRow = (scoreId, scores) => {
    const neighbors = this.props.psaNeighborsById.get(scoreId, Immutable.Map());
    const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
    const personIdValue = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '');
    const caseHistory = this.props.caseHistory.get(personId, Immutable.List());
    const manualCaseHistory = this.props.manualCaseHistory.get(personId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personId, Immutable.Map());
    const manualChargeHistory = this.props.manualChargeHistory.get(personId, Immutable.Map());
    const sentenceHistory = this.props.sentenceHistory.get(personId, Immutable.Map());
    const ftaHistory = this.props.ftaHistory.get(personId, Immutable.Map());
    const hearings = this.props.hearings.get(personId, Immutable.List());
    return (
      <PSAReviewPersonRow
          neighbors={neighbors}
          scores={scores}
          personId={personIdValue}
          entityKeyId={scoreId}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          updateScoresAndRiskFactors={this.props.actions.updateScoresAndRiskFactors}
          changePSAStatus={this.props.actions.changePSAStatus}
          onStatusChangeCallback={this.props.onStatusChangeCallback}
          submitData={this.props.actions.submit}
          replaceEntity={this.props.actions.replaceEntity}
          refreshPSANeighbors={this.props.actions.refreshPSANeighbors}
          caseHistory={caseHistory}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          sentenceHistory={sentenceHistory}
          ftaHistory={ftaHistory}
          hearings={hearings}
          refreshingNeighbors={this.props.psaIdsRefreshing.has(scoreId)}
          readOnly={this.props.readOnlyPermissions}
          key={scoreId}
          hideCaseHistory={this.props.hideCaseHistory}
          hideProfile={this.props.hideProfile}
          submitting={this.props.submitting} />
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
      <StyledCenteredContainer>
        <StyledSectionHeader>
          PSA History
          <ReviewCount>{numResults}</ReviewCount>
        </StyledSectionHeader>
        <CustomPagination
            numItems={numPages}
            activePage={currPage}
            onChangePage={page => this.updatePage((page - 1) * MAX_RESULTS)} />
      </StyledCenteredContainer>
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
      <ReviewRowListWrapper>
        {this.renderPagination(numItems)}
        {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
      </ReviewRowListWrapper>
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
    hearings: review.get('hearings'),
    readOnlyPermissions: review.get('readOnly'),
    loadingPSAData: review.get('loadingPSAData'),
    psaIdsRefreshing: review.get('psaIdsRefreshing'),
    submitting: state.getIn(['submit', 'submitting'], false)
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

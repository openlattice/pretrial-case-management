/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomPagination from '../../components/Pagination';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import { getEntityKeyId, getIdValue } from '../../utils/DataUtils';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';

const StyledCenteredContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;

  .pagination {
    display: inline-block;
    margin-right: 30px;

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

const StyledSubHeaderBar = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.REVIEW:
        return (
          `background: #fff;
           border-radius: 5px;
           border: solid 1px #e1e1eb;
           border-top-left-radius: 0;
           border-top-right-radius: 0;
           padding: 0 0 10px 30px;
           font-size: 14px;
           text-align: center;`
        );
      case CONTENT_CONSTS.PENDING_PSAS:
        return (
          `background: #fff;
           border-radius: 5px;
           border: solid 1px #e1e1eb;
           border-top-left-radius: 0;
           border-top-right-radius: 0;
           padding: 0 0 10px 30px;
           font-size: 14px;
           text-align: center;`
        );
      default:
        return '';
    }
  }};
`;

const PersonWrapper = styled.div`
  padding: 30px;
  width: 100%;
`;

const ReviewWrapper = styled.div`
  width: 100%;
`;

const SpinnerWrapper = styled.div`
  margin: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const NoResults = styled.div`
  margin: 0 -30px 30px;
  font-size: 16px;
  text-align: center;
  width: 960px;
`;

const ReviewRowWrapper = styled.div`
  padding-left: 30px;
`;

const SubContentWrapper = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e1e1eb;
  padding: 20px 30px;
  margin-bottom: 30px;
`;

type Props = {
  scoreSeq :Immutable.Seq,
  sort? :?string,
  component :?string,
  hideCaseHistory? :boolean,
  onStatusChangeCallback? :() => void,
  renderContent :?(() => void),
  renderSubContent :?(() => void),
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
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

const MAX_RESULTS = 4;

class PSAReviewReportsRowList extends React.Component<Props, State> {

  static defaultProps = {
    sort: SORT_TYPES.DATE,
    hideCaseHistory: false,
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
    const personId = getEntityKeyId(neighbors, ENTITY_SETS.PEOPLE);
    const personIdValue = getIdValue(neighbors, ENTITY_SETS.PEOPLE, PROPERTY_TYPES.PERSON_ID);
    const caseHistory = this.props.caseHistory.get(personId, Immutable.List());
    const manualCaseHistory = this.props.manualCaseHistory.get(personId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personId, Immutable.Map());
    const manualChargeHistory = this.props.manualChargeHistory.get(personId, Immutable.Map());
    const sentenceHistory = this.props.sentenceHistory.get(personId, Immutable.Map());
    const ftaHistory = this.props.ftaHistory.get(personId, Immutable.Map());
    const hearings = this.props.hearings.get(personId, Immutable.List());
    const { component } = this.props;

    const hideProfile = (
      component === CONTENT_CONSTS.PROFILE ||
      component === CONTENT_CONSTS.PENDING_PSAS
    );
    return (
      <PSAReviewReportsRow
          neighbors={neighbors}
          scores={scores}
          personId={personIdValue}
          entityKeyId={scoreId}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          onStatusChangeCallback={this.props.onStatusChangeCallback}
          submitData={this.props.actions.submit}
          replaceEntity={this.props.actions.replaceEntity}
          deleteEntity={this.props.actions.deleteEntity}
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
          hideProfile={hideProfile}
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

  renderHeaderBar = (numResults) => {
    const { start } = this.state;

    const numPages = Math.ceil(numResults / MAX_RESULTS);
    const currPage = (start / MAX_RESULTS) + 1;

    return (
      <StyledCenteredContainer>
        <StyledSubHeaderBar component={this.props.component}>
          {this.props.renderContent(numResults)}
          <CustomPagination
              numPages={numPages}
              activePage={currPage}
              onChangePage={page => this.updatePage((page - 1) * MAX_RESULTS)} />
        </StyledSubHeaderBar>
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

  renderContent = (items, numPages, noResults) => {
    const { component } = this.props;

    switch (component) {
      case CONTENT_CONSTS.REVIEW:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
            {this.renderHeaderBar(numPages)}
          </ReviewWrapper>
        );
      case CONTENT_CONSTS.PENDING_PSAS:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            <SubContentWrapper>
              {this.props.renderSubContent()}
            </SubContentWrapper>
            <ReviewRowWrapper>
              {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
            </ReviewRowWrapper>
            {this.renderHeaderBar(numPages)}
          </ReviewWrapper>
        );
      case CONTENT_CONSTS.PROFILE:
        if (noResults) {
          return (
            <PersonWrapper>
              {this.renderHeaderBar(numPages)}
              <NoResults>No Results</NoResults>
            </PersonWrapper>
          );
        }
        return (
          <PersonWrapper>
            {this.renderHeaderBar(numPages)}
            {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
          </PersonWrapper>
        );
      default:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
            {this.renderHeaderBar(numPages)}
          </ReviewWrapper>
        );
    }
  }

  render() {
    const { scoreSeq, loadingPSAData } = this.props;
    const { start } = this.state;

    if (loadingPSAData) {
      return <SpinnerWrapper><LoadingSpinner /></SpinnerWrapper>;
    }

    const items = this.sortItems(scoreSeq).slice(start, start + MAX_RESULTS);
    const numPages = scoreSeq.length || scoreSeq.size;

    const noResults = numPages === 0;

    return (
      <ReviewWrapper>
        {this.renderContent(items, numPages, noResults)}
      </ReviewWrapper>
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

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSAReviewReportsRowList);

/*
 * @flow
 */

import React from 'react';
import FontAwesome from 'react-fontawesome';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ButtonToolbar, Pagination, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import DateTimeRange from '../../components/datetime/DateTimeRange';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { CenteredContainer } from '../../utils/Layout';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as Routes from '../../core/router/Routes';

const StyledFormViewWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 55px auto;
  width: 1300px;
`;

const StyledTitleWrapper = styled.div`
  align-items: center;
  color: #37454a;
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

const StyledSectionWrapper = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 55px;
  width: 100%;
`;

const CloseX = styled(FontAwesome)`
  cursor: pointer;
`;

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

const NoResults = styled.div`
  width: 100%;
  font-size: 16px;
  text-align: center;
`;

const ErrorText = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 15px;
`;

const LoadingText = styled.div`
  font-size: 20px;
  margin: 15px;
`;

const DomainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DateRangeContainer = styled.div`
  padding: 15px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
`;

const DomainText = styled.div`
  font-size: 14px;
  margin: -5px 0 5px 0;
`;

const DomainButton = styled(ToggleButton)`
  -webkit-appearance: none !important;
`;

const MAX_RESULTS = 10;

type Props = {
  history :string[],
  scoresAsMap :Immutable.Map<*, *>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    clearForm :() => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadPSAsByDate :(filter :string) => void,
    checkPSAPermissions :() => void
  },
  psaNeighborsById :Immutable.Map<*, *>,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>
}

type State = {
  startDate :string,
  endDate :string,
  domain :string,
  start :number
};

class JudgeContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      startDate: moment().subtract(1, 'day').startOf('day').add(5, 'hours'),
      endDate: moment().startOf('day').add(5, 'hours'),
      domain: DOMAIN.PENNINGTON,
      start: 0
    };
  }

  componentDidMount() {
    this.props.actions.checkPSAPermissions();
    this.props.actions.loadPSAsByDate(PSA_STATUSES.OPEN);
  }

  componentWillUnmount() {
    this.props.actions.clearForm();
  }

  handleClose = () => {
    this.setState({
      startDate: undefined,
      endDate: undefined
    });
    this.props.history.push(Routes.DASHBOARD);
  }

  renderDateRangePicker = () => (
    <DateRangeContainer>
      <DateTimeRange
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          onStartChange={startDate => this.setState({ startDate })}
          onEndChange={endDate => this.setState({ endDate })} />
    </DateRangeContainer>
  )

  renderSpinner = () => (
    <div>
      <LoadingText>Loading past reports...</LoadingText>
      <LoadingSpinner />
    </div>
  )

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  renderFilteredPSAs = () => {
    const { start } = this.state;
    let items = this.filter();

    if (!items || !items.count()) {
      return <NoResults>No results.</NoResults>;
    }

    if (items && items.count()) {
      items = this.sortByName(items).toArray();
    }

    return (
      <div>
        {this.renderPagination(items.length)}
        {items.slice(start, start + MAX_RESULTS).map(([scoreId, neighbors]) => this.renderRow(scoreId, neighbors))}
        {this.renderPagination(items.length)}
      </div>
    );
  }

  renderError = () => <ErrorText>{this.props.errorMessage}</ErrorText>

  renderRow = (scoreId, neighbors) => {
    const scores = this.props.scoresAsMap.get(scoreId, Immutable.Map());
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
          updateScoresAndRiskFactors={() => {}}
          updateNotes={() => {}}
          submitData={() => {}}
          caseHistory={caseHistory}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          sentenceHistory={sentenceHistory}
          ftaHistory={ftaHistory}
          key={scoreId}
          readOnly />
    );
  }

  sortByName = rowSeq => rowSeq.sort(([id1, neighbor1], [id2, neighbor2]) => {
    const p1 = neighbor1.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    const p2 = neighbor2.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

    const p1Last = p1.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
    const p2Last = p2.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
    if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

    const p1First = p1.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
    const p2First = p2.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
    if (p1First !== p2First) return p1First < p2First ? -1 : 1;

    const p1Dob = moment(p1.getIn([PROPERTY_TYPES.DOB, 0], ''));
    const p2Dob = moment(p2.getIn([PROPERTY_TYPES.DOB, 0], ''));
    if (p1Dob.isValid() && p2Dob.isValid()) return p1Dob.isBefore(p2Dob) ? -1 : 1;

    return 0;
  })

  filter = () => {

    const start = moment(this.state.startDate);
    const end = moment(this.state.endDate);

    if (!start.isValid() || !end.isValid()) {
      return Immutable.Collection();
    }

    return this.props.psaNeighborsById.entrySeq().filter(([scoreId, neighbors]) => {

      const validNeighbors = neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).filter((neighbor) => {
        if (!neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '').endsWith(this.state.domain)) {
          return false;
        }

        const timestamp = moment(neighbor.getIn(['associationDetails', PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
          neighbor.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')));
        return timestamp.isSameOrAfter(start) && timestamp.isSameOrBefore(end);
      });

      return validNeighbors.size > 0;
    });
  }

  onDomainChange = (domain) => {
    this.setState({ domain });
  }

  renderDomainChoices = () => (
    <DomainContainer>
      <DomainText>County:</DomainText>
      <ButtonToolbar>
        <ToggleButtonGroup type="radio" name="domainPicker" value={this.state.domain} onChange={this.onDomainChange}>
          <DomainButton value={DOMAIN.PENNINGTON}>Pennington</DomainButton>
          <DomainButton value={DOMAIN.MINNEHAHA}>Minnehaha</DomainButton>
        </ToggleButtonGroup>
      </ButtonToolbar>
    </DomainContainer>
  )

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

  renderContent = () => {
    if (this.props.loadingResults) {
      return <StyledSectionWrapper>{this.renderSpinner()}</StyledSectionWrapper>;
    }
    return (
      <StyledSectionWrapper>
        {this.renderError()}
        {this.renderDateRangePicker()}
        {this.renderDomainChoices()}
        {this.renderFilteredPSAs()}
        <StyledTopFormNavBuffer />
      </StyledSectionWrapper>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Judges</div>
            <CloseX name="close" onClick={this.handleClose} />
          </StyledTitleWrapper>
          {this.renderContent()}
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    scoresAsMap: review.get('scoresAsMap'),
    psaNeighborsById: review.get('psaNeighborsById'),
    loadingResults: review.get('loadingResults'),
    errorMesasge: review.get('errorMesasge'),
    caseHistory: review.get('caseHistory'),
    manualCaseHistory: review.get('manualCaseHistory'),
    chargeHistory: review.get('chargeHistory'),
    manualChargeHistory: review.get('manualChargeHistory'),
    sentenceHistory: review.get('sentenceHistory'),
    ftaHistory: review.get('ftaHistory')
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(JudgeContainer);

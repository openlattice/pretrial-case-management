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
import { ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import PSAReviewRowList from '../review/PSAReviewRowList';
import LoadingSpinner from '../../components/LoadingSpinner';
import DateTimeRange from '../../components/datetime/DateTimeRange';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import { SORT_TYPES } from '../../utils/consts/Consts';
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

type Props = {
  history :string[],
  scoresAsMap :Immutable.Map<*, *>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadPSAsByDate :(filter :string) => void
  },
  psaNeighborsById :Immutable.Map<*, *>
}

type State = {
  startDate :string,
  endDate :string,
  domain :string
};

class JudgeContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      startDate: moment().subtract(1, 'day').startOf('day').add(5, 'hours'),
      endDate: moment().startOf('day').add(5, 'hours'),
      domain: DOMAIN.PENNINGTON
    };
  }

  componentDidMount() {
    this.props.actions.loadPSAsByDate('OPEN');
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
    const { scoresAsMap } = this.props;
    const items = this.filter();

    if (!items || !items.count()) {
      return <NoResults>No results.</NoResults>;
    }

    return <PSAReviewRowList scoreSeq={items.map(([id]) => ([id, scoresAsMap.get(id)]))} sort={SORT_TYPES.NAME} />;
  }

  renderError = () => <ErrorText>{this.props.errorMessage}</ErrorText>

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
    errorMessage: review.get('errorMessage')
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

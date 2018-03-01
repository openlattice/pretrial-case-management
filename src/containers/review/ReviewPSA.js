/*
 * @flow
 */

import React from 'react';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-bootstrap-date-picker';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import * as ReviewActionFactory from './ReviewActionFactory';
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

const DatePickerTitle = styled.div`
  font-size: 18px;
  margin: 15px 0;
  text-align: center;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const DatePickerGroupContainer = styled.div`
  max-width: 300px;
  margin: 10px;
`;

const Error = styled.div`
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

const DATE_FORMAT = 'MM/DD/YYYY';

type Props = {
  history :string[],
  scoresEntitySetId :string,
  scoresAsMap :Immutable.Map<*, *>,
  psaNeighborsByDate :Immutable.Map<*, Immutable.Map<*, *>>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadPSAsByDate :() => void,
    updateScoresAndRiskFactors :(values :{
      scoresEntitySetId :string,
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>,
      riskFactorsEntitySetId :string,
      riskFactorsId :string,
      riskFactorsEntity :Immutable.Map<*, *>
    }) => void
  }
}

type State = {
  date :string;
};

class ReviewPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      date: moment().format()
    };
  }

  componentDidMount() {
    this.props.actions.loadPSAsByDate();
  }

  handleClose = () => {
    this.setState({
      date: moment().format()
    });
    this.props.history.push(Routes.DASHBOARD);
  }

  renderDateRangePicker = () => {
    const { date } = this.state;

    return (
      <div>
        <DatePickerTitle>Choose a date.</DatePickerTitle>
        <DateRangeContainer>
          <DatePickerGroupContainer>
            <div>PSA Date:</div>
            <DatePicker
                value={date}
                onChange={(newDate) => {
                  this.setState({ date: newDate });
                }} />
          </DatePickerGroupContainer>
        </DateRangeContainer>
      </div>
    );
  }

  renderSpinner = () => (
    <div>
      <LoadingText>Loading past reports...</LoadingText>
      <LoadingSpinner />
    </div>
  )

  renderError = () => <Error>{this.props.errorMessage}</Error>

  renderPsas = () => {
    const { scoresAsMap, psaNeighborsByDate, actions } = this.props;

    const date = moment(this.state.date).format(DATE_FORMAT);
    return psaNeighborsByDate.get(date, Immutable.Map()).keySeq()
      .sort((id1, id2) => {
        const p1 = psaNeighborsByDate.getIn([date, id1, ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
        const p2 = psaNeighborsByDate.getIn([date, id2, ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

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
      .map((id) => {
        const entityNeighbors = psaNeighborsByDate.getIn([date, id], Immutable.Map());
        const scores = scoresAsMap.get(id, Immutable.Map());
        return (
          <PSAReviewRow
              neighbors={entityNeighbors}
              scores={scores}
              entityKeyId={id}
              downloadFn={actions.downloadPSAReviewPDF}
              updateScoresAndRiskFactors={this.updateScoresAndRiskFactors}
              key={id} />
        );
      });
  }

  updateScoresAndRiskFactors = (scoresId, scoresEntity, riskFactorsEntitySetId, riskFactorsId, riskFactorsEntity) => {
    const { scoresEntitySetId, actions } = this.props;
    actions.updateScoresAndRiskFactors({
      scoresEntitySetId,
      scoresId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsId,
      riskFactorsEntity
    });
  }

  renderContent = () => {
    if (this.props.loadingResults) {
      return <StyledSectionWrapper>{this.renderSpinner()}</StyledSectionWrapper>;
    }
    return (
      <StyledSectionWrapper>
        {this.renderError()}
        {this.renderDateRangePicker()}
        {this.renderPsas()}
        <StyledTopFormNavBuffer />
      </StyledSectionWrapper>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Review PSA Forms</div>
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
    scoresEntitySetId: review.get('scoresEntitySetId'),
    scoresAsMap: review.get('scoresAsMap'),
    psaNeighborsByDate: review.get('psaNeighborsByDate'),
    loadingResults: review.get('loadingResults'),
    errorMesasge: review.get('errorMesasge')
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewPSA);

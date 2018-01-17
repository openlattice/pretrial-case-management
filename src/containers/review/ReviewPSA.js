import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-bootstrap-date-picker';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import StyledButton from '../../components/buttons/StyledButton';
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
  font-size: 16px;
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

const DATE_FORMAT = 'MM/DD/YYYY';

class ReviewPSA extends React.Component {

  static propTypes = {
    scoresAsMap: PropTypes.instanceOf(Immutable.Map).isRequired,
    psaNeighborsByDate: PropTypes.instanceOf(Immutable.Map).isRequired,
    errorMesasge: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      loadPsasByDateRequest: PropTypes.func.isRequired,
      downloadPsaReviewPdfRequest: PropTypes.func.isRequired
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      date: moment.utc(moment().format(DATE_FORMAT)).toISOString()
    };
  }

  componentDidMount() {
    this.props.actions.loadPsasByDateRequest();
  }

  handleClose = () => {
    this.setState({
      date: moment.utc(moment().format(DATE_FORMAT)).toISOString()
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
              onChange={(date) => {
                this.setState({ date });
              }} />
          </DatePickerGroupContainer>
        </DateRangeContainer>
      </div>
    )
  }

  renderError = () => {
    return <Error>{this.props.errorMessage}</Error>;
  }

  renderPsas = () => {
    const { scoresAsMap, psaNeighborsByDate, actions } = this.props;
    const date = moment(this.state.date).format(DATE_FORMAT);
    const rows = [];
    return psaNeighborsByDate.get(date, Immutable.Map()).keySeq().map((id) => {
      const entityNeighbors = psaNeighborsByDate.getIn([date, id], Immutable.Map());
      const scores = scoresAsMap.get(id, Immutable.Map());
      return (
        <PSAReviewRow
            neighbors={entityNeighbors}
            scores={scores}
            entityKeyId={id}
            downloadFn={actions.downloadPsaReviewPdfRequest}
            key={id} />
      );
    });
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Review PSA Forms</div>
            <CloseX name="close" onClick={this.handleClose} />
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            {this.renderError()}
            {this.renderDateRangePicker()}
            {this.renderPsas()}
            <StyledTopFormNavBuffer />
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }

}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    scoresAsMap: review.get('scoresAsMap'),
    psaNeighborsByDate: review.get('psaNeighborsByDate'),
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

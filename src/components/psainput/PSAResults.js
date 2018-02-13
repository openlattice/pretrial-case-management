import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import {
  ButtonWrapper,
  Divider,
  ResultsContainer,
  ResultsWrapper,
  ResultHeader,
  RiskFactorCell,
  RiskFactorHeaderCell,
  RiskFactorTable,
  ScaleBlock,
  ScaleWrapper,
  SelectedScaleBlock,
  WeightedScoreWrapper
} from '../../utils/Layout';

export default class PSAResults extends React.Component {

  static propTypes = {
    scores: PropTypes.object.isRequired,
    formValues: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      showWeightedScores: false
    };
  }

  getNvcaString = () => ((this.props.scores.nvcaFlag) ? 'Yes' : 'No')

  renderScale = (val) => {
    const scale = [];
    for (let i = 1; i < 7; i += 1) {
      const block = (i <= val)
        ? <SelectedScaleBlock key={i}>{i}</SelectedScaleBlock> : <ScaleBlock key={i}>{i}</ScaleBlock>;
      scale.push(block);
    }
    return <ScaleWrapper>{scale}</ScaleWrapper>;
  }

  renderRiskFactors = () => {
    const {
      ageAtCurrentArrest,
      currentViolentOffense,
      pendingCharge,
      priorMisdemeanor,
      priorFelony,
      priorViolentConviction,
      priorFailureToAppearRecent,
      priorFailureToAppearOld,
      priorSentenceToIncarceration
    } = this.props.formValues;

    let ageAtCurrentArrestValue = '20 or Younger';
    if (ageAtCurrentArrest === '1') ageAtCurrentArrestValue = '21 or 22';
    else if (ageAtCurrentArrest === '2') ageAtCurrentArrestValue = '23 or Older';
    const currentViolentOffenseValue = (currentViolentOffense === 'true') ? 'Yes' : 'No';
    const currentViolentOffenseAndYoungValue = (currentViolentOffense === 'true' && ageAtCurrentArrest === '0')
      ? 'Yes' : 'No';
    const pendingChargeValue = (pendingCharge === 'true') ? 'Yes' : 'No';
    const priorMisdemeanorValue = (priorMisdemeanor === 'true') ? 'Yes' : 'No';
    const priorFelonyValue = (priorFelony === 'true') ? 'Yes' : 'No';
    const priorConvictionValue = (priorMisdemeanor === 'true' || priorFelony === 'true') ? 'Yes' : 'No';
    const priorViolentConvictionValue = (priorViolentConviction === '3') ? '3 or more' : priorViolentConviction;
    const priorFailureToAppearRecentValue = (priorFailureToAppearRecent === '2')
      ? '2 or more' : priorFailureToAppearRecent;
    const priorFailureToAppearOldValue = (priorFailureToAppearOld === 'true') ? 'Yes' : 'No';
    const priorSentenceToIncarcerationValue = (priorSentenceToIncarceration === 'true') ? 'Yes' : 'No';

    return (
      <RiskFactorTable>
        <tbody>
          <tr>
            <RiskFactorHeaderCell>Risk Factors:</RiskFactorHeaderCell>
            <RiskFactorHeaderCell>Responses:</RiskFactorHeaderCell>
          </tr>
          <tr>
            <RiskFactorCell>1. Age at Current Arrest</RiskFactorCell>
            <RiskFactorCell>{ageAtCurrentArrestValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>2. Current Violent Offense</RiskFactorCell>
            <RiskFactorCell>{currentViolentOffenseValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>
              &nbsp;&nbsp;&nbsp;&nbsp;a. Current Violent Offense & 20 Years Old or Younger
              <i> (calculated from 1 and 2)</i>
            </RiskFactorCell>
            <RiskFactorCell>{currentViolentOffenseAndYoungValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>3. Pending Charge at the Time of the Offense</RiskFactorCell>
            <RiskFactorCell>{pendingChargeValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>4. Prior Misdemeanor Conviction</RiskFactorCell>
            <RiskFactorCell>{priorMisdemeanorValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>5. Prior Felony Conviction</RiskFactorCell>
            <RiskFactorCell>{priorFelonyValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>
              &nbsp;&nbsp;&nbsp;&nbsp;a. Prior Conviction <i>(calculated from 4 and 5)</i>
            </RiskFactorCell>
            <RiskFactorCell>{priorConvictionValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>6. Prior Violent Conviction</RiskFactorCell>
            <RiskFactorCell>{priorViolentConvictionValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>7. Prior Pre-trial Failure to Appear in Past 2 Years</RiskFactorCell>
            <RiskFactorCell>{priorFailureToAppearRecentValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>8. Prior Pre-trial Failure to Appear Older than 2 Years</RiskFactorCell>
            <RiskFactorCell>{priorFailureToAppearOldValue}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>9. Prior Sentence to Incarceration</RiskFactorCell>
            <RiskFactorCell>{priorSentenceToIncarcerationValue}</RiskFactorCell>
          </tr>
        </tbody>
      </RiskFactorTable>
    );
  }

  renderWeightedScore = score => (this.state.showWeightedScores
    ? <WeightedScoreWrapper>Weighted Score: {score}</WeightedScoreWrapper> : null)

  renderNvca = () => (
    <div>
      <ResultHeader>New Violent Criminal Activity Flag</ResultHeader>
      {this.renderWeightedScore(this.props.scores.nvcaTotal)}
      <div>&nbsp;&nbsp;{this.getNvcaString()}</div>
    </div>
  )

  renderNca = () => (
    <div>
      <ResultHeader>New Criminal Activity Scale</ResultHeader>
      {this.renderWeightedScore(this.props.scores.ncaTotal)}
      {this.renderScale(this.props.scores.ncaScale)}
    </div>
  )

  renderFta = () => (
    <div>
      <ResultHeader>Failure to Appear Scale</ResultHeader>
      {this.renderWeightedScore(this.props.scores.ftaTotal)}
      {this.renderScale(this.props.scores.ftaScale)}
    </div>
  )

  render() {
    return (
      <div>
        <Divider />
        <ResultsContainer>
          <ResultsWrapper>
            <ButtonWrapper>
              <Button
                  bsStyle="default"
                  onClick={() => {
                    this.setState({ showWeightedScores: !this.state.showWeightedScores });
                  }}>
                {this.state.showWeightedScores ? 'Hide weighted scores' : 'Show weighted scores'}
              </Button>
            </ButtonWrapper>
            {this.renderNvca()}
            {this.renderNca()}
            {this.renderFta()}
            <Divider />
            {this.renderRiskFactors()}
          </ResultsWrapper>
        </ResultsContainer>
      </div>
    );
  }
}

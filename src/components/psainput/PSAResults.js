/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
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
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  AGE_AT_CURRENT_ARREST_FQN,
  CURRENT_VIOLENT_OFFENSE_FQN,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN,
  PENDING_CHARGE_FQN,
  PRIOR_MISDEMEANOR_FQN,
  PRIOR_FELONY_FQN,
  PRIOR_CONVICTION_FQN,
  PRIOR_VIOLENT_CONVICTION_FQN,
  PRIOR_FAILURE_TO_APPEAR_RECENT_FQN,
  PRIOR_FAILURE_TO_APPEAR_OLD_FQN,
  PRIOR_SENTENCE_TO_INCARCERATION_FQN
} = PROPERTY_TYPES;

type Props = {
  scores :Object,
  riskFactors :Object
};

type State = {
  showWeightedScores :boolean
};

export default class PSAResults extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      showWeightedScores: false
    };
  }

  getNvcaString = () => ((this.props.scores.nvcaFlag) ? 'Yes' : 'No')

  renderScale = (val :number) => {
    const scale = [];
    for (let i = 1; i < 7; i += 1) {
      const block = (i <= val)
        ? <SelectedScaleBlock key={i}>{i}</SelectedScaleBlock> : <ScaleBlock key={i}>{i}</ScaleBlock>;
      scale.push(block);
    }
    return <ScaleWrapper>{scale}</ScaleWrapper>;
  }

  renderRiskFactors = () => {
    const { riskFactors } = this.props;

    const format = (valList) => {
      if (!valList.length) return '';
      const val = valList[0];
      if (val.length) return val;
      return val ? 'Yes' : 'No';
    };

    return (
      <RiskFactorTable>
        <tbody>
          <tr>
            <RiskFactorHeaderCell>Risk Factors:</RiskFactorHeaderCell>
            <RiskFactorHeaderCell>Responses:</RiskFactorHeaderCell>
          </tr>
          <tr>
            <RiskFactorCell>1. Age at Current Arrest</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[AGE_AT_CURRENT_ARREST_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>2. Current Violent Offense</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[CURRENT_VIOLENT_OFFENSE_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>
              &nbsp;&nbsp;&nbsp;&nbsp;a. Current Violent Offense & 20 Years Old or Younger
              <i> (calculated from 1 and 2)</i>
            </RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>3. Pending Charge at the Time of the Offense</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PENDING_CHARGE_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>4. Prior Misdemeanor Conviction</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_MISDEMEANOR_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>5. Prior Felony Conviction</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_FELONY_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>
              &nbsp;&nbsp;&nbsp;&nbsp;a. Prior Conviction <i>(calculated from 4 and 5)</i>
            </RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_CONVICTION_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>6. Prior Violent Conviction</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_VIOLENT_CONVICTION_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>7. Prior Pre-trial Failure to Appear in Past 2 Years</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_FAILURE_TO_APPEAR_RECENT_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>8. Prior Pre-trial Failure to Appear Older than 2 Years</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_FAILURE_TO_APPEAR_OLD_FQN])}</RiskFactorCell>
          </tr>
          <tr>
            <RiskFactorCell>9. Prior Sentence to Incarceration</RiskFactorCell>
            <RiskFactorCell>{format(riskFactors[PRIOR_SENTENCE_TO_INCARCERATION_FQN])}</RiskFactorCell>
          </tr>
        </tbody>
      </RiskFactorTable>
    );
  }

  renderWeightedScore = (score :number) => (this.state.showWeightedScores
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

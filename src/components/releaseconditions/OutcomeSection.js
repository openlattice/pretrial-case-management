/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Checkbox, Input } from 'lattice-ui-kit';

import { RowWrapper, OptionsGrid, Row } from './ReleaseConditionsStyledTags';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import { OUTCOMES, OTHER_OUTCOME, OTHER_OUTCOMES } from '../../utils/consts/ReleaseConditionConsts';

const { OTHER_OUTCOME_TEXT } = RELEASE_CONDITIONS;

const RadioWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  margin: 0 3px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
`;

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  handleInputChange :(event :Object) => void,
  outcome :String,
  otherOutcome :String,
  disabled :boolean
};

type State = {
  otherIsChosen :boolean;
};

class OutcomeSection extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      otherIsChosen: false
    };
  }

  static getDerivedStateFromProps(nextProps :Props) {
    const { outcome } = nextProps;
    const otherOutcomes = Object.values(OTHER_OUTCOMES);
    if (otherOutcomes.includes(outcome)) {
      return { otherIsChosen: true };
    }

    return null;
  }

  selectOther = () => {
    const { otherIsChosen } = this.state;
    this.setState({ otherIsChosen: !otherIsChosen });
  }

  render() {
    const { otherIsChosen } = this.state;
    const {
      mapOptionsToRadioButtons,
      handleInputChange,
      otherOutcome,
      disabled,
      outcome
    } = this.props;
    const otherOutcomeIsSelected = Object.values(OTHER_OUTCOMES).includes(outcome);
    return (
      <RowWrapper>
        <h1>Outcome</h1>
        <OptionsGrid numColumns={4}>
          {mapOptionsToRadioButtons(OUTCOMES, 'outcome')}
          <RadioWrapper>
            <Checkbox
                checked={otherIsChosen}
                disabled={otherOutcomeIsSelected}
                mode="button"
                onChange={this.selectOther}
                label={OTHER_OUTCOME.OTHER_OUTCOME}
                value={otherIsChosen} />
          </RadioWrapper>
        </OptionsGrid>
        {
          otherIsChosen
            ? (
              <>
                <OptionsGrid numColumns={5}>
                  {mapOptionsToRadioButtons(OTHER_OUTCOMES, 'outcome')}
                </OptionsGrid>
                <Row>
                  <h3>Outcome</h3>
                  <Input
                      disabled={disabled}
                      name={OTHER_OUTCOME_TEXT}
                      value={otherOutcome}
                      onChange={handleInputChange} />
                </Row>
              </>
            )
            : null
        }
      </RowWrapper>
    );
  }

}

export default OutcomeSection;

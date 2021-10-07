/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Input } from 'lattice-ui-kit';

import { RowWrapper, OptionsGrid, SubConditionsWrapper } from './ReleaseConditionsStyledTags';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import {
  CONDITION_LIST,
  CHECKIN_FREQUENCIES,
  C_247_TYPES
} from '../../utils/consts/ReleaseConditionConsts';

const { CONDITIONS, OTHER_CONDITION_TEXT } = RELEASE_CONDITIONS;

const ConditionsOptionsGrid = styled(OptionsGrid)`
  div:nth-child(9) {
    grid-column-start: 1;
    grid-column-end: 3;
  }

  div:nth-child(10) {
    grid-column-start: 3;
    grid-column-end: 5;
  }
`;

type Props = {
  parentState :Object,
  mapOptionsToRadioButtons :(options :{}, field :string, parentState :Object) => void,
  mapOptionsToCheckboxButtons :(options :{}, field :string, parentState :Object) => void,
  handleInputChange :(event :Object) => void,
  renderNoContactPeople :() => void,
  conditions :Object,
  otherCondition :String,
  disabled :boolean,
};

class ConditionsSection extends React.Component<Props> {

  renderSimpleCheckInSection = () => {
    const { parentState, mapOptionsToRadioButtons } = this.props;
    return (
      <SubConditionsWrapper>
        <h2>Check-in frequency</h2>
        <OptionsGrid numColumns={3}>
          {mapOptionsToRadioButtons(CHECKIN_FREQUENCIES, 'checkinFrequency', parentState)}
        </OptionsGrid>
        <hr />
      </SubConditionsWrapper>
    );
  };

  render247Project = () => {
    const { parentState, mapOptionsToCheckboxButtons } = this.props;
    return (
      <SubConditionsWrapper>
        <h2>24/7 Requirements</h2>
        <h3>Must sign 24/7 Project agreement and comply with all terms and conditions.</h3>
        <OptionsGrid numColumns={3}>
          {mapOptionsToCheckboxButtons(C_247_TYPES, 'c247Types', parentState)}
        </OptionsGrid>
        <hr />
      </SubConditionsWrapper>
    );
  }

  renderConditionsGrid = () => {
    const { parentState, mapOptionsToCheckboxButtons } = this.props;
    return (
      <ConditionsOptionsGrid numColumns={4}>
        {mapOptionsToCheckboxButtons(CONDITION_LIST, CONDITIONS, parentState)}
      </ConditionsOptionsGrid>
    );
  }

  render() {
    const {
      conditions,
      disabled,
      handleInputChange,
      otherCondition,
      renderNoContactPeople
    } = this.props;

    return (
      <RowWrapper>
        <h1>Conditions</h1>
        { this.renderConditionsGrid() }
        <hr />
        { conditions.includes(CONDITION_LIST.NO_CONTACT) ? renderNoContactPeople() : null }
        { conditions.includes(CONDITION_LIST.CHECKINS) ? this.renderSimpleCheckInSection() : null }
        { conditions.includes(CONDITION_LIST.C_247) ? this.render247Project() : null }
        { conditions.includes(CONDITION_LIST.OTHER) ? (
          <SubConditionsWrapper>
            <h2>Other Conditions</h2>
            <Input
                name={OTHER_CONDITION_TEXT}
                value={otherCondition}
                onChange={handleInputChange}
                disabled={disabled} />
          </SubConditionsWrapper>
        ) : null }
      </RowWrapper>
    );
  }
}

export default ConditionsSection;

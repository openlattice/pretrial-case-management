/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import RadioButton from './CountWithTitleRadioButton';
import { PEOPLE } from '../../utils/consts/FrontEndStateConsts';

const ButtonsWrapper = styled.div`
  width: 100%;
  padding: 30px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
`;


class Tabs extends React.Component<Props, State> {

  onChange = (e) => {
    const { onChange } = this.props;
    const { name } = e.target;
    onChange(name);
  };

  render() {
    const {
      filter,
      peopleWithMultiplePSAs,
      peopleWithRecentFTAs,
      peopleWithNoPendingCharges,
      peopleWithPSAsWithNoHearings
    } = this.props;

    const buttonObjects = [
      {
        count: peopleWithMultiplePSAs.size,
        title: 'People w/ Multiple PSAs',
        name: PEOPLE.MULTIPLE_PSA_PEOPLE,
        checked: filter === PEOPLE.MULTIPLE_PSA_PEOPLE
      },
      {
        count: peopleWithRecentFTAs.size,
        title: 'People w/ Recent FTAs',
        name: PEOPLE.RECENT_FTA_PEOPLE,
        checked: filter === PEOPLE.RECENT_FTA_PEOPLE
      },
      {
        count: peopleWithNoPendingCharges.size,
        title: 'PSAs w/ No Pending Charges',
        name: PEOPLE.NO_PENDING_CHARGES_PEOPLE,
        checked: filter === PEOPLE.NO_PENDING_CHARGES_PEOPLE
      },
      {
        count: peopleWithPSAsWithNoHearings.size,
        title: 'PSAs w/ No Hearings',
        name: PEOPLE.NO_HEARINGS_PEOPLE,
        checked: filter === PEOPLE.NO_HEARINGS_PEOPLE
      }
    ];

    return (
      <ButtonsWrapper>
        {
          buttonObjects.map(button => (
            <RadioButton
                key={button.name}
                name={button.name}
                count={button.count}
                label={button.title}
                value={button.checked}
                checked={button.checked}
                disabled={!button.count}
                onChange={this.onChange}
                large />
          ))
        }
      </ButtonsWrapper>
    );
  }

}

export default Tabs;

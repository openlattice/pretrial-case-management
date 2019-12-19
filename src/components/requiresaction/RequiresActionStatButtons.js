/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import RadioButton from './CountWithTitleRadioButton';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

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
        name: PEOPLE_DATA.MULTIPLE_PSA_PEOPLE,
        checked: filter === PEOPLE_DATA.MULTIPLE_PSA_PEOPLE
      },
      {
        count: peopleWithRecentFTAs.size,
        title: 'People w/ Recent FTAs',
        name: PEOPLE_DATA.RECENT_FTA_PEOPLE,
        checked: filter === PEOPLE_DATA.RECENT_FTA_PEOPLE
      },
      {
        count: peopleWithNoPendingCharges.size,
        title: 'PSAs w/ No Pending Charges',
        name: PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE,
        checked: filter === PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE
      },
      {
        count: peopleWithPSAsWithNoHearings.size,
        title: 'PSAs w/ No Hearings',
        name: PEOPLE_DATA.NO_HEARINGS_PEOPLE,
        checked: filter === PEOPLE_DATA.NO_HEARINGS_PEOPLE
      }
    ];

    return (
      <ButtonsWrapper>
        {
          buttonObjects.map(button => (
            <RadioButton
                height={56}
                key={button.name}
                name={button.name}
                count={button.count}
                label={button.title}
                value={button.checked}
                checked={button.checked}
                disabled={!button.count}
                onChange={this.onChange} />
          ))
        }
      </ButtonsWrapper>
    );
  }

}

export default Tabs;

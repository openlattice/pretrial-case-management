/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Set } from 'immutable';
import { Radio } from 'lattice-ui-kit';

import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, 1fr);
  padding: 30px 0;
  width: 100%;
`;

 type Props = {
   onChange :(name :string) => void;
   filter :string,
   peopleWithMultiplePSAs :Set,
   peopleWithRecentFTAs :Set,
   peopleWithNoPendingCharges :Set,
   peopleWithPSAsWithNoHearings :Set
 };

class Tabs extends React.Component<Props> {

  onChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
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
          buttonObjects.map((button) => (
            <Radio
                key={button.name}
                name={button.name}
                label={`${button.count} ${button.title}`}
                value={button.count}
                checked={button.checked}
                disabled={!button.count}
                mode="button"
                onChange={this.onChange} />
          ))
        }
      </ButtonsWrapper>
    );
  }
}

export default Tabs;

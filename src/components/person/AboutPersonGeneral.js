/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, DataGrid } from 'lattice-ui-kit';

import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDateList, formatValue } from '../../utils/FormattingUtils';

const {
  DOB,
  FIRST_NAME,
  GENDER,
  LAST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  PICTURE,
  RACE
} = PROPERTY_TYPES;

const PersonPhoto = styled.img`
  width: 100%;
  height: auto;
`;

const StyledCard = styled(Card)`
  margin-bottom: 30px;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr;

  > div {
    padding: 30px;
  }
`;

type Props = {
  selectedPersonData :Map;
}

class AboutPersonGeneral extends React.Component<Props> {

  formatName = (name :string) => (
    name.split(' ').map((n) => (n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())).join(' ')
  );

  render() {
    const { selectedPersonData } = this.props;

    let age = '';
    const firstName = formatValue(selectedPersonData.get(FIRST_NAME, List()));
    const formattedFirstName = this.formatName(firstName);
    const middleName = formatValue(selectedPersonData.get(MIDDLE_NAME, List()));
    const formattedMiddleName = this.formatName(middleName);
    const lastName = formatValue(selectedPersonData.get(LAST_NAME, List()));
    const formattedLastName = this.formatName(lastName);
    const gender = formatValue(selectedPersonData.get(GENDER, List()));
    const race = formatValue(selectedPersonData.get(RACE, List()));
    const dobList = selectedPersonData.get(DOB, List());
    const dob = formatDateList(dobList);
    const mugshot :string = selectedPersonData.getIn([MUGSHOT, 0])
      || selectedPersonData.getIn([PICTURE, 0])
      || defaultUserIcon;

    if (dobList.size) {
      age = Math.floor(DateTime.local().diff(DateTime.fromISO(dobList.get(0, '')), 'years').years);
    }

    const data = fromJS({
      age,
      [DOB]: dob,
      [FIRST_NAME]: formattedFirstName,
      [GENDER]: gender,
      [LAST_NAME]: formattedLastName,
      [MIDDLE_NAME]: formattedMiddleName,
      [RACE]: race
    });

    const labelMap = fromJS({
      [LAST_NAME]: 'last name',
      [MIDDLE_NAME]: 'middle name',
      [FIRST_NAME]: 'first name',
      [DOB]: 'date of birth',
      age: 'age',
      [GENDER]: 'gender',
      [RACE]: 'race'
    });

    return (
      <StyledCard>
        <Wrapper>
          <PersonPhoto src={mugshot} />
          <DataGrid
              columns={4}
              data={data}
              labelMap={labelMap}
              truncate />
        </Wrapper>
      </StyledCard>
    );
  }
}

export default AboutPersonGeneral;

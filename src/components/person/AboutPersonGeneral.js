/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { DateTime } from 'luxon';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDateList, formatValue } from '../../utils/FormattingUtils';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';

const {
  DOB,
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  MUGSHOT,
  PICTURE
} = PROPERTY_TYPES;

type Props = {
  selectedPersonData :Immutable.Map<*, *>
}

class AboutPersonGeneral extends React.Component<Props, *> {

  formatName = name => (
    name.split(' ').map(n => (n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())).join(' ')
  )

  render() {
    const { selectedPersonData } = this.props;

    let generalContent = [];

    let age = '';
    const firstName = formatValue(selectedPersonData.get(FIRST_NAME, Immutable.List()));
    const formattedFirstName = this.formatName(firstName);
    const middleName = formatValue(selectedPersonData.get(MIDDLE_NAME, Immutable.List()));
    const formattedMiddleName = this.formatName(middleName);
    const lastName = formatValue(selectedPersonData.get(LAST_NAME, Immutable.List()));
    const formattedLastName = this.formatName(lastName);
    const dobList = selectedPersonData.get(DOB, Immutable.List());
    const dob = formatDateList(dobList);
    const mugshot :string = selectedPersonData.getIn([MUGSHOT, 0])
      || selectedPersonData.getIn([PICTURE, 0])
      || defaultUserIcon;

    if (dobList.size) {
      age = Math.floor(DateTime.local().diff(DateTime.fromISO(dobList.get(0, '')), 'years').years);
    }

    try {
      if (selectedPersonData) {
        generalContent = [
          {
            label: 'Last Name',
            content: [(lastName ? formattedLastName : lastName)]
          },
          {
            label: 'Middle Name',
            content: [
              (middleName ? formattedMiddleName : middleName)
            ]
          },
          {
            label: 'First Name',
            content: [(firstName ? formattedFirstName : firstName)]
          },
          {
            label: 'Date of Birth',
            content: [dob]
          },
          {
            label: 'Age',
            content: [age]
          },
          {
            label: 'Gender',
            content: [formatValue(selectedPersonData.get(PROPERTY_TYPES.SEX))]
          },
          {
            label: 'Race',
            content: [formatValue(selectedPersonData.get(PROPERTY_TYPES.RACE))]
          }
        ];
      }
    }
    catch (e) {
      console.error(e);
    }

    const content = generalContent.map(person => (
      <ContentBlock
          contentBlock={person}
          component={CONTENT_CONSTS.PROFILE}
          key={person.label} />
    ));

    return (
      <ContentSection
          photo={mugshot}
          component={CONTENT_CONSTS.PROFILE}>
        {content}
      </ContentSection>
    );
  }
}

export default AboutPersonGeneral;

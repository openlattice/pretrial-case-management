import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import moment from 'moment';

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
  LAST_NAME
} = PROPERTY_TYPES;

const AboutPersonGeneral = ({ selectedPersonData }) => {

  let generalContent = [];

  let age = '';
  const firstName = formatValue(selectedPersonData.get(FIRST_NAME, Immutable.List()));
  const middleName = formatValue(selectedPersonData.get(MIDDLE_NAME, Immutable.List()));
  const lastName = formatValue(selectedPersonData.get(LAST_NAME, Immutable.List()));
  const dobList = selectedPersonData.get(DOB, Immutable.List());
  const dob = formatDateList(dobList);

  if (dobList.size) {
    age = moment().diff(moment(dobList.get(0, '')), 'years');
  }

  try {
    if (selectedPersonData) {
      generalContent = [
        {
          label: 'Last Name',
          content: [lastName]
        },
        {
          label: 'Middle Name',
          content: [middleName]
        },
        {
          label: 'First Name',
          content: [firstName]
        },
        {
          label: '',
          content: ['']
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

  const content = generalContent.map((person) => {
    return (
      <ContentBlock
          contentBlock={person}
          component={CONTENT_CONSTS.PROFILE}
          key={person.label} />
    );
  });

  const header = `${firstName} ${middleName} ${lastName}`;

  return (
    <ContentSection
        photo={defaultUserIcon}
        component={CONTENT_CONSTS.PROFILE}
        header={header} >
      {content}
    </ContentSection>
  );
};

AboutPersonGeneral.propTypes = {
  selectedPersonData: PropTypes.instanceOf(Immutable.Map).isRequired
};

export default AboutPersonGeneral;

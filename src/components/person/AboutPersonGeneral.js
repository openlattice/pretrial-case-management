import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import moment from 'moment';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDateList, formatValue } from '../../utils/Utils';
import { isNonEmptyString } from '../../utils/LangUtils';


const AboutPersonGeneral = ({ selectedPersonData, vertical }) => {

  let generalContent = [];
  const title = 'General';

  let age = '';
  const dobList = selectedPersonData.get(PROPERTY_TYPES.DOB, Immutable.List());
  const dob = formatDateList(dobList);

  if (dobList.size) {
    age = moment().diff(moment(dobList.get(0, '')), 'years');
  }

  try {
    if (selectedPersonData) {
      generalContent = [
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

  return (
    <ContentSection title={title}>
      <ContentBlock
          contentBlock={generalContent[0]}
          key={generalContent[0].label}
          vertical={vertical} />
      <ContentBlock
          contentBlock={generalContent[1]}
          key={generalContent[1].label}
          vertical={vertical} />
      <ContentBlock
          contentBlock={generalContent[2]}
          key={generalContent[2].label}
          vertical={vertical} />
      <ContentBlock
          contentBlock={generalContent[3]}
          key={generalContent[3].label}
          vertical={vertical} />
    </ContentSection>
  );
};

AboutPersonGeneral.defaultProps = {
  vertical: false
};

AboutPersonGeneral.propTypes = {
  vertical: PropTypes.bool,
  selectedPersonData: PropTypes.instanceOf(Immutable.Map).isRequired
};

export default AboutPersonGeneral;

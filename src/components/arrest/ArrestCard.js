/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { formatDate, formatTime } from '../../utils/FormattingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARREST_DATE_TIME,
  ARRESTING_AGENCY,
  CASE_ID,
  ENTITY_KEY_ID
} = PROPERTY_TYPES;

type Props = {
  arrest :Immutable.Map<*, *>,
  component :String
};

const ArrestCard = ({ arrest, component } :Props) => {
  const {
    [ARREST_DATE_TIME]: arrestDateTime,
    [ARRESTING_AGENCY]: arrestingAgency,
    [CASE_ID]: caseId,
    [ENTITY_KEY_ID]: arrestEKID
  } = getEntityProperties(
    arrest,
    [CASE_ID, ARREST_DATE_TIME, ARRESTING_AGENCY]
  );

  const arrestDate = formatDate(arrestDateTime);
  const arrestTime = formatTime(arrestDateTime);

  let generalContent;

  if (component === CONTENT_CONSTS.FORM_CONTAINER) {
    generalContent = [
      {
        label: 'Case Number',
        content: [caseId]
      },
      {
        label: '',
        content: ['']
      },
      {
        label: 'Arrest Date',
        content: [arrestDate]
      },
      {
        label: 'Arrest Time',
        content: [arrestTime]
      },
      {
        label: 'Arresting Agency',
        content: [arrestingAgency]
      }
    ];
  }
  else {
    generalContent = [
      {
        label: 'Arrest Date',
        content: [arrestDate]
      },
      {
        label: 'Arrest Time',
        content: [arrestTime]
      },
      {
        label: 'Arresting Agency',
        content: [arrestingAgency]
      }
    ];
  }

  const content = generalContent.map((item) => (
    <ContentBlock
        component={component}
        contentBlock={item}
        key={item.label} />
  ));

  return (
    <ContentSection
        component={component}
        header="Arrest">
      {content}
    </ContentSection>
  );
};

export default ArrestCard;

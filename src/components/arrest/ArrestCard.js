/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { formatDateTime } from '../../utils/FormattingUtils';
import { getCaseFields } from '../../utils/CaseUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARRESTING_AGENCY,
  CASE_ID,
  ARREST_DATE_TIME
} = PROPERTY_TYPES;

type Props = {
  arrest :Immutable.Map<*, *>,
  component :String
};

const ArrestCard = ({ arrest, component } :Props) => {
  const { caseId, arrestDateTime, arrestingAgency } = getCaseFields(
    arrest,
    [CASE_ID, ARREST_DATE_TIME, ARRESTING_AGENCY]
  );
  const arrestDate = formatDateTime(arrestDateTime, 'MM/DD/YYYY');
  const arrestTime = formatDateTime(arrestDateTime, 'HH:mm');

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
      }
    ];
  }

  const content = generalContent.map((item, idx) => (
    <ContentBlock
        component={component}
        contentBlock={item}
        key={`${item.label}-${idx}`} />
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

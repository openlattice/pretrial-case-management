/*
 * @flow
 */
import React from 'react';
import { Map } from 'immutable';
import { Table } from 'lattice-ui-kit';

import OptOutRow from './OptOutRow';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { OPT_OUT_HEADERS } from '../../utils/RemindersUtils';

const {
  CONTACT_INFORMATION,
  PEOPLE,
} = APP_TYPES;

const {
  DATE_TIME,
  EMAIL,
  ENTITY_KEY_ID,
  PHONE,
  REASON
} = PROPERTY_TYPES;

type Props = {
  isLoading :boolean;
  optOuts ?:Map;
  optOutNeighbors ?:Map;
  pageOptions ?:number[];
};

const defaultPageOptions = [5, 10, 15];

class RemindersTable extends React.Component<Props> {

  static defaultProps = {
    optOuts: Map(),
    optOutNeighbors: Map(),
    pageOptions: defaultPageOptions,
  }

  getReminderNeighborDetails = (optOuts :Map, optOutsNeighbors :Map) => {
    const {
      [ENTITY_KEY_ID]: id,
      [REASON]: reason,
      [DATE_TIME]: dateTime
    } = getEntityProperties(optOuts, [ENTITY_KEY_ID, REASON, DATE_TIME]);
    const person = optOutsNeighbors.get(PEOPLE, Map());
    const contactInfo = optOutsNeighbors.get(CONTACT_INFORMATION, Map());
    const { lastFirstMid: personName, personEntityKeyId: personEKID } = formatPeopleInfo(person);
    const {
      [EMAIL]: email,
      [PHONE]: phone
    } = getEntityProperties(contactInfo, [EMAIL, PHONE]);
    const contact = phone || email;
    return {
      id,
      contact,
      dateTime,
      personEKID,
      personName,
      reason
    };
  };

  getFormattedData = () => {
    const { optOuts, optOutNeighbors } = this.props;
    const data = [];
    if (optOuts && optOuts.size) {
      optOuts.entrySeq().forEach(([optOutEKID, optOut]) => {
        const optoutNeighbors = optOutNeighbors.get(optOutEKID, Map());
        const dataObj :Object = this.getReminderNeighborDetails(optOut, optoutNeighbors);
        data.push(dataObj);
      });
    }
    return { data };
  };

  render() {
    const { isLoading, pageOptions } = this.props;
    const { data: optOutData } = this.getFormattedData();

    const components :Object = {
      Row: ({ data } :Object) => (
        <OptOutRow data={data} />
      )
    };

    return (
      <Table
          components={components}
          isLoading={isLoading}
          headers={OPT_OUT_HEADERS}
          paginated
          rowsPerPageOptions={pageOptions}
          data={optOutData} />
    );
  }
}

export default RemindersTable;

/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { CardSegment, Table } from 'lattice-ui-kit';

import ConditionsRow from '../../containers/rcm/ConditionsRow';
import { HeaderSection } from './SettingsStyledComponents';

type Props = {
  editing :boolean,
  conditions :Object[],
  levels :Map<*, *>
};

class ConditionsTable extends React.Component<Props> {

  getHeaders = () => {
    const { editing, levels } = this.props;
    const headers :Object[] = [{ key: 'description', label: 'Description' }];
    for (let level = 1; level <= Object.keys(levels).length; level += 1) {
      if (levels[level].active) {
        headers.push({ key: `Level ${level}`, label: `Level ${level}`, cellStyle: { width: '12%' } });
      }
    }
    if (editing) headers.push({ key: 'removerow', label: '' });
    return headers;
  }

  render() {
    const {
      editing,
      conditions,
      levels
    } = this.props;

    const headers = this.getHeaders();
    const components :Object = {
      Row: ({ data } :any) => (
        <ConditionsRow
            editing={editing}
            levels={levels}
            data={data} />
      )
    };

    return (
      <CardSegment vertical>
        <HeaderSection>Release Conditions</HeaderSection>
        <Table
            components={components}
            headers={headers}
            data={conditions} />
      </CardSegment>
    );
  }
}

export default ConditionsTable;

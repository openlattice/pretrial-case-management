/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { CardSegment, Table } from 'lattice-ui-kit';

import ReleaseTypeRow from '../../containers/rcm/ReleaseTypeRow';
import { HeaderSection } from './SettingsStyledComponents';
import { RCM_DATA } from '../../utils/consts/AppSettingConsts';
import { RELEASE_TYPE_HEADERS } from '../../utils/consts/RCMResultsConsts';

type Props = {
  editing :boolean,
  levels :Map<*, *>
};

class ReleaseTypeTable extends React.Component<Props, State> {

  getHeaders = () => {
    const { levels } = this.props;
    const headers :Object[] = [{ key: 'context', label: 'Release Type' }];
    for (let level = 1; level <= Object.keys(levels).length; level += 1) {
      if (levels[level].active) {
        headers.push({ key: `Level ${level}`, label: `Level ${level}`, cellStyle: { width: '12%' } });
      }
    }
    return headers;
  }

  render() {
    const { editing, levels } = this.props;
    const releaseTypeData = [];
    Object.keys(RELEASE_TYPE_HEADERS).forEach((releaseType) => {
      const releaseObject = {
        [RCM_DATA.RELEASE_TYPE]: releaseType,
        description: RELEASE_TYPE_HEADERS[releaseType],
        id: RELEASE_TYPE_HEADERS[releaseType]
      };
      releaseTypeData.push(releaseObject);
    });

    const headers = this.getHeaders();
    const components :Object = {
      Row: ({ data } :any) => (
        <ReleaseTypeRow
            editing={editing}
            levels={levels}
            data={data} />
      )
    };

    return (
      <CardSegment vertical>
        <HeaderSection>Release Types</HeaderSection>
        <Table
            components={components}
            headers={headers}
            data={releaseTypeData} />
      </CardSegment>
    );
  }
}

export default ReleaseTypeTable;

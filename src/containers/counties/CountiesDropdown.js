/*
 * @flow
 */

import React from 'react';
import { Select } from 'lattice-ui-kit';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';

import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';

const { ENTITY_KEY_ID, NAME } = PROPERTY_TYPES;

type Props = {
  value :string,
  options :Map<*, *>,
  loading :boolean,
  onChange :() => void
};

class CourtContainer extends React.Component<Props> {

  renderCountyFilter = () => {
    const {
      value,
      options,
      loading,
      onChange
    } = this.props;
    const countyOptions :List = options.entrySeq().map(([countyEKID, county]) => {
      const { [NAME]: countyName } = getEntityProperties(county, [ENTITY_KEY_ID, NAME]);
      return {
        label: countyName,
        value: countyEKID
      };
    }).toJS();
    countyOptions.unshift({ label: 'All', value: '' });
    const currentFilterValue :Object = {
      label: options.getIn([value, NAME, 0], 'All'),
      value
    };
    return (
      <Select
          value={currentFilterValue}
          options={countyOptions}
          isLoading={loading}
          onChange={onChange} />
    );
  }

  render() {
    return this.renderCountyFilter();
  }
}

function mapStateToProps(state) {
  const counties = state.get(STATE.COUNTIES);
  return {
    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),
  };
}
// $FlowFixMe
export default connect(mapStateToProps, null)(CourtContainer);

/*
 * @flow
 */

import React from 'react';
import { Modal } from 'lattice-ui-kit';
import { Map } from 'immutable';

import ReleaseConditionsContainer from '../../containers/releaseconditions/ReleaseConditionsContainer';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDate } from '../../utils/FormattingUtils';
import { getAssociationDetailsForEntitySet, getFirstNeighborValue } from '../../utils/DataUtils';

const { PSA_SCORES } = APP_TYPES;

type Props = {
  hearingEntityKeyId :string,
  hearingNeighborsById :Map<*, *>,
  open :boolean,
  onClose :() => void,
  refreshing :boolean
}

const ReleaseConditionsModal = ({
  hearingEntityKeyId,
  hearingNeighborsById,
  open,
  onClose,
  refreshing
} :Props) => {

  const psaObj = getAssociationDetailsForEntitySet(hearingNeighborsById.get(hearingEntityKeyId, Map()), PSA_SCORES);
  const psaDate = formatDate(getFirstNeighborValue(psaObj, PROPERTY_TYPES.COMPLETED_DATE_TIME));

  return (
    <Modal
        isVisible={open}
        onClose={onClose}
        shouldCloseOnOutsideClick
        textTitle={`Hearing Details for PSA Created on ${psaDate}`}
        viewportScrolling>
      <ReleaseConditionsContainer
          loading={refreshing}
          hearingEntityKeyId={hearingEntityKeyId} />
    </Modal>
  );
};

export default ReleaseConditionsModal;

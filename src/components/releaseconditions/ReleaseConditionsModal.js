/*
 * @flow
 */

import React from 'react';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map } from 'immutable';

import ReleaseConditionsContainer from '../../containers/releaseconditions/ReleaseConditionsContainer';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDate } from '../../utils/FormattingUtils';
import { getAssociationDetailsForEntitySet, getFirstNeighborValue } from '../../utils/DataUtils';
import {
  Wrapper,
  PaddedStyledColumnRow,
  TitleWrapper,
  CloseModalX
} from '../../utils/Layout';

const { PSA_SCORES } = APP_TYPES;

type Props = {
  hearingEntityKeyId :string,
  hearingNeighborsById :Map<*, *>,
  open :boolean,
  onClose :() => void,
  refreshing :boolean
}

const MODAL_WIDTH = '975px';
const MODAL_HEIGHT = 'max-content';

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
    <Wrapper>
      <ModalTransition>
        {
          open
          && (
            <Modal
                scrollBehavior="outside"
                onClose={onClose}
                width={MODAL_WIDTH}
                height={MODAL_HEIGHT}
                max-height={MODAL_HEIGHT}
                shouldCloseOnOverlayClick
                stackIndex={2}>
              <TitleWrapper>
                <h1>{`Hearing Details for PSA Created on ${psaDate}`}</h1>
                <div>
                  <CloseModalX onClick={onClose} />
                </div>
              </TitleWrapper>
              <PaddedStyledColumnRow>
                <ReleaseConditionsContainer
                    loading={refreshing}
                    hearingEntityKeyId={hearingEntityKeyId} />
              </PaddedStyledColumnRow>
            </Modal>
          )
        }
      </ModalTransition>
    </Wrapper>
  );
};

export default ReleaseConditionsModal;

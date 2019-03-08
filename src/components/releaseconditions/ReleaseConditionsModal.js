/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map } from 'immutable';

import ReleaseConditionsContainer from '../../containers/releaseconditions/ReleaseConditionsContainer';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  Wrapper,
  PaddedStyledColumnRow,
  TitleWrapper,
  CloseModalX
} from '../../utils/Layout';
import { PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';


type Props = {
  hearingEntityKeyId :string,
  hearingNeighborsById :Map<*, *>,
  open :boolean,
  onClose :() => void,
  refreshing :boolean,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    loadReleaseConditions :({ hearingId :string }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshHearingNeighbors :({ id :string }) => void,
    replaceAssociation :(values :{
      associationEntity :Map<*, *>,
      associationEntityName :string,
      associationEntityKeyId :string,
      srcEntityName :string,
      srcEntityKeyId :string,
      dstEntityName :string,
      dstEntityKeyId :string,
      callback :() => void
    }) => void
  }
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


  const psaDate = moment(hearingNeighborsById.getIn(
    [hearingEntityKeyId, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]
  )).format('MM/DD/YYYY');

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
}

export default ReleaseConditionsModal;

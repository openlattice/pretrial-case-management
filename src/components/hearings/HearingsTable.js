/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import type { RequestState } from 'redux-reqseq';
import { Map } from 'immutable';

import ConfirmationModal from '../ConfirmationModal';
import HearingRow from './HearingRow';
import { OL } from '../../utils/consts/Colors';
import { CONFIRMATION_ACTION_TYPES, CONFIRMATION_OBJECT_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { sortHearingsByDate, getHearingString } from '../../utils/HearingUtils';
import { getEntityProperties, isUUID, getIdOrValue } from '../../utils/DataUtils';

import { requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';

const { PSA_SCORES } = APP_TYPES;

/* Primary Components */
const Body = styled.div`
  width: 100%;
  margin-top: 41px;
  max-height: ${(props) => props.maxHeight}px;
  min-height: 200px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderElement = styled.div`
  color: ${OL.GREY02};
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 12px 10px;
  text-transform: uppercase;
`;

const HeaderRow = styled.div`
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
  display: grid;
  grid-template-columns: 110px 70px 130px 190px 100px 95px 200px;
  position: absolute;
`;
const Table = styled.div`
  border: 1px solid ${OL.GREY11};
  margin-bottom: 30px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

/* Secondary Components */
const CenteredHeader = styled(HeaderElement)`
  text-align: center;
`;


const Headers = () => (
  <HeaderRow>
    <HeaderElement>Date</HeaderElement>
    <HeaderElement>Time</HeaderElement>
    <HeaderElement>Courtroom</HeaderElement>
    <HeaderElement>Type</HeaderElement>
    <HeaderElement>Case ID</HeaderElement>
    <CenteredHeader>PSA</CenteredHeader>
    <HeaderElement />
  </HeaderRow>
);

type Props = {
  maxHeight :number,
  updateHearingReqState :RequestState,
  rows :Map<*, *>,
  hearingsWithOutcomes :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  cancelFn :(values :{ entityKeyId :string }) => void,
}


class HearingsTable extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      confirmationModalOpen: false,
      hearing: Map()
    };
  }

  componentDidUpdate(prevProps) {
    const { updateHearingReqState } = this.props;
    const wasPending = requestIsPending(prevProps.updateHearingReqState);
    const isSuccess = requestIsSuccess(updateHearingReqState);
    if (wasPending && isSuccess) {
      this.closeConfirmationModal();
    }
  }

  openConfirmationModal = (hearing :Map) => this.setState({
    confirmationModalOpen: true,
    hearing
  });

  closeConfirmationModal = () => this.setState({
    confirmationModalOpen: false,
    hearing: Map()
  });

  renderConfirmationModal = () => {
    const { cancelFn, updateHearingReqState } = this.props;
    const hearingCancellationIsPending = requestIsPending(updateHearingReqState);
    const { confirmationModalOpen, hearing } = this.state;


    return (
      <ConfirmationModal
          disabled={hearingCancellationIsPending}
          confirmationType={CONFIRMATION_ACTION_TYPES.CANCEL}
          objectType={CONFIRMATION_OBJECT_TYPES.HEARING}
          onClose={this.closeConfirmationModal}
          open={confirmationModalOpen}
          confirmationAction={() => cancelFn(hearing)} />
    );
  }

  render() {
    const {
      maxHeight,
      rows,
      cancelFn,
      hearingsWithOutcomes,
      hearingNeighborsById
    } = this.props;
    let hearingCourtStringsCounts = Map();
    rows.forEach((hearing) => {
      const hearingCourtString = getHearingString(hearing);
      hearingCourtStringsCounts = hearingCourtStringsCounts.set(
        hearingCourtString,
        hearingCourtStringsCounts.get(hearingCourtString, 0) + 1
      );
    });

    return (
      <>
        <Table>
          <Headers />
          <Body maxHeight={maxHeight}>
            {rows.sort(sortHearingsByDate).valueSeq().map(((row) => {
              const {
                [PROPERTY_TYPES.CASE_ID]: hearingCaseId,
                [PROPERTY_TYPES.ENTITY_KEY_ID]: hearingEntityKeyId
              } = getEntityProperties(row, [
                PROPERTY_TYPES.CASE_ID,
                PROPERTY_TYPES.ENTITY_KEY_ID
              ]);
              const hearingCourtString = getHearingString(row);
              const hearingIsADuplicate = (hearingCourtStringsCounts.get(hearingCourtString) > 1);
              const hearingWasCreatedManually = isUUID(hearingCaseId);
              const hearingHasOutcome = hearingsWithOutcomes.includes(hearingEntityKeyId);
              const disabled = hearingHasOutcome || !hearingWasCreatedManually;
              const hearingHasOpenPSA = getIdOrValue(hearingNeighborsById
                .get(hearingEntityKeyId, Map()), PSA_SCORES, PROPERTY_TYPES.STATUS) === PSA_STATUSES.OPEN;
              return (
                <HearingRow
                    key={`${hearingEntityKeyId}-${hearingCourtString}-${hearingCaseId}`}
                    hearing={row}
                    openConfirmationModal={this.openConfirmationModal}
                    caseId={hearingCaseId}
                    isDuplicate={hearingIsADuplicate}
                    hasOpenPSA={hearingHasOpenPSA}
                    hasOutcome={hearingHasOutcome}
                    cancelFn={cancelFn}
                    disabled={disabled} />
              );
            }))}
          </Body>
        </Table>
        { this.renderConfirmationModal() }
      </>
    );
  }
}

export default HearingsTable;

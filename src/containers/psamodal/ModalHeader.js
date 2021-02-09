/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { Button } from 'lattice-ui-kit';
import { fromJS, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-duotone-svg-icons';

import NameCard from '../../components/psamodal/NameCard';
import PSAReportDownloadButton from '../../components/review/PSAReportDownloadButton';
import PSAStats from '../../components/review/PSAStats';
import PSAMetaData from '../../components/review/PSAMetaData';
import RCMBanner from '../../components/rcm/RCMBanner';
import { MetadataWrapper } from '../../utils/Layout';
import { CONTEXT } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { PSA_MODAL, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { BOOKING_CONDITIONS_LABELS } from '../../utils/consts/RCMResultsConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import { downloadPSAReviewPDF } from '../review/ReviewActions';

const {
  CONDITION_1,
  CONDITION_2,
  CONDITION_3
} = PROPERTY_TYPES;

const {
  RCM_COURT_CONDITIONS,
  RCM_RESULTS,
  RCM_RISK_FACTORS
} = APP_TYPES;

const conditionProperties = [CONDITION_1, CONDITION_2, CONDITION_3];

const { MUGSHOT, PICTURE } = PROPERTY_TYPES;

const ModalHeaderGrid = styled.div`
  margin-top: 15px;
  display: grid;
  grid-template-columns: 20% 80%;
`;

const Picture = styled.img`
  grid-row-start: 1;
  grid-row-end: 4;
  margin-right: 15px;
  max-width: 100%;
  border-radius: 3px;
`;

const PhotoWrapper = styled.div`
  grid-row-start: 1;
  grid-row-end: 4;
  align-items: center;
  background: ${OL.GREY05};
  display: flex;
  justify-content: center;
  margin: 15px;
  margin-left: 0;
  min-width: 100%;
  min-height: 235px;
  border-radius: 3px;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 30px 0;
`;

const NameSection = styled.div`
  grid-row-start: 1;
  grid-row-end: 2;
  grid-column-start: 2;
  grid-column-end: 3;
  display: flex;
  margin: 10px;
`;

const ScoreSection = styled(NameSection)`
  grid-row-start: 3;
  grid-row-end: 4;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
`;

const RCMSection = styled(NameSection)`
  grid-row-start: 2;
  grid-row-end: 3;
  margin-bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ScoresWrapper = styled.div`
  height: fit-content;
  display: flex;
  border: 1px solid lightgrey;
  border-radius: 3px;
  padding: 15px;
`;

type Props = {
  actions :{
    downloadPSAReviewPDF :RequestSequence;
  };
  closePSAFn :() => void,
  entitySetsByOrganization :Map<*, *>,
  person :Map<*, *>,
  psaNeighbors :Map<*, *>,
  psaPermissions :boolean,
  scores :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
};

class ModalHeader extends React.Component<Props> {

  renderPSAReportDownloadButton = () => {
    const {
      actions,
      psaNeighbors,
      scores,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    return (
      <PSAReportDownloadButton
          includesPretrialModule={includesPretrialModule}
          downloadFn={actions.downloadPSAReviewPDF}
          neighbors={psaNeighbors}
          scores={scores} />
    );
  }

  render() {
    const {
      closePSAFn,
      entitySetsByOrganization: entitySetIdsToAppType,
      person,
      psaNeighbors,
      psaPermissions,
      scores,
      selectedOrganizationSettings
    } = this.props;
    const {
      [MUGSHOT]: personMugshot,
      [PICTURE]: personPicture,
    } = getEntityProperties(person, [MUGSHOT, PICTURE]);
    const mugshot :string = personMugshot || personPicture;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const rcmRiskFactors = psaNeighbors.getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const { [PROPERTY_TYPES.CONTEXT]: psaContext } = getEntityProperties(rcmRiskFactors, [PROPERTY_TYPES.CONTEXT]);
    const psaIsBooking = psaContext === CONTEXT.BOOKING;
    const rcm = psaNeighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map());
    const legacyConditions = fromJS(conditionProperties.map((conditionField) => {
      const conditionFromRCM = rcm.getIn([conditionField, 0], '');
      return psaIsBooking
        ? { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS_LABELS[conditionFromRCM] }
        : { [PROPERTY_TYPES.TYPE]: conditionFromRCM };
    }).filter((conditionType) => conditionType[PROPERTY_TYPES.TYPE]));
    const rcmCourtConditions = psaNeighbors.getIn([RCM_COURT_CONDITIONS], legacyConditions);

    if (!scores) return null;
    const changeStatusText = psaIsClosed(scores) ? 'Change PSA Status' : 'Close PSA';

    return (
      <HeaderWrapper>
        <ModalHeaderGrid>
          {
            mugshot
              ? <Picture src={mugshot} alt="" />
              : (
                <PhotoWrapper>
                  <FontAwesomeIcon color={OL.GREY01} icon={faUser} size="7x" />
                </PhotoWrapper>
              )
          }
          <NameSection>
            <NameCard person={person} />
            {
              psaPermissions && includesPretrialModule
                ? (
                  <div>
                    <Button color="secondary" onClick={closePSAFn}>
                      {changeStatusText}
                    </Button>
                  </div>
                )
                : null
            }
          </NameSection>
          <RCMSection>
            RCM:
            <RCMBanner courtConditions={rcmCourtConditions} rcm={rcm} />
          </RCMSection>
          <ScoreSection>
            <ScoresWrapper>
              <PSAStats scores={scores} hideProfile downloadButton={this.renderPSAReportDownloadButton} />
            </ScoresWrapper>
            <MetadataWrapper>
              <PSAMetaData
                  entitySetIdsToAppType={entitySetIdsToAppType}
                  psaNeighbors={psaNeighbors}
                  scores={scores} />
            </MetadataWrapper>
          </ScoreSection>
        </ModalHeaderGrid>
      </HeaderWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const psaModal = state.get(STATE.PSA_MODAL);

  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  return {
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]),

    [PSA_MODAL.SCORES]: psaModal.get(PSA_MODAL.SCORES),
    [PSA_MODAL.LOADING_PSA_MODAL]: psaModal.get(PSA_MODAL.LOADING_PSA_MODAL),
    [PSA_MODAL.PSA_NEIGHBORS]: psaModal.get(PSA_MODAL.PSA_NEIGHBORS),
    [PSA_MODAL.PSA_PERMISSIONS]: psaModal.get(PSA_MODAL.PSA_PERMISSIONS),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Review Actions
    downloadPSAReviewPDF
  }, dispatch)
});
// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ModalHeader);

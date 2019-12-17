/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import StyledButton from '../../components/buttons/StyledButton';
import NameCard from '../../components/psamodal/NameCard';
import PSAReportDownloadButton from '../../components/review/PSAReportDownloadButton';
import PSAStats from '../../components/review/PSAStats';
import PSAMetaData from '../../components/review/PSAMetaData';
import closeX from '../../assets/svg/close-x-gray.svg';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { PSA_MODAL } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import { downloadPSAReviewPDF } from '../review/ReviewActions';

const CloseXContainer = styled.div`
  position: fixed;
  transform: translateX(860px) translateY(-10px);
`;

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 30px 0;
`;

const MainHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 30px 15px;
`;

const ScoresSection = styled.div`
  padding: 15px;
  border: 1px solid lightgrey;
  border-radius: 3px;
  margin: 0 15px;
`;

const ClosePSAButton = styled(StyledButton)`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: ${OL.PURPLE02};
  width: 196px;
  height: 40px;
  border: none;
  border-radius: 3px;
  background-color: ${OL.PURPLE06};
`;

const CloseModalX = styled.img.attrs({
  alt: '',
  src: closeX
})`
  height: 16px;
  width: 16px;
  margin-left: 40px;
  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  psaNeighbors :Map<*, *>,
  psaPermissions :boolean,
  scores :Map<*, *>,
  entitySetsByOrganization :Map<*, *>,
  person :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
  actions :{
  }
};

class ModalHeader extends React.Component<Props, State> {

  renderPersonInfo = () => {
    const { person } = this.props;
    return <NameCard person={person} />;
  }

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

  renderMetadata = () => {
    const {
      entitySetsByOrganization: entitySetIdsToAppType,
      psaNeighbors,
      scores
    } = this.props;
    return (
      <PSAMetaData
          entitySetIdsToAppType={entitySetIdsToAppType}
          psaNeighbors={psaNeighbors}
          scores={scores} />
    );
  }

  render() {
    const {
      scores,
      psaPermissions,
      closePSAFn,
      onClose
    } = this.props;

    if (!scores) return null;
    const changeStatusText = psaIsClosed(scores) ? 'Change PSA Status' : 'Close PSA';

    return (
      <HeaderWrapper>
        <CloseXContainer><CloseModalX onClick={onClose} /></CloseXContainer>
        <MainHeader>
          { this.renderPersonInfo() }
          { psaPermissions
            ? (
              <ClosePSAButton onClick={closePSAFn}>
                {changeStatusText}
              </ClosePSAButton>
            )
            : null
          }
        </MainHeader>
        <ScoresSection>
          <PSAStats scores={scores} hideProfile downloadButton={this.renderPSAReportDownloadButton} />
        </ScoresSection>
        {this.renderMetadata()}
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

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  actions.downloadPSAReviewPDF = downloadPSAReviewPDF;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalHeader);

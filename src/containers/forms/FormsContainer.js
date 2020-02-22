/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { faUserFriends, faFilePlus } from '@fortawesome/pro-duotone-svg-icons';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import CreateFormListItem from '../../components/dashboard/CreateFormListItem';
import { OL } from '../../utils/consts/Colors';
import { getJurisdiction } from '../../utils/AppUtils';
import { CONTEXT } from '../../utils/consts/Consts';
import { CONTEXTS, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { StyledFormWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as Routes from '../../core/router/Routes';

const { BOOKING } = CONTEXT;

const FormsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => (props.threeButtons ? 3 : 2)}, 1fr);
  column-gap: 30px;
  height: 100%;
`;

const SubText = styled.div`
  color: ${OL.GREY03};
  font-size: 16px;
  line-height: 19px;
  margin-bottom: 30px;
  max-width: 800px;
}
`;

class FormsContainer extends React.Component<Props, *> {

  getPSAPath = (context) => `${Routes.PSA_FORM_BASE}/${context}`;

  render() {
    const { selectedOrganizationTitle, selectedOrganizationId, selectedOrganizationSettings } = this.props;
    // TODO: This is yucky. We will want to rework once we phase out different contexts for different orgs.
    const jurisdiction = getJurisdiction(selectedOrganizationId);
    const includeBooking = selectedOrganizationSettings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], false);
    const includeCourt = selectedOrganizationSettings.getIn([SETTINGS.CONTEXTS, CONTEXTS.COURT], false);
    return (
      <StyledFormWrapper>
        <DashboardMainSection header={`${selectedOrganizationTitle} - Public Safety Assessment`}>
          <SubText>
            The PSA uses nine factors to predict a person’s likelihood of success while on pretrial release.
            The factors include the person’s current age, prior convictions, pending charges,
            and prior failures to appear in court pretrial. The PSA generates a score ranging
            from 1 to 6 on two separate scales – new criminal activity (i.e., arrest) and failure to appear in court.
            The assessment may also generate a flag to indicate whether a person presents an
            elevated likelihood of being arrested for a new violent crime if released during the pretrial period.
          </SubText>
          {
            jurisdiction
              ? (
                <FormsWrapper threeButtons={includeBooking && includeCourt}>
                  {
                    includeBooking && (
                      <CreateFormListItem
                          name="New PSA (Booking)"
                          path={this.getPSAPath(BOOKING)}
                          icon={faFilePlus} />
                    )
                  }
                  {
                    includeCourt && (
                      <CreateFormListItem
                          name="New PSA"
                          path={this.getPSAPath(jurisdiction)}
                          icon={faFilePlus} />
                    )
                  }
                  <CreateFormListItem
                      name="Search People"
                      path={Routes.REVIEW_REPORTS}
                      icon={faUserFriends} />
                </FormsWrapper>
              )
              : null
          }
        </DashboardMainSection>
      </StyledFormWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);

  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
  };
}

export default connect(mapStateToProps, null)(FormsContainer);

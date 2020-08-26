/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import {
  Badge,
  Card,
  CardSegment,
  SearchInput
} from 'lattice-ui-kit';

import EnrollStatusBanner from '../../components/enroll/EnrollStatusBanner';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import LogoLoader from '../../components/LogoLoader';
import RemindersTable from '../../components/reminders/RemindersTable';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityKeyId } from '../../utils/DataUtils';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Wrapper
} from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { MANUAL_REMINDERS_DATA } from '../../utils/consts/redux/ManualRemindersConsts';
import { REMINDERS_ACTIONS, REMINDERS_DATA } from '../../utils/consts/redux/RemindersConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import {
  loadManualRemindersNeighborsById,
  LOAD_MANUAL_REMINDERS_NEIGHBORS
} from '../manualreminders/ManualRemindersActions';
import { loadReminderNeighborsById } from '../reminders/RemindersActionFactory';

const StyledCard = styled(Card)`
  margin-bottom: 30px;
`;

const StyledCardSegment = styled(CardSegment)`
  justify-content: space-between;
`;

const RemindersTableTitle = styled.div`
  display: flex;
  height: min-content;
  margin: auto 0;
`;

const TableTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
  margin-right: 10px;
  ${(props :Object) => (
    props.grid
      ? (
        `display: grid;
         grid-template-columns: 75% 25%;
         margin-bottom: 20px;`
      ) : ''
  )}
`;

const {
  CONTACT_INFORMATION,
  REMINDERS,
  MANUAL_REMINDERS,
  SUBSCRIPTION
} = APP_TYPES;

type Props = {
  actions :{
    loadReminderNeighborsById :RequestSequence;
    loadManualRemindersNeighborsById :RequestSequence;
  };
  loading :boolean;
  neighbors :Map;
  loadReminderNeighborsByIdReqState :RequestState;
  loadManualRemindersNeighborsRS :RequestState;
  manualReminderNeighborsById :Map;
  readOnlyPermissions :boolean;
  reminderNeighborsById :Map;
  selectedPersonData :Map;
  settings :Map
}

type State = {
  contactInfo :Map;
  manualRemindersById :Map;
  personVoiceProfile :Map;
  remindersById :Map;
  searchQuery :string;
  subscription :Map;
}

const getEnitysById = (neighbors, appType) => Map().withMutations((mutableMap) => {
  neighbors.get(appType, List()).forEach((reminder) => {
    const reminderEKID = getEntityKeyId(reminder);
    mutableMap.set(reminderEKID, reminder);
  });
});

class PersonPrograms extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      contactInfo: Map(),
      manualRemindersById: Map(),
      personVoiceProfile: Map(),
      remindersById: Map(),
      searchQuery: '',
      subscription: Map()
    };
  }

  updateSearchQuery = (event :SyntheticInputEvent<*>) => this.setState({
    searchQuery: event.target.value
  });

  componentDidMount() {
    const { actions, neighbors } = this.props;
    const contactInfo = neighbors.get(CONTACT_INFORMATION, List());
    const manualRemindersById = getEnitysById(neighbors, MANUAL_REMINDERS);
    const remindersById = getEnitysById(neighbors, REMINDERS);
    const subscription = neighbors.getIn([SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], Map());
    const personVoiceProfile = neighbors.getIn([SPEAKER_RECOGNITION_PROFILES, PSA_NEIGHBOR.DETAILS], Map());
    this.setState({
      contactInfo,
      manualRemindersById,
      personVoiceProfile,
      remindersById,
      subscription
    });
    actions.loadReminderNeighborsById({ reminderIds: remindersById.keySeq().toJS() });
    actions.loadManualRemindersNeighborsById({ manualReminderIds: manualRemindersById.keySeq().toJS() });
  }

  render() {
    const {
      loading,
      loadReminderNeighborsByIdReqState,
      loadManualRemindersNeighborsRS,
      manualReminderNeighborsById,
      readOnlyPermissions,
      reminderNeighborsById,
      selectedPersonData,
      settings
    } = this.props;
    const {
      contactInfo,
      manualRemindersById,
      personVoiceProfile,
      remindersById,
      searchQuery,
      subscription
    } = this.state;
    const settingsIncludeVoiceEnroll = settings.get(SETTINGS.ENROLL_VOICE, false);
    const courtRemindersEnabled = settings.get(SETTINGS.COURT_REMINDERS, false);

    const remindersAreLoading :boolean = requestIsPending(loadReminderNeighborsByIdReqState)
      || requestIsPending(loadManualRemindersNeighborsRS);

    if (loading) {
      return <LogoLoader loadingText="Loading Person Details..." />;
    }
    return (
      <Wrapper>
        <StyledColumn>
          {
            courtRemindersEnabled
            && (
              <>
                <SubscriptionInfo
                    readOnly={readOnlyPermissions}
                    subscription={subscription}
                    contactInfo={contactInfo}
                    person={selectedPersonData} />
                <StyledCard>
                  <StyledCardSegment>
                    <RemindersTableTitle>
                      <TableTitle>Reminders History</TableTitle>
                      <Badge count={manualRemindersById.size + remindersById.size} />
                    </RemindersTableTitle>
                    <SearchInput onChange={this.updateSearchQuery} />
                  </StyledCardSegment>
                  <RemindersTable
                      noNames
                      isLoading={remindersAreLoading}
                      manualReminders={manualRemindersById}
                      manualRemindersNeighbors={manualReminderNeighborsById}
                      reminders={remindersById}
                      remindersNeighbors={reminderNeighborsById}
                      searchQuery={searchQuery} />
                </StyledCard>
              </>
            )
          }
          {/* {
            settingsIncludeVoiceEnroll
              && (
                <StyledColumnRowWrapper>
                  <StyledColumnRow withPadding>
                    <EnrollStatusBanner person={selectedPersonData} personVoiceProfile={personVoiceProfile} />
                  </StyledColumnRow>
                </StyledColumnRowWrapper>
              )
          } */}
        </StyledColumn>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const reminders = state.get(STATE.REMINDERS);
  const manualReminders = state.get(STATE.MANUAL_REMINDERS);
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());

  return {
    settings,

    // Reminders Request States
    loadReminderNeighborsByIdReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS),

    // Reminders Data
    [REMINDERS_DATA.REMINDER_NEIGHBORS]: reminders.get(REMINDERS_DATA.REMINDER_NEIGHBORS),

    // Manual Reminders
    loadManualRemindersNeighborsRS: getReqState(manualReminders, LOAD_MANUAL_REMINDERS_NEIGHBORS),
    [MANUAL_REMINDERS_DATA.REMINDER_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS_DATA.REMINDER_NEIGHBORS),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    loadManualRemindersNeighborsById,
    loadReminderNeighborsById
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PersonPrograms);

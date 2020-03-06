/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CardSegment, MinusButton, PlusButton } from 'lattice-ui-kit';

import BookingHoldSection from './BookingHoldSection';
import HoldExceptions from './HoldExceptions';
import ReleaseExceptions from './ReleaseExceptions';
import LevelColorsSection from './LevelColorsSection';
import ReleaseConditionsTable from '../../components/settings/ConditionsTable';
import ReleaseTypeTable from '../../components/settings/ReleaseTypeTable';
import ToggleButtons from '../../components/buttons/ToggleButtons';
import RCMMatrix from '../../components/rcm/RCMMatrix';
import { InstructionalText, InstructionalSubText } from '../../components/TextStyledComponents';
import { HeaderSection } from '../../components/settings/SettingsStyledComponents';
import { THEMES } from '../../utils/consts/RCMResultsConsts';
import {
  getRCMSettings,
  getRCMConditions,
  getRCMMatrix,
  getRCMLevels,
  getActiveRCMLevels
} from '../../utils/RCMUtils';
import {
  SETTINGS,
  CONTEXTS,
  CONTEXT_OPTIONS,
  RCM,
  RCM_DATA
} from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import { submitSettings, updateSetting } from '../settings/SettingsActions';

const BookingHeader = styled(InstructionalSubText)`
  margin-top: 15px;
`;

type Props = {
  actions :{
    submitSettings :RequestSequence;
    updateSetting :RequestSequence;
  };
  bookingView :boolean;
  editing :boolean;
  setRCMView :() => void;
  settings :Object;
  selectedOrganizationTitle :string;
};


class RCMSettings extends React.Component<Props> {

  getLevels = (all ?:boolean) => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    const levels = getRCMLevels(rcmSettings).toJS();
    if (all) return levels;
    return getActiveRCMLevels(rcmSettings).toJS();
  }

  getConditions = () => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    return getRCMConditions(rcmSettings).toJS();
  }

  getMatrix = () => {
    const { settings } = this.props;
    const rcmSettings = getRCMSettings(settings);
    return getRCMMatrix(rcmSettings).toJS();
  }

  getColorTheme = () => {
    const { settings } = this.props;
    return settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.CLASSIC);
  }

  isReadyToSubmit = () => {
    const levels = this.getLevels();
    const conditions = this.getConditions();
    return fromJS(levels)
      .keySeq().every((level) => fromJS(conditions).valueSeq().some((condition) => condition.get(level, false)));
  }

  getCellInfo = (ncaScore :number, ftaScore :number) => {
    const matrix = this.getMatrix();
    return matrix[ncaScore][ftaScore];
  }

  changeConditionLevel = (ncaScore :number, ftaScore :number) => {
    const { actions, editing } = this.props;
    const matrix = this.getMatrix();
    const levels = this.getLevels();
    const cellInfo = this.getCellInfo(ncaScore, ftaScore);
    if (editing && cellInfo) {
      const currentLevel = cellInfo[RCM_DATA.LEVEL];
      const nextLevel = (levels[currentLevel + 1] && levels[currentLevel + 1].active) ? currentLevel + 1 : 1;
      matrix[ncaScore][ftaScore][RCM_DATA.LEVEL] = nextLevel;
      actions.updateSetting({ path: [SETTINGS.RCM, RCM.MATRIX], value: fromJS(matrix) });
    }
  }

  addLevel = () => {
    const { actions } = this.props;
    const levels = this.getLevels();
    const nextLevel = Object.keys(levels).length + 1;
    if (nextLevel <= 6) {
      actions.updateSetting({ path: [SETTINGS.RCM, RCM.LEVELS, `${nextLevel}`, RCM_DATA.ACTIVE], value: true });
    }
  }

  removeLevel = () => {
    const { actions } = this.props;
    const allLevels = this.getLevels(true);
    const activeLevels = this.getLevels();
    const matrix = this.getMatrix();
    const conditions = this.getConditions();
    const lastLevel = Object.keys(activeLevels).length;
    const colorTheme = this.getColorTheme();
    if (lastLevel > 3) {
      allLevels[lastLevel][RCM_DATA.ACTIVE] = false;
      const nextConditions = Map().withMutations((mutableMap) => {
        Object.values(conditions).forEach((condition :Object) => {
          if (condition.description) {
            const nextCondition = condition;
            nextCondition[lastLevel] = false;
            mutableMap.set(condition.description, fromJS(nextCondition));
          }
        });
      });
      for (let ftaScore = 1; ftaScore <= 6; ftaScore += 1) {
        for (let ncaScore = 1; ncaScore <= 6; ncaScore += 1) {
          if (matrix[ftaScore][ncaScore]) {
            const currentLevel = matrix[ftaScore][ncaScore][RCM_DATA.LEVEL];
            if (currentLevel === lastLevel) {
              matrix[ftaScore][ncaScore][RCM_DATA.LEVEL] = lastLevel - 1;
            }
          }
        }
      }
      const nextRCM = fromJS({
        [RCM.CONDITIONS]: nextConditions,
        [RCM.MATRIX]: matrix,
        [RCM.LEVELS]: allLevels,
        [RCM.THEME]: colorTheme,
      });
      actions.updateSetting({ path: [SETTINGS.RCM], value: nextRCM });
    }
  }

  includesBookingContext = () => {
    const { settings } = this.props;
    return settings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], false);
  }

  renderHeader = () => {
    const { bookingView, editing, setRCMView } = this.props;
    const includesBookingContext = this.includesBookingContext();
    const selectedValue :Object = bookingView ? CONTEXT_OPTIONS[1] : CONTEXT_OPTIONS[0];
    const numOfActiveLevels = Object.values(this.getLevels()).length;
    return (
      <CardSegment>
        <HeaderSection>
          {
            (includesBookingContext)
              ? (
                <ToggleButtons
                    options={CONTEXT_OPTIONS}
                    selectedOption={selectedValue.value}
                    onSelect={setRCMView} />
              ) : null
          }
        </HeaderSection>
        <HeaderSection>
          <div>
            {
              editing
                ? (
                  <>
                    <PlusButton
                        mode="positive"
                        disabled={numOfActiveLevels === 6}
                        onClick={this.addLevel}>
                        Level
                    </PlusButton>
                    <MinusButton
                        mode="negative"
                        disabled={numOfActiveLevels === 3}
                        onClick={this.removeLevel}>
                        Level
                    </MinusButton>
                  </>
                )
                : <div />
            }
          </div>
        </HeaderSection>
      </CardSegment>
    );
  }

  render() {
    const {
      actions,
      bookingView,
      editing,
      settings,
      selectedOrganizationTitle
    } = this.props;
    const includesBookingContext = this.includesBookingContext();
    const includeSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);
    const levels = this.getLevels();
    const conditions = this.getConditions();
    const conditionValues = Object.values(conditions).map((condition, idx) => {
      const mappedCondition :Object = condition;
      mappedCondition.id = idx;
      return mappedCondition;
    });
    if (editing) conditionValues.push({ id: 'emptyOption' });
    return (
      <>
        <InstructionalText>{`${selectedOrganizationTitle}'s Release Conditions Matrix`}</InstructionalText>
        <InstructionalSubText>
          Each grid lists the six possible scores of the PSA’s New Criminal Activity (NCA)
          scale in the (vertical) columns and the six possible scores of the Failure to Appear
          (FTA) scale in the (horizontal) rows, resulting in 36 cells. Because the PSA’s nine
          risk factors combine in different ways to yield the scores on the two scales, certain
          score combinations are not possible.
        </InstructionalSubText>
        {this.renderHeader()}
        <RCMMatrix bookingView={bookingView} changeConditionLevel={this.changeConditionLevel} disabled={!editing} />
        <CardSegment>
          <LevelColorsSection
              editing={editing}
              levels={levels}
              settings={settings}
              updateSetting={actions.updateSetting} />
        </CardSegment>
        {
          includesBookingContext && bookingView
            ? <CardSegment><BookingHoldSection editing={editing} levels={levels} /></CardSegment> : null
        }
        {
          includesBookingContext && includeSecondaryBookingCharges && bookingView
            ? (
              <>
                <BookingHeader>
                  Booking Hold Exceptions will be considered for selected levels:
                </BookingHeader>
                <CardSegment>
                  <HoldExceptions editing={editing} levels={levels} />
                </CardSegment>
              </>
            ) : null
        }
        {
          includesBookingContext && includeSecondaryBookingCharges && bookingView
            ? (
              <>
                <BookingHeader>
                  Booking Release Exceptions will be considered for selected levels:
                </BookingHeader>
                <CardSegment>
                  <ReleaseExceptions editing={editing} levels={levels} />
                </CardSegment>
              </>
            ) : null
        }
        {
          !bookingView
            ? (
              <ReleaseTypeTable
                  includesBookingContext={includesBookingContext}
                  editing={editing}
                  levels={levels} />
            ) : null
        }
        {
          (!bookingView)
            ? (
              <ReleaseConditionsTable
                  editing={editing}
                  conditions={conditionValues}
                  levels={levels} />
            ) : null
        }
      </>
    );
  }
}


function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());

  return {
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    settings
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    submitSettings,
    updateSetting
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(RCMSettings);

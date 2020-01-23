/*
 * @flow
 */

import React from 'react';
import { fromJS, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CardSegment, MinusButton, PlusButton } from 'lattice-ui-kit';

import BookingHoldSection from './BookingHoldSection';
import LevelColorsSection from './LevelColorsSection';
import ReleaseConditionsTable from '../../components/settings/ConditionsTable';
import ReleaseTypeTable from '../../components/settings/ReleaseTypeTable';
import ToggleButtons from '../../components/buttons/ToggleButtons';
import RCMMatrix from '../../components/rcm/RCMMatrix';
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
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import { submitSettings, updateSetting } from '../settings/SettingsActions';

type Props = {
  editing :boolean,
  settings :Object,
  actions :{
    submitSettings :RequestSequence;
    updateSetting :RequestSequence;
  };
};

class RCMSettings extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      bookingView: false
    };
  }

  getLevels = (all) => {
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

  getCellInfo = (ncaScore, ftaScore) => {
    const matrix = this.getMatrix();
    return matrix[ncaScore][ftaScore];
  }

  changeConditionLevel = (ncaScore, ftaScore) => {
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
        Object.values(conditions).forEach((condition) => {
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
    const { editing } = this.props;
    const { bookingView } = this.state;
    const includesBookingContext = this.includesBookingContext();
    const selectedValue = bookingView ? CONTEXT_OPTIONS[1] : CONTEXT_OPTIONS[0];
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
                    onSelect={(value) => {
                      this.setState({ bookingView: value === CONTEXTS.BOOKING });
                    }} />
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
    const { actions, editing, settings } = this.props;
    const { bookingView } = this.state;
    const includesBookingContext = this.includesBookingContext();
    const levels = this.getLevels();
    const conditions = this.getConditions();
    const conditionValues = Object.values(conditions).map((condition, idx) => {
      const mappedCondition = condition;
      mappedCondition.id = idx;
      return mappedCondition;
    });
    if (editing) conditionValues.push({ id: 'emptyOption' });
    return (
      <>
        {this.renderHeader()}
        <RCMMatrix bookingView={bookingView} changeConditionLevel={this.changeConditionLevel} />
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
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  return {
    settings
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    submitSettings,
    updateSetting
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RCMSettings);

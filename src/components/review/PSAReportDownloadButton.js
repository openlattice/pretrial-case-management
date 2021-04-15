/*
 * @flow
 */

import React, {
  useReducer,
  useRef,
} from 'react';

import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, getIn } from 'immutable';
// $FlowFixMe
import { Button, Menu, MenuItem } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import { downloadPSAReviewPDF } from '../../containers/review/ReviewActions';
import { CONTEXTS, MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';

const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE :{|
  deleteOpen :boolean;
  detailsOpen :boolean;
  menuOpen :boolean;
|} = {
  deleteOpen: false,
  detailsOpen: false,
  menuOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    default:
      return state;
  }
};

const PSAReportDownloadButton = ({
  neighbors,
  scores
} :{|
  neighbors :Map;
  scores :Map;
|}) => {

  const dispatch = useDispatch();

  const [state, stateDispatch] = useReducer(reducer, INITIAL_STATE);

  const includesPretrialModule = useSelector((store) => getIn(store, [
    STATE.SETTINGS,
    SETTINGS_DATA.APP_SETTINGS,
    SETTINGS.MODULES,
    MODULE.PRETRIAL
  ], false));

  const includesBookingContext = useSelector((store) => getIn(store, [
    STATE.SETTINGS,
    SETTINGS_DATA.APP_SETTINGS,
    SETTINGS.CONTEXTS,
    CONTEXTS.BOOKING
  ], false));

  const includesCourtContext = useSelector((store) => getIn(store, [
    STATE.SETTINGS,
    SETTINGS_DATA.APP_SETTINGS,
    SETTINGS.CONTEXTS,
    CONTEXTS.COURT
  ], false));

  const anchorRef = useRef(null);
  const endIcon = <FontAwesomeIcon icon={faChevronDown} />;

  const downlaodReport = (isCompact :boolean, isBooking :boolean) => {
    dispatch(
      downloadPSAReviewPDF({
        neighbors,
        scores,
        isCompact,
        isBooking
      })
    );
  };

  const handleOpenMenu = () => {
    stateDispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleSelectCompactCourt = () => {
    downlaodReport(true, false);
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleSelectCompactBooking = () => {
    downlaodReport(true, true);
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleSelectFullCourt = () => {
    downlaodReport(false, false);
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleSelectFullBooking = () => {
    downlaodReport(false, true);
    stateDispatch({ type: CLOSE_MENU });
  };

  return (
    <>
      <Button
          aria-controls={state.menuOpen ? 'pdf-report-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="pdf report download button"
          onClick={handleOpenMenu}
          ref={anchorRef}
          endIcon={endIcon}>
        PDF Report
      </Button>
      <Menu
          anchorEl={anchorRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="pdf-report-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        {
          includesCourtContext && (
            <>
              <MenuItem onClick={handleSelectCompactCourt}>
                Compact Report (Court)
              </MenuItem>
              {
                includesPretrialModule && (
                  <MenuItem onClick={handleSelectFullCourt}>
                    Full Report (Court)
                  </MenuItem>
                )
              }
            </>
          )
        }
        {
          includesBookingContext && (
            <>
              <MenuItem onClick={handleSelectCompactBooking}>
                Compact Report (Booking)
              </MenuItem>
              {
                includesPretrialModule && (
                  <MenuItem onClick={handleSelectFullBooking}>
                    Full Report (Booking)
                  </MenuItem>
                )
              }
            </>
          )
        }
      </Menu>
    </>
  );
};

export default PSAReportDownloadButton;

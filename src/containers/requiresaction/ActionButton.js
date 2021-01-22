/*
 * @flow
 */

import React, { useEffect, useReducer, useRef } from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import ClosePSAModal from '../../components/review/ClosePSAModal';
import PSAModal from '../psamodal/PSAModal';
import * as Routes from '../../core/router/Routes';
import { goToPath } from '../../core/router/RoutingActions';
import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import { loadCaseHistory } from '../review/ReviewActions';

const CLOSE_CLOSE_PSA_MODAL = 'CLOSE_CLOSE_PSA_MODAL';
const CLOSE_MENU = 'CLOSE_MENU';
const CLOSE_PSA_MODAL = 'CLOSE_PSA_MODAL';
const OPEN_CLOSE_PSA_MODAL = 'OPEN_CLOSE_PSA_MODAL';
const OPEN_MENU = 'OPEN_MENU';
const OPEN_PSA_MODAL = 'OPEN_PSA_MODAL';

const INITIAL_STATE = {
  psaModalOpen: false,
  closePSAModalOpen: false,
  menuOpen: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_CLOSE_PSA_MODAL:
      return {
        ...state,
        closePSAModalOpen: false,
      };
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case CLOSE_PSA_MODAL:
      return {
        ...state,
        psaModalOpen: false,
        closePSAModalOpen: false,
      };
    case OPEN_CLOSE_PSA_MODAL:
      return {
        ...state,
        menuOpen: false,
        closePSAModalOpen: true,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    case OPEN_PSA_MODAL:
      return {
        ...state,
        menuOpen: false,
        psaModalOpen: true,
      };
    default:
      return state;
  }
};

const ActionButton = ({
  personEKID,
  psaEKID,
  psaNeighbors,
  scores
} :{|
  personEKID :UUID;
  psaEKID :UUID;
  psaNeighbors :Map;
  scores :Map;
|}) => {
  const dispatcher = useDispatch();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const anchorRef = useRef(null);

  useEffect(() => {
    if (state.psaModalOpen) {
      const loadCaseHistoryCallback = () => dispatcher(loadCaseHistory({ personEKID, neighbors: psaNeighbors }));
      dispatcher(loadPSAModal({ psaId: psaEKID, callback: loadCaseHistoryCallback }));
    }
  }, [dispatcher, personEKID, psaEKID, psaNeighbors, state]);

  const goToPersonProfile = () => {
    dispatcher(
      goToPath(Routes.PERSON_DETAILS.replace(Routes.PERSON_EKID, personEKID))
    );
  };

  const handleOpenMenu = () => {
    dispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    dispatch({ type: CLOSE_MENU });
  };

  const handleOpenPSAModal = () => {
    dispatch({ type: OPEN_PSA_MODAL });
  };

  const handleClosePSAModal = () => {
    dispatch({ type: CLOSE_PSA_MODAL });
  };

  const handleOpenClosePSAModal = () => {
    dispatch({ type: OPEN_CLOSE_PSA_MODAL });
  };

  const handleCloseClosePSAModal = () => {
    dispatch({ type: CLOSE_CLOSE_PSA_MODAL });
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'psa-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="psa action button"
          onClick={handleOpenMenu}
          ref={anchorRef}
          variant="text">
        <FontAwesomeIcon fixedWidth icon={faEllipsisV} />
      </IconButton>
      <Menu
          anchorEl={anchorRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="psa-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>

        <MenuItem onClick={handleOpenPSAModal}>
          Open PSA Details
        </MenuItem>
        <MenuItem onClick={handleOpenClosePSAModal}>
          Update PSA Status
        </MenuItem>
        <MenuItem onClick={goToPersonProfile}>
          Go To Profile
        </MenuItem>
      </Menu>
      <PSAModal
          entityKeyId={psaEKID}
          onClose={handleClosePSAModal}
          open={state.psaModalOpen}
          scores={scores} />
      <ClosePSAModal
          entityKeyId={psaEKID}
          onClose={handleCloseClosePSAModal}
          onSubmit={handleCloseClosePSAModal}
          open={state.closePSAModalOpen}
          scores={scores} />
    </>
  );
};

export default ActionButton;

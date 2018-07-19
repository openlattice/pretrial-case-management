import * as OverrideClassNames from './OverrideClassNames';

export const globals = {
  [`.${OverrideClassNames.NAV_TABS}`]: {
    display: 'flex',
    'justify-content': 'center'
  },
  [`.${OverrideClassNames.PSA_REVIEW_MODAL}`]: {
    'min-width': '1000px'
  },
  [`.${OverrideClassNames.MODAL_CONTENT}`]: {
    'border-radius': '5px',
    'background-color': '#ffffff',
    'box-shadow': '0 10px 20px 0 rgba(0, 0, 0, 0.1)',
    border: 'none'
  },
  [`.${OverrideClassNames.MODAL_HEADER}`]: {
    display: 'block'
  },
  [`.${OverrideClassNames.DATE_PICKER_SELECTED}`]: {
    'background-color': '#e4d8ff !important',
    border: 'solid 1px #6124e2'
  },
  [`.${OverrideClassNames.DATE_TIME_PICKER_SELECTED}`]: {
    'background-color': '#e4d8ff !important',
    border: 'solid 1px #6124e2',
    color: '#555e6f !important'
  },
  [`.${OverrideClassNames.rdtDay}:hover`]: {
    'background-color': '#f0f0f7'
  },
  [`.${OverrideClassNames.MODAL_BACKDROP}`]: {
    opacity: '0.3'
  }
};

import * as OverrideClassNames from './OverrideClassNames';

export const globals = {
  [`.${OverrideClassNames.NAV_TABS}`]: {
    'justify-content': 'center'
  },
  [`.${OverrideClassNames.PSA_REVIEW_MODAL}`]: {
    'min-width': '1000px'
  },
  [`.${OverrideClassNames.MODAL_HEADER}`]: {
    display: 'block'
  }
};

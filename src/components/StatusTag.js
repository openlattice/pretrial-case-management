
import styled from 'styled-components';

import { OL, STATUS } from '../utils/consts/Colors';
import { PSA_STATUSES } from '../utils/consts/Consts';

export default styled.div`
  width: 86px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: bold;
  color: ${OL.WHITE};
  border-radius: 3px;
  align-self: center;
  padding: 2px 5px;
  background:
    ${(props) => {
    switch (props.status) {
      case PSA_STATUSES.OPEN:
        return STATUS.OPEN;
      case PSA_STATUSES.SUCCESS:
        return STATUS.SUCCESS;
      case PSA_STATUSES.FAILURE:
        return STATUS.FAILURE;
      case PSA_STATUSES.CANCELLED:
        return STATUS.CANCELLED;
      case PSA_STATUSES.DECLINED:
        return STATUS.DECLINED;
      case PSA_STATUSES.DISMISSED:
        return STATUS.DISMISSED;
      default:
        return 'transparent';
    }
  }};
`;

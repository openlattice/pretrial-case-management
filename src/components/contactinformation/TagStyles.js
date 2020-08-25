// @flow
import { css } from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const uncheckedBase = css`
  background-color: ${OL.GREY10};
  border-color: ${OL.GREY10};
  color: ${OL.GREY02};
`;

const uncheckedHover = css`
  background-color: ${OL.GREY08};
  border-color: ${OL.GREY08};
  color: ${OL.GREY02};
`;

const checkedBase = css`
  background-color: ${OL.GREY05};
  border-color: ${OL.GREY05};
  color: ${OL.GREY02};
`;

const checkedHover = css`
  background-color: ${OL.GREY03};
  border-color: ${OL.GREY03};
  color: white;
`;

export {
  checkedBase,
  checkedHover,
  uncheckedBase,
  uncheckedHover,
};

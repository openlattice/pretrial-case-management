import styled, { css } from 'styled-components';
import Select from 'react-select';

export const selectStyles = css`
  width: 100%;

  .lattice-select__control {
    width: 100%;
    min-height: 44px;
    border-radius: 5px;
    border: none;
    background-color: transparent;
    margin-top: 10px;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    text-align: left;
    color: #2e2e34;
    box-shadow: none;
    padding-right: 10%;

    svg {
      height: 11px;
      padding: 0px;
    }
  }

  .lattice-select__value-container {
    width: auto;
  }

  .lattice-select__group-heading {
    padding-top: 14px;
    border-top: solid 1px #e1e1eb;
  }

  .lattice-select__menu {
    transform: translateX(-20%);
    width: 100%;
    text-align: left;
  }

  .lattice-select__indicator {
    padding: 0px;
  }

  .lattice-select__control.lattice-select__control-is-focused {
    box-shadow: 0 0 0 0px;
    background-color: #fff;
  }

  .lattice-select__option {
    color: #555e6f;
    font-size: 14px;
    line-height: 19px;

    :active {
      background-color: #e6e6f7;
    }
  }

  .lattice-select__option--is-focused {
    background-color: #f0f0f7;
  }

  .lattice-select__option--is-selected {
    background-color: #e6e6f7;;
    color: #2e2e34;
  }

  .lattice-select__single-value {
    color: #2e2e34;
    font-size: 14px;
    line-height: 19px;
  }

  .lattice-select__indicator-separator {
    display: none;
  }
`;

const StyledSelect = styled(Select)`
  ${selectStyles}
`;

export default StyledSelect;

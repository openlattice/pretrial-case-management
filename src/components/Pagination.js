/*
 * @flow
 */

import React from 'react';

import leftArrow from '../assets/svg/left-arrow-dark.svg';
import rightArrow from '../assets/svg/right-arrow-dark.svg';

type Props = {
  onChangePage :() => void,
  numPages :number,
  activePage :number
}

// pagination start page is START_PAGE
const START_PAGE = 1;
// only MAX_PAGE_DISPLAY pages are displayed in the pagination controls.
const MAX_PAGE_DISPLAY = 5;
// if the active page is less than SHIFT_THRESHOLD,
// the pages displayed in the pagination controls does not shift.
const SHIFT_THRESHOLD = 4;

const Pagination = (props :Props) => {

  const { numPages } = props;
  const { activePage } = props;
  const { onChangePage } = props;

  if (!numPages || numPages <= 1) {
    return null;
  }
  // `pages` is an array that controls which pages are displayed in the pagination controls
  let pages;
  let start = START_PAGE;
  let end;
  // If the page count is less than the MAX_PAGE_DISPLAY,
  // the page count (numPages) will control `pages`.
  if (numPages <= MAX_PAGE_DISPLAY) {
    pages = [...Array(numPages).keys()].map(v => start + v);
  }
  // If the page count is greater than the MAX_PAGE_DISPLAY and the active page is less than 4,
  // `pages` does not shift.
  else if (activePage < SHIFT_THRESHOLD) {
    end = MAX_PAGE_DISPLAY;
    pages = [...Array(1 + (end - start)).keys()].map(v => start + v);
  }
  // If the page count is greater than the MAX_PAGE_DISPLAY and the active page is greater than 4,
  // `pages` shifts based on an offset from the current page. The offset is half of the MAX_PAGE_DISPLAY.
  else {
    start = activePage - Math.floor(MAX_PAGE_DISPLAY / 2);
    end = activePage + Math.floor(MAX_PAGE_DISPLAY / 2);
    // if the last page number is displayed, `pages` will no longer shift;
    if (end > numPages) {
      start = numPages - SHIFT_THRESHOLD;
      end = numPages;
    }
    pages = [...Array(1 + (end - start)).keys()].map(v => start + v);
  }


  const indices = pages.map((page, index) => {
    return (
      <li key={index} className={activePage === page ? 'active' : ''}>
        <a onClick={() => onChangePage(page)}>{page}</a>
      </li>
    );
  });

  return (
    <ul className="pagination">
      <li className={activePage === 1 ? 'disabled' : ''}>
        <a onClick={() => onChangePage(activePage - 1)}>
          <img src={leftArrow} alt="" />
        </a>
      </li>
      {indices}
      <li className={activePage === numPages ? 'disabled' : ''}>
        <a onClick={() => onChangePage(activePage + 1)}>
          <img src={rightArrow} alt="" />
        </a>
      </li>
    </ul>
  );
};

export default Pagination;

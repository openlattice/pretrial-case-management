import React from 'react';

import leftArrow from '../assets/svg/left-arrow-dark.svg';
import rightArrow from '../assets/svg/right-arrow-dark.svg';

const propTypes = {
  onChangePage: React.PropTypes.func.isRequired,
  numItems: React.PropTypes.number.isRequired,
  activePage: React.PropTypes.number.isRequired
};

const Pagination = (props) => {

  const { numItems } = props;
  const { activePage } = props;
  const { onChangePage } = props;

  if (!numItems || numItems <= 1) {
    return null;
  }

  let pages;
  let start = 1;
  let end;

  if (numItems < 6) {
    pages = [...Array(numItems).keys()].map(v => start + v);
  }
  else if (activePage < 4) {
    end = 5;
    pages = [...Array(1 + (end - start)).keys()].map(v => start + v);
  }
  else {
    start = activePage - 2;
    end = activePage + 2;
    if (end > numItems) {
      start = numItems - 4;
      end = numItems;
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
      <li className={activePage === numItems ? 'disabled' : ''}>
        <a onClick={() => onChangePage(activePage + 1)}>
          <img src={rightArrow} alt="" />
        </a>
      </li>
    </ul>
  );
};

Pagination.propTypes = propTypes;

export default Pagination;

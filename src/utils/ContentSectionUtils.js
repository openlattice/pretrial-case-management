import CONTENT_CONSTS from '../utils/consts/ContentConsts';
import { OL } from '../utils/consts/Colors';

export const getComputedTopWrapperStyle = (component) => {
  switch (component) {
    case CONTENT_CONSTS.SUMMARY:
      return (
        `grid-template-columns: 25% 25% 25% 25%;
         grid-auto-rows: min-content;
        `
      );
    case CONTENT_CONSTS.DMF:
      return (
        `grid-template-columns: 20% 20% 20% 20% 20%;
         grid-auto-rows: min-content;
         grid-row-gap: 15px;
         margin-bottom: 30px;`
      );
    case CONTENT_CONSTS.PROFILE:
      return (
        `grid-template-columns: 24% 24% 24% 28%;
         grid-auto-rows: min-content;
         grid-row-gap: 20px;`
      );
    case CONTENT_CONSTS.HEARINGS:
      return (
        `grid-template-columns: 32% 32% 32%;
         grid-auto-rows: min-content;
         grid-column-gap: 2%;
         grid-row-gap: 20px;
         :nth-last-child(4) {
           justify-content: flex-end;
         }`
      );
    case CONTENT_CONSTS.CREATING_HEARING:
      return (
        `grid-template-columns: 32% 32% 32%;
         grid-auto-rows: min-content;
         grid-column-gap: 2%;
         grid-row-gap: 20px;
         :nth-last-child(4) {
           justify-content: flex-end;
         }`
      );
    case CONTENT_CONSTS.HEARING_CARD:
      return (
        `grid-auto-rows: min-content;
          grid-column-gap: 15px;
          grid-template-columns: reapeat(auto-fill);
          grid-auto-flow: column;
         :nth-last-child(4) {
           justify-content: flex-end;
         }`
      );
    default:
      return (
        `grid-template-columns: 50% 50%;
         grid-auto-rows: min-content;
         grid-row-gap: 15px;`
      );
  }
};

export const getComputedBottomWrapperStyle = (component) => {
  switch (component) {
    case CONTENT_CONSTS.FORM_CONTAINER:
      return (
        `padding: 0;
         justify-content: none;
         img {
           margin-right: 20px;
         }`
      );
    case CONTENT_CONSTS.SUMMARY:
      return (
        'padding: 30px 0 0 30px;'
      );
    case CONTENT_CONSTS.PROFILE:
      return (
        `
          background: ${OL.WHITE};
          border: solid 1px ${OL.GREY11};
          border-radius: 5px;
          margin-bottom: 20px;
          padding: 30px;
          img {
           margin-right: 50px;
         }`
      );
    case CONTENT_CONSTS.HEARINGS:
      return (
        'padding: 30px 50px 0 50px;'
      );
    case CONTENT_CONSTS.CREATING_HEARING:
      return (
        'padding: 30px 50px 0 15px;'
      );
    case `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}`:
      return (
        'padding: 0 30px 0 30px;'
      );
    case CONTENT_CONSTS.HEARING_CARD:
      return (
        `padding: 0;
         margin-bottom: 0;`
      );
    default:
      return (
        `padding: 30px 0 0 30px;
         img {
           margin-right: 20px;
         }`
      );
  }
};

export const getComputedHeaderStyle = (component) => {
  switch (component) {
    case CONTENT_CONSTS.SUMMARY:
      return (
        `padding: 0 30px 0 30px;
         margin-bottom: -10px;
         font-size: 16px;
        `
      );
    case CONTENT_CONSTS.ARREST:
      return (
        `padding: 0 30px 0 30px;
         margin-bottom: -10px;
         font-size: 16px;
        `
      );
    case CONTENT_CONSTS.FORM_CONTAINER:
      return (
        `padding: 10px 30px 30px 0;
         font-size: 18px;
         font-weight: normal;`
      );
    case CONTENT_CONSTS.DMF:
      return (
        `padding: 30px 30px 0 30px;
         font-size: 16px;
         font-weight: 600;`
      );
    case CONTENT_CONSTS.PROFILE:
      return (
        `padding: 30px;
         border-bottom: solid 1px ${OL.GREY11};
         font-size: 22px;`
      );
    case CONTENT_CONSTS.HEARINGS:
      return (
        `padding: 30px 0 0 50px;
         font-size: 16px;`
      );
    case CONTENT_CONSTS.CREATING_HEARING:
      return (
        `padding-left: 15px;
         font-size: 16px;`
      );
    case `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}`:
      return (
        `padding: 0 0 30px 30px;
         margin-bottom: -10px;
         font-size: 16px;
        `
      );
    default:
      return (
        `padding: 30px;
         font-size: 22px;`
      );
  }
};

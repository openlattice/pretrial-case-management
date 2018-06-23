import Immutable from 'immutable';

export const getMapByCaseId = (list, fqn) => {
  let objMap = Immutable.Map();
  list.forEach((obj) => {
    const objIdArr = obj.getIn([fqn, 0], '').split('|');
    if (objIdArr.length > 1) {
      const caseId = objIdArr[0];
      objMap = objMap.set(caseId, objMap.get(caseId, Immutable.List()).push(obj));
    }
  });
  return objMap;
};

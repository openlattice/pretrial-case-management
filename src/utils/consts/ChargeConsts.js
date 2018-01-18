const VIOLENT_CHARGES = [
  '16-10-32',
  '22-41-1',
  '22-4-2',
  '22-4a-1',
  '22-8-12',
  '22-10-1',
  '22-10-5',
  '22-10-5.1',
  '22-10-6',
  '22-10-6.1',
  '22-11a-2',
  '22-14-20',
  '22-14a-5',
  '22-14a-6',
  '22-14a-11',
  '22-14a-19',
  '22-14a-20',
  '22-16-1',
  '22-16-1.1',
  '22-16-4',
  '22-16-5',
  '22-16-7',
  '22-16-15',
  '22-16-20',
  '22-16-41',
  '22-17-6',
  '22-18-1',
  '22-18-1.05',
  '22-18-1.1',
  '22-18-1.2',
  '22-18-1.3',
  '22-18-1.4',
  '22-18-26',
  '22-18-26.1',
  '22-18-29',
  '22-18-29.1',
  '22-18-31',
  '22-18-37',
  '22-19-1',
  '22-19-1.1',
  '22-19-17',
  '22-19a-1',
  '22-19a-7',
  '22-22-1',
  '22-22-7',
  '22-22-7.2',
  '22-22-7.4',
  '22-22-7.7',
  '22-22-24.3',
  '22-22-28',
  '22-22-29',
  '22-24a-5',
  '22-30-1',
  '22-32-1',
  '22-33-9.1',
  '22-33-10',
  '22-46-2',
  '22-49-1',
  '22-49-2',
  '22-49-3',
  '26-10-1',
  '26-10-30'
];

const stripDegree = (chargeNum) => {
  return chargeNum.trim().split('(')[0];
};

export const chargeIsViolent = (chargeNum) => {
  return VIOLENT_CHARGES.includes(stripDegree(chargeNum));
};

export const chargeFieldIsViolent = (chargeField) => {
  let violent = false;
  if (chargeField && chargeField.length) {
    chargeField.forEach((chargeNum) => {
      if (chargeIsViolent(chargeNum)) violent = true;
    });
  }
  return violent;
};

export default VIOLENT_CHARGES;

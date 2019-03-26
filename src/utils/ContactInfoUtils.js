import { Constants } from 'lattice'

import { CONTACT_METHODS } from './consts/ContactInfoConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';

const { OPENLATTICE_ID_FQN } = Constants;

export const filterContactsByType = (contacts, method) => {
  if (method) {
    return contacts.filter((contact) => {
      const contactMethod = contact.getIn([PROPERTY_TYPES.CONTACT_METHOD, 0],
        contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTACT_METHOD, 0], ''));
      const phone = contact.getIn([PROPERTY_TYPES.PHONE, 0],
        contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0], ''));
      const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0],
        contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.EMAIL, 0], ''));
      if (contactMethod) return (contactMethod === method);
      if (phone && method === CONTACT_METHODS.PHONE) return true;
      if (email && method === CONTACT_METHODS.EMAIL) return true;
      return false;
    });
  }
  return contacts;
};

export const formatPhoneNumber = (phone) => {
  const cleaned = (phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return null;
};

export const getContactFields = (contact) => {
  const contactDetails = contact.get(PSA_NEIGHBOR.DETAILS, contact);
  const phone = contactDetails.getIn([PROPERTY_TYPES.PHONE, 0], '');
  const email = contactDetails.getIn([PROPERTY_TYPES.EMAIL, 0], '');
  const contactMethod = contactDetails.getIn([PROPERTY_TYPES.CONTACT_METHOD, 0], '');
  const isMobile = contactDetails.getIn([PROPERTY_TYPES.IS_MOBILE, 0], '');
  const isPreferred = contactDetails.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], '');
  const contactEntityKeyId = contactDetails.getIn([OPENLATTICE_ID_FQN, 0], '');
  return {
    contactEntityKeyId,
    phone,
    email,
    contactMethod,
    isMobile,
    isPreferred,
  };
};

export const phoneIsValid = phone => (
  phone ? phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/) : true
);

export const emailIsValid = email => (
  email ? email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/) : true
);

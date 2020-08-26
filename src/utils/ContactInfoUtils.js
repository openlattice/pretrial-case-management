import { CONTACT_METHODS } from './consts/ContactInfoConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getEntityProperties, getEntityKeyId, getFirstNeighborValue } from './DataUtils';

const { IS_MOBILE, IS_PREFERRED } = PROPERTY_TYPES;

export const getContactInfoFields = (contact) => {
  const phone = getFirstNeighborValue(contact, PROPERTY_TYPES.PHONE);
  const email = getFirstNeighborValue(contact, PROPERTY_TYPES.EMAIL);
  const contactMethod = getFirstNeighborValue(contact, PROPERTY_TYPES.CONTACT_METHOD);
  const isMobile = getFirstNeighborValue(contact, PROPERTY_TYPES.IS_MOBILE, false);
  const isPreferred = getFirstNeighborValue(contact, PROPERTY_TYPES.IS_PREFERRED, false);
  const contactEntityKeyId = getEntityKeyId(contact);
  return {
    contactEntityKeyId,
    phone,
    email,
    contactMethod,
    isMobile,
    isPreferred,
  };
};

export const filterContactsByType = (contacts, method) => {
  if (method) {
    return contacts.filter((contact) => {
      const { contactMethod, email, phone } = getContactInfoFields(contact);
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
  const matchPlusOne = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (matchPlusOne) {
    return `(${matchPlusOne[2]}) ${matchPlusOne[3]}-${matchPlusOne[4]}`;
  }
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return null;
};

export const phoneIsValid = (phone) => (
  phone ? phone.match(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/) : true
);

export const emailIsValid = (email) => (
  email ? email.match(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/) : true
);

export const getPreferredMobileContacts = (contacts) => contacts.filter((contact) => {
  const {
    [IS_MOBILE]: isMobile,
    [IS_PREFERRED]: isPreferred
  } = getEntityProperties(contact, [IS_MOBILE, IS_PREFERRED]);
  return isMobile && isPreferred;
});

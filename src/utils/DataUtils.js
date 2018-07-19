export const ID_FIELD = 'openlattice.@id';

export const stripIdField = (entity) => {
  const newEntity = Object.assign({}, entity);
  if (newEntity[ID_FIELD]) {
    delete newEntity[ID_FIELD];
  }
  return newEntity;
};

const { collections, ObjectId } = require('./mongoClient');

function toObjectId(value) {
  if (!value || !ObjectId.isValid(value)) {
    return null;
  }

  try {
    return new ObjectId(value);
  } catch {
    return null;
  }
}

async function findOwnerByReference(ownerReference) {
  if (!ownerReference) return null;

  const query = [];
  const ownerId = toObjectId(ownerReference);

  if (ownerId) {
    query.push({ _id: ownerId });
  }

  query.push({ store_id: ownerReference });
  query.push({ email: String(ownerReference).toLowerCase() });

  return collections.users().findOne({ $or: query });
}

async function resolveOwnerId(req) {
  const userId = req.user?.user_id;
  if (!userId) return null;

  if (req.user?.role !== 'helper') {
    return userId;
  }

  const helper = await collections.helpers().findOne({ _id: toObjectId(userId) || userId });
  return helper?.owner_user_id || userId;
}

async function resolveHelperName(req) {
  if (req.user?.role !== 'helper') {
    return 'Owner';
  }

  const helper = await collections.helpers().findOne({ _id: toObjectId(req.user.user_id) || req.user.user_id });
  return helper?.helper_name || 'Helper';
}

module.exports = {
  findOwnerByReference,
  resolveOwnerId,
  resolveHelperName,
  toObjectId,
};
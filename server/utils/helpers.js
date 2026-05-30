/**
 * Send a success response
 */
const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, ...data });
};

/**
 * Send an error response
 */
const sendError = (res, message = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

/**
 * Paginate a Mongoose query
 * @param {Model} model - Mongoose model
 * @param {Object} query - Filter query
 * @param {Object} options - { page, limit, sort, populate, select }
 */
const paginate = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    populate = "",
    select = "",
  } = options;

  const skip = (page - 1) * limit;
  let dbQuery = model.find(query).sort(sort).skip(skip).limit(Number(limit));

  if (select) dbQuery = dbQuery.select(select);
  if (populate) dbQuery = dbQuery.populate(populate);

  const [data, total] = await Promise.all([dbQuery, model.countDocuments(query)]);

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

/**
 * Async wrapper to avoid try/catch repetition
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Slugify a string
 */
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/**
 * Format bytes to human-readable string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

module.exports = { sendSuccess, sendError, paginate, asyncHandler, slugify, formatBytes };

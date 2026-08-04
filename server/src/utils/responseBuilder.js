/**
 * Standard API Response Builder
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginated = (res, data, meta, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta, // e.g., { total, page, limit, totalPages }
  });
};

const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  paginated,
  error,
};

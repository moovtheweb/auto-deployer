/**
 * helloHTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

exports.hellohttp = function hellohttp (req, res) {
  res.send(`Hello ${req.body.name || 'World'}! :-P `);
};

module.exports = (app) => {
  app.get('/example', (req, res) => {
    return res.status(200).json({
      status: 'example ok'
    });
  });
}
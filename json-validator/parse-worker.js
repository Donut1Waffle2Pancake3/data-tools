/* JSON.parse in a dedicated worker — keeps the tab responsive on large pastes. */
self.onmessage = function (e) {
  var reqId = e.data.reqId;
  var text = e.data.text;
  try {
    JSON.parse(text);
    self.postMessage({ reqId: reqId, ok: true });
  } catch (err) {
    var msg =
      err instanceof SyntaxError
        ? err.message || 'Invalid JSON.'
        : String((err && err.message) || 'Invalid JSON.');
    self.postMessage({ reqId: reqId, ok: false, message: msg });
  }
};

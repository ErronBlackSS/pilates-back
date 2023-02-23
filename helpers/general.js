
module.exports.parseUpdateData = function(request, dataBaseName) {
  let query = 'UPDATE ' + dataBaseName + ' SET '
  const set = []
  Object.keys(request).forEach(function (key, i) {
    if (key !== 'id') {
      set.push(key + ' = ' + '\'' + request[key] + '\'' + ' '); 
    }
  });
  query += set.join(', ')
  query += 'WHERE id = ' + request.id

  return query
}

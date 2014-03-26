/**
 * Database object
 * @param {Object} conn database connection
 * @this {DB}
 */
var DB = function(conn) {
    this.conn = conn;
};

/**
 * Выполняет произвольный запрос к БД и возвращает сырой результат
 * @param {String}   query
 * @param {Array}    params
 * @param {Function} callback
 */
DB.prototype.Exec = function(query, params, callback) {
    console.log('inside exec doing query');
    console.log(query);
    var params = params || [];
    this.conn.transaction(function(tx) {
        console.log('inside transaction function');
        tx.executeSql(
            query,
            params,
            function(tx, res) {
                console.log('success executeSql');
                callback(null, res);
            },
            function(e) {
                console.log('error executeSql');
                callback(e);
            }
        );
    });
};

/**
 * Возвращает массив результатов запроса
 * @param {String}   query
 * @param {Array}    params
 * @param {Function} callback
 */
DB.prototype.FetchAll = function(query, params, callback) {
    var self = this;
    self.Exec(query, params, function(err, res) {
        if (err) return callback(err);
        return callback(null, self._toArray(res));
    });
};

/**
 * Возвращает один результат
 * @param {String}   query
 * @param {Array}    params
 * @param {Function} callback
 */
DB.prototype.FetchOne = function(query, params, callback) {
    var self = this;
    self.Exec(query, params, function(err, res) {
        if (err) return callback(err);
        ret = res.rows.length ? res.rows.item(0) : false;
        return callback(null, ret);
    });
};

/**
 * Превращает результат запроса в массив
 * @param  {[type]} res
 * @return {Array}
 */
DB.prototype._toArray = function(res) {
    var ret = [];
    for (var i = 0; i < res.rows.length; ++i) {
        ret.push(res.rows.item(i));
    }
    return ret;
};

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('ondeviceready launched');
    steroids.on('ready', function() {
        console.log('steroids ready launched');
        if (!window.sqlitePlugin) {
            console.log('relauncing coz no sqlite');
            location.reload();
            return;
        }
        if ('Android' === device.platform) {
            name = "file://" + steroids.app.absolutePath + "/data/eda.db";
        } else {
            name = steroids.app.path + "/data/eda.db";
        }

        window.db = new DB(window.sqlitePlugin.openDatabase({
            name: name
        }));

        console.log('created window.db, launching test query');

        window.db.FetchAll('SELECT * FROM ingredients_categories', [], function(err, res) {
            console.log('got response from fetch all');
            console.log(err);
            console.log(res);
            console.log('finished loggin response');
        });
    });
}


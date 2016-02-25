/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var elasticsearch = require('elasticsearch');

 var fs = require('fs');
 var client = new elasticsearch.Client({
   host:'localhost:9200',
  /*hosts: 'https://search-coole-search-3yksottitvcxgbifbjty3kpeve.ap-northeast-1.es.amazonaws.com/',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'ap-northeast-1',
    accessKey: 'AKIAJLCRPGM7B5ACPQEA',
    secretKey: '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'
  }, */
  log: 'trace'
 });

var _index = "ocool";
var _type = 'music';

module.exports = {
	search: function(req,res){
		console.log(req.param('text'));
    res.json({text: req.param('text'), type: req.param('type')});
  },
	index: function(req, res){
			client.indices.delete({index: _index});

      fs.readFile('mappings/model-mapping.json', 'utf8', function (err, data) {
          if (err) throw err;
          var employeeMappings = JSON.parse(data);
          client.indices.create({
              index: _index,
              body:employeeMappings

          }, function (error, response) {
              fs.readFile('mappings/music-data.json', 'utf8', function (err, data) {
                  if (err) throw err;
                  var sampleDataSet = JSON.parse(data);

                  var body = [];

                  sampleDataSet.forEach(function (item) {
                      body.push({"index": {"_index": _index, "_type": _type}});
                      body.push(item);
                  });

                  client.bulk({
                      body: body
                  }, function (err, resp) {
                      res.render('index', {result: 'Indexing Completed!'});
                  })
              });
							//
							fs.readFile('mappings/news-data.json', 'utf8', function (err, data) {
                  if (err) throw err;
                  var sampleDataSet = JSON.parse(data);

                  var body = [];

                  sampleDataSet.forEach(function (item) {
                      body.push({"index": {"_index": _index, "_type": "news"}});
                      body.push(item);
                  });

                  client.bulk({
                      body: body
                  }, function (err, resp) {
                      res.render('index', {result: 'Indexing Completed!'});
                  })
              });
							//

							//
          });
      });
	},
	autocomplete: function(req, res){
		console.log('req.query.term:' + req.param('term'));
		client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "match": {
                        "title": {
                            "query": req.param('term'),
														"operator":"and"
                        }
                }
            }
        }
    }).then(function (resp) {

        var results = resp.hits.hits.map(function(hit){
            return hit._source;
        });
				console.log('results========:' + results);
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
	},
	search: function(req, res){

	},
	suggest: function(req, res){
		client.suggest({
		index: _index,
		type: _type,
		body: {
		  mysuggester: {
		    text: req.param('term'),
		    term: {
		      field: 'first_name'
		    }
		  }
		}
		}, function (error, response) {
			console.log(response);
			var results = response.hits.hits.map(function(hit){
					return hit._source.first_name + " " + hit._source.last_name;
			});
			res.send(results);

		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to InfoController)
   */
  _config: {}
};

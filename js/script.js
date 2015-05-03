$(document).ready(function () {
    console.log("DOM fully loaded and parsed");

    // create classes for article objects
    var WikiArticle = function (title, url) {
        this.url = ko.observable(url);
        this.headline = ko.observable(title);
    };
    var Article = function (data) {
        this.url = ko.observable(data.web_url);
        this.abstract = ko.observable(data.snippet);
        this.headline = ko.observable(data.headline.main);
    };

    function AppViewModel() {
        var self = this;
        // data
        self.question = ko.observable("Where do you want to live?");
        self.nytTitle = ko.observable("New York Times Articles");
        self.wikiTitle = ko.observable("Relevant Wikipedia Links");
        self.url = ko.observable("");
        self.street = ko.observable("");
        self.city = ko.observable("");
        self.nytArticles = ko.observableArray([]);
        self.wikiArticles = ko.observableArray([]);

        // on submitt clear the list of NYT articles, set the street and city values and call the searchNYT function
        self.doSomething = function () {
            self.nytArticles([]);
            self.wikiArticles([]);
            self.setBg();
            self.searchNYT();
            self.searchWiki();

            if (self.city()) {
                var newQuestion = "So, you want to live in " + self.city() + "?";
                self.question(newQuestion);
            } else {
                self.question("Where do you want to live?");
            }
        };

        self.setBg = function () {
            self.url("https://maps.googleapis.com/maps/api/streetview?size=800x550&location=" + self.street() + self.city());
            //console.log(self.url())
        };
        // send na ajax query consist of the given city parameter, create an 
        // Article objects with relevant infos and push it to the list of NYT articles
        self.searchNYT = function () { // NYT does not support JSONP
            var query = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + self.city() + "&api-key=965ee1221d1e327b32a7ea49dd30ec95:3:71984632";
            var jqxhr = $.getJSON(query, function (data) {
                //console.log( "success" );
                $.each(data.response.docs, function (key, value) {
                    self.nytArticles.push(new Article(value));
                });
            })
            // chanied events
            // handle the results if the request was succesful but no articles found
            .done(function () {
                if (self.nytArticles().length === 0) {
                    self.nytTitle("No related articles found! :(");
                } else {
                    self.nytTitle("New York Times Articles");
                }
            })
            // handle the results in case of wrong request
            .fail(function () {
                //console.log( "request error" );
                self.nytTitle("NetworkError: 400 Bad Request! :(")
            })
            // remove the text below the NY Times title in any case upon submitt
            .always(function () {
                $(".nytimes-container .remove").remove();
            });
        }

        // JSONP request does not have error handlers
        // so we can solve the problem by setting up a timout function that would be cleared
        // in case of succesfull query request
        var wikiRequestTimeout = setTimeout(function () {
            self.wikiTitle("NetworkError: 400 Bad Request! :(");
                $(".wikipedia-container .remove").remove();
        }, 8000);

        self.searchWiki = function () { // by calling callback function we make JSONP request
            var query = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + self.city() + "&limit=10&format=json&callback=?";
            var jqxhr = $.getJSON(query, function(data) {
                // console.log(data)
                $.each(data[1], function (key, value) {
                    var articTitle = value;
                    var articUrl = data[3][key];
                    self.wikiArticles.push(new WikiArticle(articTitle, articUrl));
                })
            })
            // chanied events
            // handle the results if the request was succesful but no articles found
            .done(function(data) { 
                if (self.wikiArticles().length == 0) {
                    self.wikiTitle("No related articles found! :(");
                }
                else {
                    self.wikiTitle("Relevant Wikipedia Links");
                }
                // when the request is done cancel the wikiRequestTimeout
                clearTimeout(wikiRequestTimeout);
            })
            .always(function() {
                $(".wikipedia-container .remove").remove();
            });
        }
    }
// refer to the bindings
ko.applyBindings(new AppViewModel());
});
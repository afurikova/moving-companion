$( document ).ready(function () {
    console.log("DOM fully loaded and parsed");

    // create a class for article objects
    var Article = function (data) {
      this.url = ko.observable(data.web_url);
      this.abstract = ko.observable(data.snippet);
      this.headline = ko.observable(data.headline.main);
    }

    function AppViewModel() {
      var self = this;
      // data
      self.question = ko.observable("Where do you want to live?");
      self.nytTitle = ko.observable("New York Times Articles");
      self.url = ko.observable("");
      self.street = ko.observable("");
      self.city = ko.observable("");
      self.nytArticles = ko.observableArray([]);

      // on submitt clear the list of NYT articles, set the street and city values and call the searchNYT function
      self.doSomething = function() {
        self.nytArticles([]);
        self.setBg();
        self.searchNYT();
      };

      self.setBg = function () {
        self.url("https://maps.googleapis.com/maps/api/streetview?size=800x550&location=" + self.street() + self.city())
        //console.log(self.url())
      }
      // send na ajax query consist of the given city parameter, create an 
      // Article objects with relevant infos and push it to the list of NYT articles
      self.searchNYT = function () { // NYT does not support JSONP
        var query = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + self.city() + "&api-key=965ee1221d1e327b32a7ea49dd30ec95:3:71984632"
        var jqxhr = $.getJSON( query, function(element) {
          //console.log( "success" );
          for (var article in element.response.docs) {
            //console.log(element.response.docs[article])
            self.nytArticles.push(new Article(element.response.docs[article]));
          }
        })
        // chanied events
        // handle the results if the request was succesful but no articles found
        .done(function() { 
          if (self.nytArticles().length == 0) {
            self.nytTitle("Sorry, No related articles found!") 
          } else {
            self.nytTitle("New York Times Articles")
          }
        })
        // handle the results in case of wrong request
        .fail(function() {
          //console.log( "request error" );
          self.nytTitle("NetworkError: 400 Bad Request!") 
        })
        // remove the text below the NY Times title in any case upon submitt
        .always(function() {
          $( ".nytimes-container .remove" ).remove();
        });
      };
}
// refer to the bindings
ko.applyBindings(new AppViewModel());
 });
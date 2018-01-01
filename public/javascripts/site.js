$(document).on('ready', function() {
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
/*
if (document.getElementById("standings") != null){
  document.getElementById("standings").innerHTML = "Retrieving Standings...";
}
if (document.getElementById("teams") != null){
  document.getElementById("teams").innerHTML = "Retrieving Teams...";
}
if (document.getElementById("scoreboard") != null){
  document.getElementById("scoreboard").innerHTML = "Retrieving Scoreboard...";
}
*/
if (document.getElementById("standings") != null){
  document.getElementById("standings").innerHTML = "Retrieving Standings...";
  //document.getElementById("teams").innerHTML = "Retrieving Teams...";
  document.getElementById("scoreboard").innerHTML = "Retrieving Scoreboard...";

  //Get ALL Scoreboards
  var leagueArray = ["371.l.1074216", "371.l.1066863", "371.l.1048163", "371.l.1046003", "371.l.694698"]; 
  var arrayLength = leagueArray.length;
  var dataFilters = {};
  var scoreboardArray = [];
  var standingsArray = [];
  //var teamsArray = [];
  //Add indicator for retrieving data to front-end

  for (var i = 0; i < arrayLength; i++) {
      dataFilters = {};
      dataFilters["league_key"] = "" + leagueArray[i] + "";
      $.ajaxSetup({async:false});
      $.get('/data/league/scoreboard',
      dataFilters,
      function (res){
        var jsonText = JSON.stringify(res);
        scoreboardArray.push(jsonText);
      },
      'json'
      );
      $.get('/data/league/standings',
      dataFilters,
      function (res){
        var jsonText = JSON.stringify(res);
        standingsArray.push(jsonText);
      },
      'json'
      );
      /*
      $.get('/data/league/teams',
      dataFilters,
      function (res){
        var jsonText = JSON.stringify(res);
        teamsArray.push(jsonText);
      },
      'json'
      );
      */
  }
}

  //console.log("TEAMS:\n"+ JSON.stringify(teamsArray));
  if (document.getElementById("standings") != null){
    var standText = "<br/>";
    //console.log("STAND: " + standingsArray.length);
    for (var i=0; i<standingsArray.length; i++){
      //console.log("SA[" + i + "]:" + standingsArray[i]);
      var standJSON = JSON.parse(standingsArray[i]);
      standText += "<h5>" + standJSON.name + "</h5>";
      var standCollection = standJSON.standings;
      //console.log("coll: " + standCollection);
      for (var j=0; j<standCollection.length; j++){
        standCollJSON = standCollection[j];
        standText += "#" + standCollJSON.standings.rank + ". " 
        + standCollJSON.name + "(" 
        + standCollJSON.standings.outcome_totals.wins + "-" + standCollJSON.standings.outcome_totals.losses 
        + "  +" + standCollJSON.standings.points_for + ")<br/>";
      }
    }
    document.getElementById("standings").innerHTML = standText;
  }
  /*
  if (document.getElementById("teams") != null){
    var teamText = "";
    for (var i=0; i<teamsArray.length; i++){
      //console.log("T[" + i + "]:" + teamsArray[i]);
      var teamJSON = JSON.parse(teamsArray[i]);
      teamText += "<h3>" + teamJSON.name + "</h3><br/><br/>";
    }
    document.getElementById("teams").innerHTML = teamText;
  }
  */
  if (document.getElementById("scoreboard") != null){
    var scoreText = "<br/>";
    for (var i=0; i<scoreboardArray.length; i++){
      //console.log("T[" + i + "]:" + scoreboardArray[i]);
      var scoreJSON = JSON.parse(scoreboardArray[i]);
      scoreText += "<h5>" + scoreJSON.name + "</h5>";
      var scoreCollection = scoreJSON.scoreboard.matchups;
      for (var j=0; j<scoreCollection.length; j++){
        var matchups = scoreCollection[j];
        var matchCollection = matchups.teams;
        for (var k=0; k<matchCollection.length; k++){
          var players = matchCollection[k];
          scoreText += players.name;
          scoreText += "[" + players.managers[0].nickname + "]";
          scoreText += " (" + players.points.total + ") <br/>";
          //scoreText += "(" + players.projected_points.total + ")   ";
        }
        scoreText += "<br/>";
      }
    }
    document.getElementById("scoreboard").innerHTML = scoreText;
  }

  var submitting = false;
  $('.try .btn').on('click', function() {
    if (!submitting) {
      submitting = true;
      $('.empty').removeClass('empty');

      var $items = $('.try input[type=text]');
      if ( $('.try .nav').length > 0 ) {
        $items = $('.try .tab-pane.active input[type=text]');
      }

      $.each($items.not(".filter, .optional"), function(idx, val) {
        if ( !$(val).val() ) {
          $(val).addClass('empty');
        }
      });

      var data = {}
      $.each($items, function(idx, val) {
        var s = $(val).val().replace(' ', '');
        if ( !_.isEmpty(s) ) {
          if ( $(val).hasClass('filter') ) {
            if ( !_.has(data, 'filters') ) {
              data.filters = {};
            }
            var id = $(val).attr('id');
            data.filters[id] = s;
          } else {
            data[$(val).attr('id')] = s;
          }
        }
      });

      // if ( _.isEmpty(data) ) {
      //   if ( $('.try .at-least-one').length > 0 ) {
      //     // should only happen when filters are all empty and 1 is required (ie/ games collection)
      //     $items.addClass('empty');
      //   }
      // }

      if ( $('.empty').length ) {
        submitting = false;
        return;
      }

      $('.loading').toggle();

      if ( $('.try .checkbox-group :checked').length > 0 ) {
        var subresources = [];
        $.each($('.try .checkbox-group :checked'), function(idx, val) {
          var sub = $(val).attr('name');
          subresources.push(sub);
        });
        data.subresources = subresources.join(',');
      }

      if ( _.has(data, 'filters') ) {
        data.filters = JSON.stringify(data.filters);
      }

      /*
      var dataFilters = {};
      dataFilters["league_key"] = "371.l.1048163";
      //dataFilters["week"] = "14";
      $.get('/data/league/scoreboard',
      dataFilters,
      function (res){
        var jsonText = JSON.stringify(res);
        console.log("JSON: " + jsonText);
      },
      'json'
      );
      */

      console.log(data); //{league_key: "371.l.1048163", week: "14"}
      $.get( '/data/' + resource + '/' + subresource,
        data,
        function(res) {
          //console.log("Data for \n"+ subresource + "\n:" + JSON.stringify(res));
          $('.data-block h2').text('Output');
          $('.data-block .json').text(JSON.stringify(res, null, 2));
          $('.json').each(function(i, block) {
            hljs.highlightBlock(block);
          });
          $(window).scrollTo( $('.data-block'), 800 );

          submitting = false;
          $('.loading').toggle();
        },
        'json'
        );
    }
  });
});

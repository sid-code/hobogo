
window.onhashchange = function() {
  startWebSocket(location.hash.slice(1));
};

document.addEventListener("DOMContentLoaded", function() {
  var submitButton = document.getElementById("search-button");
  submitButton.addEventListener("click", function() {
    var config = getSearchConfig();
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        var json = JSON.parse(this.responseText);
        var token = json.token;
        location.hash = "#" + token;
      }
    };
    xhr.open("POST", "/search");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(config));
  });

  if (location.hash.length) {
    window.onhashchange();
  }

});

document.addEventListener("DOMContentLoaded", function() {
  var submitButton = document.getElementById("search-button");
  submitButton.addEventListener("click", function() {
    var config = getSearchConfig();
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        var json = JSON.parse(this.responseText);
        var token = json.token;
        console.log(token);
      }
    };
    xhr.open("POST", "/search");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(config));
  });
});

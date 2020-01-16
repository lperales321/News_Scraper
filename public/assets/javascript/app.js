  // Save Article Buttone
  $(".save").on("click", function() {
    // Save the id from the save tag
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/article/" + thisId
    })
      .then(function(data) {
        console.log("updated");
      });
  });

  $(".delArticle").on("click", function() {
    // Save the id from the save tag
    var thisId = $(this).attr("data-id");

    $.ajax({
    method: "POST",
    url: "/article/delete/" + thisId
    })
    .then(function(data) {
        console.log("deleted");
    });
});
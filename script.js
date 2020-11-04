var api_gategay = "URL_END_POINT_BASE";
var access_token = "";
var secuencial = 1;

function generateAccessToken() {
  var settings = {
    url: api_gategay + "/oauth/token",
    method: "POST",
    timeout: 0,
    cache: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic CREDENTIALS",
    },
    data: {
      grant_type: "client_credentials",
    },
  };

  $.ajax(settings).done(function (response) {
    console.log("/oauth/token", JSON.stringify(response));
    access_token = response.access_token;
  });
}

function search(lastEvaluatedKey) {
  var term = document.getElementById("txtTerm").value;

  var query = {
    ProjectionExpression: "ID, #date, #topic, #body, #messageBackupID",
    ExpressionAttributeNames: {
      "#date": "date",
      "#body": "body",
      "#topic": "topic",
      "#messageBackupID": "messageBackupID",
    },
    TableName: "event-broker-events-*",
    ExpressionAttributeValues: { ":pBody": { S: term } },
    FilterExpression: "contains(#body, :pBody)",
  };

  console.log(secuencial + " lastEvaluatedKey", lastEvaluatedKey);

  if (lastEvaluatedKey !== null) {
    query["ExclusiveStartKey"] = {
      ID: { S: lastEvaluatedKey },
    };
  }

  var settings = {
    url: api_gategay + "/events/query",
    method: "POST",
    cache: false,
    timeout: 0,
    headers: {
      "x-access-token": access_token,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(query),
  };

  $.ajax(settings).done(function (response) {
    if (response.Count === 0) {
      if (response.LastEvaluatedKey != null) {
        console.log(
          secuencial + " /events/query",
          response.LastEvaluatedKey.ID.S
        );
        setTimeout(() => {
          search(response.LastEvaluatedKey.ID.S);
        }, 1800);
      } else {
        console.log(secuencial + " /events/query", "Termino la busqueda.");
        print(response.items);
      }
    } else {
      console.log(secuencial + "/events/query", JSON.stringify(response));
      print(response.items);
    }
    secuencial += 1;
  });
}

function print(items) {
  $("#tblResult").empty();
  if (items) {
    $("#codeResult").html("No se encontraron resultados");
  } else {
    $("#codeResult").html(JSON.stringify(items));
  }
}

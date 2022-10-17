//######### CONNECT TO DATABASE ########
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://JessicaKrapfl:database@cluster0.cpon5.mongodb.net/?retryWrites=true&w=majority";
var count = 0;
var everythingDone = 14;
//########### POST #########
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("APIChallenge");
    //define the list of merchants
    var Merchants = 
        [{ merchantID:0, latitude: 53.14546047508924, longitude: -6.0762490019499715, merchantName: "Tesco"},
        { merchantID:1, latitude:53.38004697744345, longitude: -6.58379250194194, merchantName: "Boots"},
        { merchantID:2, latitude:53.39922310377921, longitude: -6.388962629506912, merchantName: "Eason"},
        { merchantID:3, latitude:53.272775789374286, longitude:  -6.332658027249847, merchantName: "Lidl"},
        { merchantID:4, latitude: 53.293958279991855, longitude: -6.2667403888403515, merchantName: "Aldi"},
        { merchantID:5, latitude: 53.37047286712591, longitude: -6.205629252409899, merchantName: "Super Value"},
        { merchantID:6, latitude: 53.30799192522777, longitude: -6.2365286212407955, merchantName: "Spar"},
        { merchantID:7, latitude: 53.35318067744504, longitude: -6.391711138645266, merchantName: "Next"},
        { merchantID:8, latitude: 53.451675392997444, longitude: -6.169924985798554, merchantName: "Londis"},
        { merchantID:9, latitude: 53.3311251390815, longitude: -6.300387943324192, merchantName: "Dunnes"}];
      
      //post the info into the database
    dbo.collection("Merchants").insertMany(Merchants, function(err, res) {
      if (err) throw err;
      console.log("documents inserted");
      count++;//increment count after it inserts into the table
      if(count==everythingDone)//close the db after it has done all the things
      {
        db.close();
      }
    });

    //############# GET ###########
    //****** many merchants ordered by nearest using haversine *********/
    //getting the distanes into an array
    const dist = [Merchants.length];//distance
    const idNum= [Merchants.length];//merchantID
    for(var i=0;i<Merchants.length;i++)//get distance from the merchant to the location and store it in an array
    {
      dist[i]=haversine(Merchants[i].latitude,Merchants[i].longitude);//puts the distance into the array of distances
      idNum[i] = Merchants[i].merchantID;//puts the merchant id into an array this will help later when printing ---probably could have used i
    }
    
    //sorting the array
    bubbleSort(dist,idNum);

    //printing the results
    for(var i = 0; i<Merchants.length;i++)
    {
      dbo.collection("Merchants").findOne({merchantID: idNum[i]}, function(err, result) {
        if (err) throw err;
        console.log("Sorted by Distance:");
        console.log("______________________________");
        console.log("merchantID: "+result.merchantID);
        console.log("merchantName: "+result.merchantName);
        console.log("latitude: "+result.latitude);
        console.log("longitude: "+result.longitude);
        console.log("Distance: ");
        console.log("------------------------------");
        count++;
        if(count==everythingDone)//close the db after it has done all the things
        {
          db.close();
        }
      });
    }

    //** one merchant **/
    dbo.collection("Merchants").findOne({merchantID: 7}, function(err, result) {
      if (err) throw err;
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      console.log("details of one merchant:");
      console.log("______________________________");
      console.log("merchantID: "+result.merchantID);
      console.log("merchantName: "+result.merchantName);
      console.log("latitude: "+result.latitude);
      console.log("longitude: "+result.longitude);
      console.log("------------------------------");
      count++;
      if(count==everythingDone)//close the db after it has done all the things
      {
        db.close();
      }
    });
  
  //########## PUT #########
    var query = { merchantID: 8 };
    var newvalue = { $set: {merchantName: "Tesco"} };
    dbo.collection("Merchants").updateOne(query, newvalue, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      count++;
      if(count==everythingDone)//close the db after it has done all the things
      {
        db.close();
      }
  });

  //########## DELETE ##########
  var toDelete = { merchantID: 9};
  dbo.collection("Merchants").deleteOne(toDelete, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    count++;
    if(count==everythingDone)//close the db after it has done all the things
    {
      db.close();
    }
    //db.close();
  });

  //CLEAR if i need to
  /*
  var query1 = {};
  dbo.collection("Merchants").deleteMany(query1, function(err, obj) {
    if (err) throw err;
    console.log("db cleared");
    db.close();
  });
  */
  //db.close();
}); 

//***************haversine function********
function haversine(lat2,lon2)
{
  //lat and lon of phoenix park 53.359306811506634, -6.332364166269449
  //degrees to radians
  var lat1R = degreesToRads(53.359306811506634);
  var lon1R = degreesToRads(-6.332364166269449);
  var lat2R = degreesToRads(lat2);
  var lon2R = degreesToRads(lon2);

  //haversinen formula
  var lonDist = lon2R - lon1R;
  var latDist = lat2R - lat1R;

  var a = Math.pow(Math.sin(latDist / 2), 2)
  + Math.cos(lat1R) * Math.cos(lat2R)
  * Math.pow(Math.sin(lonDist / 2),2);

  var c = 2 * Math.asin(Math.sqrt(a));

  // radius of earth in kilometers
  var r = 6371;

  // calculate the result
  return(c * r);
}

function degreesToRads(degrees)
{
  var pi = Math.PI;
  return degrees*(pi/180);
}

//*********Sort function*********
function bubbleSort(dist,ID)
{
  for(var i = 0; i < dist.length; i++)
  {
    // Last i elements are already in place 
    for(var j = 0; j < ( dist.length - i -1 ); j++)
    {
      // Checking if the item at present iteration
      // is greater than the next iteration
      if(dist[j] > dist[j+1])
      {
        // If the condition is true then swap them
        //whatever you do to dist do to ID
        var tempDist = dist[j];
        var tempID = ID[j];
        dist[j] = dist[j + 1];
        ID[j] = ID[j + 1];
        dist[j+1] = tempDist;
        ID[j + 1] = tempID;
      }
    }
  }
 }
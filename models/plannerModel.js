const nedb = require("nedb");

class Planner {
  constructor(dbFilePath) {
    if (dbFilePath) {
      this.db = new nedb({
        filename: dbFilePath,
        autoload: true,
        corruptAlertThreshold: 1,
      });
      console.log("DB connected to " + dbFilePath);
    } else {
      this.db = new nedb();
    }
  }

  init() {
    //reset the database
    this.db.remove({}, { multi: true }, function (err, numRemoved) {});
    //-----------------------------------------------------------------------
    /*
    // get this week's monday date
    function getMonday(d) {
      d = new Date(d);
      var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }
*/

    // add a day to a date
    /*
    function addDay(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
    */
    //-----------------------------------------------------------------------
    //var monday = getMonday(new Date());
    //console.log(monday);
    //----------------------------------------------------------------------
    /* Get all days and dates within a months
     * @param {int} The month number, 0 based
     * @param {int} The year, not zero based, required to account for leap years
     * @return {Date[]} List with date objects for each day of the month
     */
    function getDaysInMonth(month, year) {
      var date = new Date(year, month, 1);
      var days = [];
      while (date.getMonth() === month) {
        date.setDate(date.getDate() + 1);
        days.push(new Date(date));
        
      }
      //console.log("days:");
      //console.log(days);
      return days;
    }
    var date = new Date();
    var month = date.getMonth();
    var year = date.getFullYear();

    var dates = getDaysInMonth(month, year);
    //console.log("this is dates:");
    //console.log(dates);
    //console.log(dates.length);
    //=================================================================
    //array with each name of day of the week
    var dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    //=================================================================
    var objDays = []; // array to hold the day object
    var x; //counter
    for (x = 0; x < dates.length; x++) {
      var day = {
        name: dayNames[dates[x].getDay()],
        goal: "",
        achievement: "",
        user: "",
        date: dates[x],
        dayId: x+1,
      };
      objDays.push(day);
    }
    //used for debugging
    console.log(objDays);
    console.log("Inserted into db: ");
    //console.log(exercises);
    //----------------------------------------------------------------------
    //insert array objDays to the databases
    this.db.insert(objDays);

    //for later debugging
    //console.log("Exercises record inserted");
  }
  //get all data from the database
  getAllEntries() {
    //-----------------------------------------------------------------------
    //format a date for displaying
    //-----------------------------------------------------------------------
    //loop thorugh the collection and format the date.
    function forEachFunction(item, index, arr) {
      arr[index].date = formatDate(item.date);
    }
    //-----------------------------------------------------------------------
    //return a Promise object, which can be resolved or rejected
    return new Promise((resolve, reject) => {
      //use the find() function of the database to get the data,
      //error first callback function, err for error, entries for data
      this.db.find({}, function (err, entries) {
        //if error occurs reject Promise
        if (err) {
          reject(err);
          //if no error resolve the promise & return the data
        } else {
          //entries.forEach(forEachFunction);
          /*entries.sort((a, b) => {
            return a.exdate > b.exdate ? 1 : a.exdate < b.exdate ? -1 : 0;
          });*/

          const sortedEntries = entries.sort((a, b) => a.date - b.date);
          sortedEntries.forEach(forEachFunction);
          resolve(sortedEntries);
          //to see what the returned data looks like
          console.log("function all() returns: ", sortedEntries);
        }
      });
    });
  }
  //-----------------------------------------------------------------------------------
  getDayById(dayIdIn) {
    //var parsed = parseInt(dayIdIn,10);
    //console.log("this is getDayById" + parsed);
    return new Promise((resolve, reject) => {
      this.db.find({ dayId: parseInt(dayIdIn,10) }, function (err, day) {
        if (err) {
          console.log("error occured in Planner model");
          reject(err);
        } else {
          console.log("Found day:");
          //console.log(day);
          resolve(day);
        }
      });
    });
  }
  //-----------------------------------------------------------------------------------

  // UPDATE
  setGoal(id,newGoal) {
    console.log("setGoal id: "+id);
    this.db.update(
      { dayId:parseInt(id,10)}, 
      { $set: { goal: newGoal} },
      function (err, numReplaced) {
        console.log("replaced---->" + numReplaced);
      }
      //add setAchievement(id, "") to reset achievement
      );
  }
  //-----------------------------------------------------------------------------------
  setAchievement(id,achievement){
    this.db.update(
      { dayId:id}, 
      {$set:{achievement: achievement}},
      function (err, numReplaced) {
        console.log("replaced---->" + numReplaced);
      }
      );

  }
  //-----------------------------------------------------------------------------------
  formatDate(date) {
    if (date == "" || date == null) {
      return -1;
    } else {
      return (
        date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
      );
    }
  }
    //-----------------------------------------------------------------------------------
}// end of class
function formatDate(date) {
  if (date == "" || date == null) {
    return -1;
  } else {
    return (
      date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
    );
  }
}

const dao = new Planner("planner.db");
//dao.init();
module.exports = dao;

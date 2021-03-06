'use strict';
/* global $ dayModule */

/**
 * A module for managing multiple days & application state.
 * Days are held in a `days` array, with a reference to the `currentDay`.
 * Clicking the "add" (+) button builds a new day object (see `day.js`)
 * and switches to displaying it. Clicking the "remove" button (x) performs
 * the relatively involved logic of reassigning all day numbers and splicing
 * the day out of the collection.
 *
 * This module has four public methods: `.load()`, which currently just
 * adds a single day (assuming a priori no days); `switchTo`, which manages
 * hiding and showing the proper days; and `addToCurrent`/`removeFromCurrent`,
 * which take `attraction` objects and pass them to `currentDay`.
 */


var days = []
var tripModule = (function () {


  // application state

      var currentDay;

  // jQuery selections

  var $addButton, $removeButton;
  $(function () {
    $addButton = $('#day-add');
    $removeButton = $('#day-title > button.remove');
  });

  // method used both internally and externally

  function switchTo (newCurrentDay) {
    if (currentDay) currentDay.hide();
    currentDay = newCurrentDay;
    currentDay.show();
  }

 // ~~~~~~~~~~~~~~~~~~~~~~~
    // before calling `addDay` or `deleteCurrentDay` that update the frontend (the UI), we need to make sure that it happened successfully on the server
  // ~~~~~~~~~~~~~~~~~~~~~~~
  $(function () {
    $addButton.on('click', addDay);
    $removeButton.on('click', deleteCurrentDay);
  });



  // ~~~~~~~~~~~~~~~~~~~~~~~
    // `addDay` may need to take information now that we can persist days -- we want to display what is being sent from the DB
  // ~~~~~~~~~~~~~~~~~~~~~~~
  function addDay () {
    if (this && this.blur) this.blur(); // removes focus box from buttons
    var newDay = dayModule.create({ number: days.length + 1 }); // dayModule
    days.push(newDay);
    if (days.length === 1) {
      currentDay = newDay;
    }
    switchTo(newDay);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~
    // Do not delete a day until it has already been deleted from the DB
  // ~~~~~~~~~~~~~~~~~~~~~~~
  function deleteCurrentDay () {
    // prevent deleting last day
    if (days.length < 2 || !currentDay) return;
    // remove from the collection
    var index = days.indexOf(currentDay),
      previousDay = days.splice(index, 1)[0],
      newCurrent = days[index] || days[index - 1];
    // fix the remaining day numbers
    days.forEach(function (day, i) {
      day.setNumber(i + 1);
    });
    switchTo(newCurrent);
    previousDay.hideButton();
  }

  // globally accessible module methods
  $("#day-add").on("click", function(){
    $.ajax({
      method: "POST",
      url: "/api/days",
      data: {id: days.length + 1}
    }).then(
    function(result){
    })
  });

  function addSavedDay(dayNo) {
    console.log(dayNo)
    $.ajax({
      method: "GET",
      url: `/api/restaurants-activities/${1}`,
    })
    .then(function(result){
      console.log('result', result);
      if (result.restaurants) {
        var restaurants = result[restaurants].map(function(element){
          attractionsModule.getEnhanced(element)
        });
      }
      if (result.activities) {
        var activities = result[activities].map(function(element) {
          attractionModule.getEnhanced(element)
        });
      }

      console.log('restaurants', restaurants);
      console.log('activities', activities)

      restaurants.forEach(function(restaurant){
        restaurant.show();
      });
      activities.forEach(function(activity){
        activity.show()
      })

      // FILL THIS IN LATER
    })
    .catch(console.error)

    if (this && this.blur) this.blur(); // removes focus box from buttons
    var newDay = dayModule.create({ number: days.length + 1 }); // dayModule
    days.push(newDay);
    if (days.length === 1) {
      currentDay = newDay;
    }
    switchTo(newDay);

  }



  // }

  var publicAPI = {


    load: function () {
      $.ajax({
        method: "GET",
        url: "api/days"
      }).then(function(results){
        if(!results.length){
          addDay();
          $.ajax({
            method: "POST",
            url: "/api/days",
            data: {id: 1}
          })
        } else {
         for(var i = 0; i < results.length; i++){
           console.log('yo')
          //  addDay();
          addSavedDay(results[i]);

           days[i].hotel
           // i + 1 = dayNumber
           // have to go fetch all the attractions for that daynumber, assign
           // them to that dayNumber
          }
        }
      }
    );      // ~~~~~~~~~~~~~~~~~~~~~~~
        //If we are trying to load existing Days, then let's make a request to the server for the day. Remember this is async. For each day we get back what do we need to do to it?
      // ~~~~~~~~~~~~~~~~~~~~~~~
  //    $(addDay);
    },

    switchTo: switchTo,

    addToCurrent: function (attraction) {
      currentDay.addAttraction(attraction);
    },

    removeFromCurrent: function (attraction) {
      currentDay.removeAttraction(attraction);
    },
  };

  return publicAPI;

}());

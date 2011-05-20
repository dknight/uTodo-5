// id is a random number which identifies unique id of every task
var id = getRandomId();

// Just clearer
var clearDiv = $("<div></div>").addClass("clear");

// Template of task
var currentTask = $("<div></div>")
                  .addClass("task")
                  .append(
                      $("<input></input>")
                      .attr("type", "checkbox")
                      .attr("name", "comlete")
                      .addClass("check_box")
                      .val("1")
                  )
                  .append(
                      $("<span></span>")
                  )
                  .append(
                      $("<a></a>")
                      .addClass("delete")
                      .attr("href", "#")
                      .attr("title", "Delete?")
                  )
                  .append(clearDiv);

/**
 * Random ID generator.
 * Retrun integer
 */
function getRandomId()
{
    return Math.round(Math.random()*1000000);
}

/**
 * Appends new task to application.
 *
 * data Object
 * return void
 */
function appendNewTask(data)
{
    var newTask = currentTask.clone();
    
    newTask.attr("id", "task_" + data.id);
    newTask.find("input").val(data.id);
    newTask.find("a.delete").attr("rel", data.id);
    newTask.find("span").text(decodeURIComponent(data.text).replace(/\+/g, ' '));
    
    data.completed = data.completed == 'true' ? true : false;
    
    if( data.completed) {
        newTask.find("input").attr("checked", "checked");
    } else {
        newTask.find("input").removeAttr("checked");
    }
    
    newTask.find("input").bind("change", function() {
        if($(this).is(":checked")) {
            data.completed = true;
            localStorage["utodo5.task." + data.id] = $.param(data);
            $(this).parent().fadeOut("fast", function() {
                $(this).prependTo("#completed_tasks").fadeIn("fast");
            });
        } else {
            data.completed = false;
            localStorage["utodo5.task." + data.id] = $.param(data);
            $(this).parent().fadeOut("fast", function() {
                $(this).appendTo("#current_tasks").fadeIn("fast");
            });
          }
    });
    
    newTask.find("a.delete").bind("click", function() {
      $(this).parent().highlightFade({color:'red'});
      $(this).parent().fadeOut("fast", function() {
        $(this).remove();
      })
      deleteFromLocalStroge(data.id);
      return false;
    });
    
    if( data.completed) {
        $("#completed_tasks").append(newTask);
    } else {
        $("#current_tasks").prepend(newTask);
    }
}

/**
 * Deletes record from localStorage.
 * id integer|string
 *
 * return void
 */
function deleteFromLocalStroge(id)
{
    localStorage.removeItem("utodo5.task." + id)
}

function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

/**
 * Perform sorting by timestamp.
 * a Object
 * b Object
 *
 * return integer
 */
function sortByDate(a, b)
{
    return parseInt(a.stamp) - parseInt(b.stamp)
}

/**
 * Checks is browser supports local storage.
 *
 * return boolean
 */
function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}


/**
 * When DOM is ready here we go... ->
 */
$(function() {
    
    if( !supports_html5_storage()) {
      $("#wrapper").prepend(
          $("<h4></h4>")
          .addClass("error")
          .html("NB! Your browser doesn't support HTML5 local storage!")
      );
    }
    // console.log(localStorage);
    
    // Loop existing tasks
    var collection = new Array();
    for( task in localStorage) {
        var data = $.unserialize(localStorage[task]);
        collection.push(data);
    }
    collection.sort(sortByDate);
    for( var i = 0; i < collection.length; i++) {
        appendNewTask(collection[i]);
    }
    
    // Form submit adds a new task.
    $("#form_task").bind("submit", function() {
        var value = $.trim($("#task").val());
        if( value) {
            var id = getRandomId();
            var stamp = new Date();
            var data = { text: value, completed: false, id: id, stamp: stamp.getTime()}
            appendNewTask(data);
            localStorage["utodo5.task." + id] = $.param(data);
            $("#task_" + id).highlightFade();
            id = getRandomId();
            
            $("#task").val("");
        }
        
        return false;
    });
    
});
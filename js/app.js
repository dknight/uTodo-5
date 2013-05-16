// id is a random number which identifies unique id of every task
var id = getRandomId();

// Just clearer
var clearDiv = $("<div></div>").addClass("clear");

// Template of task
var $currentTask = $("<div></div>")
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
 *
 * retrun integer
 */
function getRandomId()
{
    return Math.round(Math.random()*100000000);
}

/**
 * Appends new task to application.
 *
 * param {object} data
 * param {boolean} hl
 * return void
 */
function appendNewTask(data, hl)
{
    var $newTask = $currentTask.clone();
    
    $newTask.attr("id", "task_" + data.id);
    $newTask.find("input").val(data.id);
    $newTask.find("a.delete").attr("rel", data.id);
    $newTask.find("span").text(decodeURIComponent(data.text).replace(/\+/g, ' '));
    
    data.completed = data.completed == 'true' ? true : false;
    
    if( data.completed) {
        $newTask.find("input").attr("checked", "checked");
    } else {
        $newTask.find("input").removeAttr("checked");
    }
    
    $newTask.find(":checkbox").bind("change", function() {
        if($(this).is(":checked")) {
            data.completed = true;
            localStorage["utodo5.task." + data.id] = $.param(data);
            $(this).parent().fadeOut("fast", function() {
                $(this).prependTo("#completed_tasks").effect({
                    mode   : 'show',
                    effect : 'highlight'
                });
            });
        } else {
            data.completed = false;
            localStorage["utodo5.task." + data.id] = $.param(data);
            $(this).parent().fadeOut("fast", function() {
                $(this).appendTo("#current_tasks").fadeIn("fast");
            });
        }
    });
    
    $newTask.find("a.delete").bind("click", function(event) {
        event.preventDefault();
        $(this).parent().effect({
            mode   : 'hide',
            effect : 'highlight',
            color  : '#f44'
        },
        function() {
            $(this).remove();
        })
        deleteFromLocalStroge(data.id);
    });
    
    if( data.completed) {
        $("#completed_tasks").append($newTask);
    } else {
        if ( hl ) {
            $newTask.effect({
                mode  : 'show',
                effect: 'highlight'
            });
        }
        $("#current_tasks").prepend($newTask);
    }
}

/**
 * Deletes record from localStorage.
 * param {integer|string} id
 *
 * return void
 */
function deleteFromLocalStroge(id)
{
    localStorage.removeItem("utodo5.task." + id);
    get_used_storage_size();
}

function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

/**
 * Perform sorting by timestamp.
 * param {object} a
 * param {object} b
 *
 * return integer
 */
function sortByDate(a, b)
{
    return parseInt(a.stamp) - parseInt(b.stamp)
}

/**
 * Checks is browser supports local storage.
 * TODO: maybe use modernizr in future.
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

function get_used_storage_size()
{
    var value = JSON.stringify(localStorage).length / Math.pow(1024, 2);
    $("#used_memory").html(value.toFixed(2));
    $("#memory_meter").val(value.toFixed(2));
}

/**
 * When DOM is ready here we go...
 */
$(document).ready(function() {
    
    if ( !supports_html5_storage() ) {
        $("body").prepend(
            $("<h4></h4>")
            .addClass("error")
            .html("NB! Your browser doesn't support HTML5 local storage!<br />Please update your browser.")
        );
        return;
    }
    
    get_used_storage_size();

    
    // Loop existing tasks
    var collection = new Array();
    for( var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var data = $.unserialize(localStorage[key]);
        collection.push(data);
    }
    collection.sort(sortByDate);
    for( var i = 0; i < collection.length; i++ ) {
        appendNewTask(collection[i]);
    }
    
    // Form submit adds a new task.
    $("#form_task").bind("submit", function(event) {
        event.preventDefault();
        var value = $.trim($("#task").val());
        if (value) {
            var id = getRandomId();
            var stamp = new Date();
            var data = { text: value, completed: false, id: id, stamp: stamp.getTime()}
            appendNewTask(data, true);
            get_used_storage_size();
            localStorage["utodo5.task." + id] = $.param(data);
            id = getRandomId();
            
            // delete form data
            $("#task").val("");
        }
    });
    
}); // end of DOM ready
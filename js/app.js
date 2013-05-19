// Define var here.
var id, $currentTask, $clearDiv;

  /**
 * Random ID generator.
 *
 * retrun integer
 */
function getRandomId() {
    return Math.round(Math.random() * 100000000);
}

/**
 * Appends new task to application.
 *
 * param {object} data
 * param {boolean} hl
 * return void
 */
function appendNewTask(data, hl) {
    var $newTask = $currentTask.clone();
    
    $newTask.attr("id", "task_" + data.id);
    $newTask.find("input").val(data.id);
    $newTask.find("a.delete").attr("rel", data.id);
    $newTask.find("span").text(decodeURIComponent(data.text).replace(/\+/g, ' '));
    
    data.completed = data.completed === 'true' ? true : false;
    
    if (data.completed) {
        $newTask.find(":checkbox").attr("checked", true);
    } else {
        $newTask.find(":checkbox").removeAttr("checked");
    }
    
    $newTask.find(":checkbox").bind("change", function (event) {
        if ($(this).is(":checked")) {
            data.completed = true;
            localStorage["utodo5.task." + data.id] = $.param(data);
            $(this).parent().fadeOut("fast", function () {
                $(this).prependTo("#completed_tasks").effect({
                    mode   : 'show',
                    effect : 'highlight'
                });
            });
        } else {
            data.completed = false;
            localStorage["utodo5.task." + data.id] = $.param(data);
            $(this).parent().fadeOut("fast", function () {
                $(this).appendTo("#current_tasks").fadeIn("fast");
            });
        }
    });
    
    $newTask.find("a.delete").bind("click", function (event) {
        event.preventDefault();
        $(this).parent().effect({
            mode   : 'hide',
            effect : 'highlight',
            color  : '#f44'
        },
        function () {
            $(this).remove();
        });
        deleteFromLocalStroge(data.id);
    });
    
    if (data.completed) {
        $("#completed_tasks").append($newTask);
    } else {
        if (hl) {
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
function deleteFromLocalStroge(id) {
    localStorage.removeItem("utodo5.task." + id);
    getUsedStorageSize();
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
function supportsHtml5Storage() {
    try {
        return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
        return false;
    }
}

function getUsedStorageSize() {
    var value = JSON.stringify(localStorage).length / Math.pow(1024, 2);
    $("#used_memory").html(value.toFixed(2));
    $("#memory_meter").val(value.toFixed(2));
}
function buildLangSelect() {
    var $select = $('<select></select>')
                    .attr("id", "lang")
                    .appendTo("header")
                    .bind('change', function (event) {
                        var s = $(this).val();
                        $("meta[name='description']").attr("content", labels[s].description);
                        $("h1 span").html(labels[s].slogan);
                        $("#task").attr("placeholder", labels[s].typeNewTask);
                        $("#form_task :submit").val(labels[s].addTask);
                        $("#current_tasks_header").html(labels[s].currentTasks);
                        $("#completed_tasks_header").html(labels[s].completedTasks);
                        $("#memory_usage").html(labels[s].memoryUsage);
                        $("#source_code").html(labels[s].sourceCode);
                        $("#disclaimer").html(labels[s].disclaimer);
                        $("#licensed_under").html(labels[s].licensedUnder);
                        $(".delete").attr("title", labels[s].del);
                        localStorage['language'] = s;
                    });
    for (x in labels) {
        var $option = $("<option></option>")
                      .val(x)
                      .html(labels[x].name);
        $("#lang").append($option);
        if (!localStorage['language']) {
            localStorage['language'] = DEFAULT_LANGUAGE;
        }
    }
    $("#lang option").attr("selected", false);
    $("#lang option[value='" + localStorage['language']  + "']").attr("selected", true);
}

/**
 * When DOM is ready here we go...
 */
$(document).ready(function() {
    
    buildLangSelect();
    $("#lang").trigger("change");
    
    // id is a random number which identifies unique id of every task
    id = getRandomId();
    
    // Just clearer
    $clearDiv = $("<div></div>").addClass("clear");
    
    // Template of task
    $currentTask = $("<div></div>")
                      .addClass("task")
                      .append(
                          $("<input></input>")
                          .attr("type", "checkbox")
                          .attr("name", "taskUID" + parseInt(Math.random()*1000000))
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
                          .attr("title", labels[localStorage['language']].del)
                      )
                      .append($clearDiv);
    
    if (!supportsHtml5Storage()) {
        $("body").prepend(
            $("<h4></h4>")
            .addClass("error")
            .html(localStorage['language'].notSupport)
        );
        return;
    }
    
    getUsedStorageSize();
    
    // Loop existing tasks
    var collection = new Array();
    for (i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i),
            data = $.unserialize(localStorage[key]);
        if (key !== 'language') {
            collection.push(data);
        }
    }
    collection.sort(sortByDate);
    for (i = 0; i < collection.length; i++) {
        appendNewTask(collection[i]);
    }
    
    // Form submit adds a new task.
    $("#form_task").bind("submit", function(event) {
        event.preventDefault();
        var value = $.trim($("#task").val());
        if (value) {
            var id = getRandomId(),
                stamp = new Date(),
                data = {
                    text      : value,
                    completed : false,
                    id        : id,
                    stamp     : stamp.getTime()
                };
            appendNewTask(data, true);
            getUsedStorageSize();
            localStorage["utodo5.task." + id] = $.param(data);
            id = getRandomId();
            
            // delete form data
            $("#task").val("");
        }
    });
    
    // Fix jQUery 2.0.0 and IE bug.
    if (window.navigator.userAgent.match(/MSIE/i)) {
        $("#completed_tasks :checkbox").each(function () {
            $(this)[0].checked = true;
        });
    }
    
}); // end of DOM ready
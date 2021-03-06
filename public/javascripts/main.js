var listApi = '/api/lists/';
var taskApi = '/api/tasks/';
var quoteApi = 'http://www.stands4.com/services/v2/quotes.php';

$(function() {

  $.ajax({
    method: 'GET',
    url: quoteApi,
    data: {
      uid: '4840',
      tokenid: 'vdd0Lpy8OmyazMor',
      searchtype: 'random',
      query: 'motivation'

    },
    dataType: 'html'
  })
  .done(function(data) {
    // var oneQuote = Math.floor(Math.random()* (data.length -1)) +1;
    $('#quote').html(data);
  })
  .fail(function(jqXHR, textStatus) {
    console.log('Request failed: ' + textStatus);
  });

  function loadTasks(listId) {
    $.ajax({
        url: taskApi,
        method: 'GET',
        data: {
          listId: listId
        },
        dataType: 'JSON'
      })
      .done(function(tasks) {
        var points = 0;
        if (tasks !== []) {
          var releventTasks = [];
          for (i =0; i<tasks.length; i++) {
            if (tasks[i].listId == listId) {
              releventTasks.push(tasks[i]);
              if (tasks[i].done) {
                points = points + tasks[i].points;
                console.log(points);
              };
            };
          }
          $('#collapse_' + listId + ' span').text(points);

          var context = {
            tasks: releventTasks
          };
          $.get('templates/task.handlebars', function(data) {
            var template = Handlebars.compile(data);
            $('#tasks_' + listId).html(template(context));
            taskListeners();
          }, 'html');
        }
      })
      .fail(function(jqXHR, textStatus) {
        console.log('Request failed: ' + textStatus);
      });
  }

  // to create a new list
  // on click of submit for new to-do list call the creatList function

  $('#newList').submit(function() {
    var name = $('#listName').val();
    var id = userJson._id;
    createList(name, id);
    return false;
  });

  function listListeners() {
    $('.deleteBtn').click(function() {
      var listId = $(this).data('list-id');
      console.log(listId);
      deleteList(listId);
      return false;
    });

    $('.newTask').submit(function() {
      var item = $(this).find('input[name=task]').val();
      var id = $(this).find('input[name=listId]').val();
      var points = $(this).find('select[name=points]').val();
      newTask(item, points, id);
      return false;
    });

    $('.tasks-list').on('show.bs.collapse', function() {
      var listId = $(this).parentsUntil('well').attr('id');
      loadTasks(listId);
    });
  }


  function taskListeners() {
    $('.delete').submit(function() {
      var taskId = $(this).data('task-id');
      deleteTask(taskId);
      return false;
    });

    $('.task-check').bind('change', function() {
      var listId = $(this).parentsUntil('well').attr('id');
      var taskId = $(this).data('task-id');
      if (this.checked) {
        $.ajax({
          url: taskApi + taskId,
          type: 'PUT',
          data: {'done': true}
        })
        .done(function(task) {
          var newPoints = $('#collapse_' + listId + ' span').text() + task.points;
          console.log(newPoints);
          $('#collapse_' + listId + ' span').html(newPoints);
        })
        .fail(function(jqXHR, textStatus) {
          console.log('Request failed: ' + textStatus);
        });
      }
      else {
        $.ajax({
          url: taskApi + taskId,
          type: 'PUT',
          data: {'done': false}
        })
        .done(function(task) {
          var newPoints = $('#collapse_' + listId + ' span').text() - task.points;
          $('#collapse_' + listId + ' span').html(newPoints);
        })
        .fail(function(jqXHR, textStatus) {
          console.log('Request failed: ' + textStatus);
        });
      }
    });
  }

  function newTask(item, points, id) {
    $.ajax({
      url: taskApi,
      method: 'POST',
      data: {
        item: item,
        points: points,
        listId: id
      },
      dataType: 'JSON'
    })
    .done(function(task) {
      task = [task];
      $.get('templates/task.handlebars', function(data) {
        var context = { tasks: task };
        var template = Handlebars.compile(data);
        $('#tasks_' + id).append(template(context));
        taskListeners();
      }, 'html');
    })
    .fail(function(jqXHR, textStatus) {
      console.log('Request failed: ' + textStatus);
    });
  }

  function createList(newListName, userId) {
    var name = newListName;
    var id = userId;
    $.ajax({
        url: listApi,
        method: 'POST',
        data: {
          name: name,
          userId: id
        },
        dataType: 'JSON'
      })
      .done(function(list) {
        var newList = [list];
        var context = {
          lists: newList
        };
        $.get('templates/list.handlebars', function(data) {
          var template = Handlebars.compile(data);
          $('#lists').append(template(context));
          listListeners();
        }, 'html');
      })
      .fail(function(jqXHR, textStatus) {
        console.log('Request failed: ' + textStatus);
      });
  }

  function deleteList(listId) {
    var listId = listId;
    $.ajax({
        url: listApi + listId,
        method: 'DELETE',
        data: {},
        dataType: 'JSON'
      })
      .done(function(list) {
        $($('div').find("[data-list='" + listId + "']")).remove();
      })
      .fail(function(jqXHR, textStatus) {
        console.log('Request failed: ' + textStatus);
      });
  }

  function deleteTask(taskId) {
    var taskId = taskId;

    $.ajax({
        url: taskApi + taskId,
        method: 'DELETE',
        data: {},
        dataType: 'JSON'
      })
      .done(function(list) {
        $('#' + taskId).remove();
      })
      .fail(function(jqXHR, textStatus) {
        console.log('Request failed: ' + textStatus);
      });
  }

  listListeners();
});
